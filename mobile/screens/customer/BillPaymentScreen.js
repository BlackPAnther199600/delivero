import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import API from '../../services/api';

const BillPaymentScreen = ({ route }) => {
  const { billId } = route.params || {};
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [barcodeImage, setBarcodeImage] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (setImage) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Create bill payment request
      const paymentResponse = await API.post('/bill-payments', {
        billId,
        paymentMethod
      });

      const billPaymentId = paymentResponse.data.id;

      // Upload images if provided
      if (barcodeImage || qrCodeImage) {
        const formData = new FormData();
        
        if (barcodeImage) {
          formData.append('barcode', {
            uri: barcodeImage,
            type: 'image/jpeg',
            name: 'barcode.jpg',
          });
        }

        if (qrCodeImage) {
          formData.append('qrCode', {
            uri: qrCodeImage,
            type: 'image/jpeg',
            name: 'qrcode.jpg',
          });
        }

        await API.post(
          `/bill-payments/${billPaymentId}/upload-images`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      Alert.alert('Successo', 'Richiesta di pagamento inviata!');
      setBarcodeImage(null);
      setQrCodeImage(null);
    } catch (error) {
      Alert.alert('Errore', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 15, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Paga la tua Bolletta
      </Text>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
          Metodo di Pagamento:
        </Text>
        <TouchableOpacity
          style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: paymentMethod === 'cash' ? '#007AFF' : '#f0f0f0',
            marginBottom: 10
          }}
          onPress={() => setPaymentMethod('cash')}
        >
          <Text style={{ color: paymentMethod === 'cash' ? '#fff' : '#000' }}>
            💵 Contanti (Rider paga)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: paymentMethod === 'prepaid' ? '#007AFF' : '#f0f0f0'
          }}
          onPress={() => setPaymentMethod('prepaid')}
        >
          <Text style={{ color: paymentMethod === 'prepaid' ? '#fff' : '#000' }}>
            💳 Pre-pagamento
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
          Foto Barcode:
        </Text>
        {barcodeImage && (
          <Image
            source={{ uri: barcodeImage }}
            style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 10 }}
          />
        )}
        <TouchableOpacity
          style={{
            padding: 12,
            backgroundColor: '#34C759',
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={() => pickImage(setBarcodeImage)}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>📷 Scatta Foto</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
          Foto QR Code:
        </Text>
        {qrCodeImage && (
          <Image
            source={{ uri: qrCodeImage }}
            style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 10 }}
          />
        )}
        <TouchableOpacity
          style={{
            padding: 12,
            backgroundColor: '#34C759',
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={() => pickImage(setQrCodeImage)}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>📷 Scatta Foto</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{
          padding: 15,
          backgroundColor: '#007AFF',
          borderRadius: 8,
          alignItems: 'center'
        }}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          {loading ? 'Invio...' : 'Invia Richiesta'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BillPaymentScreen;
