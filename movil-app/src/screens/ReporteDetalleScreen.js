import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getReporte, updateEstado, createComentario, getComentarios, getUser } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const ESTADO_COLOR = { pendiente: '#f97316', en_revision: '#3b82f6', en_proceso: '#8b5cf6', resuelto: '#22c55e', rechazado: '#ef4444' };
const PRIORIDAD_COLOR = { 1: '#22c55e', 2: '#84cc16', 3: '#eab308', 4: '#f97316', 5: '#ef4444' };

export default function ReporteDetalleScreen({ route, navigation }) {
  const { reporteId, token } = route.params || {};
  const [reporte, setReporte] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [userRol, setUserRol] = useState(null);

  useEffect(() => {
    if (!reporteId) { navigation.goBack(); return; }
    getReporte(reporteId).then((r) => {
      setReporte(r.data);
      setComentarios(r.data?.comentarios || []);
    }).catch(() => Alert.alert('Error', 'No se pudo cargar el reporte'));
    if (token) getUser().then((u) => setUserRol(u.rol)).catch(() => {});
  }, [reporteId]);

  const handleCambiarEstado = async (estado) => {
    try {
      const r = await updateEstado(reporteId, estado);
      setReporte(r.data || r);
      Alert.alert('Actualizado', `Estado cambiado a ${estado.replace(/_/g, ' ')}`);
    } catch { Alert.alert('Error', 'No se pudo actualizar el estado'); }
  };

  const handleComentar = async () => {
    if (!nuevoComentario.trim()) return;
    setEnviando(true);
    try {
      await createComentario(reporteId, nuevoComentario.trim());
      setNuevoComentario('');
      const r = await getReporte(reporteId);
      setComentarios(r.data?.comentarios || []);
    } catch { Alert.alert('Error', 'No se pudo enviar el comentario'); }
    finally { setEnviando(false); }
  };

  if (!reporte) {
    return <View style={[styles.safe, styles.center]}><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  const cat = reporte.categoria || {};

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}><Ionicons name="arrow-back" size={22} color="#f1f5f9" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del reporte</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll}>
        {reporte.fotografia && <Image source={{ uri: reporte.fotografia }} style={styles.foto} />}
        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={[styles.catBadge, { backgroundColor: (cat.color || '#64748b') + '20' }]}>
              {cat.icono && <Ionicons name={cat.icono} size={14} color={cat.color || '#64748b'} />}
              <Text style={[styles.catText, { color: cat.color || '#64748b' }]}>{cat.nombre || 'Sin categoría'}</Text>
            </View>
            <View style={[styles.prioBadge, { backgroundColor: PRIORIDAD_COLOR[reporte.prioridad] }]}>
              <Text style={styles.prioText}>{reporte.prioridad}</Text>
            </View>
          </View>
          <Text style={styles.titulo}>{reporte.titulo}</Text>
          <Text style={styles.descripcion}>{reporte.descripcion}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={[styles.estadoCircle, { backgroundColor: ESTADO_COLOR[reporte.estado] || '#64748b' }]} />
            <Text style={[styles.infoText, { color: ESTADO_COLOR[reporte.estado] || '#64748b', fontWeight: '700' }]}>{reporte.estado?.replace(/_/g, ' ')}</Text>
          </View>
          {reporte.direccion && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#64748b" />
              <Text style={styles.infoText}>{reporte.direccion}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#64748b" />
            <Text style={styles.infoText}>{reporte.creado}</Text>
          </View>
          {reporte.usuario && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color="#64748b" />
              <Text style={styles.infoText}>Reportado por {reporte.usuario.name}</Text>
            </View>
          )}

          {token && ['funcionario', 'admin'].includes(userRol) && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Cambiar estado</Text>
              <View style={styles.estadosRow}>
                {Object.keys(ESTADO_COLOR).map((e) => (
                  <TouchableOpacity key={e} style={[styles.estadoBtn, reporte.estado === e && { backgroundColor: ESTADO_COLOR[e] }]} onPress={() => handleCambiarEstado(e)}>
                    <Text style={[styles.estadoBtnText, reporte.estado === e && { color: '#fff' }]}>{e.replace(/_/g, ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Comentarios ({comentarios.length})</Text>

          {comentarios.length === 0 && (
            <Text style={styles.sinComentarios}>Sin comentarios aún</Text>
          )}

          {comentarios.map((c, i) => (
            <View key={c.id || i} style={styles.comentario}>
              <View style={styles.comAvatar}>
                <Ionicons name="person-circle" size={28} color="#3b82f6" />
              </View>
              <View style={styles.comBody}>
                <View style={styles.comTop}>
                  <Text style={styles.comAutor}>{c.usuario?.name || 'Usuario'}</Text>
                  <Text style={styles.comFecha}>{c.creado}</Text>
                </View>
                <Text style={styles.comText}>{c.comentario}</Text>
              </View>
            </View>
          ))}

          {token && (
            <View style={styles.comentarBox}>
              <TextInput style={styles.comInput} placeholder="Escribe un comentario..." placeholderTextColor="#475569" value={nuevoComentario} onChangeText={setNuevoComentario} multiline />
              <TouchableOpacity style={styles.comBtn} onPress={handleComentar} disabled={enviando || !nuevoComentario.trim()}>
                {enviando ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={20} color="#fff" />}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#f1f5f9', fontSize: 17, fontWeight: '700' },
  scroll: { flex: 1 },
  foto: { width: '100%', height: 260 },
  body: { padding: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  catBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, gap: 5 },
  catText: { fontSize: 12, fontWeight: '600' },
  prioBadge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  prioText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  titulo: { color: '#f1f5f9', fontSize: 22, fontWeight: '800', marginBottom: 10 },
  descripcion: { color: '#94a3b8', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#1e293b', marginVertical: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  estadoCircle: { width: 10, height: 10, borderRadius: 5 },
  infoText: { color: '#94a3b8', fontSize: 14, flex: 1 },
  sectionTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  estadosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  estadoBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e293b' },
  estadoBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  sinComentarios: { color: '#475569', fontSize: 13, fontStyle: 'italic', marginBottom: 12 },
  comentario: { flexDirection: 'row', marginBottom: 14, gap: 8 },
  comAvatar: { width: 32, alignItems: 'center' },
  comBody: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, padding: 12 },
  comTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  comAutor: { color: '#3b82f6', fontSize: 13, fontWeight: '600' },
  comFecha: { color: '#475569', fontSize: 11 },
  comText: { color: '#cbd5e1', fontSize: 14, lineHeight: 20 },
  comentarBox: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 8 },
  comInput: { flex: 1, backgroundColor: '#1e293b', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, color: '#f1f5f9', fontSize: 14, maxHeight: 80 },
  comBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
});
