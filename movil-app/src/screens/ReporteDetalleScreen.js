import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getReporte, updateEstado, createComentario, getComentarios, getUser, deleteReporte, getFuncionarios, asignarReporte } from '../services/api';
import ReporteMapaDetalle from '../components/ReporteMapaDetalle';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ESTADO_COLOR = { pendiente: '#f97316', en_revision: '#3b82f6', en_proceso: '#8b5cf6', resuelto: '#22c55e', rechazado: '#ef4444' };
const PRIORIDAD_COLOR = { 1: '#22c55e', 2: '#84cc16', 3: '#eab308', 4: '#f97316', 5: '#ef4444' };
const PRIORIDAD_LABEL = { 1: 'Muy baja', 2: 'Baja', 3: 'Media', 4: 'Alta', 5: 'Crítica' };

export default function ReporteDetalleScreen({ route, navigation }) {
  const { reporteId, token } = route.params || {};
  const [reporte, setReporte] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [userRol, setUserRol] = useState(null);
  const [userId, setUserId] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [asignando, setAsignando] = useState(false);
  const [gallery, setGallery] = useState({ open: false, index: 0 });

  const cargar = useCallback(async () => {
    if (!reporteId) { navigation.goBack(); return; }
    try {
      const r = await getReporte(reporteId);
      setReporte(r.data);
      setComentarios(r.data?.comentarios || []);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el reporte');
    }
    if (token) {
      try {
        const u = await getUser();
        setUserRol(u.rol);
        setUserId(u.id);
        if (u.rol === 'admin') {
          const f = await getFuncionarios();
          setFuncionarios(Array.isArray(f) ? f : (f?.data || []));
        }
      } catch { /* noop */ }
    }
  }, [reporteId, token]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const esDueno = !!(reporte && userId && reporte.usuario?.id === userId);
  const puedeEditar = esDueno && reporte?.estado === 'pendiente';

  const handleCambiarEstado = async (estado) => {
    try {
      const r = await updateEstado(reporteId, estado);
      setReporte(r.data || r);
      Alert.alert('Actualizado', `Estado cambiado a ${estado.replace(/_/g, ' ')}`);
    } catch { Alert.alert('Error', 'No se pudo actualizar el estado'); }
  };

  const handleEliminar = () => {
    Alert.alert('Eliminar reporte', '¿Eliminar este reporte permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteReporte(reporteId); Alert.alert('Eliminado', 'Reporte eliminado'); navigation.goBack(); }
        catch (e) { Alert.alert('Error', e.message || 'No se pudo eliminar'); }
      } },
    ]);
  };

  const handleEditar = () => navigation.navigate('NuevoReporte', { reporte, token });

  const handleAsignar = async (funcionario) => {
    setAsignando(true);
    try {
      const r = await asignarReporte(reporteId, funcionario.id);
      setReporte(r.data || r);
      Alert.alert('Asignado', `Reporte asignado a ${funcionario.name}`);
    } catch (e) { Alert.alert('Error', e.message || 'No se pudo asignar'); }
    finally { setAsignando(false); }
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
  // Todas las fotos del reporte (nuevo formato) o la única (formato legacy).
  const fotos = (Array.isArray(reporte.fotografias) && reporte.fotografias.length)
    ? reporte.fotografias
    : (reporte.fotografia ? [reporte.fotografia] : []);

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}><Ionicons name="arrow-back" size={22} color="#f1f5f9" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del reporte</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll}>
        {fotos.length > 0 && (
          <>
            <TouchableOpacity activeOpacity={0.92} onPress={() => setGallery({ open: true, index: 0 })}>
              <Image source={{ uri: fotos[0] }} style={styles.foto} />
              {fotos.length > 1 && (
                <View style={styles.fotoBadge}>
                  <Ionicons name="images-outline" size={14} color="#fff" />
                  <Text style={styles.fotoBadgeText}>{fotos.length}</Text>
                </View>
              )}
              <View style={styles.fotoTap}>
                <Ionicons name="expand-outline" size={14} color="#fff" />
                <Text style={styles.fotoTapText}>Toca para ver</Text>
              </View>
            </TouchableOpacity>
            {fotos.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbs} contentContainerStyle={styles.thumbsContent}>
                {fotos.map((u, i) => (
                  <TouchableOpacity key={i} onPress={() => setGallery({ open: true, index: i })}>
                    <Image source={{ uri: u }} style={[styles.thumb, i === 0 && styles.thumbActive]} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        )}

        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={[styles.catBadge, { backgroundColor: (cat.color || '#64748b') + '20' }]}>
              {cat.icono && <Ionicons name={cat.icono} size={14} color={cat.color || '#64748b'} />}
              <Text style={[styles.catText, { color: cat.color || '#64748b' }]}>{cat.nombre || 'Sin categoría'}</Text>
            </View>
            <View style={styles.prioWrap}>
              <View style={[styles.prioBadge, { backgroundColor: PRIORIDAD_COLOR[reporte.prioridad] }]}>
                <Text style={styles.prioText}>{reporte.prioridad}</Text>
              </View>
              <View>
                <Text style={styles.prioCaption}>Prioridad</Text>
                <Text style={[styles.prioLabel, { color: PRIORIDAD_COLOR[reporte.prioridad] }]}>{PRIORIDAD_LABEL[reporte.prioridad] || reporte.prioridad}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.titulo}>{reporte.titulo}</Text>
          <Text style={styles.descripcion}>{reporte.descripcion}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={[styles.estadoCircle, { backgroundColor: ESTADO_COLOR[reporte.estado] || '#64748b' }]} />
            <Text style={[styles.infoText, { color: ESTADO_COLOR[reporte.estado] || '#64748b', fontWeight: '700' }]}>{reporte.estado?.replace(/_/g, ' ')}</Text>
          </View>
          <ReporteMapaDetalle reporte={reporte} />
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

          {userRol === 'admin' && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Asignar a funcionario</Text>
              {reporte.funcionario && (
                <Text style={styles.asignadoA}>Asignado a: {reporte.funcionario.name}</Text>
              )}
              <View style={styles.estadosRow}>
                {funcionarios.map((f) => (
                  <TouchableOpacity key={f.id} style={[styles.estadoBtn, reporte.funcionario_id === f.id && { backgroundColor: '#8b5cf6' }]} onPress={() => handleAsignar(f)} disabled={asignando}>
                    <Text style={[styles.estadoBtnText, reporte.funcionario_id === f.id && { color: '#fff' }]}>{f.name}</Text>
                  </TouchableOpacity>
                ))}
                {funcionarios.length === 0 && <Text style={styles.sinComentarios}>No hay funcionarios</Text>}
              </View>
            </>
          )}

          {(userRol === 'admin' || puedeEditar) && (
            <View style={styles.acciones}>
              {puedeEditar && (
                <TouchableOpacity style={styles.editBtn} onPress={handleEditar}>
                  <Ionicons name="create-outline" size={18} color="#3b82f6" />
                  <Text style={styles.editText}> Editar</Text>
                </TouchableOpacity>
              )}
              {userRol === 'admin' && (
                <TouchableOpacity style={styles.delBtn} onPress={handleEliminar}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <Text style={styles.delText}> Eliminar</Text>
                </TouchableOpacity>
              )}
            </View>
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

          {reporte.historial && reporte.historial.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Historial de estado</Text>
              {reporte.historial.map((h, i) => (
                <View key={h.id || i} style={styles.histItem}>
                  <View style={[styles.histDot, { backgroundColor: ESTADO_COLOR[h.estado] || '#64748b' }]} />
                  <View style={styles.histBody}>
                    <View style={styles.comTop}>
                      <Text style={[styles.comAutor, { color: ESTADO_COLOR[h.estado] || '#cbd5e1' }]}>{h.estado?.replace(/_/g, ' ')}</Text>
                      <Text style={styles.comFecha}>{h.creado}</Text>
                    </View>
                    {h.comentario ? <Text style={styles.comText}>{h.comentario}</Text> : null}
                    {h.usuario ? <Text style={styles.histUser}>por {h.usuario.name}</Text> : null}
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {gallery.open && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setGallery({ open: false, index: 0 })}>
          <View style={styles.galleryBg}>
            <TouchableOpacity style={styles.galleryClose} onPress={() => setGallery({ open: false, index: 0 })} hitSlop={12}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.galleryCount}>{gallery.index + 1} / {fotos.length}</Text>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.galleryScroll}
              contentOffset={{ x: gallery.index * SCREEN_WIDTH, y: 0 }}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setGallery((g) => ({ ...g, index: idx }));
              }}
            >
              {fotos.map((u, i) => (
                <View key={i} style={[styles.galleryPage, { width: SCREEN_WIDTH }]}>
                  <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => setGallery({ open: false, index: 0 })}>
                    <Image source={{ uri: u }} style={styles.galleryImg} resizeMode="contain" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </Modal>
      )}
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
  fotoBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(15,23,42,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  fotoBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  fotoTap: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(15,23,42,0.7)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  fotoTapText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  thumbs: { marginTop: 10, marginBottom: 4 },
  thumbsContent: { gap: 8, paddingHorizontal: 20 },
  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#1e293b' },
  thumbActive: { borderWidth: 2, borderColor: '#3b82f6' },
  galleryBg: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  galleryClose: { position: 'absolute', top: 44, right: 16, zIndex: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 22 },
  galleryCount: { position: 'absolute', top: 50, alignSelf: 'center', zIndex: 10, color: '#fff', fontSize: 15, fontWeight: '700' },
  galleryScroll: { flex: 1 },
  galleryPage: { height: '100%' },
  galleryImg: { width: SCREEN_WIDTH - 32, height: '82%' },
  body: { padding: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  catBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, gap: 5 },
  catText: { fontSize: 12, fontWeight: '600' },
  prioBadge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  prioText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  prioWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prioCaption: { color: '#64748b', fontSize: 11, fontWeight: '600' },
  prioLabel: { color: '#cbd5e1', fontSize: 13, fontWeight: '700' },
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
  acciones: { flexDirection: 'row', gap: 10, marginTop: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', backgroundColor: '#1e293b', paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: '#3b82f630' },
  editText: { color: '#3b82f6', fontSize: 14, fontWeight: '700' },
  delBtn: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', backgroundColor: '#1e293b', paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: '#ef444430' },
  delText: { color: '#ef4444', fontSize: 14, fontWeight: '700' },
  sinComentarios: { color: '#475569', fontSize: 13, fontStyle: 'italic', marginBottom: 12 },
  asignadoA: { color: '#cbd5e1', fontSize: 14, marginBottom: 10 },
  histItem: { flexDirection: 'row', marginBottom: 12, gap: 10 },
  histDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  histBody: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, padding: 12 },
  histUser: { color: '#475569', fontSize: 11, marginTop: 2 },
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
