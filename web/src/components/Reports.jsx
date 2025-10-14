import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Reports.css';

function Reports({ userId }) {
  const [period, setPeriod] = useState('week');
  const [dailyActivity, setDailyActivity] = useState([]);
  const [nursingDuration, setNursingDuration] = useState([]);
  const [summary, setSummary] = useState({
    totalDiapers: 0,
    totalFeedings: 0,
    totalNursing: 0,
    avgDiaperPerDay: 0,
    avgFeedingPerDay: 0,
    avgNursingPerDay: 0,
    totalNursingMinutes: 0
  });

  useEffect(() => {
    loadReports();
  }, [period, userId]);

  const loadReports = async () => {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    await loadAllData(startDate, days);
  };

  const loadAllData = async (startDate, days) => {
    // Fetch all data in parallel
    const [diaperData, feedingData, nursingData] = await Promise.all([
      supabase.from('diaper_changes').select('*').eq('user_id', userId).gte('created_at', startDate.toISOString()),
      supabase.from('feeding_records').select('*').eq('user_id', userId).gte('created_at', startDate.toISOString()),
      supabase.from('nursing_sessions').select('*').eq('user_id', userId).gte('created_at', startDate.toISOString())
    ]);

    const diapers = diaperData.data || [];
    const feedings = feedingData.data || [];
    const nursings = nursingData.data || [];

    // Günlük aktivite grafiği (tüm aktiviteler birlikte)
    const dayMap = {};

    diapers.forEach(item => {
      const dayKey = new Date(item.created_at).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
      if (!dayMap[dayKey]) dayMap[dayKey] = { day: dayKey, bez: 0, mama: 0, emzirme: 0 };
      dayMap[dayKey].bez++;
    });

    feedings.forEach(item => {
      const dayKey = new Date(item.created_at).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
      if (!dayMap[dayKey]) dayMap[dayKey] = { day: dayKey, bez: 0, mama: 0, emzirme: 0 };
      dayMap[dayKey].mama++;
    });

    nursings.forEach(item => {
      const dayKey = new Date(item.started_at).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
      if (!dayMap[dayKey]) dayMap[dayKey] = { day: dayKey, bez: 0, mama: 0, emzirme: 0 };
      dayMap[dayKey].emzirme++;
    });

    setDailyActivity(Object.values(dayMap).sort((a, b) => {
      return new Date(a.day).getTime() - new Date(b.day).getTime();
    }));

    // Emzirme süreleri (günlük toplam)
    const nursingDayMap = {};
    nursings.forEach(item => {
      const dayKey = new Date(item.started_at).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
      if (!nursingDayMap[dayKey]) nursingDayMap[dayKey] = { day: dayKey, dakika: 0 };
      nursingDayMap[dayKey].dakika += Math.floor(item.duration_seconds / 60);
    });

    setNursingDuration(Object.values(nursingDayMap));

    // Özet istatistikler
    const totalNursingMinutes = nursings.reduce((sum, n) => sum + Math.floor(n.duration_seconds / 60), 0);

    setSummary({
      totalDiapers: diapers.length,
      totalFeedings: feedings.length,
      totalNursing: nursings.length,
      avgDiaperPerDay: (diapers.length / days).toFixed(1),
      avgFeedingPerDay: (feedings.length / days).toFixed(1),
      avgNursingPerDay: (nursings.length / days).toFixed(1),
      totalNursingMinutes
    });
  };

  return (
    <div className="reports">
      <div className="reports-header">
        <h2>İstatistikler ve Raporlar</h2>
        <div className="period-selector">
          <button
            className={period === 'week' ? 'active' : ''}
            onClick={() => setPeriod('week')}
          >
            7 Gün
          </button>
          <button
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            30 Gün
          </button>
          <button
            className={period === '3months' ? 'active' : ''}
            onClick={() => setPeriod('3months')}
          >
            90 Gün
          </button>
        </div>
      </div>

      <div className="summary-cards-top">
        <div className="summary-card">
          <div className="summary-icon">💧</div>
          <div className="summary-info">
            <h4>Bez Değişimi</h4>
            <div className="summary-value">{summary.totalDiapers}</div>
            <div className="summary-avg">Günlük ort: {summary.avgDiaperPerDay}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🍼</div>
          <div className="summary-info">
            <h4>Mama</h4>
            <div className="summary-value">{summary.totalFeedings}</div>
            <div className="summary-avg">Günlük ort: {summary.avgFeedingPerDay}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🤱</div>
          <div className="summary-info">
            <h4>Emzirme</h4>
            <div className="summary-value">{summary.totalNursing} seans</div>
            <div className="summary-avg">Toplam: {summary.totalNursingMinutes} dk</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>💧 Günlük Bez Değişimi</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Adet', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="bez" fill="#93c5fd" name="Bez (adet)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🍼 Günlük Mama</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Adet', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="mama" fill="#a78bfa" name="Mama (adet)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🤱 Günlük Emzirme Sayısı</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Seans', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="emzirme" fill="#34d399" name="Emzirme (seans)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {nursingDuration.length > 0 && (
          <div className="chart-card">
            <h3>⏱️ Günlük Emzirme Süresi</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={nursingDuration}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Dakika', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="dakika" stroke="#34d399" strokeWidth={3} name="Süre (dakika)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
