import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import './Dashboard.css';

function Dashboard({ userId }) {
  const [stats, setStats] = useState({
    todayDiapers: 0,
    todayFeedings: 0,
    todayNursing: 0,
    lastNursing: null
  });

  // Nursing timer state
  const [isNursingActive, setIsNursingActive] = useState(false);
  const [nursingSeconds, setNursingSeconds] = useState(0);
  const [currentSide, setCurrentSide] = useState('left');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(0); // Toplam duraklatılan süre

  useEffect(() => {
    loadStats();
    checkActiveSession();
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  // Nursing timer effect - calculate elapsed time continuously
  useEffect(() => {
    let interval;
    let animationFrame;

    const updateTimer = () => {
      if (startTime && isNursingActive) {
        const elapsed = Math.floor((Date.now() - startTime - pausedTime) / 1000);
        setNursingSeconds(elapsed);
      }
      animationFrame = requestAnimationFrame(updateTimer);
    };

    if (startTime) {
      // Use both setInterval and requestAnimationFrame for reliability
      interval = setInterval(() => {
        if (startTime && isNursingActive) {
          const elapsed = Math.floor((Date.now() - startTime - pausedTime) / 1000);
          setNursingSeconds(elapsed);
        }
      }, 1000);

      // requestAnimationFrame için başlat
      if (isNursingActive) {
        animationFrame = requestAnimationFrame(updateTimer);
      }
    }

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animationFrame);
    };
  }, [isNursingActive, startTime, pausedTime]);

  const checkActiveSession = async () => {
    const { data } = await supabase
      .from('nursing_sessions')
      .select('*')
      .eq('user_id', userId)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const session = data[0];
      const start = new Date(session.started_at).getTime();
      const paused = session.paused_duration || 0;
      const elapsed = Math.floor((Date.now() - start - paused) / 1000);

      setActiveSessionId(session.id);
      setCurrentSide(session.side);
      setStartTime(start);
      setPausedTime(paused);
      setNursingSeconds(elapsed);
      setIsNursingActive(!session.is_paused);
    }
  };

  const loadStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { data: diaperData } = await supabase
      .from('diaper_changes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', todayISO);

    const { data: feedingData } = await supabase
      .from('feeding_records')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', todayISO);

    const { data: nursingData } = await supabase
      .from('nursing_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', todayISO);

    const { data: lastNursing } = await supabase
      .from('nursing_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    setStats({
      todayDiapers: diaperData?.length || 0,
      todayFeedings: feedingData?.length || 0,
      todayNursing: nursingData?.length || 0,
      lastNursing: lastNursing?.[0] || null
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // For timer display (00:00 format)
    if (seconds < 3600) {
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    // For duration display (Xdk Ysn format)
    return `${mins}dk ${secs}sn`;
  };

  const addQuickRecord = async (type) => {
    try {
      const now = new Date().toISOString();

      if (type === 'pee' || type === 'poop') {
        await supabase.from('diaper_changes').insert({ user_id: userId, type, created_at: now });
        alert(`✅ ${type === 'pee' ? 'Çiş' : 'Kaka'} kaydı eklendi`);
      } else if (type === 'feeding') {
        await supabase.from('feeding_records').insert({ user_id: userId, created_at: now });
        alert('✅ Mama kaydı eklendi');
      }

      loadStats();
    } catch (error) {
      console.error('Add record error:', error);
      alert('❌ Kayıt eklenirken hata oluştu');
    }
  };

  const startNursing = async () => {
    try {
      const now = Date.now();
      const startedAt = new Date(now).toISOString();
      const { data, error } = await supabase
        .from('nursing_sessions')
        .insert({
          user_id: userId,
          side: currentSide,
          started_at: startedAt,
          duration_seconds: 0,
          is_paused: false,
          paused_duration: 0
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setActiveSessionId(data.id);
        setStartTime(now);
        setNursingSeconds(0);
        setPausedTime(0);
        setIsNursingActive(true);
      }
    } catch (error) {
      console.error('Start nursing error:', error);
      alert('❌ Emzirme başlatılamadı');
    }
  };

  const pauseNursing = async () => {
    if (!activeSessionId) return;

    const currentElapsed = Math.floor((Date.now() - startTime - pausedTime) / 1000);
    const pauseStartTime = Date.now();

    // Veritabanında pause durumunu kaydet
    await supabase
      .from('nursing_sessions')
      .update({
        is_paused: true,
        pause_start_time: pauseStartTime,
        duration_seconds: currentElapsed
      })
      .eq('id', activeSessionId);

    setIsNursingActive(false);
  };

  const resumeNursing = async () => {
    if (!activeSessionId) return;

    // Pause süresi hesapla
    const { data } = await supabase
      .from('nursing_sessions')
      .select('pause_start_time, paused_duration')
      .eq('id', activeSessionId)
      .single();

    if (data && data.pause_start_time) {
      const pauseDuration = Date.now() - data.pause_start_time;
      const totalPausedTime = (data.paused_duration || 0) + pauseDuration;

      await supabase
        .from('nursing_sessions')
        .update({
          is_paused: false,
          paused_duration: totalPausedTime,
          pause_start_time: null
        })
        .eq('id', activeSessionId);

      setPausedTime(totalPausedTime);
    }

    setIsNursingActive(true);
  };

  const stopNursing = async () => {
    if (!activeSessionId) return;

    try {
      const endedAt = new Date().toISOString();
      const { error } = await supabase
        .from('nursing_sessions')
        .update({ duration_seconds: nursingSeconds, ended_at: endedAt })
        .eq('id', activeSessionId);

      if (error) throw error;

      alert(`✅ Emzirme tamamlandı: ${currentSide === 'left' ? 'Sol' : 'Sağ'} meme - ${formatDuration(nursingSeconds)}`);
      setIsNursingActive(false);
      setNursingSeconds(0);
      setActiveSessionId(null);
      loadStats();
    } catch (error) {
      console.error('Stop nursing error:', error);
      alert('❌ Emzirme kaydedilemedi');
    }
  };

  const switchSide = async () => {
    if (isNursingActive) {
      await stopNursing();
    }
    setCurrentSide(currentSide === 'left' ? 'right' : 'left');
  };

  return (
    <div className="dashboard">
      <section className="quick-actions">
        <h2>Hızlı Kayıt</h2>
        <div className="quick-buttons">
          <button className="quick-btn pee-btn" onClick={() => addQuickRecord('pee')}>
            💧 Çiş
          </button>
          <button className="quick-btn poop-btn" onClick={() => addQuickRecord('poop')}>
            💩 Kaka
          </button>
          <button className="quick-btn feeding-btn" onClick={() => addQuickRecord('feeding')}>
            🍼 Mama
          </button>
        </div>
      </section>

      <section className="nursing-section">
        <h2>🤱 Emzirme</h2>
        {stats.lastNursing && (
          <div className="last-nursing-info">
            Son verilen: {stats.lastNursing.side === 'left' ? 'Sol' : 'Sağ'} meme ({' '}
            {formatDuration(stats.lastNursing.duration_seconds)} - {new Date(stats.lastNursing.started_at).toLocaleTimeString('tr-TR')} )
          </div>
        )}

        <div className="nursing-timer">
          <div className="timer-display">{formatDuration(nursingSeconds)}</div>
          <div className="current-side">{currentSide === 'left' ? 'Sol Meme' : 'Sağ Meme'}</div>
        </div>

        <div className="side-selector">
          <button
            className={`side-btn ${currentSide === 'left' ? 'active' : ''}`}
            onClick={switchSide}
            disabled={isNursingActive}
          >
            Sol
          </button>
          <button
            className={`side-btn ${currentSide === 'right' ? 'active' : ''}`}
            onClick={switchSide}
            disabled={isNursingActive}
          >
            Sağ
          </button>
        </div>

        <div className="nursing-controls">
          {!isNursingActive && !activeSessionId && (
            <button className="control-btn start-btn" onClick={startNursing}>
              ▶️ Başlat
            </button>
          )}
          {isNursingActive && (
            <>
              <button className="control-btn pause-btn" onClick={pauseNursing}>
                ⏸️ Duraklat
              </button>
              <button className="control-btn stop-btn" onClick={stopNursing}>
                ⏹️ Bitir
              </button>
            </>
          )}
          {!isNursingActive && activeSessionId && (
            <>
              <button className="control-btn start-btn" onClick={resumeNursing}>
                ▶️ Devam
              </button>
              <button className="control-btn stop-btn" onClick={stopNursing}>
                ⏹️ Bitir
              </button>
            </>
          )}
        </div>
      </section>

      <section className="stats-section">
        <h2>Bugünün Özeti</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💧</div>
            <div className="stat-info">
              <div className="stat-value">{stats.todayDiapers}</div>
              <div className="stat-label">Bez Değişimi</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🍼</div>
            <div className="stat-info">
              <div className="stat-value">{stats.todayFeedings}</div>
              <div className="stat-label">Mama</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤱</div>
            <div className="stat-info">
              <div className="stat-value">{stats.todayNursing}</div>
              <div className="stat-label">Emzirme</div>
            </div>
          </div>
        </div>
        {stats.lastNursing && (
          <div className="last-nursing">
            <strong>Son Emzirme:</strong>{' '}
            {stats.lastNursing.side === 'left' ? 'Sol' : 'Sağ'} meme,{' '}
            {formatDuration(stats.lastNursing.duration_seconds)} ({' '}
            {new Date(stats.lastNursing.started_at).toLocaleString('tr-TR')} )
          </div>
        )}
      </section>

    </div>
  );
}

export default Dashboard;
