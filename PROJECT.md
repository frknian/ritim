# Habbit — Proje Özeti ve Vizyon Belgesi (PROJECT.md)

## 1. Vizyon ve Ürün Tanımı

**Habbit**, bireylerin günlük rutinlerini inşa etmelerini, zararlı alışkanlıklarını bırakmalarını ve yaşam alanlarını dengeli bir şekilde yönetmelerini sağlayan, üstün kullanıcı deneyimine sahip, modern ve çevrimdışı öncelikli (offline-first) bir Android alışkanlık takip uygulamasıdır.

Piyasadaki karmaşık, reklam dolu ve abonelik baskısı kuran uygulamaların aksine Habbit; **sakin, minimalist, karanlık tema odaklı ve tamamen kullanıcı odaklı** bir deneyim sunar. Kullanıcının dikkati dağıtılmaz; mikro etkileşimler, akıcı geçişler ve dokunsal geri bildirimler (haptic feedback) ile alışkanlık tamamlama anı ödüllendirici bir deneyime dönüştürülür.

---

## 2. Temel Ürün Prensipleri

1. **Özgün Tasarım Dili (Habbit Design System):**
   Mevcut popüler uygulamaların (Streaks, Habitica, Fabulous vb.) görsel kimliğini veya şablonlarını kopyalamak yerine, Android'in Material 3 yönergelerinden seçici olarak beslenen ancak kendi özgün, sakin ve karanlık odaklı tipografik kimliğine sahip bir arayüz oluşturulur.
2. **Çevrimdışı Öncelikli (Offline-First) Mimari:**
   Uygulamanın tüm temel işlevleri (oluşturma, takip, analiz, takvim, hatırlatıcılar) yerel SQLite veritabanı üzerinde %100 çevrimdışı ve sıfır gecikmeyle çalışır. İnternet bağlantısı hiçbir temel özellik için önkoşul değildir.
3. **Android'e Özel İnce Ayarlar:**
   - Uçtan uca (edge-to-edge) şeffaf sistem çubukları.
   - Doğal Android geri tuşu (`BackHandler`) ve öngörülü geri hareketi desteği.
   - Android Bildirim Kanalları (`Notification Channels`) ile kategorize edilmiş yerel bildirimler.
   - Minimum 48x48dp dokunma hedefleri ve hassas Android dokunsal geri bildirimler (`Expo Haptics`).
4. **Çift Yönlü Alışkanlık Yönetimi (Kazan / Bırak):**
   Sadece iyi alışkanlıklar edinmekle kalmaz; sigara, şeker, sosyal medya gibi bırakılmak istenen davranışlar için "nüksetme" (relapse) takibi ve temiz gün sayaçları sağlar.
5. **Esnek Takip Boyutları:**
   Yalnızca "Evet/Hayır" değil; sayısal hedefler (sayfa, bardak, km), süre hedefleri (dakika sayacı) ve özel birimler desteklenir.
6. **%100 Türkçe Kullanıcı Arayüzü:**
   Tüm kullanıcı arayüzü, bildirimler, hata mesajları, boş durumlar ve formlar doğal, akıcı ve doğru Türkçe ile hazırlanmıştır.

---

## 3. Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji | Seçim Gerekçesi |
| :--- | :--- | :--- |
| **Çatı (Framework)** | React Native (Expo SDK 52+) | Hızlı geliştirme döngüsü, kararlı Android desteği ve modern araç ekosistemi. |
| **Dil** | TypeScript (Strict Mode) | Tip güvenliği, sıfır çalışma zamanı tipi hataları, net domain modelleri. |
| **Stil / Arayüz** | NativeWind (Tailwind CSS v4 / v3 RN) | Hızlı, tutarlı stil yönetimi, optimize karanlık tema sınıfları. |
| **Durum Yönetimi** | Zustand | Hafif, boilerplate içermeyen, seçici render (re-render) optimizasyonlu reaktif durum. |
| **Yerel Veritabanı** | Expo SQLite (`expo-sqlite/next`) | Sıfır gecikmeli yerel depolama, ACID garantisi, ilişkisel veri sorgulama gücü. |
| **Grafikler & Analitik** | Victory Native (v40+ Skia tabanlı) | Akıcı, donanım hızlandırmalı 60 FPS grafikler ve minimalist veri görselleştirme. |
| **Bildirimler** | Expo Notifications | Yerel Android bildirim kanalları, zamanlanmış alarmlar ve günlük değerlendirmeler. |
| **Dokunsal Geri Bildirim**| Expo Haptics | Alışkanlık tamamlandığında Android titreşim motoru ile ödüllendirici mikro geri bildirim. |
| **Bulut Senkronizasyonu** | Supabase (Opsiyonel / İleride) | Kullanıcı isterse şifrelenmiş yedekleme ve cihazlar arası senkronizasyon için hazır şema. |

---

## 4. Kapsam ve Sınırlar

- **Hedef Platform:** Yalnızca Android akıllı telefonlar ve pratik ölçekte Android tabletler. iOS'e özel kütüphaneler, stiller veya izin mekanizmaları dahil edilmez.
- **İnternet Bağımlılığı:** Sıfır. Uygulama uçak modunda dahi eksiksiz çalışır.
- **Dil Politikası:** Kod tabanı (fonksiyonlar, tipler, SQL tabloları) İngilizce; ekranda son kullanıcıya görünen her bir kelime istisnasız Türkçedir.

---

## 5. Başarı Kriterleri

1. Uygulama açılış süresinin soğuk başlatmada 1.5 saniyenin altında olması.
2. Alışkanlık tamamlama butonuna dokunulduğunda 16ms içinde reaktif UI güncellemesi ve haptic tepki verilmesi.
3. 100'den fazla alışkanlık ve 10.000'den fazla geçmiş kaydında dahi takvim ve istatistik sorgularının <50ms sürmesi.
4. Sıfır arayüz çökmesi, kusursuz Android geri tuşu akışı ve anlaşılır hata yönetimleri.
