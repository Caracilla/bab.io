import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Dashboard from './components/Dashboard';
import Records from './components/Records';
import Reports from './components/Reports';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        setError(sessionError.message);
      } else {
        setUser(session?.user ?? null);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setError(null);
      });

      return () => subscription?.unsubscribe();
    } catch (err) {
      console.error('Auth check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      alert('Çıkış yapılırken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <div>Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '2rem',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <div style={{ color: '#dc2626', textAlign: 'center' }}>
          <strong>Bağlantı Hatası:</strong>
          <br />
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuth={setUser} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🍼 Bebek Takip</h1>
          <button className="sign-out-btn" onClick={handleSignOut}>
            Çıkış
          </button>
        </div>
        <nav className="nav">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Ana Sayfa
          </button>
          <button
            className={activeTab === 'records' ? 'active' : ''}
            onClick={() => setActiveTab('records')}
          >
            Kayıtlar
          </button>
          <button
            className={activeTab === 'reports' ? 'active' : ''}
            onClick={() => setActiveTab('reports')}
          >
            Raporlar
          </button>
        </nav>
      </header>

      <main className="main">
        {activeTab === 'dashboard' && <Dashboard userId={user.id} />}
        {activeTab === 'records' && <Records userId={user.id} />}
        {activeTab === 'reports' && <Reports userId={user.id} />}
      </main>
    </div>
  );
}

export default App;
