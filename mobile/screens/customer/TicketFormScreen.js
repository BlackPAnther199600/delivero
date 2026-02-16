import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Picker
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const TicketFormScreen = ({ navigation, onTicketCreated }) => {
  const [formData, setFormData] = useState({
    type: 'complaint',
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const ticketTypes = [
    { label: '🐛 Bug/Errore tecnico', value: 'bug' },
    { label: '😞 Reclamo', value: 'complaint' },
    { label: '💡 Richiesta funzione', value: 'feature_request' },
    { label: '🆘 Supporto', value: 'support' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert('Errore', 'Per favore compila tutti i campi');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await api.post('https://delivero-gyjx.onrender.com/api/tickets', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert(
        'Successo',
        'Ticket creato con successo!',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({ type: 'complaint', title: '', description: '' });
              if (onTicketCreated) onTicketCreated(response.data);
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Errore', error.response?.data?.error || 'Errore nella creazione del ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📝 Crea una Segnalazione</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Tipo di Segnalazione *</Text>
        <Picker
          selectedValue={formData.type}
          onValueChange={(value) => handleChange('type', value)}
          style={styles.picker}
        >
          {ticketTypes.map(type => (
            <Picker.Item key={type.value} label={type.label} value={type.value} />
          ))}
        </Picker>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Titolo *</Text>
        <TextInput
          style={styles.input}
          placeholder="Breve descrizione del problema"
          value={formData.title}
          onChangeText={(value) => handleChange('title', value)}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Descrizione dettagliata *</Text>
        <TextInput
          style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
          placeholder="Descrivi il problema nel dettaglio..."
          value={formData.description}
          onChangeText={(value) => handleChange('description', value)}
          multiline={true}
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>📤 Invia Segnalazione</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  formGroup: {
    marginBottom: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 8
  },
  picker: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 14,
    color: '#333'
  },
  button: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default TicketFormScreen;
