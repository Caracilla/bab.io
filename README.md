# Bebek Takip Uygulaması

Bebeğinizin çiş, kaka, mama ve emzirme kayıtlarını takip etmek için pratik bir uygulama. Android, iOS ve Web desteği ile.

## Özellikler

### Mobil Uygulama (React Native / Expo)
- ✅ **Çiş Kaydı**: Tek tuşla çiş kaydı ekleme
- ✅ **Kaka Kaydı**: Tek tuşla kaka kaydı ekleme
- ✅ **Mama Kaydı**: Tek tuşla mama kaydı ekleme
- ✅ **Emzirme Takibi**:
  - Sol/Sağ meme seçimi
  - Süre tutma (kronometre)
  - Duraklat/Devam/Bitir
  - Son verilen meme bilgisi
- ✅ **Geçmiş**: Tüm kayıtları görüntüleme ve silme
- ✅ **Filtreleme**: Kayıt tipine göre filtreleme

### Web Dashboard
- ✅ **Ana Sayfa**:
  - Günlük özet istatistikler
  - Son kayıtlar listesi
  - Kayıt silme
- ✅ **Raporlar**:
  - Bez değişimi trendi (grafik)
  - Çiş/Kaka dağılımı (pasta grafik)
  - Mama beslenme grafiği
  - Emzirme seansları grafiği
  - 7/30/90 günlük dönem seçimi
- ✅ **Mobil Uyumlu**: Responsive tasarım
- ✅ **Kimlik Doğrulama**: Supabase Auth ile güvenli giriş

## Kurulum

### 1. Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. SQL Editor'den `supabase-schema.sql` dosyasını çalıştırın
4. Settings > API'den URL ve anon key'i alın

### 2. Mobil Uygulama (React Native)

```bash
cd baby-tracker

# Supabase ayarlarını güncelle
# lib/supabase.ts dosyasındaki URL ve KEY'i değiştir

# Bağımlılıkları yükle (zaten yüklü)
npm install

# Android'de çalıştır
npm run android

# iOS'te çalıştır (Mac gerekir)
npm run ios

# Web'de test et
npm run web
```

### 3. Web Dashboard

```bash
cd baby-tracker/web

# Supabase ayarlarını güncelle
# src/supabase.js dosyasındaki URL ve KEY'i değiştir

# Bağımlılıkları yükle (zaten yüklü)
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Tarayıcıda aç: http://localhost:3000
```

## Supabase Yapılandırması

`lib/supabase.ts` (Mobil) ve `web/src/supabase.js` (Web) dosyalarında:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

## Veritabanı Şeması

### Tablolar
- **diaper_changes**: Bez değişimleri (çiş/kaka)
- **feeding_records**: Mama kayıtları
- **nursing_sessions**: Emzirme seansları

## Ekran Görüntüleri

### Mobil Uygulama
- **Kayıt Ekranı**: Hızlı kayıt butonları
- **Emzirme Ekranı**: Kronometre ve kontrol butonları
- **Geçmiş Ekranı**: Tüm kayıtlar ve filtreler

### Web Dashboard
- **Ana Sayfa**: İstatistikler ve son kayıtlar
- **Raporlar**: Grafikler ve analizler

## Kullanım

### Mobil Uygulama
1. Uygulamayı açın
2. **Kayıt** sekmesinden hızlı kayıt ekleyin
3. **Meme** sekmesinden emzirme süresini takip edin
4. **Geçmiş** sekmesinden kayıtları görüntüleyin/silin

### Web Dashboard
1. Tarayıcıdan web uygulamasını açın
2. E-posta/şifre ile giriş yapın veya kayıt olun
3. **Ana Sayfa**'da günlük özeti görün
4. **Raporlar**'da detaylı analizleri inceleyin

## Teknolojiler

- **Mobil**: React Native, Expo
- **Web**: React, Vite, Recharts
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State**: React Hooks
- **Styling**: StyleSheet (Mobil), CSS (Web)

## Güvenlik

- Row Level Security (RLS) aktif
- Kullanıcılar sadece kendi verilerini görüntüleyebilir
- Supabase Auth ile güvenli kimlik doğrulama

## Lisans

MIT

## Destek

Sorunlar için GitHub Issues kullanın.
