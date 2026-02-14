import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import API from '../../services/api';

const DocumentPickupScreen = () => {
  const [formData, setFormData] = useState({
    documentType: 'certificate',
    pickupLocation: '',
    deliveryAddress: '',
    estimatedCost: '5.00',
    description: '',
    signatureRequired: false
  });

  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const documentTypes = [
    { value: 'certificate', label: 'Certificato' },
    { value: 'permit', label: 'Permesso' },
    { value: 'contract', label: 'Contratto' },
    { value: 'document', label: 'Documento generico' },
    { value: 'bill', label: 'Bolletta' },
    { value: 'other', label: 'Altro' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.pickupLocation || !formData.deliveryAddress) {
      Alert.alert('Errore', 'Completa tutti i campi obbligatori');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/document-pickups', {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost),
        pickupLat: 0,
        pickupLon: 0,
        deliveryLat: 0,
        deliveryLon: 0
      });

      setTrackingNumber(response.data.tracking_number);
      Alert.alert('Successo', `Numero Tracking: ${response.data.tracking_number}`);
      
      setFormData({
        documentType: 'certificate',
        pickupLocation: '',
        deliveryAddress: '',
        estimatedCost: '5.00',
        description: '',
        signatureRequired: false
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
        📄 Ritiro Documenti
      </Text>

      {trackingNumber && (
        <View style={{
          marginHorizontal: 15,
          marginBottom: 15,
          padding: 15,
          backgroundColor: '#d1fae5',
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: '#10b981'
        }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>✓ Ritiro Confermato</Text>
          <Text style={{ color: '#666', marginBottom: 8 }}>
            Numero Tracking:
          </Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#10b981' }}>
            {trackingNumber}
          </Text>
          <Text style={{ color: '#666', marginTop: 8, fontSize: 12 }}>
            Usa questo numero per tracciare il tuo ritiro
          </Text>
        </View>
      )}

      <View style={{ paddingHorizontal: 15 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Tipo Documento
        </Text>
        <View style={{ marginBottom: 15 }}>
          {documentTypes.map(type => (
            <TouchableOpacity
              key={type.value}
              style={{
                padding: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: formData.documentType === type.value ? '#007AFF' : '#ddd',
                borderRadius: 8,
                backgroundColor: formData.documentType === type.value ? '#e7f3ff' : '#fff'
              }}
              onPress={() => handleInputChange('documentType', type.value)}
            >
              <Text style={{
                color: formData.documentType === type.value ? '#007AFF' : '#000',
                fontWeight: formData.documentType === type.value ? '600' : '400'
              }}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Luogo Ritiro *
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 10,
            marginBottom: 15
          }}
          placeholder="Indirizzo dove ritirare i documenti"
          value={formData.pickupLocation}
          onChangeText={(value) => handleInputChange('pickupLocation', value)}
        />

        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Indirizzo Consegna *
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 10,
            marginBottom: 15
          }}
          placeholder="Dove consegnare i documenti"
          value={formData.deliveryAddress}
          onChangeText={(value) => handleInputChange('deliveryAddress', value)}
        />

        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Descrizione
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
          placeholder="Es: 3 certificati di residenza"
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          multiline
        />

        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Costo Stimato (€)
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 10,
            marginBottom: 15
          }}
          placeholder="5.00"
          value={formData.estimatedCost}
          onChangeText={(value) => handleInputChange('estimatedCost', value)}
          keyboardType="decimal-pad"
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginRight: 10, flex: 1 }}>
            Firma richiesta alla consegna
          </Text>
          <Switch
            value={formData.signatureRequired}
            onValueChange={(value) => handleInputChange('signatureRequired', value)}
          />
        </View>

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
            {loading ? 'Prenotazione in corso...' : 'Prenota Ritiro'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default DocumentPickupScreen;
