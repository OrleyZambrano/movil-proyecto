import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { createAviso, updateAviso, getAviso } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const TIPOS = [
  { key: 'corte_luz', label: 'Luz', icon: 'flash', color: '#ffd600' },
  { key: 'corte_agua', label: 'Agua', icon: 'water', color: '#2979ff' },
  { key: 'ayuda', label: 'Ayuda', icon: 'hand-left', color: '#ff3d00' },
  { key: 'evento', label: 'Evento', icon: 'calendar', color: '#aa00ff' },
  { key: 'emergencia', label: 'Emergencia', icon: 'warning', color: '#d50000' },
  { key: 'otro', label: 'Otro', icon: 'information-circle', color: '#546e7a' },
];

export default function NuevoAvisoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const token = route.params?.token;
  const avisoId = route.params?.avisoId;
  const editando = !!avisoId;

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('corte_luz');
  const [prioridad, setPrioridad] = useState(3);
  const [direccion, setDireccion] = useState('');
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [notificarTodos, setNotificarTodos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(editando);

  useEffect(() => {
    if (editando) {
      getAviso(avisoId)
        .then((r) => {
          const a = r.data || r;
          setTitulo(a.titulo || '');
          setDescripcion(a.descripcion || '');
          setTipo(a.tipo || 'corte_luz');
          setPrioridad(a.prioridad || 3);
          setDireccion(a.direccion || '');
          setLatitud(a.latitud || null);
          setLongitud(a.longitud || null);
          setFechaInicio(a.fecha_inicio || '');
          setFechaFin(a.fecha_fin || '');
        })
        .catch(() => Alert.alert('Error', 'No se pudo cargar el aviso'))
        .finally(() => setCargando(false));
    }
  }, [avisoId, editando]);

  const obtenerUbicacion = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso', 'Se necesita permiso de ubicación');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLatitud(String(loc.coords.latitude));
      setLongitud(String(loc.coords.longitude));
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geo) {
        setDireccion(`${geo.street || ''} ${geo.city || ''} ${geo.region || ''}`.trim() || direccion);
      }
    } catch {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) return Alert.alert('Error', 'El título es obligatorio');
    if (!descripcion.trim()) return Alert.alert('Error', 'La descripción es obligatoria');

    setLoading(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        prioridad,
        direccion: direccion || null,
        latitud: latitud || null,
        longitud: longitud || null,
        fecha_inicio: fechaInicio || null,
        fecha_fin: fechaFin || null,
        notificar_todos: notificarTodos,
      };

      if (editando) {
        await updateAviso(avisoId, payload);
        Alert.alert('Listo', 'Aviso actualizado');
      } else {
        await createAviso(payload);
        Alert.alert('Listo', 'Aviso creado' + (notificarTodos ? ' y notificado a todos los usuarios' : ''));
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo guardar el aviso');
    } finally {
      setLoading(false);
    }
  };

  if (cargando) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editando ? 'Editar Aviso' : 'Nuevo Aviso'}</Text>
        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <Text style={styles.label}>Tipo de aviso</Text>
        <View style={styles.tiposGrid}>
          {TIPOS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tipoCard, tipo === t.key && { backgroundColor: t.color + '20', borderColor: t.color }]}
              onPress={() => setTipo(t.key)}
            >
              <Ionicons name={t.icon} size={22} color={tipo === t.key ? t.color : '#64748b'} />
              <Text style={[styles.tipoLabel, tipo === t.key && { color: t.color }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ej: Corte de luz programado en zona centro"
          placeholderTextColor="#475569"
          maxLength={255}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe el aviso..."
          placeholderTextColor="#475569"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Prioridad ({prioridad}/5)</Text>
        <View style={styles.prioRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.prioBtn, prioridad === n && { backgroundColor: '#3b82f6' }]}
              onPress={() => setPrioridad(n)}
            >
              <Text style={[styles.prioBtnText, prioridad === n && { color: '#fff' }]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Ubicación (opcional)</Text>
        <View style={styles.ubiRow}>
          <TextInput
            style={[styles.input, styles.ubiInput]}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Dirección del aviso"
            placeholderTextColor="#475569"
          />
          <TouchableOpacity style={styles.locateBtn} onPress={obtenerUbicacion}>
            <Ionicons name="locate" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        {(latitud || longitud) && (
          <Text style={styles.coords}>
            {latitud}, {longitud}
          </Text>
        )}

        <Text style={styles.label}>Vigencia (opcional)</Text>
        <View style={styles.fechaRow}>
          <TextInput
            style={[styles.input, styles.fechaInput]}
            value={fechaInicio}
            onChangeText={setFechaInicio}
            placeholder="Inicio: AAAA-MM-DD"
            placeholderTextColor="#475569"
          />
          <Text style={styles.fechaSep}>→</Text>
          <TextInput
            style={[styles.input, styles.fechaInput]}
            value={fechaFin}
            onChangeText={setFechaFin}
            placeholder="Fin: AAAA-MM-DD"
            placeholderTextColor="#475569"
          />
        </View>

        {!editando && (
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Notificar a todos los usuarios</Text>
              <Text style={styles.switchHint}>Enviar notificación push masiva</Text>
            </View>
            <Switch
              value={notificarTodos}
              onValueChange={setNotificarTodos}
              trackColor={{ false: '#334155', true: '#3b82f640' }}
              thumbColor={notificarTodos ? '#3b82f6' : '#64748b'}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: '700' },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  form: { flex: 1 },
  formContent: { padding: 16 },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  tiposGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipoCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 6,
  },
  tipoLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f1f5f9',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: { minHeight: 100 },
  prioRow: { flexDirection: 'row', gap: 8 },
  prioBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  prioBtnText: { color: '#94a3b8', fontSize: 16, fontWeight: '800' },
  ubiRow: { flexDirection: 'row', gap: 8 },
  ubiInput: { flex: 1 },
  locateBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  coords: { color: '#475569', fontSize: 11, marginTop: 6 },
  fechaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fechaInput: { flex: 1 },
  fechaSep: { color: '#64748b', fontSize: 16 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 14,
    marginTop: 20,
  },
  switchInfo: { flex: 1, marginRight: 12 },
  switchLabel: { color: '#f1f5f9', fontSize: 14, fontWeight: '600' },
  switchHint: { color: '#64748b', fontSize: 12, marginTop: 2 },
});
