import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, ScrollView, Dimensions, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getReportes, getCategorias } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import MapaReportes from '../components/MapaReportes';

const SCREEN = Dimensions.get('window');
const ESTADO_COLOR = { pendiente: '#f97316', en_revision: '#3b82f6', en_proceso: '#8b5cf6', resuelto: '#22c55e', rechazado: '#ef4444' };
const PRIORIDAD_COLOR = { 1: '#22c55e', 2: '#84cc16', 3: '#eab308', 4: '#f97316', 5: '#ef4444' };

export default function ReportesScreen({ token, user }) {
  const navigation = useNavigation();
  const rootNav = navigation.getParent();
  const [viewMode, setViewMode] = useState('lista');
  const [reportes, setReportes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroCat, setFiltroCat] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroAsign, setFiltroAsign] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { cargarDatos(); }, []));

  const cargarDatos = async () => {
    try {
      const params = {};
      if (filtroCat) params.categoria_id = filtroCat;
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroAsign === 'mis') params.funcionario_id = user?.id;
      if (filtroAsign === 'null') params.funcionario_id = 'null';
      const [r, c] = await Promise.all([getReportes(params), getCategorias()]);
      setReportes(r.data || []);
      setCategorias(c.data || []);
    } catch (e) { Alert.alert('Error', e.message || 'No se pudieron cargar los reportes'); } finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); cargarDatos(); };

  const applyFilter = (key, value) => {
    if (key === 'categoria') setFiltroCat(filtroCat === value ? '' : value);
    if (key === 'estado') setFiltroEstado(filtroEstado === value ? '' : value);
  };

  const applyFilterAsign = (value) => setFiltroAsign(filtroAsign === value ? '' : value);

  useEffect(() => { cargarDatos(); }, [filtroCat, filtroEstado, filtroAsign]);

  // Al salir de la pantalla (cambiar de pestaña / ver otro reporte) se limpian
  // los filtros, para que al volver se empiece sin filtros. Esto evita el estado
  // confuso de "chip seleccionado pero filtro no aplicado" que ocurría antes.
  useEffect(() => {
    const unsub = navigation.addListener('blur', () => {
      setFiltroCat('');
      setFiltroEstado('');
      setFiltroAsign('');
    });
    return unsub;
  }, [navigation]);

  const renderItem = ({ item }) => {
    const cat = item.categoria || {};
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => rootNav.navigate('ReporteDetalle', { reporteId: item.id, token })}>
        <View style={styles.cardLeft}>
          <View style={[styles.catIcon, { backgroundColor: (cat.color || '#64748b') + '20' }]}>
            <Ionicons name={cat.icono || 'ellipsis-horizontal'} size={18} color={cat.color || '#64748b'} />
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
          <Text style={styles.cardDesc} numberOfLines={1}>{item.descripcion}</Text>
          <View style={styles.cardBottom}>
            <View style={[styles.estadoBadge, { backgroundColor: (ESTADO_COLOR[item.estado] || '#64748b') + '20' }]}>
              <View style={[styles.dot, { backgroundColor: ESTADO_COLOR[item.estado] || '#64748b' }]} />
              <Text style={[styles.estadoText, { color: ESTADO_COLOR[item.estado] || '#64748b' }]}>{item.estado?.replace(/_/g, ' ')}</Text>
            </View>
            <Text style={styles.fecha}>{item.creado}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const activeFilters = [];
  if (filtroCat) { const c = categorias.find(x => String(x.id) === filtroCat); activeFilters.push(c?.nombre || 'Cat'); }
  if (filtroEstado) activeFilters.push(filtroEstado.replace(/_/g, ' '));
  if (filtroAsign === 'mis') activeFilters.push('Mis asignados');
  if (filtroAsign === 'null') activeFilters.push('Sin asignar');

  if (loading) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportes</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.viewToggle} onPress={() => setViewMode(viewMode === 'lista' ? 'mapa' : 'lista')}>
            <Ionicons name={viewMode === 'lista' ? 'map-outline' : 'list-outline'} size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      {user?.rol === 'funcionario' && (
        <TouchableOpacity style={[styles.pendBtn, filtroEstado === 'pendiente' && styles.pendBtnActive]} onPress={() => applyFilter('estado', 'pendiente')}>
          <Ionicons name="time-outline" size={16} color={filtroEstado === 'pendiente' ? '#fff' : '#f97316'} />
          <Text style={[styles.pendText, filtroEstado === 'pendiente' && styles.pendTextActive]}>Pendientes por atender</Text>
        </TouchableOpacity>
      )}

      {(user?.rol === 'funcionario' || user?.rol === 'admin') && (
        <View>
          <Text style={styles.filterLabel}>Asignación</Text>
          <View style={styles.asignFiltros}>
            <TouchableOpacity style={[styles.asignChip, filtroAsign === 'mis' && styles.asignChipActive]} onPress={() => applyFilterAsign('mis')}>
              <Ionicons name="person-outline" size={14} color={filtroAsign === 'mis' ? '#fff' : '#3b82f6'} />
              <Text style={[styles.asignChipText, filtroAsign === 'mis' && { color: '#fff' }]}>{user?.rol === 'funcionario' ? 'Mis asignados' : 'Asignados a mí'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.asignChip, filtroAsign === 'null' && styles.asignChipActive]} onPress={() => applyFilterAsign('null')}>
              <Ionicons name="person-add-outline" size={14} color={filtroAsign === 'null' ? '#fff' : '#f97316'} />
              <Text style={[styles.asignChipText, filtroAsign === 'null' && { color: '#fff' }]}>Sin asignar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={styles.filterLabel}>Categorías</Text>
      <HorizontalScroll style={styles.filtros} contentContainerStyle={styles.filtrosContent}>
        {categorias.map((item) => (
          <TouchableOpacity key={String(item.id)} style={[styles.filtroChip, String(item.id) === filtroCat && styles.filtroActive]}
            onPress={() => applyFilter('categoria', String(item.id))}>
            <Ionicons name={item.icono} size={14} color={String(item.id) === filtroCat ? '#fff' : item.color} />
            <Text style={[styles.filtroText, String(item.id) === filtroCat && styles.filtroTextActive]}>{item.nombre}</Text>
          </TouchableOpacity>
        ))}
      </HorizontalScroll>

      <Text style={styles.filterLabel}>Estado</Text>
      <HorizontalScroll style={styles.estadoFiltros} contentContainerStyle={styles.estadoFiltrosContent}>
        {Object.entries(ESTADO_COLOR).map(([key, color]) => (
          <TouchableOpacity key={key} style={[styles.estadoChip, filtroEstado === key && { backgroundColor: color + '30', borderColor: color }]}
            onPress={() => applyFilter('estado', key)}>
            <View style={[styles.estadoDot, { backgroundColor: color }]} />
            <Text style={[styles.estadoChipText, { color: filtroEstado === key ? color : '#94a3b8' }]}>{key.replace(/_/g, ' ')}</Text>
          </TouchableOpacity>
        ))}
      </HorizontalScroll>

      {activeFilters.length > 0 && (
        <View style={styles.activeFilters}>
          <Ionicons name="funnel" size={14} color="#3b82f6" />
          <Text style={styles.activeFilterText}>Filtros: {activeFilters.join(', ')}</Text>
          <TouchableOpacity onPress={() => { setFiltroCat(''); setFiltroEstado(''); setFiltroAsign(''); cargarDatos(); }}>
            <Text style={styles.clearFilter}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      )}

      {viewMode === 'lista' ? (
        <FlatList data={reportes} renderItem={renderItem} keyExtractor={(item) => String(item.id)} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
          contentContainerStyle={styles.list} ListEmptyComponent={
            <View style={styles.emptyBox}><Ionicons name="map-outline" size={64} color="#334155" /><Text style={styles.emptyTitle}>Sin reportes</Text><Text style={styles.emptySub}>Cambia los filtros o crea un reporte</Text></View>
          } />
      ) : (
        <MapaReportes reportes={reportes} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { color: '#f1f5f9', fontSize: 24, fontWeight: '800' },
  headerRight: { flexDirection: 'row', gap: 8 },
  pendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#f9731630' },
  pendBtnActive: { backgroundColor: '#f97316' },
  pendText: { color: '#f97316', fontSize: 13, fontWeight: '700' },
  pendTextActive: { color: '#fff' },
  viewToggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  filtros: { marginBottom: 10 },
  filtrosContent: { paddingHorizontal: 16 },
  filtroChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1e293b', gap: 5, marginRight: 12 },
  filtroActive: { backgroundColor: '#3b82f6' },
  filtroText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  filtroTextActive: { color: '#fff' },
  estadoFiltros: { marginBottom: 10 },
  estadoFiltrosContent: { paddingHorizontal: 16 },
  asignFiltros: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10 },
  asignChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e293b', gap: 5, marginRight: 10 },
  asignChipActive: { backgroundColor: '#3b82f6' },
  asignChipText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  estadoChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#1e293b', gap: 4, marginRight: 10 },
  estadoDot: { width: 6, height: 6, borderRadius: 3 },
  estadoChipText: { fontSize: 11, fontWeight: '600' },
  activeFilters: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, gap: 4 },
  activeFilterText: { color: '#94a3b8', fontSize: 12, flex: 1 },
  clearFilter: { color: '#3b82f6', fontSize: 12, fontWeight: '600' },
  list: { paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#1e293b', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 14 },
  cardLeft: { marginRight: 10, justifyContent: 'center' },
  catIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { color: '#f1f5f9', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  cardDesc: { color: '#64748b', fontSize: 12, marginBottom: 6 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  estadoBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  estadoText: { fontSize: 11, fontWeight: '600' },
  fecha: { color: '#475569', fontSize: 11 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapText: { color: '#64748b', fontSize: 16, fontWeight: '700', marginTop: 12 },
  mapSub: { color: '#475569', fontSize: 13, marginTop: 4 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#64748b', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { color: '#475569', fontSize: 14, marginTop: 4 },
  // Indicador de scroll horizontal: flechas flotantes en los bordes.
  hScrollWrap: { position: 'relative' },
  scrollHintLeft: { position: 'absolute', left: 2, top: '50%', marginTop: -16, width: 32, height: 32, borderRadius: 16, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', justifyContent: 'center', alignItems: 'center', zIndex: 5, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  scrollHintRight: { position: 'absolute', right: 2, top: '50%', marginTop: -16, width: 32, height: 32, borderRadius: 16, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', justifyContent: 'center', alignItems: 'center', zIndex: 5, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  // Etiquetas de sección para los filtros.
  filterLabel: { color: '#64748b', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 },
});

// Fila horizontal con indicador de scroll: flechas (chevrons) flotantes a los
// lados que aparecen solo cuando hay más contenido y, al tocarlas, hacen scroll.
// Reemplaza el "fade" oscuro anterior, que tapaba el contenido y se veía borroso.
function HorizontalScroll({ children, style, contentContainerStyle }) {
  const wrapW = useRef(0);
  const offset = useRef(0);
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const recalcular = (offsetX, viewW, contentW) => {
    offset.current = offsetX;
    setAtStart(offsetX <= 1);
    setAtEnd(offsetX + viewW >= contentW - 1);
  };

  const scrollBy = (delta) => {
    const next = Math.max(0, offset.current + delta);
    scrollRef.current?.scrollTo({ x: next, animated: true });
  };

  return (
    <View style={[styles.hScrollWrap, style]}
      onLayout={(e) => { wrapW.current = e.nativeEvent.layout.width; }}>
      <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16}
        onScroll={(e) => { const n = e.nativeEvent; recalcular(n.contentOffset.x, n.layoutMeasurement.width, n.contentSize.width); }}
        onContentSizeChange={(w) => recalcular(0, wrapW.current, w)}>
        {children}
      </ScrollView>
      {!atStart && (
        <TouchableOpacity style={styles.scrollHintLeft} activeOpacity={0.7} onPress={() => scrollBy(-(wrapW.current || 320) * 0.8)}>
          <Ionicons name="chevron-back" size={18} color="#cbd5e1" />
        </TouchableOpacity>
      )}
      {!atEnd && (
        <TouchableOpacity style={styles.scrollHintRight} activeOpacity={0.7} onPress={() => scrollBy((wrapW.current || 320) * 0.8)}>
          <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
        </TouchableOpacity>
      )}
    </View>
  );
}
