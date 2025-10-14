import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { supabase } from './lib/supabase';

type TabType = 'log' | 'nursing' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('log');
  const [userId] = useState('demo-user-id'); // Replace with auth.user.id later

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bebek Takip</Text>
      </View>

      <View style={styles.content}>
        {activeTab === 'log' && <LogScreen userId={userId} />}
        {activeTab === 'nursing' && <NursingScreen userId={userId} />}
        {activeTab === 'history' && <HistoryScreen userId={userId} />}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'log' && styles.activeTab]}
          onPress={() => setActiveTab('log')}
        >
          <Text style={[styles.tabText, activeTab === 'log' && styles.activeTabText]}>Kayıt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nursing' && styles.activeTab]}
          onPress={() => setActiveTab('nursing')}
        >
          <Text style={[styles.tabText, activeTab === 'nursing' && styles.activeTabText]}>Meme</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Geçmiş</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Log Screen - Quick buttons for diaper and feeding
function LogScreen({ userId }: { userId: string }) {
  const addRecord = async (type: 'pee' | 'poop' | 'feeding') => {
    try {
      const now = new Date().toISOString();

      if (type === 'feeding') {
        await supabase.from('feeding_records').insert({ user_id: userId, created_at: now });
        Alert.alert('Başarılı', `Mama kaydı eklendi: ${new Date(now).toLocaleTimeString('tr-TR')}`);
      } else {
        await supabase.from('diaper_changes').insert({ user_id: userId, type, created_at: now });
        Alert.alert('Başarılı', `${type === 'pee' ? 'Çiş' : 'Kaka'} kaydı eklendi: ${new Date(now).toLocaleTimeString('tr-TR')}`);
      }
    } catch (error) {
      Alert.alert('Hata', 'Kayıt eklenirken hata oluştu');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.logScreen}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bez Değişimi</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.bigButton, styles.peeButton]} onPress={() => addRecord('pee')}>
            <Text style={styles.bigButtonText}>💧</Text>
            <Text style={styles.bigButtonLabel}>Çiş</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.bigButton, styles.poopButton]} onPress={() => addRecord('poop')}>
            <Text style={styles.bigButtonText}>💩</Text>
            <Text style={styles.bigButtonLabel}>Kaka</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Beslenme</Text>
        <TouchableOpacity style={[styles.bigButton, styles.feedingButton]} onPress={() => addRecord('feeding')}>
          <Text style={styles.bigButtonText}>🍼</Text>
          <Text style={styles.bigButtonLabel}>Mama</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Nursing Screen - Timer for breastfeeding
function NursingScreen({ userId }: { userId: string }) {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentSide, setCurrentSide] = useState<'left' | 'right'>('left');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [lastSession, setLastSession] = useState<{ side: string; time: string } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    loadLastSession();
  }, []);

  const loadLastSession = async () => {
    const { data } = await supabase
      .from('nursing_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setLastSession({
        side: data[0].side === 'left' ? 'Sol' : 'Sağ',
        time: new Date(data[0].started_at).toLocaleTimeString('tr-TR')
      });
    }
  };

  const startTimer = async () => {
    const startedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from('nursing_sessions')
      .insert({ user_id: userId, side: currentSide, started_at: startedAt, duration_seconds: 0 })
      .select()
      .single();

    if (data) {
      setActiveSessionId(data.id);
      setIsActive(true);
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resumeTimer = () => {
    setIsActive(true);
  };

  const stopTimer = async () => {
    if (activeSessionId) {
      const endedAt = new Date().toISOString();
      await supabase
        .from('nursing_sessions')
        .update({ duration_seconds: seconds, ended_at: endedAt })
        .eq('id', activeSessionId);

      Alert.alert('Tamamlandı', `${currentSide === 'left' ? 'Sol' : 'Sağ'} meme: ${formatTime(seconds)}`);
      setIsActive(false);
      setSeconds(0);
      setActiveSessionId(null);
      loadLastSession();
    }
  };

  const switchSide = async () => {
    if (isActive) {
      await stopTimer();
    }
    setCurrentSide(currentSide === 'left' ? 'right' : 'left');
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.nursingScreen}>
      {lastSession && (
        <View style={styles.lastSessionBox}>
          <Text style={styles.lastSessionText}>
            Son verilen: {lastSession.side} ({lastSession.time})
          </Text>
        </View>
      )}

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        <Text style={styles.sideText}>{currentSide === 'left' ? 'Sol Meme' : 'Sağ Meme'}</Text>
      </View>

      <View style={styles.sideButtonRow}>
        <TouchableOpacity
          style={[styles.sideButton, currentSide === 'left' && styles.activeSideButton]}
          onPress={switchSide}
        >
          <Text style={styles.sideButtonText}>Sol</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sideButton, currentSide === 'right' && styles.activeSideButton]}
          onPress={switchSide}
        >
          <Text style={styles.sideButtonText}>Sağ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlButtons}>
        {!isActive && activeSessionId === null && (
          <TouchableOpacity style={[styles.controlButton, styles.startButton]} onPress={startTimer}>
            <Text style={styles.controlButtonText}>Başlat</Text>
          </TouchableOpacity>
        )}
        {isActive && (
          <>
            <TouchableOpacity style={[styles.controlButton, styles.pauseButton]} onPress={pauseTimer}>
              <Text style={styles.controlButtonText}>Duraklat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.stopButton]} onPress={stopTimer}>
              <Text style={styles.controlButtonText}>Bitir</Text>
            </TouchableOpacity>
          </>
        )}
        {!isActive && activeSessionId !== null && (
          <>
            <TouchableOpacity style={[styles.controlButton, styles.startButton]} onPress={resumeTimer}>
              <Text style={styles.controlButtonText}>Devam</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.stopButton]} onPress={stopTimer}>
              <Text style={styles.controlButtonText}>Bitir</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

// History Screen - List all records with delete option
function HistoryScreen({ userId }: { userId: string }) {
  const [records, setRecords] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'diaper' | 'feeding' | 'nursing'>('all');

  useEffect(() => {
    loadRecords();
  }, [filter]);

  const loadRecords = async () => {
    let allRecords: any[] = [];

    if (filter === 'all' || filter === 'diaper') {
      const { data: diaperData } = await supabase
        .from('diaper_changes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (diaperData) {
        allRecords.push(...diaperData.map(r => ({ ...r, recordType: 'diaper' })));
      }
    }

    if (filter === 'all' || filter === 'feeding') {
      const { data: feedingData } = await supabase
        .from('feeding_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (feedingData) {
        allRecords.push(...feedingData.map(r => ({ ...r, recordType: 'feeding' })));
      }
    }

    if (filter === 'all' || filter === 'nursing') {
      const { data: nursingData } = await supabase
        .from('nursing_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (nursingData) {
        allRecords.push(...nursingData.map(r => ({ ...r, recordType: 'nursing' })));
      }
    }

    allRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setRecords(allRecords);
  };

  const deleteRecord = async (record: any) => {
    Alert.alert('Sil', 'Bu kaydı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          if (record.recordType === 'diaper') {
            await supabase.from('diaper_changes').delete().eq('id', record.id);
          } else if (record.recordType === 'feeding') {
            await supabase.from('feeding_records').delete().eq('id', record.id);
          } else if (record.recordType === 'nursing') {
            await supabase.from('nursing_sessions').delete().eq('id', record.id);
          }
          loadRecords();
        }
      }
    ]);
  };

  const renderRecord = ({ item }: { item: any }) => {
    let icon = '';
    let label = '';
    let details = '';

    if (item.recordType === 'diaper') {
      icon = item.type === 'pee' ? '💧' : '💩';
      label = item.type === 'pee' ? 'Çiş' : 'Kaka';
      details = new Date(item.created_at).toLocaleString('tr-TR');
    } else if (item.recordType === 'feeding') {
      icon = '🍼';
      label = 'Mama';
      details = new Date(item.created_at).toLocaleString('tr-TR');
    } else if (item.recordType === 'nursing') {
      icon = '🤱';
      label = `Meme (${item.side === 'left' ? 'Sol' : 'Sağ'})`;
      const mins = Math.floor(item.duration_seconds / 60);
      const secs = item.duration_seconds % 60;
      details = `${new Date(item.started_at).toLocaleString('tr-TR')} - ${mins}dk ${secs}sn`;
    }

    return (
      <View style={styles.recordItem}>
        <Text style={styles.recordIcon}>{icon}</Text>
        <View style={styles.recordInfo}>
          <Text style={styles.recordLabel}>{label}</Text>
          <Text style={styles.recordDetails}>{details}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteRecord(item)}>
          <Text style={styles.deleteButtonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.historyScreen}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={styles.filterButtonText}>Tümü</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'diaper' && styles.activeFilter]}
          onPress={() => setFilter('diaper')}
        >
          <Text style={styles.filterButtonText}>Bez</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'feeding' && styles.activeFilter]}
          onPress={() => setFilter('feeding')}
        >
          <Text style={styles.filterButtonText}>Mama</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'nursing' && styles.activeFilter]}
          onPress={() => setFilter('nursing')}
        >
          <Text style={styles.filterButtonText}>Meme</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.recordList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
  logScreen: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1f2937',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bigButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  peeButton: {
    backgroundColor: '#93c5fd',
  },
  poopButton: {
    backgroundColor: '#fcd34d',
  },
  feedingButton: {
    backgroundColor: '#a78bfa',
  },
  bigButtonText: {
    fontSize: 50,
  },
  bigButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 5,
  },
  nursingScreen: {
    padding: 20,
    alignItems: 'center',
  },
  lastSessionBox: {
    backgroundColor: '#e0e7ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  lastSessionText: {
    fontSize: 14,
    color: '#4338ca',
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sideText: {
    fontSize: 24,
    color: '#6b7280',
    marginTop: 10,
  },
  sideButtonRow: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  sideButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 10,
  },
  activeSideButton: {
    backgroundColor: '#6366f1',
  },
  sideButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  controlButtons: {
    flexDirection: 'row',
  },
  controlButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  historyScreen: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  recordList: {
    padding: 15,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  recordIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  recordInfo: {
    flex: 1,
  },
  recordLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  recordDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
