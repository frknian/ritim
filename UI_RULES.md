# Habbit — Tasarım Sistemi ve Arayüz Kuralları (UI_RULES.md)

Bu belge, Habbit uygulamasının özgün "Dark-First Calm" görsel kimliğini, tipografi hiyerarşisini, renk paletini, Android ergonomisini ve Türkçe dil standartlarını tanımlar.

---

## 1. Tasarım Felsefesi ve İlkeler

- **Minimal ve Sakin (Calm & Minimal):** Kullanıcıyı boğan parlak neon renkler, agresif kırmızı uyarılar veya karmaşık gradyanlar yerine; gözü yormayan derin obsidian tonları ve dingin vurgu renkleri kullanılır.
- **İçerik Öncelikli Derinlik (Subtle Depth):** Saf düz (flat) tasarım yerine, hafif kart kenarlıkları (`border-slate-800/60`) ve katmanlı yüzeyler (`surface-1`, `surface-2`) ile yumuşak bir derinlik hissi verilir.
- **Android Doğallığı:** Android donanım geri tuşu, alt gezinme çubuğu arkasına taşan kenardan kenara (edge-to-edge) görünüm ve Material 3'ün erişilebilirlik odaklı dokunma hedefleri uygulanır. iOS tarzı kayan başlıklar (collapsing navigation large titles) veya iOS segment denetimleri taklit edilmez.
- **Büyük Dokunma Alanları:** Alışkanlık tamamlama ve hızlı işlem butonları en az 48x48dp boyutunda tasarlanarak tek elle kolay kullanım sağlanır.

---

## 2. Renk Paleti (Color Tokens)

### 2.1. Zemin ve Yüzey Renkleri (Dark Foundation)
| Token Adı | Hex Kodu | Kullanım Alanı |
| :--- | :--- | :--- |
| `bg-primary` | `#080B10` | En alt zemin / Arka plan (Ultra derin obsidian) |
| `surface-1` | `#111622` | Standart kartlar, alt sekme çubuğu, modal pencereler |
| `surface-2` | `#1A2234` | Kart içi öğeler, buton arka planları, seçili olmayan alanlar |
| `surface-elevated`| `#232D42` | Aktif / seçili chipler, açılır menüler, giriş alanları |
| `border-subtle` | `#1E283D` | Zarif kart ve ayırıcı sınır çizgileri |
| `border-focus` | `#3B82F6` | Odaklanan giriş alanları |

### 2.2. Tipografi Renkleri
| Token Adı | Hex Kodu | Kullanım Alanı |
| :--- | :--- | :--- |
| `text-primary` | `#F8FAFC` | Ana başlıklar, alışkanlık isimleri, kritik metinler |
| `text-secondary` | `#94A3B8` | Açıklamalar, sayaç durumları, sekme etiketleri |
| `text-muted` | `#64748B` | Pasif tarihler, küçük etiketler, dipnotlar |

### 2.3. Vurgu ve Alışkanlık Renkleri (Accent Palette)
Aşırı doymuş renkler yerine sakin ve zarif tonlar:
- **Zümrüt Yeşili (`#10B981`):** Kazanılan alışkanlıklar, başarılı tamamlama, pozitif seri.
- **Safir Mavisi (`#3B82F6`):** Süre hedefleri, genel ilerleme, bilgi kartları.
- **Kehribar Sarısı (`#F59E0B`):** Sayısal sayaçlar, dikkat gerektiren hedefler, seri alevi.
- **Gül Pembesi / Mercan (`#F43F5E`):** Alışkanlığı bırak (Quit), nüksetme uyarısı, tehlike aksiyonları.
- **Ametist Moru (`#8B5CF6`):** Zihin, kitap, felsefe ve yaratıcı alanlar.
- **Turkuaz (`#06B6D4`):** Sağlık, su ve spor alışkanlıkları.

---

## 3. Tipografi Skalası (Typography Hierarchy)

Uygulamada Android sistem fontu (`Roboto` / Inter) temiz ağırlıklarla kullanılır:

| Stil Adı | Boyut | Ağırlık | Satır Yüksekliği | Kullanım |
| :--- | :--- | :--- | :--- | :--- |
| `Display` | 28sp | Bold (700) | 36sp | Günün tarihi, tebrik başlıkları |
| `Heading 1`| 22sp | SemiBold (600) | 28sp | Ekran başlıkları (Bugün, Takvim vb.) |
| `Heading 2`| 18sp | SemiBold (600) | 24sp | Bölüm başlıkları, alışkanlık ismi |
| `Body Large`| 16sp | Regular (400) / Medium (500) | 22sp | Kart detayları, form etiketleri |
| `Body Small`| 14sp | Regular (400) | 20sp | Açıklamalar, alan etiketleri |
| `Caption` | 12sp | Medium (500) | 16sp | Seri sayıları, sayaç birimleri, tarihler |

---

## 4. Bileşen Standartları ve Kuralları

### 4.1. Alışkanlık Kartı Anatomisi (Habit Card)
- **Köşe Yuvarlama:** `rounded-2xl` (16dp) veya `rounded-3xl` (24dp).
- **İç Boşluk:** Minimum `p-4` (16dp).
- **Sol Bölüm:** Alışkanlık ikonu (36x36dp arka planlı yuvarlak kapsayıcı) ve renk rozeti.
- **Orta Bölüm:**
  - Alışkanlık Adı (`text-primary font-medium text-base`).
  - Hedef / Güncel durum (`text-secondary text-sm` örn: "15/20 sayfa" veya "45/60 dk").
  - Seri Göstergesi (`text-amber-400 text-xs font-semibold` örn: "🔥 14 gün").
- **Sağ Bölüm (Etkileşim Alanı):**
  - Boolean: 48x48dp dairesel tamamlandı onay kutusu.
  - Sayısal: `[-]` ve `[+]` hızlı artırma/azaltma butonları.
  - Süre: Oynat / Durdur ikonu veya tek dokunuşla loglama butonu.

### 4.2. Buton Varyantları
1. **Birincil (Primary):** `bg-blue-600 active:bg-blue-700 text-white rounded-xl h-12` (Erişilebilir, net).
2. **İkincil (Secondary):** `bg-surface-2 border border-border-subtle text-slate-200 rounded-xl h-12`.
3. **Hayalet (Ghost / Subtle):** Arka plansız, hafif basma efekti ile `active:bg-surface-2`.
4. **Yıkıcı (Destructive):** `bg-rose-500/10 border border-rose-500/20 text-rose-400`.

### 4.3. Alt Gezinme Çubuğu (Bottom Navigation Bar)
- Sabit yükseklik: `h-16` (64dp) + Android gezinme güvenli alanı (`safe-area-bottom`).
- 4 Ana Sekme: **Bugün**, **Takvim**, **İstatistikler**, **Alanlar**.
- Aktif sekme: İkon ve yazı `text-blue-400`, üstünde veya arkasında yumuşak aydınlatma.
- Pasif sekme: `text-slate-400`.

---

## 5. Dokunsal Geri Bildirim (Haptic Feedback) Matrisi

| Etkileşim | Geri Bildirim Tipi | Gerekçe |
| :--- | :--- | :--- |
| Alışkanlık Başarıyla Tamamlandı | `NotificationFeedbackType.Success` | Başarı hissini pekiştiren tatmin edici titreşim. |
| Sayısal Sayaç Artırma (`+`) | `ImpactFeedbackStyle.Light` | Hassas, mekanik tıklama hissi. |
| Sekme Değiştirme | `SelectionFeedback` | Arayüz geçiş hassasiyeti. |
| Alışkanlığı Silme / Arşivleme | `NotificationFeedbackType.Warning` | Kritik eylem uyarısı. |
| Nüksetti (Relapse) Bildirimi | `NotificationFeedbackType.Error` | Dikkat çeken net ikaz. |

---

## 6. Dil ve Metin Standartları (%100 Türkçe)

Arayüzde **kesinlikle İngilizce terim bırakılmayacaktır**. Kullanılacak standart terminoloji sözlüğü:

| İngilizce Terim | Standart Türkçe Karşılığı | Hatalı / Kaçınılması Gereken |
| :--- | :--- | :--- |
| Today | Bugün | Günlük |
| Calendar | Takvim | Tarihler |
| Statistics | İstatistikler | İstatistik |
| Areas | Alanlar | Kategoriler (varsa alan terimi önceliklidir) |
| Settings | Ayarlar | Yapılandırma |
| Build Habit | Alışkanlık Kazan | Yeni Alışkanlık Yap |
| Quit Habit | Alışkanlığı Bırak | Kötü Alışkanlık |
| Current Streak | Mevcut Seri | Aktif Streak |
| Longest Streak | En Uzun Seri | Rekor Seri |
| Daily Goal | Günlük Hedef | Kota |
| Reminder | Hatırlatıcı | Alarm |
| Daily Review | Günlük Değerlendirme | Gün Sonu Özeti |
| Archive | Arşivle | Gizle |
| Restore | Geri Yükle | Aç |
| Save | Kaydet | Tamamla |
| Cancel | Vazgeç | İptal |
| Delete | Kalıcı Olarak Sil | Sil |
| Relapsed | Nüksetti | Bozuldu |
| Completed | Tamamlandı | Bitti |
| Incomplete | Tamamlanmadı | Eksik |
| Target Value | Hedef Değer | Miktar |
| Custom Unit | Özel Birim | Metrik |

### İfade ve Ton Kuralları:
- Kullanıcıya yönelik dil: **Saygılı, motive edici, sakin ve net**.
- Boş Durum (Empty State) mesajları yapıcı olmalıdır:
  * *Örnek:* "Bugün için henüz bir alışkanlık planlanmadı. Yeni bir alışkanlık ekleyerek güne başla."
