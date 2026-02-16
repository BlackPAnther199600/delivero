import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { makeRequest } from '../../services/api';

export default function MedicalTransportScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: '',
    pickupAddress: '',
    returnTrip: true,
    specialRequirements: ''
  });

  const handleSubmit = async () => {
    if (!formData.clinicName || !formData.pickupAddress) {
      return Alert.alert("Errore", "Inserisci clinica e indirizzo di ritiro");
    }
    setLoading(true);
    try {
      await makeRequest('/services/medical-transport', { method: 'POST', data: formData });
      Alert.alert("Prenotato", "Il corriere ti contatterà per confermare l'orario.");
      navigation.goBack();
    } catch (e) { Alert.alert("Errore", "Riprova più tardi"); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>Prenota Trasporto Medico</Text>
      <TextInput
        placeholder="Nome Clinica / Dottore"
        style={styles.input}
        onChangeText={(v) => setFormData({ ...formData, clinicName: v })}
      />
      <TextInput
        placeholder="Indirizzo di Ritiro"
        style={styles.input}
        onChangeText={(v) => setFormData({ ...formData, pickupAddress: v })}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 }}>
        <Text>Viaggio di ritorno incluso</Text>
        <Switch value={formData.returnTrip} onValueChange={(v) => setFormData({ ...formData, returnTrip: v })} />
      </View>
      <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Conferma Prenotazione</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15 },
  btn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' }
});