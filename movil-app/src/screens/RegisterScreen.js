import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { register } from '../services/api';
import { guardarToken } from '../services/storage';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation, route }) {
  const { setToken } = route.params || {};
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirmation) return Alert.alert('Error', 'Completa todos los campos');
    if (password !== passwordConfirmation) return Alert.alert('Error', 'Las contraseñas no coinciden');
    if (password.length < 6) return Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
    setLoading(true);
    try {
      const res = await register(name, email, password, passwordConfirmation);
      await guardarToken(res.token);
      if (setToken) setToken(res.token);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo registrar');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#f1f5f9" /></TouchableOpacity>
        <View style={styles.topSection}>
          <View style={styles.iconWrap}><Ionicons name="person-add" size={52} color="#3b82f6" /></View>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.sub}>Únete a la comunidad</Text>
        </View>
        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Nombre completo" placeholderTextColor="#475569" value={name} onChangeText={setName} />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="#475569" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="call-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Teléfono (opcional)" placeholderTextColor="#475569" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#475569" value={password} onChangeText={setPassword} secureTextEntry />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Confirmar contraseña" placeholderTextColor="#475569" value={passwordConfirmation} onChangeText={setPasswordConfirmation} secureTextEntry />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear cuenta</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, paddingHorizontal: 24 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  topSection: { alignItems: 'center', marginTop: 20, marginBottom: 24 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { color: '#f1f5f9', fontSize: 24, fontWeight: '800' },
  sub: { color: '#64748b', fontSize: 14, marginTop: 4 },
  form: { flex: 1 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 14, paddingHorizontal: 14, marginBottom: 10, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#f1f5f9', fontSize: 15, height: '100%' },
  button: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
