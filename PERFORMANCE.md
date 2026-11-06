# Performans

Roadastar gerçek cihazda GPU'ya bağlıdır: CPU (ana + render iş parçacığı) bir çekirdeğin %40'ını kullanırken kare
düşer ve cihaz bir dakika içinde ısınır. Bu belge ölçüm yöntemini, 2026-10-28 bulgularını ve yeni kod için kuralları
içerir. Bellek için [MEMORY.md](MEMORY.md).

## Nasıl ölçülür

| Araç | Ne ölçer | Komut |
|---|---|---|
| `-perfProbe` (her derlemede) | 5 sn'de bir kare süresi dağılımı (ort., p95, en kötü, >20 ms ve >33 ms kare sayısı), süreç ve iş parçacığı başına CPU, ayak izi, ısı durumu, faz/mesafe/varlık sayısı | Aşağıdaki cihaz komutu; satırlar `PERF t=…` |
| Gerçek cihaz | Oynanış senaryosu, optimize kod | `xcrun devicectl device process launch --device <UDID> --console --terminate-existing tr.com.scincin.Roadastar -- -screenshotMode -screenshotAutoStart -screenshotUnlock -perfProbe` |
| Instruments (Time Profiler, Metal System Trace) | CPU sıcak noktaları, GPU kare süresi | Xcode → Product → Profile (Release) |

Ölçüm derlemesi: Debug bayrakları (`-screenshotAutoStart` vb.) yalnızca Debug'da çalıştığı için optimizasyon komut satırından
verilir — `xcodebuild … -configuration Debug SWIFT_OPTIMIZATION_LEVEL=-O SWIFT_COMPILATION_MODE=wholemodule`. `-Onone`
ile ölçme: Swift oyun döngüsü birkaç kat yavaştır, sonuç Release'i temsil etmez.

Cihaz A/B bayrakları (Debug): `-renderScale 3` çizim ölçeğini sabitler (bütçeyi aşar), `-renderEffects` HDR, hareket
bulanıklığı ve alan derinliğini açık bırakır.

Isı: cihaz bir koşudan sonra dakikalarca `serious`/`fair` kalır; karşılaştırmalı ölçümler arasında 4–5 dk bekle ve ilk
satırdaki `thermal` değerini kıyasla.

## Bulgular (iPhone 16 Pro, iOS 27, optimize Debug, 2026-10-28)

Şikâyet: TestFlight 1.0 (7)'de gerçek cihazda takılma. Aynı senaryo (otomatik başlangıç, 150 sn, 1× hız) bellek
değişikliğinden (458c043) önceki ve sonraki kodla ölçüldü — **ikisi de aynı**: bellek işi performansı değiştirmemiş,
sorun daha eskiden var.

| | Bellek değişikliğinden önce (158a217) | Sonra (b31bb9f) |
|---|---|---|
| fps (5 sn pencereleri) | 42–60 | 45–60 |
| p95 kare süresi | 18–47 ms | 18–43 ms |
| >33 ms kare / 5 sn | 0–46 | 0–26 |
| CPU (süreç) | %35–40 (ana %26, render %12); bir pencerede %76 | %36–44 (ana %28, render %11) |
| Isı durumu | başlangıç `fair`, 100 sn'de `serious` | başlangıç `fair`, 55 sn'de `serious` |
| Ayak izi | 370–452 MB | 376–422 MB |

Yorum:
- **GPU'ya bağlı.** CPU bir çekirdeğin yarısını bile kullanmıyor; kareler yine de 33–50 ms'ye uzuyor ve cihaz bir
  dakikada `serious`'a çıkıp kısılıyor. iPhone 16 Pro ekranı 1206 × 2622 = 3,2 MP; RealityKit bunu HDR hedefe, hareket
  bulanıklığı ve alan derinliği geçişleriyle, ~1000 varlık ve gölge haritasıyla çiziyor.
- **`RealityView` bunların hiçbirini ayarlatmıyor.** iOS'ta çizim seçeneği ve çözünürlük ölçeği yalnızca `ARView`'da var.
- Levha yazıları (`MeshResource.generateText`, 13 farklı yazı) koşu sırasında ilk görüldüğünde üretiliyordu (onlarca ms,
  ilk 40 sn'de 4 → 13); kare süresi tepeleri (44–61 ms) buna da denk geliyordu.
- Otomatik kalite (1,5 sn yavaş kare → gölge kapalı, efektler kısık) devreye girse de fps toparlanmıyordu.

Metal System Trace (15 sn, koşunun 40. saniyesi, 1,2 MP çizim) GPU'nun nereye gittiğini gösterdi — GPU bütün kayıt
boyunca **"cihaz koşulları nedeniyle en düşük performans durumunda"** (ısı), ve o hızda kare başına iş 16,7 ms'yi aşıyor:

| GPU kanalı / süreç | ms / sn | Ne |
|---|---|---|
| Roadastar · Vertex | 418 | **Sahne 2,46 milyon üçgen**, 2,2 milyonu gölge düşürüyor (iki kez çiziliyor). `generateBox(size:cornerRadius:)` 13.068 üçgen — `EntityFactory.box` varsayılan olarak yuvarlatılmış kullandığından ~150 kopya (araç gövdeleri, lamba, levha, köprü); `generateCylinder` 13 bin, `generateSphere` 8 bin: her trafik tekerleği (4 × ~35 araç), palmiye, toplanabilir |
| Roadastar · Fragment | 152 | Piksel işi; 1,2 MP'de küçük |
| backboardd (sistem birleştiricisi) · Fragment | 410 | **HUD**: bütün `HUDView`'a `.shadow(radius: 3)` → skor/mesafe/AIR her karede değiştiği için tam ekran ekran dışı çizim + blur; flaşta `.blur(radius: 42–63)` çerçeve; mod parıltısında `hueRotation` filtresi + maske. Uygulamanın kendi profilinde görünmez (ayrı süreç) |
| backboardd · Vertex + Compute | 88 | aynı |

Piksel sayısını düşürmek tek başına yetmedi (ARView ile 1,2 MP: fps yine 40–50): vertex ve birleştirici yükü piksele bağlı değil.

## Yapılanlar

1. **Sahne `ARView` (nonAR) içinde** (`SceneHostView`): `RealityView` yerine `UIViewRepresentable`; dokunmalar SwiftUI
   katmanında kalır, görünüm aynı (simülatörde kare kare karşılaştırıldı).
2. **HDR, hareket bulanıklığı ve alan derinliği kapalı** (`renderOptions`): oyunun stilize, düz renkli sahnesinde görünür
   fark yok; tonlama/hız tamponu geçişleri ve 16 bit hedef gider.
3. **Piksel bütçesi** (`GameConfig.renderPixels` 1,8 MP, düşük kalitede 1,2 MP): `contentScaleFactor = min(ekran ölçeği,
   √(bütçe / alan))`. iPhone 16 Pro 3,2 → 1,8 MP (ölçek 3 → 2,25), iPad 11" 5,6 → 1,8 MP. GPU süresi ve ısı büyük ölçüde
   piksel sayısıyla orantılı. Yerleşim değişince yeniden hesaplanır; 0,05 adım.
4. **Levha yazıları menüde ısıtılır** (`GameWorld.warmUpSignTexts`, karede bir): bilinen 13 yazı (`OverheadSystem` ve
   `TrafficSystem.knownSignPanels`) koşuya girmeden üretilmiş olur.
5. **Düşük çokgenli temel şekiller** (`EntityFactory.roundedBox` 44 üçgen pahlı kutu, `cylinder/sphere/cone` 8–32 dilim,
   `MeshDescriptor`): RealityKit'in üreteçleri yerine; bütün `box()` çağrıları, trafik tekerlekleri, araç tekerlek/nozulları,
   palmiye, tank, boru hattı, roket, toplanabilirler, itici konileri, hale ve şok halkası. Tekerlekler ve levha yazıları
   gölge düşürmez (`disableShadows`). Sahne 2,46 milyon → 33–49 bin üçgen (gölge 2,2 milyon → 20 bin).
6. **HUD'da ekran dışı geçiş yok**: `HUDView`'daki `.shadow` kaldırıldı, değişen yazılar `hardShadow` (kaydırılmış koyu
   kopya, blur yok); flaş çerçevesi ve mod parıltısı dört kenar degradesi (`EdgeFade`), `hueRotation` yerine degrade
   açısı; hız çizgilerindeki gereksiz maske kaldırıldı.
7. `-perfProbe` her derlemede; Debug'da 30 sn'de bir `GEOM` satırı (üçgen, gölge üçgeni, en ağır örgüler).

## Sonuç (aynı cihaz ve senaryo, 150 sn, 1× hız)

| | Önce (b31bb9f) | Sonra |
|---|---|---|
| fps (5 sn pencereleri) | 45–60 | **57–60**, 70. sn'den sonra 59–60 |
| p95 kare süresi | 18–43 ms | 17–22 ms |
| >33 ms kare / 5 sn | 0–26 | 0–3 |
| Sahne üçgeni (gölge düşüren) | 2.460.000 (2.230.000) | 33–49 bin (20 bin) |
| Ayak izi | 376–422 MB | 282–340 MB |
| Isı | 55 sn'de `serious` | 85 sn'de `serious`; fps düşmüyor |

Metal System Trace, GPU en düşük performans durumundayken (ms / sn):

| GPU kanalı | Önce | Sonra |
|---|---|---|
| Roadastar · Vertex | 418 | **37** |
| Roadastar · Fragment (1,2 MP → 1,8 MP) | 152 | 274 |
| backboardd · Fragment (HUD) | 410 | **133** |
| backboardd · Vertex + Compute | 88 | 18 |
| Toplam | ~1.080 | ~470 |

Kalan en büyük kalem uygulamanın kendi piksel işi (274 ms/sn, 1,8 MP); daha da düşürmek gerekirse `GameConfig.renderPixels`
ve gölge mesafesi. Isınma sürüyor (daha geç ve daha az), düşük kalite ısıda devreye girer (`AppModel`).

## Yeni kod için kurallar

- **Piksel pahalı, çokgen değil.** Tam ekran yarı saydam katman (vinyet, parıltı, parçacık bulutu) eklerken GPU dolgu
  maliyetini düşün; birden fazla tam ekran katmanı üst üste bindirme.
- **Koşu sırasında örgü/yazı üretme.** `generateText` ve `MeshResource.generate` onlarca ms: menüde ısıt ya da şablondan
  kopyala (bkz. MEMORY.md kuralları).
- **Kare başına SwiftUI güncellemesi az olsun.** Her karede değişen HUD değerleri (skor, hız) ayrı küçük görünümlerde
  kalsın; `.shadow`/blur gibi ekran dışı geçiş gerektiren değiştiriciler her karede yeniden çizilen görünümlerde olmasın.
- **Yeni görsel özellik eklenince** cihazda `-perfProbe` ile 150 sn koşu: p95 < 20 ms ve ilk 2 dakikada `serious` yok.
