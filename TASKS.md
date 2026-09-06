# Habbit — Uygulama Görevleri ve Yol Haritası (TASKS.md)

Bu belge, Habbit uygulamasının sıfırdan üretime hazır hale getirilmesi için uygulanacak fazları, sıralı görevleri ve doğrulama adımlarını listeler.

---

## Faz 1: Proje Temeli ve Android Çekirdek Kurulumu
- [x] **Görev 1.1:** Expo projesini TypeScript şablonuyla başlatma (`expo-router` veya React Navigation, Expo SDK 52+).
- [x] **Görev 1.2:** NativeWind (Tailwind CSS) yapılandırmasını tamamlama ve `tailwind.config.js` içine `UI_RULES.md` renk paleti değişkenlerini ekleme.
- [x] **Görev 1.3:** Android'e özel ayarları (`app.json`) tanımlama:
  - Yalnızca dikey yönelim (`portrait`).
  - Şeffaf durum çubuğu ve gezinme çubuğu (edge-to-edge).
  - Android izinleri (POST_NOTIFICATIONS, SCHEDULE_EXACT_ALARM).
  - Uyarlanabilir ikon (adaptive icon) ve splash ekranı konfigürasyonu.
- [x] **Görev 1.4:** Temel bağımlılıkların kurulumu:
  - `expo-sqlite`
  - `zustand`
  - `expo-notifications`
  - `expo-haptics`
  - `victory-native` & `@shopify/react-native-skia`
  - `lucide-react-native` veya `@expo/vector-icons`
  - `date-fns` veya hafif tarih kütüphanesi

---

## Faz 2: Tasarım Sistemi ve Paylaşılan Arayüz Bileşenleri
- [x] **Görev 2.1:** Merkezi tema sabitlerinin oluşturulması (`src/constants/theme.ts`, `src/constants/strings.ts` - %100 Türkçe sözlük).
- [x] **Görev 2.2:** `ScreenContainer` bileşeni (Android durum çubuğu, güvenli alan boşluğu ve koyu arka plan yönetimi).
- [x] **Görev 2.3:** Atomik UI bileşenleri:
  - `AppButton`: Birincil, İkincil, Yıkıcı, Hayalet varyantları.
  - `AppCard`: Sakin kenarlıklı ve hafif derinlikli yüzey kartı.
  - `AppInput`: Türkçe yer tutuculu, etiketli ve hata mesajlı giriş alanı.
  - `AppBadge`: Renkli alan ve durum etiketleri.
  - `ProgressBar` & `CircularProgress`: Yüzdelik ilerleme göstergeleri.
- [x] **Görev 2.4:** Dokunsal geri bildirim sarmalayıcısı (`src/utils/haptics.ts`).

---

## Faz 3: SQLite Veritabanı ve Migrasyon Katmanı
- [x] **Görev 3.1:** SQLite veritabanı bağlantı yöneticisinin yazılması (`src/db/client.ts`).
- [x] **Görev 3.2:** DDL şeması ve migrasyon yöneticisi (`src/db/schema.ts`, `src/db/migrations.ts`):
  - `areas`, `habits`, `habit_reminders`, `habit_entries`, `user_settings`, `sync_log` tabloları.
  - Performans indekslerinin oluşturulması.
- [x] **Görev 3.3:** Veri erişim depolarının (Repositories) yazılması:
  - `AreaRepository`: Alan ekleme, listeleme, güncelleme, silme.
  - `HabitRepository`: Alışkanlık CRUD, filtreleme, arşivleme/geri yükleme.
  - `EntryRepository`: Günlük kayıt oluşturma/güncelleme, tekil gün sorguları, tarih aralığı sorguları.
  - `SettingsRepository`: Anahtar-değer ayar okuma ve yazma.
- [x] **Görev 3.4:** Başlangıç verisi tohumlayıcı (Varsayılan 6 yaşam alanı ve örnek alışkanlıklar).

---

## Faz 4: Çekirdek İş Motorları (Domain Engines)
- [x] **Görev 4.1:** `RecurrenceEngine`:
  - Belirli bir tarihte alışkanlığın aktif olup olmadığını hesaplama (`isHabitActiveOnDate`).
  - Haftalık/Aylık kota hedeflerinin periyot içi durumunu doğrulama.
- [x] **Görev 4.2:** `StreakEngine`:
  - Mevcut seri (Current Streak) ve en uzun seri (Longest Streak) hesaplama algoritması.
  - Bırakılan alışkanlıklar (Quit) için temiz gün sayacı ve nüksetme hesaplayıcısı.
- [x] **Görev 4.3:** Tarih yardımcıları (`src/utils/date.ts`):
  - Türkçe gün ve ay adlandırmaları, yerel saat dilimi koruması, hafta başı/sonu aralıkları.

---

## Faz 5: Zustand Durum Katmanı (State Management)
- [x] **Görev 5.1:** `useHabitStore`:
  - Aktif ve arşivli alışkanlıklar listesi.
  - İyimser tamamlama (`toggleCompletion`, `incrementValue`, `logQuitRelapse`).
  - Filtreleme (Seçili alan, alışkanlık tipi).
- [x] **Görev 5.2:** `useAreaStore`:
  - Yaşam alanları listesi, aktif alan seçimi, alana özel istatistikleri getirme.
- [x] **Görev 5.3:** `useSettingsStore`:
  - Günlük değerlendirme bildirim saati, pano sıralaması, kompakt mod seçimi.

---

## Faz 6: Navigasyon ve Ekran İskeleti
- [x] **Görev 6.1:** 4 Ana sekme yerleşimi (Bottom Tab Bar):
  - *Bugün*, *Takvim*, *İstatistikler*, *Alanlar*.
  - Android ergonomisine uygun ikonlar ve Türkçe etiketler.
- [x] **Görev 6.2:** Android donanım geri tuşu yönetimi (`BackHandler`).
- [x] **Görev 6.3:** Yığın navigasyonu (Alışkanlık Ekle/Düzenle modalı, Detay sayfası, Ayarlar, Arşiv).

---

## Faz 7: "Bugün" (Today Dashboard) Ekranı
- [x] **Görev 7.1:** Günün tarihi ve genel ilerleme özeti (Progress Hero) kartı.
- [x] **Görev 7.2:** Yatay yaşam alanı filtre çipleri (Area Filter Chips).
- [x] **Görev 7.3:** Alışkanlık kartı varyantları:
  - Boolean: Tek dokunuşla tamamlama halkası ve başarı animasyonu.
  - Sayısal: `[-]` ve `[+]` butonları ile doğrudan sayaç yönetimi.
  - Süre: Hızlı loglama ve sayaç arayüzü.
  - Bırak (Quit): Temiz gün rozeti ve "Nüksetti" butonu.
- [x] **Görev 7.4:** Boş durum (Empty State) görünümü ve hızlı alışkanlık ekleme FAB butonu.

---

## Faz 8: Alışkanlık Oluşturma ve Düzenleme Akışı
- [x] **Görev 8.1:** Form ekranı: Alışkanlık Tipi (Kazan / Bırak) seçicisi.
- [x] **Görev 8.2:** İsim, açıklama, renk paleti ve ikon seçicisi.
- [x] **Görev 8.3:** Takip modu ve hedef belirleme (Boolean / Sayısal / Süre, özel birimler).
- [x] **Görev 8.4:** Tekrar sıklığı seçicisi (Her gün, Belirli günler, Hafta içi, Hafta sonu, Aralık).
- [x] **Görev 8.5:** Hatırlatıcı saatleri yapılandırma ve form doğrulama (Türkçe hata mesajları).

---

## Faz 9: "Takvim" Ekranı ve Geçmişe Dönük Kayıt
- [x] **Görev 9.1:** Aylık takvim matrisi (Aylar arası geçiş, gün hücreleri).
- [x] **Görev 9.2:** Isı haritası renklendirmesi (Günün tamamlanma oranına göre dinamik gösterge).
- [x] **Görev 9.3:** Gün seçildiğinde alt panelde o günün alışkanlık listesini ve tamamlanma durumlarını listeleme.
- [x] **Görev 9.4:** Geçmişe dönük değer güncelleme ve gün notu ekleme işlevi.

---

## Faz 10: "Alanlar" (Yaşam Alanları) Ekranı
- [x] **Görev 10.1:** Alan kartları listesi (Alana ait ikon, renk, aktif alışkanlık sayısı, tamamlanma yüzdesi).
- [x] **Görev 10.2:** Yeni alan ekleme ve mevcut alanı düzenleme modalı.
- [x] **Görev 10.3:** Alana dokunulduğunda o alana ait alışkanlıkların ve haftalık performansın detay dökümü.

---

## Faz 11: "İstatistikler" Ekranı ve Grafikler
- [x] **Görev 11.1:** Dönem seçici filtresi (Son 7 Gün, Son 30 Gün, Bu Ay, Bu Yıl, Tüm Zamanlar).
- [x] **Görev 11.2:** 4 Temel metrik kartı (Genel Başarı Oranı, En Uzun Seri, Toplam Eylem, En İyi Gün).
- [x] **Görev 11.3:** Victory Native ile haftalık ve aylık tamamlama tutarlılık grafikleri.
- [x] **Görev 11.4:** Alışkanlık bazında sıralı başarı dökümü.

---

## Faz 12: Android Bildirimleri ve Hatırlatıcı Motoru
- [x] **Görev 12.1:** Android bildirim kanallarını (`habit_reminders`, `daily_review`) açılışta tescil etme.
- [x] **Görev 12.2:** Alışkanlık hatırlatıcılarını yerel alarm olarak zamanlama (`scheduleNotificationAsync`).
- [x] **Görev 12.3:** Günlük Değerlendirme (Daily Review) akşam bildirimini ayarlama ve yönetme.
- [x] **Görev 12.4:** Alışkanlık silindiğinde veya güncellendiğinde zamanlanmış bildirimleri senkronize etme / iptal etme.

---

## Faz 13: Ayarlar, Arşiv ve Veri Yedekleme
- [x] **Görev 13.1:** Ayarlar ekranı: Günlük Değerlendirme saati, kompakt görünüm anahtarı.
- [x] **Görev 13.2:** Arşivlenen alışkanlıklar ekranı: Listeleme, Geri Yükleme ve Kalıcı Silme.
- [x] **Görev 13.3:** Veri Dışa Aktarma:
  - SQLite tablosunu JSON dosyası olarak üretme ve paylaşma (`expo-sharing`).
  - İnsan tarafından okunabilir CSV aktivite dökümü.
- [x] **Görev 13.4:** Veri İçe Aktarma: JSON dosyasından veritabanını kurtarma.

---

## Faz 14: Android Optimizasyonu, Test ve Cila
- [x] **Görev 14.1:** Kenardan kenara (edge-to-edge) sistem çubuklarının Android cihazlarda test edilmesi.
- [x] **Görev 14.2:** Dokunsal geri bildirimlerin (Haptics) tüm kritik butonlarda hissedilmesinin doğrulanması.
- [x] **Görev 14.3:** 1.000+ kayıt ile SQLite sorgu performansının ve bellek kullanımının ölçülmesi.
- [x] **Görev 14.4:** Tüm arayüz metinlerinin Türkçe imla, terminoloji ve ton açısından denetlenmesi.
