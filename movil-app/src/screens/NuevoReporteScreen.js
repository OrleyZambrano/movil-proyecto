import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { createReporte, getCategorias } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const PRIORIDAD_COLOR = { 1: '#22c55e', 2: '#84cc16', 3: '#eab308', 4: '#f97316', 5: '#ef4444' };

export default function NuevoReporteScreen({ route, token: propToken, setToken: propSetToken }) {
  const navigation = useNavigation();
  const token = propToken || route?.params?.token;
  const setToken = propSetToken || route?.params?.setToken;
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState(3);
  const [foto, setFoto] = useState(null);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [direccion, setDireccion] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { navigation.getParent()?.navigate('Login', { setToken }); return; }
    getCategorias().then((r) => setCategorias(r.data || [])).catch(() => {});
  }, []);

  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 }); if (!r.canceled) setFoto(r.assets[0]); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled) setFoto(result.assets[0]);
  };

  const obtenerUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso', 'Necesitamos tu ubicación');
    const loc = await Location.getCurrentPositionAsync({});
    setLat(loc.coords.latitude);
    setLng(loc.coords.longitude);
    const rev = await Location.reverseGeocodeAsync(loc.coords);
    if (rev.length > 0) {
      const a = rev[0];
      setDireccion([a.street, a.district, a.city, a.region].filter(Boolean).join(', '));
    }
  };

  const handleSubmit = async () => {
    if (!titulo.trim() || !descripcion.trim() || !categoriaId) return Alert.alert('Error', 'Completa título, descripción y categoría');
    if (lat === null || lng === null) return Alert.alert('Error', 'Obtén tu ubicación primero');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('categoria_id', categoriaId);
      formData.append('titulo', titulo.trim());
      formData.append('descripcion', descripcion.trim());
      formData.append('latitud', String(lat));
      formData.append('longitud', String(lng));
      formData.append('prioridad', String(prioridad));
      if (direccion) formData.append('direccion', direccion);
      if (foto) formData.append('fotografia', { uri: foto.uri, type: 'image/jpeg', name: 'foto.jpg' });
      await createReporte(formData);
      Alert.alert('¡Listo!', 'Reporte creado correctamente');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo crear el reporte');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}><Ionicons name="close" size={24} color="#f1f5f9" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Nuevo Reporte</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Título</Text>
          <TextInput style={styles.input} placeholder="Ej: Bache en Av. Principal" placeholderTextColor="#475569" value={titulo} onChangeText={setTitulo} />

          <Text style={styles.label}>Descripción</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Describe el problema..." placeholderTextColor="#475569" value={descripcion} onChangeText={setDescripcion} multiline />

          <Text style={styles.label}>Categoría</Text>
          <View style={styles.catRow}>
            {categorias.map((c) => (
              <TouchableOpacity key={c.id} style={[styles.catChip, String(c.id) === categoriaId && { backgroundColor: c.color + '30', borderColor: c.color }]}
                onPress={() => setCategoriaId(String(c.id))}>
                <Ionicons name={c.icono} size={16} color={String(c.id) === categoriaId ? c.color : '#64748b'} />
                <Text style={[styles.catText, String(c.id) === categoriaId && { color: c.color }]}>{c.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Prioridad</Text>
          <View style={styles.prioRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} style={[styles.prioBtn, prioridad === n && { backgroundColor: PRIORIDAD_COLOR[n] }]} onPress={() => setPrioridad(n)}>
                <Text style={[styles.prioText, prioridad === n && { color: '#fff' }]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.actionBtn, foto && styles.actionActive]} onPress={tomarFoto}>
            <Ionicons name={foto ? 'camera' : 'camera-outline'} size={20} color={foto ? '#22c55e' : '#3b82f6'} />
            <Text style={[styles.actionText, foto && { color: '#22c55e' }]}>{foto ? 'Foto lista' : 'Tomar foto'}</Text>
          </TouchableOpacity>
          {foto && <Image source={{ uri: foto.uri }} style={styles.preview} />}

          <TouchableOpacity style={[styles.actionBtn, lat !== null && styles.actionActive]} onPress={obtenerUbicacion}>
            <Ionicons name={lat !== null ? 'location' : 'location-outline'} size={20} color={lat !== null ? '#22c55e' : '#3b82f6'} />
            <Text style={[styles.actionText, lat !== null && { color: '#22c55e' }]} numberOfLines={1}>
              {lat !== null ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Obtener ubicación'}
            </Text>
          </TouchableOpacity>
          {lat !== null && <Text style={styles.dirText}>{direccion || 'Obteniendo dirección...'}</Text>}

          <TouchableOpacity style={styles.submit} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="send" size={18} color="#fff" /><Text style={styles.submitText}> Enviar reporte</Text></>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#f1f5f9', fontSize: 17, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: '#1e293b', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, color: '#f1f5f9', fontSize: 15, marginBottom: 12 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#1e293b', gap: 4 },
  catText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  prioRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  prioBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  prioText: { color: '#94a3b8', fontSize: 16, fontWeight: '700' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 14, borderRadius: 14, marginBottom: 10, gap: 10 },
  actionActive: { borderWidth: 1, borderColor: '#22c55e40' },
  actionText: { color: '#3b82f6', fontSize: 15, fontWeight: '600' },
  preview: { width: '100%', height: 180, borderRadius: 14, marginBottom: 12 },
  dirText: { color: '#64748b', fontSize: 12, marginBottom: 12, marginTop: -6 },
  submit: { flexDirection: 'row', backgroundColor: '#3b82f6', padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
