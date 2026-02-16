import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert, Platform } from 'react-native';
import { makeRequest } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ManagerRealTimeMapScreen from './ManagerRealTimeMapScreen';

export default function AdminDashboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ stats: null, users: [], finance: null });

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Carica i dati in base al tab selezionato
      if (activeTab === 'stats') {
        const stats = await makeRequest('/admin/stats', { method: 'GET' });
        setData(prev => ({ ...prev, stats }));
      } else if (activeTab === 'users') {
        const users = await makeRequest('/admin/users', { method: 'GET' });
        setData(prev => ({ ...prev, users }));
      }
    } catch (error) {
      Alert.alert("Errore", "Impossibile caricare i dati della dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {['stats', 'users', 'map', 'tickets'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'map' ? (
        <ManagerRealTimeMapScreen route={{ params: { token: 'admin-token' } }} />
      ) : (
        <ScrollView style={styles.content}>
          {loading ? <ActivityIndicator size="large" color="#FF6B00" /> : (
            <View>
              <Text style={styles.welcome}>Pannello di Controllo Admin</Text>
              {/* Qui inserisci i widget delle statistiche */}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 40 },
  tabBar: { flexDirection: 'row', backgroundColor: '#1a1a2e', padding: 5 },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#FF6B00' },
  tabText: { color: '#ccc', fontSize: 11, fontWeight: 'bold' },
  activeTabText: { color: '#fff' },
  content: { padding: 20 },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 }
});