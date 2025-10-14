# Kurulum Kılavuzu

## Adım 1: Supabase Kurulumu

### 1.1 Supabase Hesabı Oluşturma
1. [supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın veya yeni hesap oluşturun

### 1.2 Yeni Proje Oluşturma
1. Dashboard'da "New Project" butonuna tıklayın
2. Proje adı girin (örn: "bebek-takip")
3. Güçlü bir database şifresi belirleyin (bunu kaydedin!)
4. Bölge seçin (en yakın: Europe West - London)
5. "Create new project" butonuna tıklayın
6. Proje hazırlanana kadar bekleyin (~2 dakika)

### 1.3 Veritabanı Şemasını Oluşturma
1. Sol menüden "SQL Editor" seçeneğine tıklayın
2. "New query" butonuna tıklayın
3. Proje klasöründeki `supabase-schema.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'e yapıştırın
5. "Run" butonuna tıklayın
6. Başarılı mesajını görmelisiniz

### 1.4 API Anahtarlarını Alma
1. Sol menüden "Settings" > "API" seçeneğine gidin
2. "Project URL" değerini kopyalayın
3. "Project API keys" altında "anon public" anahtarını kopyalayın

## Adım 2: Mobil Uygulama Kurulumu

### 2.1 Supabase Ayarları
1. `baby-tracker/lib/supabase.ts` dosyasını açın
2. Aşağıdaki değerleri güncelleyin:
```typescript
const supabaseUrl = 'BURAYA_PROJECT_URL_YAPIŞTIR';
const supabaseAnonKey = 'BURAYA_ANON_KEY_YAPIŞTIR';
```

### 2.2 Uygulamayı Çalıştırma

#### Android için:
```bash
cd baby-tracker
npm run android
```
- Android Studio ve emulator kurulu olmalı
- Veya gerçek Android cihazınızı USB ile bağlayın

#### iOS için (sadece Mac):
```bash
cd baby-tracker
npm run ios
```
- Xcode kurulu olmalı

#### Web'de Test:
```bash
cd baby-tracker
npm run web
```
- Tarayıcıda otomatik olarak açılır

## Adım 3: Web Dashboard Kurulumu

### 3.1 Supabase Ayarları
1. `baby-tracker/web/src/supabase.js` dosyasını açın
2. Aşağıdaki değerleri güncelleyin:
```javascript
const supabaseUrl = 'BURAYA_PROJECT_URL_YAPIŞTIR';
const supabaseAnonKey = 'BURAYA_ANON_KEY_YAPIŞTIR';
```

### 3.2 Web Uygulamasını Başlatma
```bash
cd baby-tracker/web
npm run dev
```
- Tarayıcınızda `http://localhost:3000` adresine gidin

## Adım 4: İlk Kullanım

### 4.1 Hesap Oluşturma
1. Web uygulamasını veya mobil uygulamayı açın
2. "Kayıt Ol" butonuna tıklayın
3. E-posta ve şifre girin
4. E-posta adresinizi kontrol edin ve onay linkine tıklayın

### 4.2 Giriş Yapma
1. E-posta ve şifre ile giriş yapın
2. Artık kayıt eklemeye başlayabilirsiniz!

## Sorun Giderme

### "Module not found" hatası
```bash
cd baby-tracker
npm install
```

### Supabase bağlantı hatası
- URL ve API key'i doğru kopyaladığınızdan emin olun
- Supabase projesinin aktif olduğunu kontrol edin

### Mobil uygulamada "Network Error"
- `lib/supabase.ts` dosyasındaki ayarları kontrol edin
- İnternet bağlantınızı kontrol edin

### Web uygulamasında boş ekran
- Tarayıcı konsolunu (F12) kontrol edin
- `web/src/supabase.js` dosyasındaki ayarları kontrol edin

## Expo Go ile Test (En Kolay Yöntem)

1. App Store veya Google Play'den "Expo Go" uygulamasını indirin
2. Terminal'de:
```bash
cd baby-tracker
npx expo start
```
3. QR kodu Expo Go ile tarayın
4. Uygulama telefonunuzda açılacak!

## Deployment (İsteğe Bağlı)

### Web Uygulamasını Yayınlama
```bash
cd baby-tracker/web
npm run build
```
- `dist` klasörünü Netlify, Vercel veya GitHub Pages'e yükleyin

### Mobil Uygulamayı Yayınlama
```bash
cd baby-tracker
eas build --platform android
eas build --platform ios
```
- Expo hesabı gerektirir
- Detaylı bilgi: [Expo Docs](https://docs.expo.dev/build/introduction/)

## Yardım

Sorularınız için:
- GitHub Issues
- Expo Documentation: https://docs.expo.dev
- Supabase Documentation: https://supabase.com/docs
