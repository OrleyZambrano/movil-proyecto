import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { createReporte, getCategorias, updateReporte, API_BASE_URL } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const PRIORIDAD_COLOR = { 1: '#22c55e', 2: '#84cc16', 3: '#eab308', 4: '#f97316', 5: '#ef4444' };
const PRIORIDAD_LABEL = { 1: 'Muy baja', 2: 'Baja', 3: 'Media', 4: 'Alta', 5: 'Crítica' };
const MAX_FOTOS = 8;

export default function NuevoReporteScreen({ route, token: propToken, setToken: propSetToken }) {
  const navigation = useNavigation();
  const token = propToken || route?.params?.token;
  const setToken = propSetToken || route?.params?.setToken;
  const reporteAEditar = route?.params?.reporte || null;
  const editando = !!reporteAEditar;
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState(reporteAEditar?.categoria?.id ? String(reporteAEditar.categoria.id) : '');
  const [titulo, setTitulo] = useState(reporteAEditar?.titulo || '');
  const [descripcion, setDescripcion] = useState(reporteAEditar?.descripcion || '');
  const [prioridad, setPrioridad] = useState(reporteAEditar?.prioridad || 3);
  // Cada item: { uri, base64?, type?, url? } (url = ya subida al editar).
  const [fotos, setFotos] = useState(
    reporteAEditar
      ? (Array.isArray(reporteAEditar.fotografias) && reporteAEditar.fotografias.length
          ? reporteAEditar.fotografias.map((u) => ({ uri: u, url: u }))
          : (reporteAEditar.fotografia ? [{ uri: reporteAEditar.fotografia, url: reporteAEditar.fotografia }] : []))
      : []
  );
  const [lat, setLat] = useState(reporteAEditar ? Number(reporteAEditar.latitud) : null);
  const [lng, setLng] = useState(reporteAEditar ? Number(reporteAEditar.longitud) : null);
  const [direccion, setDireccion] = useState(reporteAEditar?.direccion || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { navigation.getParent()?.navigate('Login', { setToken }); return; }
    getCategorias().then((r) => setCategorias(r.data || [])).catch(() => {});
  }, []);

  // Re-inicializa el formulario cada vez que la pantalla recibe el foco.
  // Así, al volver a "Reportar" tras crear/editar, el formulario está limpio.
  // (La cámara/galería son modales nativos y NO cambian el foco del navigator,
  // por lo que no borran lo que el usuario va escribiendo.)
  useFocusEffect(useCallback(() => {
    if (reporteAEditar) {
      setCategoriaId(reporteAEditar?.categoria?.id ? String(reporteAEditar.categoria.id) : '');
      setTitulo(reporteAEditar?.titulo || '');
      setDescripcion(reporteAEditar?.descripcion || '');
      setPrioridad(reporteAEditar?.prioridad || 3);
      setFotos(Array.isArray(reporteAEditar.fotografias) && reporteAEditar.fotografias.length
        ? reporteAEditar.fotografias.map((u) => ({ uri: u, url: u }))
        : (reporteAEditar.fotografia ? [{ uri: reporteAEditar.fotografia, url: reporteAEditar.fotografia }] : []));
      setLat(Number(reporteAEditar.latitud));
      setLng(Number(reporteAEditar.longitud));
      setDireccion(reporteAEditar?.direccion || null);
    } else {
      setCategoriaId('');
      setTitulo('');
      setDescripcion('');
      setPrioridad(3);
      setFotos([]);
      setLat(null);
      setLng(null);
      setDireccion(null);
    }
  }, [reporteAEditar]));

  // --- Fotos múltiples ---
  // Enviamos cada foto como base64 en JSON (evita el error
  // "Unsupported FormDataPart implementation" de React Native en Android).
  const abrirCamara = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso', 'Necesitamos acceso a la cámara');
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7, base64: true });
    if (!r.canceled) {
      const a = r.assets[0];
      setFotos((prev) => [...prev, { uri: a.uri, base64: a.base64, type: a.type || 'image/jpeg' }].slice(0, MAX_FOTOS));
    }
  };

  const abrirGaleria = async () => {
    const opciones = { allowsEditing: false, quality: 0.7, base64: true };
    // En nativo permitimos selección múltiple; en web el picker es uno a la vez.
    if (Platform.OS !== 'web') opciones.allowsMultipleSelection = true;
    const r = await ImagePicker.launchImageLibraryAsync(opciones);
    if (!r.canceled) {
      const nuevas = r.assets.map((a) => ({ uri: a.uri, base64: a.base64, type: a.type || 'image/jpeg' }));
      setFotos((prev) => [...prev, ...nuevas].slice(0, MAX_FOTOS));
    }
  };

  const elegirFuente = () => {
    Alert.alert('Agregar foto', '¿Desde dónde quieres agregar la imagen?', [
      { text: 'Cámara', onPress: abrirCamara },
      { text: 'Galería', onPress: abrirGaleria },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const quitarFoto = (index) => setFotos((prev) => prev.filter((_, i) => i !== index));

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
      // Payload JSON: enviamos la foto como base64 en un campo de texto.
      // Esto funciona igual en Android, iOS y web y evita del todo el error
      // "Unsupported FormDataPart implementation" de React Native.
      const payload = {
        categoria_id: categoriaId,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        latitud: String(lat),
        longitud: String(lng),
        prioridad: String(prioridad),
        direccion: direccion || null,
      };
      // Fotos: las nuevas (con base64) se envían como array; al editar,
      // las que ya estaban subidas se envían como rutas relativas para conservarlas.
      const nuevas = fotos.filter((f) => f.base64).map((f) => ({ base64: f.base64, tipo: f.type }));
      if (nuevas.length) payload.fotografias_base64 = nuevas;
      if (editando) {
        // Al editar siempre enviamos las fotos conservadas (rutas relativas).
        // Incluso si queda vacío, así el backend puede eliminar todas.
        const actuales = fotos
          .filter((f) => !f.base64 && f.url)
          .map((f) => f.url.replace(`${API_BASE_URL}/storage/`, ''));
        payload.fotografias_actuales = actuales;
      }
      if (editando) {
        await updateReporte(reporteAEditar.id, payload);
      } else {
        await createReporte(payload);
      }
      Alert.alert('¡Listo!', editando ? 'Reporte actualizado correctamente' : 'Reporte creado correctamente');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || (editando ? 'No se pudo actualizar el reporte' : 'No se pudo crear el reporte'));
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}><Ionicons name="close" size={24} color="#f1f5f9" /></TouchableOpacity>
          <Text style={styles.headerTitle}>{editando ? 'Editar reporte' : 'Nuevo Reporte'}</Text>
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
          <Text style={[styles.prioCaption, { color: PRIORIDAD_COLOR[prioridad] }]}>Nivel: {PRIORIDAD_LABEL[prioridad]}</Text>

          <Text style={styles.label}>Fotos (opcional)</Text>
          <View style={styles.gallery}>
            {fotos.map((f, i) => (
              <View key={i} style={styles.thumbWrap}>
                <Image source={{ uri: f.uri }} style={styles.thumb} />
                <TouchableOpacity style={styles.thumbDel} onPress={() => quitarFoto(i)} hitSlop={8}>
                  <Ionicons name="close-circle" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            {fotos.length < MAX_FOTOS && (
              <TouchableOpacity style={styles.thumbAdd} onPress={elegirFuente}>
                <Ionicons name="add" size={30} color="#3b82f6" />
                <Text style={styles.thumbAddText}>Agregar</Text>
              </TouchableOpacity>
            )}
          </View>
          {fotos.length > 0 && (
            <Text style={styles.galleryHint}>{fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'} · toca la X para quitar</Text>
          )}

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
  prioRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  prioBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  prioText: { color: '#94a3b8', fontSize: 16, fontWeight: '700' },
  prioCaption: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginBottom: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 14, borderRadius: 14, marginBottom: 10, gap: 10 },
  actionActive: { borderWidth: 1, borderColor: '#22c55e40' },
  actionText: { color: '#3b82f6', fontSize: 15, fontWeight: '600' },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  thumbWrap: { position: 'relative', width: 96, height: 96, borderRadius: 14, overflow: 'hidden', backgroundColor: '#1e293b' },
  thumb: { width: 96, height: 96, borderRadius: 14 },
  thumbDel: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 12 },
  thumbAdd: { width: 96, height: 96, borderRadius: 14, backgroundColor: '#1e293b', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', gap: 2 },
  thumbAddText: { color: '#3b82f6', fontSize: 11, fontWeight: '700' },
  galleryHint: { color: '#64748b', fontSize: 12, marginBottom: 12 },
  dirText: { color: '#64748b', fontSize: 12, marginBottom: 12, marginTop: -6 },
  submit: { flexDirection: 'row', backgroundColor: '#3b82f6', padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
