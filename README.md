# Ritim 🌿

> **Sakin, odaklı ve bilinçli alışkanlık takip uygulaması.**  
> *Modern, tamamen çevrimdışı (offline-first) ve bağımsız (standalone) Android alışkanlık takipçisi.*

---

## 📖 Genel Bakış

**Ritim**, günlük rutinlerinizi ve hedeflerinizi sakin, odaklı ve estetik bir arayüzle yönetmeniz için geliştirilmiş modern bir alışkanlık takip uygulamasıdır. Alışkanlık kazanma ve zararlı alışkanlıkları bırakma süreçlerini zinciri kırma psikolojisi, detaylı istatistikler, ana ekran widget'ları ve esnek takvim özelleştirmeleri ile destekler.

Tüm verileriniz **yalnızca kendi cihazınızda** yerel SQLite veritabanında saklanır; internet bağlantısı veya üyelik gerektirmez.

---

## ✨ Temel Özellikler

### 🌿 1. Modern Tasarım & Dinamik Tema
- **Logo Yeşili Vurgu:** Marka kimliğiyle uyumlu zümrüt ve nane yeşili (`#10B981` & `#4CD482`) odak renkleri.
- **Karanlık (Obsidian) ve Aydınlık (Saf Beyaz) Mod:** Göz yormayan, sistem temasına veya tercihe göre anında değişen yüksek kontrastlı arayüz.
- **Doğal Gezinme:** Donanım geri tuşu, jest desteği ve alt sekme geçmişini (history stack) tam destekleyen ekran akışı.

### 📅 2. Akıllı Takvim & Günlük Yapılacaklar Özelleştirme
- **Aylık Matris Görünümü:** Günlük tamamlanma oranına göre dinamik gösterge noktaları (kısmi başarıda mavi, tam başarıda yeşil).
- **Her Güne Özel "Düzenle" Butonu:**
  - Tamamlandı / Tamamlanmadı durumunu doğrudan değiştirme.
  - Sayısal ve süreli alışkanlıklar için `-5`, `-1`, serbest giriş, `+1`, `+5`, **Sıfırla** ve **Hedefe Ulaş** kısayolları.
  - Günlük seans notları ekleme ve kaydetme.
  - Alışkanlığın genel ayarlarını düzenlemeye doğrudan köprü.

### 🔄 3. Çift Yönlü Canlı Senkronizasyon
- Takvimde, Bugün ekranında veya modallarda yapılan tüm güncellemeler anında SQLite veritabanına, global Zustand durumuna ve ana ekran widget'larına yansıtılır.
- Veriler ekranlar arasında gecikmesiz, tutarlı ve senkronizedir.

### 🧩 4. Android Ana Ekran Widget'ları (App Widgets)
- **Ritim: Günlük Alışkanlıklar (`HabbitTodayWidget`):** Bugünün alışkanlıklarını ana ekrandan doğrudan görüp tek tıkla tamamlama.
- **Ritim: Günlük İlerleme (`HabbitSummaryWidget`):** Günlük başarı yüzdesi, tamamlanan ve kalan görevlerin kompakt özeti.
- **Ritim: Zinciri Kırma (`HabbitChainWidget`):** Seçtiğiniz alışkanlığın mevcut serisi ve son 7 günlük zincir matrisi.

### 🏆 5. Zinciri Kırma, Seriler & Ödül Sistemi
- **Akıllı Seri Motoru (`StreakEngine`):** Günlük, hafta içi, hafta sonu, özel günler veya aralıklı tekrarlama modlarına duyarlı seri hesaplama.
- **Dönüm Noktaları & Ödüller:** Belirlediğiniz serilere (ör. 7 gün, 21 gün, 100 gün) ulaştığınızda kendi tanımladığınız ödülleri açma ve kutlama.
- **Kazanılan & Bırakılan Alışkanlıklar:** Alışkanlık inşa etme (`build`) veya zararlı alışkanlığı bırakma (`quit`) modları.

### 📊 6. Derinlemesine İstatistikler & Grafikler
- 7 Gün, 30 Gün, Bu Ay, Bu Yıl ve Tüm Zamanlar filtreleri.
- Başarı oranı, mevcut seri, en uzun seri ve toplam tamamlama metrikleri.
- Haftanın en başarılı günü ve haftalık tutarlılık grafiği.
- Yaşam alanlarına göre gelişim dengesi.

### 🔔 7. Bildirimler, Titreşim & Güvenli Yedekleme
- Her alışkanlık için özel saatlerde hatırlatıcı bildirimler.
- Akşam saatinde günlük değerlendirme bildirimi.
- Dokunsal geri bildirim (Haptics) özelleştirmeleri.
- **Yedekleme & Dışa Aktarma:**
  - Tek tıkla tam JSON veritabanı yedeği oluşturma ve geri yükleme.
  - Tablo analizleri için aktivite dökümünü CSV formatında indirme.

---

## 🛠️ Teknoloji Yığını

| Alan | Teknoloji / Kütüphane |
| :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) 0.86.3 & [Expo](https://expo.dev/) SDK 57 |
| **Dil** | [TypeScript](https://www.typescriptlang.org/) |
| **Veritabanı** | [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Yerel, şifresiz, offline-first) |
| **Widget Motoru** | [react-native-android-widget](https://github.com/sBugalsky/react-native-android-widget) |
| **Durum Yönetimi** | [Zustand](https://github.com/pmndrs/zustand) |
| **İkonlar** | [Lucide React Native](https://lucide.dev/) |
| **Bildirimler** | [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) |
| **Dokunsal Geri Bildirim** | [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) |
| **Dosya & Paylaşım** | [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/) & [Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/) |

---

## 🚀 Kurulum ve Başlangıç

### Önkoşullar
- **Node.js:** v18 veya üzeri
- **Paket Yöneticisi:** `npm` veya `yarn`
- **Android Geliştirme:** Android Studio, Android SDK Platform 34/35/36, JDK 17

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/frknian/ritim.git
cd ritim
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Uygulamayı Cihazda / Emülatörde Çalıştırın
```bash
npx expo run:android
```

---

## 📦 Standalone Release APK Derleme

Uygulama Metro geliştirme sunucusuna ihtiyaç duymadan, doğrudan fiziksel Android cihazlara yüklenebilir bağımsız APK olarak derlenebilir:

```bash
# Yerel native klasörü oluşturun (gerekliyse)
npx expo prebuild --platform android

# Release APK derleyin
cd android
./gradlew assembleRelease
```

Derlenen APK dosyası şu dizinde üretilir:
```
android/app/build/outputs/apk/release/app-release.apk
```

**Cihazınıza doğrudan yüklemek için:**
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

---

## 📂 Proje Dizin Yapısı

```text
ritim/
├── assets/                  # Başlatıcı simgeleri, adaptif ikonlar ve splash ekranı
├── src/
│   ├── components/          # Yeniden kullanılabilir UI bileşenleri
│   │   ├── common/          # Butonlar, modallar, ikonlar, üst başlık vb.
│   │   ├── habit/           # Alışkanlık kartları, form modalı, detay modalı
│   │   ├── area/            # Yaşam alanı formları ve kartları
│   │   └── navigation/      # Alt sekme çubuğu (TabBar)
│   ├── screens/             # Uygulama ekranları
│   │   ├── TodayScreen.tsx        # Ana ekran (Bugün ve hızlı tamamlama)
│   │   ├── CalendarScreen.tsx     # Takvim ve günlük yapılacaklar özelleştirme
│   │   ├── StatisticsScreen.tsx   # Grafik ve başarı analitikleri
│   │   ├── AreasScreen.tsx        # Yaşam alanları dengesi
│   │   ├── SettingsScreen.tsx     # Ayarlar, tema, bildirimler ve yedekleme
│   │   └── ArchiveScreen.tsx      # Arşivlenen alışkanlıklar
│   ├── db/                  # SQLite istemcisi ve repository katmanı
│   │   ├── client.ts
│   │   └── repositories/    # Habit, Entry, Area, Settings, Reward repository'leri
│   ├── store/               # Zustand global state (useHabitStore, useAreaStore, etc.)
│   ├── services/            # Bildirim, widget, yedekleme ve seri hesaplama servisleri
│   ├── widgets/             # Android ana ekran widget tanımları
│   ├── utils/               # Tarih, haptik ve yardımcı fonksiyonlar
│   └── constants/           # Tema renkleri, tipografi ve Türkçe metinler
├── App.tsx                  # Kök bileşen, sekme yönetimi ve geri tuşu işleyicisi
├── app.json                 # Expo konfigürasyonu ve widget plugin tanımları
├── package.json             # Bağımlılıklar ve scriptler
└── README.md
```

---

## 🔒 Gizlilik & Güvenlik

- **Sıfır İzleme:** Uygulama içerisinde hiçbir analitik, izleyici veya üçüncü taraf reklam SDK'sı bulunmaz.
- **Tamamen Çevrimdışı:** Verileriniz asla uzak bir sunucuya gönderilmez.
- **Yedek Kontrolü:** Verilerinizi istediğiniz zaman şifresiz JSON olarak cihazınıza kaydedebilir veya dilediğiniz cihaza aktarabilirsiniz.

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
