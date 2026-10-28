# Bellek Yönetimi

Roadastar sonsuz bir koşu: bir tur dakikalarca sürebilir, araç, dekor ve levhalar sürekli kurulup bırakılır.
Bu yüzden bellekte üç şey önemli: **birikmemesi** (koşu uzadıkça ve ekranlar arasında gidip gelince büyümemesi),
**sızıntı olmaması** ve **tepe değerin** düşük kalması (eski ve düşük RAM'li cihazlarda sistem uygulamayı kapatmasın).
Bu belge ölçüm yöntemini, bulguları ve yeni kod için kuralları içerir. Yöntem Beadfever'daki (`../Beadfever/docs/MEMORY.md`)
ile aynıdır; sonsuz koşu için zaman içinde örnekleme ve sahne yoklaması eklendi.

## Nasıl ölçülür

| Araç | Ne ölçer | Komut |
|---|---|---|
| `scripts/measure_memory.sh` | Ekran ve bölge bazında ayak izi, tepe, CoreAnimation, `leaks` sızıntı sayısı; sonsuz koşuda zaman içinde ayak izi ve sahne yoklaması | `scripts/measure_memory.sh <simülatör UDID> [saniye]` (önce Debug derlemesi kurulu olmalı) |
| `RoadastarTests/MemoryTests` | Sahnesiz dünya: dünya bırakılıyor mu, sonsuz koşuda varlık sayısı, neon şehirde örgü üretimi, ses örnekleri, kayıt sıklığı | `scripts/test.sh` |
| `testMemoryAcrossRepeatedNavigation` | Menü ↔ garaj, görevler, başarımlar, kontroller ve bir koşu, 5 tur; her turun bellek farkı (`XCTMemoryMetric`) | `scripts/test.sh`; sonuçlar `build/Tests-*.xcresult` |
| `heap` farkı + `malloc_history` | Büyüyen türü ve onu ayıran yığını bulmak: koşunun iki anında `heap --sortBySize <pid>`, sonra şüpheli bir adres için `malloc_history` | Uygulamayı `SIMCTL_CHILD_MallocStackLogging=1 xcrun simctl launch …` ile aç |
| Gerçek cihaz | Ayak izinin zaman içindeki eğilimi (GPU belleği dahil) | `xcrun devicectl device process launch --device <UDID> --console --terminate-existing tr.com.scincin.Roadastar -- -screenshotMode -screenshotAutoStart -screenshotUnlock -screenshotSpeed 2 -memoryProbe -soundOn NO` |
| Instruments (Allocations, Leaks) | Ayrıntılı nesne yaşamı | Xcode → Product → Profile |

Senaryolar yalnızca Debug'da çalışan bayraklarla tekrarlanır: `-startScreen garage|quests|achievements|controls`,
`-soundProbe` (açılışta bütün efektleri çalar), `-memoryProbe` (10 sn'de bir ayak izi, sahnedeki varlık sayısı ve önbellek
boyları; cihazda da çalışır),
`-uiTesting` (ilerleme her açılışta sıfırlanan ayrı depoda), ekran görüntüsü bayrakları (`-screenshotMode`: çarpışma kapalı,
`-screenshotAutoStart`, `-screenshotStartDistance 9500`, `-screenshotSpeed 2`, `-screenshotScene rocket`).

## Sonuçlar

iPhone 17 Pro Max simülatörü (iOS 27.0), Debug, `scripts/measure_memory.sh`, 2026-10-26.

| Senaryo | Önce: ayak izi / sızıntı | Sonra: ayak izi / sızıntı |
|---|---|---|
| Menü | 79 MB / 155 | 77 MB / 5 |
| Garaj | 78 MB / 6 | 78 MB / 5 |
| Görevler | 84 MB / 155 | 82 MB / 5 |
| Başarımlar | 90 MB / 154 | 88 MB / 5 |
| Bütün sesler çalındıktan sonra | 79 MB / 155 | 78 MB / 5 |
| Koşu başı (300 m) | 102 MB / 158 | 103 MB / 7 |
| Tuz düzlükleri | 107 MB / 7 | 108 MB / 7 |
| Neon şehir (viyadük) | **146 MB** / 7 | **108 MB** / 7 |
| ROCKET MODE | 148 MB / 8 | 109 MB / 12 |

Sonsuz koşu (2× hız, çarpışma kapalı), ayak izi:

| Süre | Önce | Sonra |
|---|---|---|
| 20 sn | 117 MB | 119 MB |
| 50 sn | 129 MB | 129 MB |
| 100 sn (neon şehre giriş) | 150 MB | 140 MB |
| 150 sn | **231 MB** | **146 MB** |
| 300 sn | – | 155 MB |
| `boxMesh` önbelleği | 109 → 340 | 109'da sabit |
| Sahnedeki varlık | 870–1221 | 853–1284 |

Önceki sızıntıların 150'ye yakını CoreAudio'nun `ListenerBinding`/`ParameterListenerBinding` kayıtlarıydı (AVAudioEngine);
açılışların yarısında görülüyordu. Kalan 5–12 kayıt çerçeve kodunda: objc çalışma zamanının `map_images` kaydı ve VFX'in
(RealityKit parçacık motoru) simülasyonunda bıraktığı 48 baytlık dizi kayıtları. Bizim kodumuzdan gelen sızıntı yok.

**Simülatörde kalan yavaş artış (~4 MB/dk) simülatöre özgü.** İki anda alınan `heap` farkı, artışın tamamının
`MTLSimDepthStencilState` + VFX `DeallocNotifier` + blok + objc ilişkilendirmesi olduğunu gösteriyor (180 sn'de her birinden
+30.572 adet, ~170/sn). `malloc_history` yığını: RealityKit render iş parçacığı → `addVFXParticleEmitterDrawsToTechniqueBuckets` →
VFX → `-[MTLSimDevice newDepthStencilStateWithDescriptor:]`. Simülatörün Metal sürücüsü her çağrıda yeni nesne veriyor, VFX
de onları önbelleğinde tutuyor. Gerçek cihazda aynı koşu birikmiyor (aşağıda).

### Gerçek cihaz (iPhone 16 Pro, iOS 27, Debug, `-memoryProbe` ayak izi)

| Senaryo | Ayak izi |
|---|---|
| Menü | 335 MB (sabit) |
| Sonsuz koşu, 2× hız, 10 → 200 sn | 412 → 419 MB (arada 412–485 MB dalgalanma, birikme yok) |

Cihazda ayak izi GPU belleğini de (çerçeve tamponları, gölge haritası, Metal kaynakları) içerdiği için simülatörün ~4 katı.
Bu fark render ayarından gelir; görsel kaliteyi değiştirmeden düşürülemez, şimdilik dokunulmadı.

`testMemoryAcrossRepeatedNavigation` (5 tur: garaj, görevler, başarımlar, kontroller, bir koşu): turlar arası fark
+2,9 / −0,2 / +0,4 / +1,1 / −0,5 MB (ilk tur ısınma), mutlak bellek 117,6–119,0 MB (%0,5 sapma). Birikme yok.

> Simülatör sayıları gerçek cihazdan farklıdır (çerçeve tamponları, ekran ölçeği, Metal sürücüsü). Eğilim ve birikme için
> güvenilir; mutlak değer için gerçek cihazda Instruments ile ölç.

## Bulgular ve yapılanlar

| # | Bulgu | Etki | Yapılan |
|---|---|---|---|
| 1 | Neon şehirde her bina 4–5 farklı boyda köşesi yuvarlatılmış kutu örgüsü üretiyordu; paylaşılan `boxMesh` önbelleği bunları 1024'e kadar tutuyordu | Asıl birikme: sonsuz koşuda 150 sn'de 117 → 231 MB, şehirde önbellek 109 → 340 örgü; varlık sayısı sınırlıydı (870–1221) | Binalar paylaşılan birim küpü `scale` ile kullanır (`EntityFactory.scaledBox`, `Decor.building`); önbellek sınırı 256; üretim sayacı `generatedBoxMeshCount` (`neonCityDoesNotGenerateMeshes`, `buildingsShareOneMesh`) |
| 2 | `AVAudioEngine` + `AVAudioSourceNode`: CoreAudio `ListenerBinding`/`ParameterListenerBinding` sızıntısı (Beadfever'daki ile aynı) | Açılışların yaklaşık yarısında 150+ sızıntı (~9,7 KB) | `Sound` tek `AudioQueue` üzerinde (mono Float32, 3×1024 kare tampon); karıştırıcı sabit 8 yuvalı, ses iş parçacığında bellek ayırmaz; örnekler 16 bit ve tembel; artık 5–6 sızıntı, hepsi objc çalışma zamanının `map_images` kaydı |
| 3 | Paylaşım kartı (1080 × 1080 px, ölçek 3) her tur sonunda önceden çiziliyordu | Her oyun bitişinde ~4,7 MB bitmap ve çizim işi, paylaşılmasa bile | `ShareCardItem: Transferable`; PNG yalnızca paylaşım anında üretilir (`GameOverCard`) |
| 4 | Görünümlerde `Task { }` ve `DispatchQueue.main.asyncAfter` (parlama, BOOST erişilebilirlik basışı) | Görünüm kapansa da çalışmaya devam eden işler, durumu yakalayan kapanışlar | `.task(id:)` (`FlashOverlay`, `BoostButton`): görünüm gidince iptal |
| 5 | Tur görevinin ilerlemesi her 0,5 sn'de JSON'a çevrilip `UserDefaults`'a yazılıyordu; tur sonunda günlük görevler 11 kez ayrı kaydediliyordu | Sürekli kodlama/yazma, gereksiz bellek ve disk işi | Kayıt yalnızca görev tamamlanınca; günlük metrikler `add(_ amounts:)` ile tek kayıt (`missionProgressIsNotPersistedEveryTick`) |
| 6 | Fırlatma rampası her doğuşta yeni örgü ve malzemelerle kuruluyordu | Her ROCKET bölgesinde yeni kaynaklar | Bir kez şablon kurulur, `clone(recursive:)` ile çoğaltılır (`Decor.launchSite`) |
| 7 | `RealityView` sahne aboneliği dünyayı güçlü yakalıyordu | Dünya ve sahnesi görünümden uzun yaşayabilirdi | `[weak world]` (`ContentView`); `worldIsReleasedAfterRuns` |
| 8 | Bellek uyarısında yalnızca örgü/malzeme önbelleği bırakılıyordu; arka planda ses motoru çalışmaya devam ediyordu | Uyarıda ses örnekleri bellekte kalıyordu; arka planda boşuna ses iş parçacığı | Uyarıda `Sound.shared.purge()`; arka planda `Sound.suspend()`, öne gelince `resume()`; ses kapalıyken kuyruk durur |
| 9 | Yakın geçiş zaman damgaları (`nearMissTimes`) yalnızca eşya zarı atılınca budanıyordu | Uzun koşuda sınırsız büyüyebilen dizi | Her eklemede budanır (`GameWorld`) |
| – | Hız çizgileri her karede yeniden çiziliyordu | Gereksiz gövde/çizim işi | `SpeedStreaks: Equatable` + `.equatable()` |

## Yeni kod için kurallar

- **Koşu sırasında örgü ve malzeme üretme.** Değişken boylu parça için paylaşılan birim örgüyü `scale` ile kullan
  (`EntityFactory.scaledBox`); paylaşılan önbelleğe (`boxMesh`, malzemeler) yalnızca sabit boylar girer. Karmaşık dekor bir
  kez şablon olarak kurulur, `clone(recursive:)` ile çoğaltılır (örgü ve malzeme paylaşılır).
- **Geride kalan her varlık sahneden çıkar** (`removeFromScene`); sahnedeki varlık sayısı koşu boyunca sınırlı kalmalı.
  `-memoryProbe` ve `endlessRunDoesNotAccumulateEntities` bunu izler.
- **Ses iş parçacığında bellek ayırma; `AVAudioEngine` kullanma.** Çıkış tek `AudioQueue`; yeni ses karıştırıcıya eklenir,
  örnekleri ilk çalışta üretilir ve `Sound.purge()` ile bırakılabilir.
- **Görünümde `Task { }` ya da `DispatchQueue.main.asyncAfter` açma.** Zamanlayıcı gerekiyorsa bir sayaç/değer değiştir ve
  `.task(id:)` ile bekle: görünüm kapanınca SwiftUI iptal eder.
- **Pahalı iş kullanıcı isteyince.** Paylaşım görseli gibi büyük bitmap'ler önceden çizilmez (`Transferable` ile paylaşım anında).
- **Kare/tik başına diske yazma.** Kalıcı kayıt yalnızca anlamlı değişimde (tamamlanma, tur sonu) ve toplu.
- **Sınıflar arası kapanışlarda `[weak self]` / `[unowned self]`.** Bir nesnenin sakladığı abonelik ya da kapanış o nesneyi
  güçlü tutmasın (`worldIsReleasedAfterRuns`).
- **Kaynaklar tembel ve bırakılabilir.** Bellek uyarısında yeniden üretilebilen her şey bırakılır (`EntityFactory.trimCaches`,
  `Sound.purge`); arka planda ses kuyruğu durur.
- **Listelerin bir üst sınırı olsun** (olay akışı, görevler, bildirimler, zaman damgaları).
- **Simülatörde yavaş artış görülürse** önce `heap` farkıyla büyüyen türü ve `malloc_history` ile ayıran yığını bul; yığın
  yalnızca çerçeve kodundaysa (ör. VFX → `MTLSimDevice`) gerçek cihazda `-memoryProbe` ile doğrula.
- **Yeni ekran ya da bölge eklenince:** `scripts/measure_memory.sh`'a senaryo, `testMemoryAcrossRepeatedNavigation`'a durak ekle;
  ölçüm sonucunu bu belgedeki tabloya işle.
