import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import './Records.css';

function Records({ userId }) {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadRecords();
    const interval = setInterval(loadRecords, 30000);
    return () => clearInterval(interval);
  }, [userId, filter]);

  const loadRecords = async () => {
    const allRecords = [];

    if (filter === 'all' || filter === 'diaper') {
      const { data } = await supabase
        .from('diaper_changes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) {
        allRecords.push(...data.map(r => ({ ...r, recordType: 'diaper' })));
      }
    }

    if (filter === 'all' || filter === 'feeding') {
      const { data } = await supabase
        .from('feeding_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) {
        allRecords.push(...data.map(r => ({ ...r, recordType: 'feeding' })));
      }
    }

    if (filter === 'all' || filter === 'nursing') {
      const { data } = await supabase
        .from('nursing_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) {
        allRecords.push(...data.map(r => ({ ...r, recordType: 'nursing' })));
      }
    }

    allRecords.sort((a, b) => {
      const aDate = new Date(a.created_at || a.started_at).getTime();
      const bDate = new Date(b.created_at || b.started_at).getTime();
      return bDate - aDate;
    });

    setRecords(allRecords.slice(0, 100));
  };

  const deleteRecord = async (record) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    if (record.recordType === 'diaper') {
      await supabase.from('diaper_changes').delete().eq('id', record.id);
    } else if (record.recordType === 'feeding') {
      await supabase.from('feeding_records').delete().eq('id', record.id);
    } else if (record.recordType === 'nursing') {
      await supabase.from('nursing_sessions').delete().eq('id', record.id);
    }
    loadRecords();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}dk ${secs}sn`;
  };

  return (
    <div className="records-page">
      <div className="records-page-header">
        <h2>Tüm Kayıtlar</h2>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tümü
          </button>
          <button
            className={`filter-btn ${filter === 'diaper' ? 'active' : ''}`}
            onClick={() => setFilter('diaper')}
          >
            💧 Bez
          </button>
          <button
            className={`filter-btn ${filter === 'feeding' ? 'active' : ''}`}
            onClick={() => setFilter('feeding')}
          >
            🍼 Mama
          </button>
          <button
            className={`filter-btn ${filter === 'nursing' ? 'active' : ''}`}
            onClick={() => setFilter('nursing')}
          >
            🤱 Emzirme
          </button>
        </div>
      </div>

      <div className="records-count">
        Toplam {records.length} kayıt
      </div>

      <div className="records-grid">
        {records.length === 0 && (
          <div className="no-records">Henüz kayıt yok</div>
        )}
        {records.map((record) => {
          let icon = '';
          let label = '';
          let details = '';
          let cardClass = 'record-item';

          if (record.recordType === 'diaper') {
            icon = record.type === 'pee' ? '💧' : '💩';
            label = record.type === 'pee' ? 'Çiş' : 'Kaka';
            details = new Date(record.created_at).toLocaleString('tr-TR');
            cardClass += record.type === 'pee' ? ' pee' : ' poop';
          } else if (record.recordType === 'feeding') {
            icon = '🍼';
            label = 'Mama';
            details = new Date(record.created_at).toLocaleString('tr-TR');
            cardClass += ' feeding';
          } else if (record.recordType === 'nursing') {
            icon = '🤱';
            label = `Emzirme (${record.side === 'left' ? 'Sol' : 'Sağ'})`;
            details = `${new Date(record.started_at).toLocaleString('tr-TR')} - ${formatDuration(record.duration_seconds)}`;
            cardClass += ' nursing';
          }

          return (
            <div key={record.id} className={cardClass}>
              <div className="record-icon">{icon}</div>
              <div className="record-info">
                <div className="record-label">{label}</div>
                <div className="record-details">{details}</div>
              </div>
              <button
                className="delete-btn"
                onClick={() => deleteRecord(record)}
              >
                Sil
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Records;
