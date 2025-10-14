# 🍼 Bab.io - Bebek Takip Uygulaması

Bebeklerin çiş, kaka, mama ve emzirme döngülerini takip etmek için geliştirilmiş pratik bir uygulama. Android, iOS ve Web desteği ile.

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
  - Hızlı kayıt butonları (Çiş, Kaka, Mama)
  - Emzirme zamanlayıcısı
  - Günlük özet istatistikler
- ✅ **Kayıtlar**:
  - Tüm kayıtların listesi
  - Filtreleme (Tümü, Bez, Mama, Emzirme)
  - Kayıt silme
- ✅ **Raporlar**:
  - Günlük bez değişimi grafiği
  - Günlük mama grafiği
  - Günlük emzirme sayısı grafiği
  - Günlük emzirme süresi grafiği
  - 7/30/90 günlük dönem seçimi
- ✅ **Mobil Uyumlu**: Responsive tasarım
- ✅ **Demo Hesap**: demo@example.com / demo123456
- ✅ **Kimlik Doğrulama**: Supabase Auth ile güvenli giriş

## Kurulum

### 1. Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. SQL Editor'den `supabase-schema.sql` dosyasını çalıştırın
4. Settings > API'den URL ve anon key'i alın

### 2. Mobil Uygulama (React Native)

```bash
cd mobile

# .env dosyası oluştur
cp .env.example .env
# .env dosyasını Supabase bilgilerinizle düzenleyin

# Bağımlılıkları yükle
npm install

# Android'de çalıştır
npx expo start

# Expo Go uygulamasından QR kod ile bağlanın
```

### 3. Web Dashboard

```bash
cd web

# Supabase ayarlarını güncelle
# src/supabase.js dosyasındaki URL ve KEY'i değiştir

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Tarayıcıda aç: http://localhost:5173
```

## 🏗️ Proje Yapısı

```
bab.io/
├── mobile/                 # React Native (Expo) mobil uygulama
│   ├── App.tsx            # Ana mobil uygulama
│   ├── lib/supabase.ts    # Supabase config
│   └── .env.example       # Çevre değişkenleri şablonu
├── web/                   # React + Vite web uygulaması
│   ├── src/
│   │   ├── components/    # React bileşenleri
│   │   └── supabase.js   # Supabase config
│   └── package.json
└── supabase-schema.sql    # Veritabanı şeması
```

## Supabase Yapılandırması

Mobil için `mobile/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Web için `web/src/supabase.js`:
```javascript
const supabaseUrl = 'your-project-url';
const supabaseAnonKey = 'your-anon-key';
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
