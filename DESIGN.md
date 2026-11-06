# Tasarım Eleştirisi ve TODO — Roadastar 1.0 (8)

Anthropic'in **Design** eklentisindeki `design-critique` çerçevesiyle (ilk izlenim → kullanılabilirlik → görsel hiyerarşi →
tutarlılık → erişilebilirlik → iyi olanlar → öncelikli öneriler) 2026-10-29'da yapıldı. İncelenen ekranlar iPhone 17 Pro
simülatöründen: pilot kaydı, ana menü, Garaj, Görevler, Başarımlar, Kontroller, eğitim HUD'u, duraklatma, koşu HUD'u,
oyun sonu; ayrıca neon şehir / ROCKET / STAR MODE koşu kareleri. Aşama: **yayın sonrası cila** (1.0 mağazada).

## Genel izlenim

Düşük çokgenli gün batımı otoyolu, beyaz Roadster ve neon şehir güçlü, tutarlı bir görsel kimlik veriyor; HUD okunaklı,
oyun sonu kartı net. En büyük fırsat: **oyunun en iyi görseli (araç) ana menüde yok** — menü rampaya bakan boş bir sahne
üstünde iki kart ve beş düğmeden oluşuyor. İkinci fırsat: **aksan rengi ve düğme stili çokluğu** (altın, yeşil, camgöbeği,
kırmızı, mor; dolu/çerçeveli/metin) tek bir marka sesine indirgenmeli.

## Ekran ekran bulgular

Önem: 🔴 kritik · 🟡 orta · 🟢 küçük

### Pilot kaydı (ilk açılış)
| Bulgu | Önem | Öneri |
|---|---|---|
| Otomatik ad (`PLAYER_9553 #4206`) ve tek CONTINUE: sürtünmesiz, iyi. Ama alan bir metin kutusu gibi görünmüyor; "Letters, digits and _ · 3-14 characters" kuralı daha hata yokken gösteriliyor | 🟡 | "**Continue as PLAYER_9553**" birincil, "Change name" ikincil; kural metni yalnızca alan düzenlenince/hata olunca |
| Arkadaki sahne (rampa, kum) markayı taşımıyor | 🟢 | Kartın arkasında aracın 3/4 görünümü (Garaj kamerası) |

### Ana menü
| Bulgu | Önem | Öneri |
|---|---|---|
| **Araç görünmüyor**; menü kamerası rampaya bakıyor. Garaj aynı sahneyi araçla gösteriyor | 🔴 | Menü kamerası aracın 3/4'üne; kart aracın üstüne binmeyecek şekilde alt yarıda. Mağaza görselleriyle aynı "kahraman" açı |
| "ROADASTAR" düz kalın sistem yazısı; logo/wordmark yok | 🟡 | Eğik, hız çizgili bir wordmark (sitedekiyle aynı); ikon ile aynı aile |
| Başlığın altındaki 3 satır jest ipucu küçük yazı gibi okunuyor, "How to play?" düğmesiyle çakışıyor | 🟡 | Satırları kaldır; "How to play?" tek giriş; ilk açılışta zaten eğitim var |
| **UPDATES** kutusu ayrı bir kart olarak başlığın üstünde: dikkat sırasını bozuyor (dört ayrı grup: iki yuvarlak düğme, Updates, ana kart) | 🟡 | Profil düğmesine rozet ya da kartın altında ince bir "What's new" satırı; açılır kutu profil sayfasına |
| 5 ikincil düğme 2 sütunda, Garage tek başına yetim; 4 farklı çerçeve rengi (gri, altın, yeşil, camgöbeği) | 🟡 | 2×2 (How to play, Controls, Achievements, Quests) + tam genişlikte **Garage** (araç küçük resmiyle); tek aksan rengi, ikonlar aynı ağırlıkta |
| "BEST 0" küçük; pilot satırı "PILOT PLAYER_0713 #3107 ›" profil düğmesiyle aynı işi yapıyor | 🟢 | Pilot adı + en iyi skor tek satırda, sağ üst profil düğmesi avatar/baş harf |

### Garaj
| Bulgu | Önem | Öneri |
|---|---|---|
| Sayfa ekranın %60'ını kaplıyor, araç üstte sıkışık | 🟡 | Sayfa yüksekliği `.medium` + büyütülebilir; araç kamerası sayfanın üstüne göre ortalanır |
| Kilitli boya yuvarlaklarında fiyat yok | 🟡 | Yuvarlağın altında `R 400` etiketi; alınabiliyorsa altın çerçeve |
| "Equipped" düğmesi gri üstüne gri, pasif mi belirsiz | 🟡 | Seçili boyada etiket "Equipped ✓" (düğme değil); başka boyada "Equip" birincil |
| Eşya kartı 3 satır açıklama ("When you crash, choose whether to use it…"), kesiliyor | 🟡 | Tek satır + "ⓘ"; satın alma düğmesi sağda, sahip olunan sayı rozet |
| Paint / Items aynı kaydırmada | 🟢 | Üstte bölümlü denetim: **Paint · Items** |

### Görevler
| Bulgu | Önem | Öneri |
|---|---|---|
| Dört bölüm (check-in, ziyaret jetonu, günlük, tur) aynı ağırlıkta; göz nereye bakacağını bilmiyor | 🟡 | "Daily" tek kart: 7 günlük seri şeridi (bugün vurgulu) + "Claim" ; görevler altında |
| İlerleme çubukları 2 pt, düşük kontrast; ödül "R +60" küçük | 🟡 | 4 pt çubuk, ödül chip'i (altın) kart sağında büyük |
| "Streak reward — Come back tomorrow for +10" çerçeveli düğme gibi ama pasif | 🟢 | Düğme değil durum satırı; süre sayacıyla ("in 11h 20m") |
| Açıklama paragrafları ("Run quests count within a single run…") | 🟢 | Bölüm başlığına ⓘ |

### Başarımlar
| Bulgu | Önem | Öneri |
|---|---|---|
| 76 kart aynı görsel ağırlıkta; kilitli/tamamlanmış ayrımı yalnızca çubuk | 🟡 | Tamamlananlar renkli kupa + dolu arka plan; kilitliler soluk; üstte filtre **All · In progress · Done** |
| Üst özet "Completed 0 / 76" metin | 🟢 | Özet ilerleme çubuğu + "Up next" satırı (en yakın 2 başarım) |
| 11 pt gri alt yazılar ("3 km in a single run") | 🟡 | En az 13 pt, kontrast ≥ 4.5:1 |

### Kontroller
| Bulgu | Önem | Öneri |
|---|---|---|
| İkon seti karışık: dolu daire, oklar, üçgen, "?" kutusu (Hold BOOST), kare (Tap ITEM) | 🟡 | Tek SF Symbols ağırlığı ya da oyunun kendi glif seti; BOOST/ITEM için HUD'daki düğmelerin küçük kopyası |
| Liste sistem görünümü; oyunun ses tonundan kopuk | 🟢 | Başlık bandı oyun tipografisiyle; her satırda 1 sn'lik mini animasyon |

### Eğitim HUD'u ve duraklatma
| Bulgu | Önem | Öneri |
|---|---|---|
| **Duraklatınca eğitim kartı ve "Skip tutorial" görünür kalıyor**, PAUSED kartıyla üst üste | 🔴 | Duraklatmada eğitim katmanı gizlenir; duraklatma dönünce geri gelir |
| Eğitim kartı yolun üst üçte birini (trafiğin belirdiği yeri) kapatıyor | 🟡 | Kartı küçült (tek satır + ikon) ya da aracın hemen üstüne al |
| "Skip tutorial" düğmesi skorun yanında, HUD düğmesi gibi | 🟢 | Eğitim kartının içinde küçük metin düğmesi |
| PAUSED / oyun sonu kartlarındaki şaka metninin yanındaki "?" kutusu yardım düğmesi gibi okunuyor | 🟡 | Kutusuz, italik alıntı; ya da konuşma balonu |

### Koşu HUD'u
| Bulgu | Önem | Öneri |
|---|---|---|
| BOOST + ITEM sol altta, sağ alt boş: sağ elini kullanan oyuncu iki başparmakla oynamak zorunda | 🟡 | Ayarlarda **Controls side: Left / Right** (HUD aynalanır) |
| Boş ITEM yuvası kesikli kutu: yer tutucu gibi | 🟢 | Eşya yokken %30 saydam ikon ya da gizli; eşya gelince belirir |
| AIR etiketi 12 pt monospace, açık zeminde (kum) kontrast düşük | 🟡 | 13 pt + hardShadow (var) + arkada ince koyu şerit |
| Lastik dumanı bulutları alt üçte biri sisliyor | 🟢 | Parçacık boyutu/opaklığı %30 düşür, kameraya en yakın mesafede sönümle |
| Skor, ROCKET çubuğu, AIR çubuğu: hiyerarşi doğru, okunur | ✅ | — |

### Oyun sonu
| Bulgu | Önem | Öneri |
|---|---|---|
| NEW RECORD → skor → fark → jeton → istatistik → RETRY: sıralama iyi | ✅ | — |
| İstatistik etiketleri (DISTANCE/TIME/MAX COMBO) 11 pt gri | 🟢 | 12–13 pt, değerler 24 pt |
| "Main menu" ve "Share" metin düğmeleri 30 pt yükseklikte | 🟡 | 44 pt dokunma alanı (HIG) |
| Sıralama bilgisi yok (Game Center var) | 🟢 | "Best Score leaderboard: #12" satırı, dokununca Game Center |
| Sol üstte profil ve ses düğmeleri menü düğmeleri gibi duruyor | 🟢 | Oyun sonunda yalnızca ses; profil menüde |

## Tutarlılık

| Öğe | Sorun | Öneri |
|---|---|---|
| Tipografi | Üç ses: HUD'da yuvarlak kalın sayılar, geniş aralıklı küçük büyük harf etiketler, sayfalarda sistem metni. Boyutlar 11–96 pt arasında serbest | Ölçek: Display 38 · Title 24 · Body 17 · Label 13 · Caption 12 (altına inilmez); sayfalarda Dynamic Type |
| Renk | Altın (jeton/başarım), yeşil (görev), camgöbeği (garaj/AIR), kırmızı (ROCKET/rozet), mor (DAILY) + beyaz birincil | Bir aksan (camgöbeği ya da gün batımı turuncusu), altın yalnızca ödül, kırmızı yalnızca tehlike/rozet; `HUDPalette`'te anlamlı adlar (`accent`, `reward`, `danger`) |
| Düğmeler | PLAY/RESUME/RETRY beyaz dolu + aralıklı büyük harf; menüde çerçeveli renkli; sayfalarda sistem dolu (sarı, yeşil) | Üç stil: birincil (beyaz dolu), ikincil (çerçeveli, aksan), metin; sayfalardaki "Claim" düğmeleri de bu üçten biri |
| Kartlar | Menü kartı %50 koyu saydam, oyun sonu kartı daha koyu, sayfalar sistem koyu | Tek kart malzemesi (koyu saydam + 1 pt kenar) |
| İkonlar | Sayfalarda SF Symbols, menüde emoji benzeri renkli glifler (🎓 🏆 ⚒), kontrollerde karışık | Tek set; menüde SF Symbols `.medium` |

## Erişilebilirlik

- **Kontrast:** Beyaz HUD yazıları hardShadow ile her zeminde okunur ✅. Riskli: Garaj "Equipped" (gri/gri), 11 pt gri alt yazılar
  (Başarımlar, oyun sonu istatistik etiketleri), AIR etiketi kum üstünde. Hedef 4.5:1; küçük gri metni `.secondary` yerine
  %70 beyaz yap.
- **Dokunma alanı:** Duraklat/ses, boya yuvarlakları, menü düğmeleri 44 pt ✅. "Main menu", "Share", "Skip tutorial" metin
  düğmeleri 44 pt'nin altında.
- **Dynamic Type:** Sayfalar `.system(size:)` ile sabit; Görevler/Başarımlar/Kontroller'de `.font(.body)` vb. ile ölçeklenmeli.
  HUD sabit kalabilir (oyun), ama "Larger Accessibility Sizes"da kartlar taşmamalı.
- **Renk dışı sinyal:** Kilitli boyalarda kilit, görevlerde DAILY/RUN etiketleri metinli ✅. Rozetler yalnızca kırmızı daire +
  sayı ✅.
- **Hareket:** "Hareketi Azalt" kamera sarsıntısını kapatıyor ✅; flaş ve mod parıltısı da azaltılabilir.
- **VoiceOver:** İkon düğmelerinin etiketi var (CircleIconButton) ✅; HUD gizli ✅. Garaj boya yuvarlaklarına renk adı +
  "locked, 400 coins" etiketi.

## İyi olanlar

- Görsel kimlik tutarlı ve sevimli: gün batımı paleti, düşük çokgen, beyaz Roadster; neon şehir ve ROCKET anları mağaza
  görseli kalitesinde.
- HUD disiplini: skor tek büyük sayı, modlar renkle ayrışıyor, AIR çubuğu dilimli ve anlaşılır; takılma yok.
- Akış sürtünmesiz: otomatik pilot adı, tek dokunuşla oyun, eğitim adım sayaçlı ve atlanabilir.
- Oyun sonu kartı: rekor vurgusu, fark, jeton, istatistik, RETRY — doğru sıra ve ölçek.
- Sayfalar HIG'e uygun: başlık + Done, bölüm başlıkları, sistem malzemesi.

## Öncelikli öneriler

1. **Menüyü kahraman görsele çevir** (araç 3/4, wordmark, hint satırlarını kaldır, Updates'i rozete indir) — ilk 2 saniyedeki
   izlenim; mağaza görselleriyle aynı dili konuşur.
2. **Tek tasarım sistemi**: 1 aksan + ödül + tehlike rengi, 3 düğme stili, 5 boyutluk tip ölçeği, tek ikon seti — menü,
   Garaj, Görevler ve sayfalar aynı kitten çıkmış görünsün.
3. **Oyun içi ergonomi ve hatalar**: kontrol tarafı seçimi (sol/sağ), duraklatmada eğitim katmanının gizlenmesi, "?" kutularının
   konuşma balonuna dönmesi, 44 pt metin düğmeleri.

## Tasarım TODO

Etki / efor: Y yüksek · O orta · D düşük. Kaynak kodu yerleri parantez içinde. **Hepsi 2026-10-29'da yapıldı** (aşağıdaki
"Yapılanlar" bölümü); yeni maddeler buraya eklenir.

### P1 — ilk izlenim ve hatalar
- [x] Menü kamerası aracı gösterir; kart alt yarıda (`GameWorld.applyIntroPose`, `MenuCard`) — Y/O
- [x] Wordmark (siteyle ortak SVG → `Assets.xcassets`), "ROADASTAR" metninin yerine — Y/O
- [x] Başlık altı jest satırları kaldırılır; Updates kutusu profil rozetine / kart altı satıra (`MenuCard`, `ContentView`) — O/D
- [x] İkincil düğmeler 2×2 + tam genişlik Garage (araç küçük resmi); tek aksan, SF Symbols ikon (`MenuCard`) — O/D
- [x] Duraklatmada eğitim kartı ve Skip gizlenir (`ContentView` tutorialStep katmanı `!state.isPaused`) — Y/D
- [x] PAUSED / oyun sonu şaka metni: kutusuz italik alıntı (`PauseCard`, `GameOverCard`) — O/D
- [x] "Main menu", "Share", "Skip tutorial" 44 pt dokunma alanı (`PauseCard`, `GameOverCard`, `TutorialCard`) — O/D
- [x] Garaj: kilitli boyada fiyat, "Equipped ✓" etiketi, eşya kartı tek satır + ⓘ (`GarageView`) — O/D

### P2 — sistemleştirme
- [x] `HUDPalette`: `accent`, `reward`, `danger`, `card` anlamlı renkler; yeşil/mor/camgöbeği çerçeveler aksana — O/O
- [x] Tip ölçeği (Display 38 · Title 24 · Body 17 · Label 13 · Caption 12) `HUDFont` ile; 11 pt yok — O/O
- [x] Sayfalarda Dynamic Type (`.font(.body/.caption)` + `minimumScaleFactor`), büyük boyutta taşma testi — O/O
- [x] Üç düğme stili `ButtonStyle` olarak (`PrimaryButton`, `SecondaryButton`, `TextButton`); "Claim" düğmeleri bunlara — O/O
- [x] Kontroller: tek ikon seti; BOOST/ITEM için HUD düğmelerinin minik kopyası (`ControlsView`) — D/D
- [x] Görevler: "Daily" tek kart + 7 günlük seri şeridi; 4 pt çubuk, büyük ödül chip'i (`QuestsView`) — O/O
- [x] Başarımlar: filtre (All · In progress · Done), "Up next" satırı, tamamlanan/kilitli ayrımı, 13 pt alt yazı (`AchievementsView`) — O/O
- [x] HUD: **Controls side** ayarı (sol/sağ aynalama) (`AppSettings`, `ContentView`, `BoostButton`) — Y/O
- [x] Boş ITEM yuvası saydam/gizli; AIR etiketi 13 pt (`HUDView`, `ContentView`) — D/D

### P3 — cila
- [x] Pilot kaydı: "Continue as X" + "Change name"; kural metni yalnızca düzenlemede; arkada araç (`PilotSetupView`) — D/D
- [x] Oyun sonu: sıralama satırı (Game Center), istatistik değerleri 24 pt, profil düğmesi gizli (`GameOverCard`) — O/D
- [x] Lastik dumanı parçacıkları %30 küçük/saydam, kameraya yakın sönümleme (`Effects.setTireSmoke`) — D/D
- [x] Garaj sayfası `.medium` yükseklik + araç kamerası sayfaya göre ortalanır (`GarageView`, `GameWorld.orbitGarageCamera`) — D/O
- [x] Erişilebilirlik turu: gri küçük yazılar %70 beyaz, boya yuvarlaklarına VoiceOver etiketi, "Hareketi Azalt"ta flaş/parıltı kısık — O/D
- [x] Ses düğmesi sessiz durumu (çizgili simge) menü ve HUD'da aynı — D/D

Yeni ekran eklerken: bu belgedeki tip ölçeği, renk adları ve düğme stilleri; mağaza görsellerindeki kahraman açı (bkz.
`AppStore/UPLOAD.md`). Yapılanlar işaretlenip tarih düşülür; `TODO.md` buraya bağlanır.

## Yapılanlar (2026-10-29)

Tesla'nın "ürün önde, arayüz sakin" yaklaşımı ve Roadster teknik verileriyle:

- **Menü (Tesla Roadster ürün sayfası gibi)**: sahne kamerası aracın arkasından-solundan alçak 3/4 ve dar açı
  (`IntroSequence.cameraKeys[0]` `heroStart`'a göre, `GameConfig.menuFieldOfView` 46°); gece "showroom" havası
  (`Atmosphere.showroom`: yıldızlı gök, ufukta ılık parıltı, araca sıcak spot) — PLAY'e basınca intro'nun ilk yarısında
  gündüze ve oyun açısına açılır (`Atmosphere.menuBlend`). Kart ekranın alt yarısında (`ContentView`, üstte %36 boşluk):
  pilot satırı, `Wordmark` (sitedeki `.logo`: eğik, 900, geniş aralık, sert gölge), BEST, tek vurgulu PLAY, altında ince
  ayraçlı liste satırları (ödül bekliyor · How to play · Controls · Achievements · Quests · Garage (boya noktası) · Ranking).
  Updates kutusu ve başlık altı jest satırları kaldırıldı (`UpdatesPanel` silindi; bekleyen ödüller tek satır).
- **Showroom (menüdeki araç, Tesla Roadster sayfası gibi "fütüristik")**: `RoadsterModel.makeShowroom` araca bağlı
  parlak koyu sahne zemini (metalik, aracın gölgesini alır), camgöbeği alt neon, katmanlı LED stop parıltısı, far
  hüzmeleri; `GameWorld` mavi rim ışığı (`rimLight`, arkadan-soldan), spot ışığında süzülen toz ve hafif kamera salınımı
  ekler. Intro'nun ilk yarısında küçülerek/sönerek kapanır (`setShowroom`), Garaj'da da açık.
- **Easter egg — teknik veriler**: wordmark'a basılı tutunca (VoiceOver: "Spec sheet" eylemi) 6 sn'lik kart: `SpecRow`
  (0–100 km/sa 2,1 s — Roadster'ın ilan değeri `GameConfig.zeroToHundredSeconds`; azami hız `GameConfig.topSpeedKmh` = hız
  tablosunun sonu 360 km/sa; 10 itici `RoadsterModel.nozzleCount`; AIR 600 L) ve "Roadster'dan esinle" satırı. Ana
  ekranda ve Garaj'da görünmez.
- **Tasarım sistemi** (`HUDComponents`): `HUDPalette.accent/reward/danger/card/secondaryText`, `HUDFont` ölçeği (38/24/17/13/12),
  `PrimaryButtonStyle` / `SecondaryButtonStyle` / `TextButtonStyle` (`.primary`, `.secondary(tint)`, `.text`), `RewardChip`,
  `WideProgressBar`, `Badge`, `StoryQuote`, `SpecRow`. Kartlar `HUDPalette.card`.
- **Hatalar**: duraklatmada eğitim kartı ve Skip gizli; bahane metni kutusuz eğik alıntı (`StoryQuote`); metin düğmeleri
  44 pt (`TextButtonStyle`). Not: simülatör emoji fontu olmadığında bahane emojisi "?" kutusu olarak görünür; cihazda normal.
- **Garaj**: Paint · Items sekmeleri, kilitli boyada "R 1.000",
  "Equipped ✓" etiket, eşya kartı tek satır + ⓘ, panel yüksekliği 0,52.
- **Görevler**: "Daily" kartı: 7 günlük seri şeridi (+10…+50), seri ödülü, ziyaret jetonu; görev satırlarında `RewardChip`,
  4 pt `WideProgressBar`, ikincil metinler `secondaryText`.
- **Başarımlar**: özet ilerleme çubuğu, filtre (All · In progress · Done), "Up next" (ilerlemesi en yüksek iki başarım),
  tamamlananlar altın dolgu, kilitliler soluk, alt yazılar 13 pt.
- **Kontroller**: tek SF Symbols seti (aksan renginde kutu ikonlar).
- **HUD**: Profil → Kontroller → **BOOST ve ITEM tarafı** (Sol/Sağ, `AppSettings.controlsSide`; bildirim kartları karşı tarafa
  geçer); boş ITEM yuvası soluk ve kesiksiz; AIR etiketi 13 pt, ipuçları 12 pt; "Hareketi Azalt"ta mod parıltısı soluk.
- **Pilot kaydı**: hazır adla CONTINUE + "Change name" (düzenlemede kural metni); kamera aracı gösterir.
- **Oyun sonu**: istatistik değerleri 24 pt, etiketler 12 pt; Game Center açıksa "Ranking" satırı; profil düğmesi yalnızca menüde.
- **Parçacık**: lastik dumanı %25 küçük, daha saydam, daha kısa ömür.
- **Dokunma girişi UIKit'te** (`TouchInputView`, 2026-10-29): SwiftUI `DragGesture` tek parmaktı ve BOOST'a basmak ya da
  eşya bildirimi gibi ikinci bir dokunuş/görünüm değişikliği onu iptal edince `onEnded` gelmiyordu → araç "basılı
  tutuluyor" sanıp havada asılı kalıyordu. Çok dokunuşlu `UIView`: ilk dokunuş kontrol, BOOST dairesine gelen dokunuş
  boost, `touchesCancelled` ve pencereden ayrılma da bitiş. BOOST düğmesi yalnızca görsel + VoiceOver. Koşuda ekran
  uykuya dalmaz (`isIdleTimerDisabled`), alt kenar jesti ertelenir (`defersSystemGestures`).
- **Bahane simgeleri SF Symbols** (`CrashStory.symbol`): emoji, fontu olmayan ortamda "?" kutusu çıkarıyordu.
- **Ağır çekim varsayılanı kapalı**; **Game Center sonradan açılınca** cihazdaki rekor sıralamaya gönderilir
  (`GameCenter.onAuthenticated`).
- **Tur sonu temizliği** `runEndClearsPreviousRun` testiyle doğrulandı: sahne menüdeki boyuna döner, akış/eşya/skor sıfır.
- **Erişilebilirlik**: sayfalardaki `.secondary` metinler `secondaryText` (%72 beyaz); boya yuvarlaklarında ad + fiyat etiketi
  zaten vardı; ses düğmesi sessiz simgesi iki yerde de aynıydı; sayfalar metin stilleriyle Dynamic Type'a zaten uyuyordu.

## Yerel hatırlatıcılar (2026-10-30)

`Core/Reminders.swift` (`ReminderPlanner` saf plan + `ReminderCenter` bildirim merkezi), metinler `Reminders.xcstrings` (EN/TR).

| Tür | Ne zaman | Dokununca |
|---|---|---|
| Ödül bekliyor | Son açılıştan 3 sa sonra (alınmamış ödül varsa) | Görevler |
| Seri tehlikede | Ertesi gün 19:00 (seri ≥ 2) | Görevler |
| Rekora yakın | Ertesi gün 12:30 (son tur rekorun %80'i ile %100'ü arası) | Menü |
| Yeni günlük görevler | Ertesi gün 12:00 | Görevler |
| Geri dönüş | 3. gün 18:00, son olarak 7. gün 18:00 | Menü |

- Günde en fazla bir (aynı güne düşenlerden öncelikli olan kalır); 21:30–09:00 arası olanlar 09:30'a kayar.
- Uygulama arka plana geçince ve tur bitince bekleyenler silinip yeniden kurulur; uygulama öndeyken bildirim gösterilmez.
- İzin ilk açılışta değil, ilk tur bitip menüye dönünce kendi kartımızla (`ReminderOfferCard`) istenir; "Şimdi değil"
  hatırlatıcıları kapatır. Profil → Hatırlatıcılar: ana anahtar ve üç tür; sistem izni kapalıysa Ayarlar'a yönlendirir.
- Testler: `ReminderTests` (günde bir, sessiz saat, öncelik, kapalı türler, rekora yakınlık).
