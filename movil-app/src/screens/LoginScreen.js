import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { login } from '../services/api';
import { guardarSesion } from '../services/storage';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation, route, setToken, setUser }) {
  setToken = setToken || route.params?.setToken;
  setUser = setUser || route.params?.setUser;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Completa todos los campos');
    setLoading(true);
    try {
      const res = await login(email, password);
      await guardarSesion(res.token, res.user);
      if (setToken) setToken(res.token);
      if (setUser) setUser(res.user);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Credenciales incorrectas');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#f1f5f9" /></TouchableOpacity>
        <View style={styles.topSection}>
          <View style={styles.iconWrap}><Ionicons name="person-circle" size={64} color="#3b82f6" /></View>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.sub}>Inicia sesión para reportar</Text>
        </View>
        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="#475569" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#475569" value={password} onChangeText={setPassword} secureTextEntry={!showPass} autoCapitalize="none" autoCorrect={false} textContentType="password" />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eye}><Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#64748b" /></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Iniciar sesión</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Register', { setToken })}>
            <Text style={styles.link}>¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate</Text></Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  topSection: { alignItems: 'center', marginTop: 32, marginBottom: 40 },
  iconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { color: '#f1f5f9', fontSize: 26, fontWeight: '800' },
  sub: { color: '#64748b', fontSize: 14, marginTop: 4 },
  form: { flex: 1 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 14, paddingHorizontal: 14, marginBottom: 12, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#f1f5f9', fontSize: 15, height: '100%' },
  eye: { padding: 4 },
  button: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkBtn: { padding: 16 },
  link: { color: '#64748b', textAlign: 'center', fontSize: 14 },
  linkBold: { color: '#3b82f6', fontWeight: '700' },
});
