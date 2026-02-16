import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../services/api';

const BillPaymentScreen = ({ route, navigation }) => {
  const { billId } = route.params || {};
  const [barcodeImage, setBarcodeImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setBarcodeImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!barcodeImage) {
      Alert.alert("Attenzione", "Devi scattare una foto alla bolletta");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('billImage', {
        uri: barcodeImage,
        name: 'bill.jpg',
        type: 'image/jpeg',
      });

      await api.post('/bill-payments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert("Successo", "Bolletta inviata! Un operatore la caricherà a breve.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert("Errore", "Impossibile caricare l'immagine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Pagamento Bollette</Text>
      <Text style={{ color: '#666', marginBottom: 20 }}>Scansiona il codice a barre o scatta una foto leggibile della bolletta.</Text>

      <TouchableOpacity onPress={pickImage} style={{ height: 200, backgroundColor: '#eee', borderRadius: 15, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        {barcodeImage ? (
          <Image source={{ uri: barcodeImage }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text>📸 Clicca per scattare foto</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={{ backgroundColor: '#007AFF', marginTop: 30, padding: 15, borderRadius: 10, alignItems: 'center' }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Invia Bolletta</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BillPaymentScreen;