# Habbit — Ekranlar ve Akış Spesifikasyonu (SCREENS.md)

Bu belge, Habbit uygulamasının 4 ana sekmesini, detay ekranlarını, modallarını ve kullanıcı etkileşim akışlarını tanımlar.

---

## 1. Navigasyon Mimarisi

Uygulama 4 ana alt sekme (Bottom Tabs) ve üzerine açılan yığın (Stack) ekranlarından oluşur:

```
Navigation Root
├── (tabs)
│   ├── Bugün (Today) [Varsayılan]
│   ├── Takvim (Calendar)
│   ├── İstatistikler (Statistics)
│   └── Alanlar (Areas)
├── modal: Alışkanlık Ekle / Düzenle (Habit Form)
├── screen: Alışkanlık Detayı (Habit Detail)
├── screen: Ayarlar (Settings)
├── screen: Arşivlenen Alışkanlıklar (Archived Habits)
└── modal: Yaşam Alanı Ekle / Düzenle (Area Form)
```

---

## 2. Ana Sekmeler

### 2.1. Bugün Ekranı (`src/app/(tabs)/index.tsx`)
Ana kontrol paneli ve günlük eylem merkezi.

- **Üst Kısım (Header):**
  - Sol: Günün tarihi (Büyük, sade fontla: *"5 Eylül Cumartesi"*).
  - Sağ: Ayarlar butonu (çark ikonu) ve bildirim durumu.
- **Günlük Genel İlerleme Özeti (Progress Hero):**
  - Halka veya yumuşak yatay ilerleme göstergesi: *"%75 Tamamlandı (6/8 Alışkanlık)"*.
  - Haftalık 7 günlük mini durum noktaları (Pzt-Paz).
- **Alan Filtre Şeridi (Area Filter Chips):**
  - Yatay kaydırılabilir chipler: *"Tümü"*, *"Sağlık"*, *"Kitap"*, *"Matematik"*, *"Yazılım"*.
- **Bugünün Alışkanlıkları Listesi:**
  - **Kazanılan Alışkanlık Kartı (Build):**
    - Boolean: Yeşil tamamlama dairesi, basıldığında dolma animasyonu ve haptic geri bildirim.
    - Sayısal: `[-]` ve `[+]` butonları ile anında artırma, doğrudan sayı girişi için dokunma alanı.
    - Süre: Sayacı başlatma düğmesi veya "+15 dk" hızlı loglama düğmesi.
  - **Bırakılan Alışkanlık Kartı (Quit):**
    - "Temiz Gün Devam Ediyor" rozeti (Gül pembesi / mercan çerçeve).
    - "Nüksetti" hızlı butonu (onay penceresi açar).
- **Hızlı Ekleme Butonu (FAB):**
  - Ekranın sağ alt köşesinde dairesel `+` eylem butonu.

---

### 2.2. Takvim Ekranı (`src/app/(tabs)/calendar.tsx`)
Aylık kuşbakışı takip ve geçmişe dönük kayıt merkezi.

- **Üst Kısım:** Ay ve Yıl başlığı (*"Eylül 2026"*), `<` ve `>` ay değiştirme okları, *"Bugüne Git"* hızlı butonu.
- **Aylık Matris (Month Grid):**
  - 7 sütun (Pzt, Sal, Çar, Per, Cum, Cmt, Paz).
  - Gün hücreleri: O gün tamamlanan alışkanlık oranına göre renklendirilen halka / dolgu seviyesi (Isı haritası mantığı).
  - Seçili gün: Belirgin açık renk çerçeve.
- **Günlük Detay Bölümü (Day Drawer / Bottom List):**
  - Seçilen günün tarihi başlığı (*"3 Eylül Perşembe"*).
  - O gün için planlanmış alışkanlıkların o günkü değerleri ve tamamlanma durumları.
  - Geçmişe dönük tamamlama veya değer düzeltme (Retroactive logging).
  - O güne ait günlük not ekleme / düzenleme alanı.

---

### 2.3. İstatistikler Ekranı (`src/app/(tabs)/stats.tsx`)
Performans analizi ve veri görselleştirme paneli.

- **Dönem Seçici (Segmented Control):**
  - `[Son 7 Gün]`, `[Son 30 Gün]`, `[Bu Ay]`, `[Bu Yıl]`, `[Tüm Zamanlar]`.
- **Özet Metrik Kartları (2x2 Grid):**
  1. *Genel Başarı Oranı:* `%84`
  2. *Aktif En Uzun Seri:* `42 Gün`
  3. *Toplam Tamamlama:* `156 Kez`
  4. *En Başarılı Gün:* `Çarşamba`
- **Haftalık Tutarlılık Grafiği (Victory Native):**
  - Günlere göre tamamlama oranlarını gösteren minimal çubuk grafik.
- **Alışkanlık Bazında Başarı Dağılımı:**
  - En istikrarlı 3 alışkanlık ve dikkat gerektiren alışkanlıklar listesi.

---

### 2.4. Alanlar Ekranı (`src/app/(tabs)/areas.tsx`)
Hayat dengesi ve yaşam alanlarının yönetimi.

- **Üst Kısım:** Başlık (*"Yaşam Alanları"*), yeni alan ekleme butonu (`+`).
- **Alan Kartları Listesi:**
  - Alan Adı ve İkonu (örn: 📚 *Kitap & Entelektüel*).
  - Aktif alışkanlık sayısı (*"3 Alışkanlık"*).
  - Bu haftaki tamamlama yüzdesi ve ilerleme çubuğu.
  - Alandaki alışkanlıkların mini listesi.
- **Alana Dokunulduğunda:**
  - O alana ait filtrelenmiş detay görünümü, alışkanlıklar ve alana özel istatistikler.

---

## 3. Alt Ekranlar ve Modallar

### 3.1. Alışkanlık Ekle / Düzenle Ekranı (`src/app/habit/form.tsx`)
Kullanıcı dostu, adım adım veya temiz dikey form yapısı.

1. **Alışkanlık Tipi Seçimi:**
   - `[Alışkanlık Kazan]` (Pozitif) veya `[Alışkanlığı Bırak]` (Negatif/Quit).
2. **Temel Bilgiler:**
   - Alışkanlık Adı (örn: "Günde 2 Litre Su").
   - Açıklama / Motivasyon Notu (opsiyonel).
   - İkon ve Renk Seçici (Sakin paletten 12 renk, 24 odaklı ikon).
   - Yaşam Alanı Seçimi (Dropdown / Chip listesi).
3. **Takip Modu ve Hedef:**
   - Tip seçimi: `Mantıksal (Evet/Hayır)`, `Sayısal`, `Süre`.
   - Sayısal seçilirse: Günlük Hedef (örn: 20) ve Birim (örn: "sayfa").
   - Süre seçilirse: Hedef Süre (örn: 45 dakika).
4. **Tekrar Planı (Repeat Schedule):**
   - Seçenekler: Her gün, Seçili günler, Hafta içi, Hafta sonu, Haftada X gün, Her N günde bir.
5. **Hatırlatıcılar:**
   - Çoklu saat ekleme (`+ Hatırlatıcı Ekle`).
   - Zaman seçici (Android TimePicker).
6. **Kaydet Butonu:**
   - Alt kısımda sabit, belirgin birincil buton (*"Alışkanlığı Kaydet"*).

---

### 3.2. Alışkanlık Detayı Ekranı (`src/app/habit/[id].tsx`)
Tek bir alışkanlığın derinlemesine analizi ve yönetimi.

- **Başlık ve Durum:** Alışkanlık ismi, alanı, mevcut seri alevi ve en uzun seri rekoru.
- **Yıllık / Aylık Isı Haritası (Heatmap):** GitHub tarzı minimalist tamamlama grid'i.
- **Son 30 Günün Kayıtları:** Liste halinde tarih, gerçekleşen değer ve varsa notlar.
- **İşlemler Menüsü:**
  - *"Alışkanlığı Düzenle"*
  - *"Arşivle"* (Aktif listeden kaldırır, veriyi korur)
  - *"Kalıcı Olarak Sil"* (İki aşamalı onay diyaloğu ile)

---

### 3.3. Ayarlar Ekranı (`src/app/settings/index.tsx`)

- **Bildirim Ayarları:**
  - *Günlük Değerlendirme Bildirimi:* Açık/Kapalı anahtarı.
  - *Değerlendirme Saati:* Saat seçici (Varsayılan: 21:30).
- **Pano Özelleştirme:**
  - *Kompakt Görünüm:* Açık/Kapalı (daha az boşluklu, küçük kartlar).
  - *Pano Bölüm Sıralaması:* Bölümleri yukarı/aşağı taşıma.
- **Veri ve Yedekleme:**
  - *JSON Olarak Dışa Aktar:* Tüm veritabanını indirilebilir JSON dosyası yapar.
  - *CSV Aktivite Dökümü:* Excel/E-tablolara uygun döküm.
  - *Yedekten Geri Yükle:* JSON dosyasından veritabanını kurtarır.
- **Arşiv:**
  - *Arşivlenen Alışkanlıklar:* Arşiv ekranına geçiş (`>`).
- **Uygulama Hakkında:**
  - Sürüm bilgisi (v1.0.0), lisans ve çevrimdışı gizlilik bildirimi.

---

### 3.4. Arşiv Ekranı (`src/app/settings/archive.tsx`)
Arşivlenmiş alışkanlıkların listesi.
- Her kartta: Alışkanlık adı, toplam kazanılan seri ve arşivlenme tarihi.
- Aksiyonlar: *"Geri Yükle"* (Aktif hale getirir) ve *"Kalıcı Olarak Sil"*.
