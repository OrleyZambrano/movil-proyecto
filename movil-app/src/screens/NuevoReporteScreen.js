import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { createReporte, getCategorias, updateReporte, API_BASE_URL } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const PRIORIDAD_COLOR = { 1: '#00c853', 2: '#64dd17', 3: '#ffd600', 4: '#ff6d00', 5: '#d50000' };
const PRIORIDAD_LABEL = { 1: 'Muy baja', 2: 'Baja', 3: 'Media', 4: 'Alta', 5: 'Crítica' };
const MAX_FOTOS = 8;

const MAP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    *{margin:0;padding:0}html,body,#map{width:100%;height:100%}body{background:#1e293b;touch-action:pan-x pan-y pinch-zoom}
    .leaflet-container{touch-action:pan-x pan-y pinch-zoom}
    .mk{display:flex;align-items:center;justify-content:center}
    .mkd{width:28px;height:28px;border-radius:50%;background:#3b82f6;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5)}
    .mkd span{color:#fff;font-size:15px;font-weight:700}
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var marker=null;
    var m=L.map('map',{center:[-0.95,-80.73],zoom:12,zoomControl:true,attributionControl:false});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(m);
    m.on('click',function(e){
      if(marker)m.removeLayer(marker);
      marker=L.marker([e.latlng.lat,e.latlng.lng],{icon:L.divIcon({className:'mk',html:'<div class="mkd"><span>\\u25B2</span></div>',iconSize:[28,28],iconAnchor:[14,28]})}).addTo(m);
      window.ReactNativeWebView.postMessage(JSON.stringify({action:'tap',lat:e.latlng.lat,lng:e.latlng.lng}));
    });
    function setLocation(lat,lng){
      m.setView([lat,lng],16,{animate:true});
      if(marker)m.removeLayer(marker);
      marker=L.marker([lat,lng],{icon:L.divIcon({className:'mk',html:'<div class="mkd"><span>\\u25B2</span></div>',iconSize:[28,28],iconAnchor:[14,28]})}).addTo(m);
    }
    window.addEventListener('message',function(e){
      try{var d=JSON.parse(e.data);if(d.action==='set'&&d.lat&&d.lng)setLocation(d.lat,d.lng)}catch(err){}
    });
    document.body.addEventListener('touchmove',function(e){e.stopPropagation()},true);
  <\/script>
</body>
</html>`;

function PickMap({ lat, lng, onLocationSelected }) {
  const webRef = useRef(null);

  const sendLocation = useCallback((newLat, newLng) => {
    if (webRef.current) {
      webRef.current.postMessage(JSON.stringify({ action: 'set', lat: newLat, lng: newLng }));
    }
  }, []);

  useEffect(() => {
    if (lat !== null && lng !== null) {
      sendLocation(lat, lng);
    }
  }, [lat, lng, sendLocation]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.action === 'tap' && data.lat && data.lng) {
        onLocationSelected(data.lat, data.lng);
      }
    } catch {}
  };

  if (Platform.OS === 'web') {
    return (
      <View style={stylesPicker.webFallback}>
        <Ionicons name="map-outline" size={32} color="#64748b" />
        <Text style={stylesPicker.webText}>Coordenadas: {lat ? lat.toFixed(5) : '-'}, {lng ? lng.toFixed(5) : '-'}</Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
    >
      <WebViewNative
        ref={webRef}
        source={{ html: MAP_HTML }}
        style={stylesPicker.map}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
}

let WebViewNative = null;
try {
  WebViewNative = require('react-native-webview').WebView;
} catch {}

const stylesPicker = StyleSheet.create({
  map: { flex: 1 },
  webFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b', gap: 8 },
  webText: { color: '#94a3b8', fontSize: 13 },
});

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

  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const searchTimer = useRef(null);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const pickMapKey = useRef(0);

  useEffect(() => {
    if (!token) { navigation.getParent()?.navigate('Login', { setToken }); return; }
    getCategorias().then((r) => setCategorias(r.data || [])).catch(() => {});
  }, []);

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
    setBusqueda('');
    setResultados([]);
    setMostrarMapa(false);
  }, [reporteAEditar]));

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

  const obtenerUbicacionGPS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso', 'Necesitamos tu ubicación');
    const loc = await Location.getCurrentPositionAsync({});
    const newLat = loc.coords.latitude;
    const newLng = loc.coords.longitude;
    setLat(newLat);
    setLng(newLng);
    pickMapKey.current += 1;
    setMostrarMapa(true);
    const rev = await Location.reverseGeocodeAsync(loc.coords);
    if (rev.length > 0) {
      const a = rev[0];
      setDireccion([a.street, a.district, a.city, a.region].filter(Boolean).join(', '));
    }
  };

  const buscarDireccion = async (texto) => {
    setBusqueda(texto);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!texto.trim()) { setResultados([]); return; }

    searchTimer.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(texto)}&format=json&limit=4&addressdetails=1`
        );
        const data = await r.json();
        setResultados((data || []).filter((x) => x.lat && x.lon));
      } catch { setResultados([]); }
      setBuscando(false);
    }, 400);
  };

  const seleccionarResultado = async (item) => {
    const newLat = parseFloat(item.lat);
    const newLng = parseFloat(item.lon);
    setLat(newLat);
    setLng(newLng);
    setDireccion(item.display_name);
    setResultados([]);
    setBusqueda('');
    pickMapKey.current += 1;
    setMostrarMapa(true);
  };

  const handleMapTap = useCallback(async (newLat, newLng) => {
    setLat(newLat);
    setLng(newLng);
    try {
      const rev = await Location.reverseGeocodeAsync({ latitude: newLat, longitude: newLng });
      if (rev.length > 0) {
        const a = rev[0];
        setDireccion([a.street, a.district, a.city, a.region].filter(Boolean).join(', '));
      }
    } catch {}
  }, []);

  const handleSubmit = async () => {
    if (!titulo.trim() || !descripcion.trim() || !categoriaId) return Alert.alert('Error', 'Completa título, descripción y categoría');
    if (lat === null || lng === null) return Alert.alert('Error', 'Selecciona una ubicación en el mapa o usa el GPS');
    setLoading(true);
    try {
      const payload = {
        categoria_id: categoriaId,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        latitud: String(lat),
        longitud: String(lng),
        prioridad: String(prioridad),
        direccion: direccion || null,
      };
      const nuevas = fotos.filter((f) => f.base64).map((f) => ({ base64: f.base64, tipo: f.type }));
      if (nuevas.length) payload.fotografias_base64 = nuevas;
      if (editando) {
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
          <TextInput style={styles.input} placeholder="Ej: Bache en Av. Principal" placeholderTextColor="#475569" value={titulo} onChangeText={setTitulo} maxLength={255} />

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

          <Text style={styles.label}>Ubicación</Text>

          <Text style={styles.hint}>Escribe una dirección o toca el mapa</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar dirección..."
              placeholderTextColor="#475569"
              value={busqueda}
              onChangeText={buscarDireccion}
            />
            {buscando && <ActivityIndicator size="small" color="#3b82f6" style={{ marginLeft: 8 }} />}
          </View>

          {resultados.length > 0 && (
            <View style={styles.resultadosBox}>
              {resultados.map((item, i) => (
                <TouchableOpacity key={i} style={styles.resultItem} onPress={() => seleccionarResultado(item)}>
                  <Ionicons name="location-outline" size={16} color="#3b82f6" />
                  <Text style={styles.resultText} numberOfLines={2}>{item.display_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.gpsBtn} onPress={obtenerUbicacionGPS}>
            <Ionicons name="locate" size={18} color="#3b82f6" />
            <Text style={styles.gpsBtnText}>Usar mi ubicación actual (GPS)</Text>
          </TouchableOpacity>

          {(lat !== null || mostrarMapa) && (
            <View style={styles.mapContainer}>
              <View style={styles.mapHeader}>
                <Text style={styles.mapHeaderText}>Toca el mapa para ajustar la ubicación</Text>
              </View>
              <View style={styles.mapWrap}>
                <PickMap
                  key={`map-${pickMapKey.current}`}
                  lat={lat}
                  lng={lng}
                  onLocationSelected={handleMapTap}
                />
              </View>
              {lat !== null && (
                <View style={styles.coordsInfo}>
                  <Ionicons name="pin" size={14} color="#22c55e" />
                  <Text style={styles.coordsText}>{lat.toFixed(5)}, {lng.toFixed(5)}</Text>
                </View>
              )}
              {direccion && (
                <Text style={styles.dirFull} numberOfLines={2}>{direccion}</Text>
              )}
            </View>
          )}

          {lat === null && !mostrarMapa && (
            <TouchableOpacity style={styles.openMapBtn} onPress={() => setMostrarMapa(true)}>
              <Ionicons name="map-outline" size={18} color="#3b82f6" />
              <Text style={styles.openMapText}>Seleccionar en el mapa</Text>
            </TouchableOpacity>
          )}

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
  hint: { color: '#64748b', fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: '#1e293b', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, color: '#f1f5f9', fontSize: 15, marginBottom: 12 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#1e293b', gap: 4 },
  catText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  prioRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  prioBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  prioText: { color: '#94a3b8', fontSize: 16, fontWeight: '700' },
  prioCaption: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  searchInput: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#f1f5f9', fontSize: 14, borderWidth: 1, borderColor: '#334155' },
  resultadosBox: { backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  resultItem: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  resultText: { flex: 1, color: '#e2e8f0', fontSize: 13, lineHeight: 18 },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, marginBottom: 8 },
  gpsBtnText: { color: '#3b82f6', fontSize: 13, fontWeight: '600' },
  mapContainer: { marginBottom: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: '#1e293b' },
  mapHeader: { paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#334155' },
  mapHeaderText: { color: '#94a3b8', fontSize: 11 },
  mapWrap: { height: 200 },
  coordsInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  coordsText: { color: '#22c55e', fontSize: 12, fontWeight: '700' },
  dirFull: { color: '#64748b', fontSize: 12, paddingHorizontal: 14, paddingBottom: 10 },
  openMapBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1e293b', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  openMapText: { color: '#3b82f6', fontSize: 14, fontWeight: '600' },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  thumbWrap: { position: 'relative', width: 96, height: 96, borderRadius: 14, overflow: 'hidden', backgroundColor: '#1e293b' },
  thumb: { width: 96, height: 96, borderRadius: 14 },
  thumbDel: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 12 },
  thumbAdd: { width: 96, height: 96, borderRadius: 14, backgroundColor: '#1e293b', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', gap: 2 },
  thumbAddText: { color: '#3b82f6', fontSize: 11, fontWeight: '700' },
  galleryHint: { color: '#64748b', fontSize: 12, marginBottom: 12 },
  submit: { flexDirection: 'row', backgroundColor: '#3b82f6', padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
