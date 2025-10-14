import React, { useState } from 'react';
import { supabase } from '../supabase';
import './Auth.css';

function Auth({ onAuth }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'demo'

  const handleDemoLogin = async () => {
    setLoading(true);
    setMessage('');

    // Demo kullanıcı için otomatik kayıt/giriş
    const demoEmail = 'demo@example.com';
    const demoPassword = 'demo123456';

    try {
      // Önce giriş dene
      let { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });

      // Eğer kullanıcı yoksa kayıt et
      if (error && error.message.includes('Invalid login')) {
        const signUpResult = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword
        });

        if (signUpResult.error) throw signUpResult.error;

        // Kayıttan sonra tekrar giriş dene
        const signInResult = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword
        });

        if (signInResult.error) throw signInResult.error;
        data = signInResult.data;
      } else if (error) {
        throw error;
      }

      if (data.user) {
        onAuth(data.user);
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setMessage(`Demo giriş hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!email || !password) {
      setMessage('Lütfen e-posta ve şifre girin');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (error) throw error;

        // E-posta onayı kapalıysa direkt giriş yap
        if (data.user && data.session) {
          setMessage('Kayıt başarılı! Giriş yapılıyor...');
          onAuth(data.user);
        } else {
          setMessage('Kayıt başarılı! E-postanızı kontrol edin.');
          setMode('login');
          setEmail('');
          setPassword('');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.user) {
          setMessage('Giriş başarılı!');
          onAuth(data.user);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.message.includes('Invalid login')) {
        setMessage('E-posta veya şifre hatalı');
      } else if (error.message.includes('Email not confirmed')) {
        setMessage('Lütfen e-postanızı onaylayın');
      } else {
        setMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🍼 Bebek Takip</h2>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
        </p>

        {message && (
          <div className={`message ${message.includes('başarılı') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="demo-section">
          <button
            type="button"
            className="demo-btn"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            🎯 Demo ile Dene
          </button>
          <p className="demo-note">Hızlıca test etmek için</p>
        </div>

        <div className="divider">
          <span>veya</span>
        </div>

        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Şifreniz (min 6 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            minLength={6}
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? '⏳ Yükleniyor...' : (mode === 'login' ? '🔓 Giriş Yap' : '✅ Kayıt Ol')}
          </button>
        </form>

        <button
          type="button"
          className="toggle-btn"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setMessage('');
          }}
          disabled={loading}
        >
          {mode === 'login'
            ? '➕ Hesabınız yok mu? Kayıt olun'
            : '🔑 Zaten hesabınız var mı? Giriş yapın'}
        </button>
      </div>
    </div>
  );
}

export default Auth;
