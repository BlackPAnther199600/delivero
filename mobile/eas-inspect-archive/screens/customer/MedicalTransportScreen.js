import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import API from '../../services/api';

const MedicalTransportScreen = () => {
  const [formData, setFormData] = useState({
    doctorName: '',
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    pickupAddress: '',
    appointmentDate: new Date(),
    appointmentTime: new Date(),
    returnTrip: true,
    specialRequirements: ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        appointmentDate: selectedDate
      }));
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setFormData(prev => ({
        ...prev,
        appointmentTime: selectedTime
      }));
    }
    setShowTimePicker(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.doctorName || !formData.clinicAddress || !formData.pickupAddress) {
      Alert.alert('Errore', 'Completa tutti i campi obbligatori');
      return;
    }

    setLoading(true);
    try {
      await API.post('/medical-transports', {
        ...formData,
        appointmentDate: formData.appointmentDate.toISOString().split('T')[0],
        appointmentTime: formData.appointmentTime.toTimeString().split(' ')[0],
        pickupLat: 0,
        pickupLon: 0
      });

      Alert.alert('Successo', 'Trasporto medico prenotato!');
      setFormData({
        doctorName: '',
        clinicName: '',
        clinicAddress: '',
        clinicPhone: '',
        pickupAddress: '',
        appointmentDate: new Date(),
        appointmentTime: new Date(),
        returnTrip: true,
        specialRequirements: ''
      });
    } catch (error) {
      Alert.alert('Errore', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', padding: 15 }}>
        🏥 Trasporto Medico
      </Text>

      <View style={{ paddingHorizontal: 15 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 15, marginBottom: 8 }}>
          Nome Medico *
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 10,
            marginBottom: 15
          }}
          placeholder="Es: Dr. Giuseppe Rossi"
          value={formData.doctorName}
          onChangeText={(value) => handleInputChange('doctorName', value)}
        />

        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Clinica/Studio
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 10,
            marginBottom: 15
          }}
          placeholder="Nome della clinica"
          value={formData.clinicName}
          onChangeText={(value) => handleInputChange('clinicName', value)}
        />

        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Indirizzo Clinica *
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 10,
            marginBottom: 15
          }}
          placeholder="Via, numero, città"
          value={formData.clinicAddress}
          onChangeText={(value) => handleInputChange('clinicAddress', value)}
        />

        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Telefono Clinica
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 10,
            marginBottom: 15
          }}
          placeholder="+39 xxx xxx xxxx"
          value={formData.clinicPhone}
          onChangeText={(value) => handleInputChange('clinicPhone', value)}
          keyboardType="phone-pad"
        />

        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Punto Ritiro (tua casa) *
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 10,
            marginBottom: 15
          }}
          placeholder="Tuo indirizzo"
          value={formData.pickupAddress}
          onChangeText={(value) => handleInputChange('pickupAddress', value)}
        />

        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Data Appuntamento *
        </Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 10,
            marginBottom: 15
          }}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>📅 {formData.appointmentDate.toLocaleDateString('it-IT')}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.appointmentDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Ora Appuntamento *
        </Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 10,
            marginBottom: 15
          }}
          onPress={() => setShowTimePicker(true)}
        >
          <Text>🕐 {formData.appointmentTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={formData.appointmentTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginRight: 10 }}>
            Includi viaggio di ritorno
          </Text>
          <Switch
            value={formData.returnTrip}
            onValueChange={(value) => handleInputChange('returnTrip', value)}
          />
        </View>

        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Esigenze Speciali
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 10,
            marginBottom: 15,
            height: 80
          }}
          placeholder="Es: mobilità ridotta, accompagnatore, ecc."
          value={formData.specialRequirements}
          onChangeText={(value) => handleInputChange('specialRequirements', value)}
          multiline
        />

        <TouchableOpacity
          style={{
            padding: 15,
            backgroundColor: '#007AFF',
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20
          }}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            {loading ? 'Prenotazione in corso...' : 'Prenota Trasporto'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default MedicalTransportScreen;
