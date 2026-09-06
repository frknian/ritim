# Habbit — Özellikler ve Fonksiyonel Gereksinimler (FEATURES.md)

Bu belge, Habbit uygulamasının tüm temel yeteneklerini, mantıksal kurallarını ve kullanıcı senaryolarını detaylandırır.

---

## 1. Alışkanlık Tipleri (Habit Types)

Habbit iki temel alışkanlık modelini destekler:

### 1.1. Alışkanlık Kazan (Build Habit)
- **Amaç:** Kullanıcının hayatına katmak veya artırmak istediği pozitif eylemler (Örn: "Günde 2 Litre Su İç", "Kitap Oku", "Spor Yap").
- **Tamamlama Mantığı:** Gün içerisinde belirlenen hedef değere ulaşıldığında gün "başarılı" (completed) olarak işaretlenir.
- **Seri (Streak) Kuralı:** Alışkanlığın tekrar planına göre hedefin tutturulduğu her ardışık dönemde seri 1 artar. Hedef kaçırılırsa seri sıfırlanır.

### 1.2. Alışkanlığı Bırak (Quit Habit)
- **Amaç:** Kullanıcının terk etmek veya azaltmak istediği negatif eylemler (Örn: "Sigarayı Bırak", "Şeker Tüketme", "Gece Geç Uyumak").
- **Temiz Gün Mantığı:** Kullanıcı nüksetme (relapse) bildirmediği sürece gün otomatik olarak başarılı kabul edilir veya gün sonunda temiz gün onaylanır.
- **Nüksetme (Relapse) Yönetimi:** Kullanıcı "Nüksetti" (Relapsed) butonuna bastığında serisi sıfırlanır, not ekleme ekranı açılarak nüksetme sebebi (tetikleyici) kaydedilebilir.
- **Tasarruf / Sayaç:** Bırakılan alışkanlık için "Temiz Geçen Gün Sayısı" ve nüksetmesiz en uzun dönem görselleştirilir.

---

## 2. Takip Modları (Tracking Modes)

| Takip Modu | Tanım | Örnek Kullanım | Arayüz Etkileşimi |
| :--- | :--- | :--- | :--- |
| **Mantıksal (Boolean)** | Yapıldı / Yapılmadı | "Yatağı topla", "Meditasyon yap" | Tek dokunuşla onay kutusu veya kaydırma (swipe). |
| **Sayısal Hedef (Numeric)** | Belirli bir adede/ölçüye ulaşma | "20 sayfa kitap", "8 bardak su" | Hızlı `+` / `-` butonları veya sayısal değer girme tuş takımı. |
| **Süre Hedefi (Duration)** | Belirli bir zaman ayırma | "45 dk ders çalışma", "20 dk yürüyüş" | Dahili geri sayım sayacı (timer) veya el ile dakika girişi. |
| **Özel Birimler (Custom Units)**| Kullanıcı tanımlı metrik | "km", "sayfa", "bardak", "kelime", "adım" | Dinamik birim etiketi ile hedefe oran gösterimi (`12/20 sayfa`). |

---

## 3. Tekrar ve Periyot Sistemi (Repeat System)

Alışkanlıkların takvimde hangi günlerde aktif olacağını belirleyen esnek motor:

1. **Her Gün (Daily):** Haftanın 7 günü zorunlu.
2. **Belirli Günler (Selected Weekdays):** Pazartesi, Çarşamba, Cuma gibi seçili günlerde aktif.
3. **Hafta İçi (Weekdays):** Yalnızca Pazartesi - Cuma arası.
4. **Hafta Sonu (Weekends):** Cumartesi ve Pazar günleri.
5. **Haftada X Kez (X times per week):** Haftalık esnek kota (örn. haftada 3 gün spor). Haftanın herhangi 3 günü tamamlandığında haftalık hedef sağlanmış olur.
6. **Ayda X Kez (X times per month):** Aylık periyot içinde hedeflenen toplam gün sayısı.
7. **Her N Günde Bir (Every N days):** Örneğin 2 günde bir, 3 günde bir döngüsel plan.

---

## 4. Yaşam Alanları (Life Areas)

Alışkanlıklar hayatın farklı kompartımanlarına ayrılarak bütünsel gelişim takip edilir:

- **Varsayılan Alanlar:**
  - Matematik & Bilim
  - Siber Güvenlik & Yazılım
  - Kitap & Entelektüel
  - Satranç & Zihin
  - Sağlık & Spor
  - Kişisel Gelişim
- **Alan Metrikleri:**
  - İlgili alandaki aktif alışkanlık sayısı.
  - Alana ait genel tamamlama yüzdesi (son 7 gün ve son 30 gün).
  - Alana özel haftalık performans grafiği.
  - Alana özel renk ve ikon ataması.

---

## 5. Seri (Streak) ve Başarı Motoru

- **Mevcut Seri (Current Streak):** Kesintisiz devam eden tamamlama sayısı.
- **En Uzun Seri (Longest Streak):** Kullanıcının kırdığı rekor seri.
- **Seri Hedefleri (Streak Goals):** Örneğin "21 Günlük Yeni Başlangıç", "66 Günlük Alışkanlık Kilidi", "100 Günlük Ustalık" hedefleri ve hedef tamamlandığında görsel tebrik.
- **Telafi / Dondurma Opsiyonu (İleride):** Hastalık veya tatil durumunda seriyi bozmamak için kısıtlı dondurma hakkı mimariye uygun tasarlanır.

---

## 6. Bugün Panosu (Home Dashboard)

- **Tarih Başlığı:** Türkçe gün, ay, yıl gösterimi (Örn: "5 Eylül Cumartesi").
- **Günlük Genel İlerleme:** Dairesel veya yatay ilerleme çubuğu ile bugünkü tamamlanma oranı (örn: %75).
- **Bugünün Alışkanlıkları Listesi:**
  - Akıllı filtreler: "Tümü", "Kazanılanlar", "Bırakılanlar", "Alan bazlı filtre".
  - Hızlı Tamamlama: Tek dokunuşla durum güncelleme.
  - Sayısal artırma / eksiltme: Doğrudan kart üzerinden `+1` yapabilme.
- **Haftalık Özet Şeridi:** Son 7 günün tamamlama durumunu gösteren minimal nokta / halka göstergesi.
- **Özelleştirme:** Bölümlerin sırasını değiştirme, gizleme, kompakt veya detaylı kart görünümü seçme.

---

## 7. Takvim Modülü (Calendar)

- **Aylık Görünüm:** Ay bazında günleri gösteren grid ızgarası.
- **Görsel Yoğunluk:** Her günde tamamlanan alışkanlık oranına göre renk tonu (ısı haritası / dot matrix göstergesi).
- **Geçmişe Dönük Kayıt (Retroactive Logging):** Kullanıcı unuttuğu dünkü veya önceki günkü alışkanlığını takvimden günü seçerek güncelleyebilir veya not ekleyebilir.
- **Günlük Detay Çekmecesi:** Seçilen güne ait tüm alışkanlıkların o günkü durumları, değerleri ve notları listelenir.

---

## 8. İstatistik ve Analiz Modülü (Statistics)

- **Zaman Aralıkları:**
  - Son 7 Gün
  - Son 30 Gün
  - Bu Ay
  - Bu Yıl
  - Tüm Zamanlar
- **Temel Metrikler:**
  - Genel Tamamlama Yüzdesi (`%`).
  - Toplam Başarılı Gün ve Eylem Sayısı.
  - Haftalık Tutarlılık Skoru.
  - En Başarılı Gün (Örn: "En yüksek tamamlama oranınız: Salı günleri").
  - Alışkanlık Bazında Başarı Dağılımı.
- **Grafikler (Victory Native):** Minimalist çubuk (bar) ve çizgi (line) grafikleri, renk paletiyle uyumlu, sakin veri sunumu.

---

## 9. Bildirimler ve Alarmlar (Notifications)

- **Android Bildirim Kanalları:**
  - `habit_reminders`: Alışkanlığa özel hatırlatıcılar için yüksek öncelikli kanal.
  - `daily_review`: Günün değerlendirmesi için sakin akşam özeti kanalı.
- **Alışkanlık Başına Çoklu Hatırlatıcı:** Bir alışkanlık için sabah 09:00 ve akşam 19:00 gibi birden çok saat tanımlayabilme.
- **Günlük Değerlendirme (Daily Review):** Kullanıcının belirlediği saatte (Örn: 21:30) "Günün nasıl geçti? Alışkanlıklarını gözden geçir." çağrısı.
- **Aksiyonlu Bildirimler:** Bildirim üzerinden uygulamayı açmadan doğrudan "Tamamla" diyebilme altyapısı.

---

## 10. Arşivleme ve Veri Yönetimi

- **Arşivleme:** Kullanıcı bir alışkanlığı silmek zorunda kalmadan arşivleyebilir. Arşivlenen alışkanlıklar Bugün ve Takvim ekranlarından kalkar, istatistik geçmişi korunur.
- **Geri Yükleme:** Arşivdeki alışkanlık tek dokunuşla tüm geçmişiyle birlikte aktif listeye geri alınır.
- **Veri Dışa Aktarma:**
  - JSON formatında tam yedek (tüm tablolar, ayarlar ve geçmiş).
  - CSV formatında insan tarafından okunabilir aktivite dökümü.
- **Veri İçe Aktarma / Geri Yükleme:** JSON yedeğinden sıfır veri kaybıyla veritabanını yeniden inşa etme.
