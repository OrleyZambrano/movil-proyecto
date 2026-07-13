import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getReportes, getAvisos } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import MapaReportes from '../components/MapaReportes';

const ESTADO_COLOR = {
  pendiente: '#ff6d00',
  en_revision: '#1565c0',
  en_proceso: '#f9a825',
  resuelto: '#00c853',
  rechazado: '#d50000',
};

const FILTROS = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'urgentes', label: 'Urgentes' },
];

export default function HomeScreen({ token, user, setToken, unread }) {
  const navigation = useNavigation();
  const rootNav = navigation.getParent();
  const [reportes, setReportes] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todas');

  const cargarDatos = useCallback(async () => {
    try {
      const params = {};
      if (filtro === 'pendientes') params.estado = 'pendiente';
      if (filtro === 'mis' && user?.id) params.funcionario_id = user.id;
      const [r, a] = await Promise.all([
        getReportes(Object.keys(params).length ? params : undefined),
        getAvisos({ activo: '1' }),
      ]);
      let reportesData = (r && r.data) || [];
      if (filtro === 'urgentes') {
        reportesData = reportesData.filter((rep) => rep.prioridad >= 4);
      }
      setReportes(reportesData);
      setAvisos((a && a.data) || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtro, user?.id]);

  useFocusEffect(useCallback(() => { cargarDatos(); }, [cargarDatos]));

  const onRefresh = () => { setRefreshing(true); cargarDatos(); };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const cat = item.categoria || {};
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => rootNav.navigate('ReporteDetalle', { reporteId: item.id, token })}
      >
        <View style={[styles.catIcon, { backgroundColor: (cat.color || '#64748b') + '20' }]}>
          <Ionicons name={cat.icono || 'ellipsis-horizontal'} size={20} color={cat.color || '#64748b'} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>
          <View style={styles.cardMeta}>
            <View style={[styles.estadoBadge, { backgroundColor: (ESTADO_COLOR[item.estado] || '#64748b') + '20' }]}>
              <View style={[styles.estadoDot, { backgroundColor: ESTADO_COLOR[item.estado] || '#64748b' }]} />
              <Text style={[styles.estadoText, { color: ESTADO_COLOR[item.estado] || '#64748b' }]}>
                {item.estado?.replace(/_/g, ' ')}
              </Text>
            </View>
            <Text style={styles.cardFecha}>{item.creado}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#475569" />
      </TouchableOpacity>
    );
  };

  const listHeader = (
    <View style={styles.listTitleRow}>
      <Text style={styles.listTitle}>Reportes recientes</Text>
      <Text style={styles.listCount}>{reportes.length} encontrados</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ---- HEADER ---- */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting} numberOfLines={1}>
            {token && user ? `Hola, ${user.name?.split(' ')[0] || 'ciudadano'}` : 'Reporte Ciudadano'}
          </Text>
          <Text style={styles.role}>
            {token ? user?.rol === 'admin' ? 'Admin' : user?.rol === 'funcionario' ? 'Funcionario' : 'Ciudadano' : 'Mapa comunitario'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => rootNav.navigate('NotificacionesModal', { token })}
        >
          <Ionicons name="notifications-outline" size={22} color="#f1f5f9" />
          {unread > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ---- FILTROS ---- */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosScroll}
        contentContainerStyle={styles.filtrosRow}
      >
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filtroBtn, filtro === f.key && styles.filtroBtnActive]}
            onPress={() => setFiltro(f.key)}
          >
            <Text style={[styles.filtroText, filtro === f.key && styles.filtroTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
        {token && (
          <TouchableOpacity
            style={[styles.filtroBtn, filtro === 'mis' && styles.filtroBtnActive]}
            onPress={() => setFiltro(filtro === 'mis' ? 'todas' : 'mis')}
          >
            <Text style={[styles.filtroText, filtro === 'mis' && styles.filtroTextActive]}>Mis reportes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* ---- MAPA (vista fija, NO dentro del FlatList) ---- */}
      <View style={styles.mapWrapper}>
        <MapaReportes
          reportes={reportes}
          avisos={avisos}
          onPressReporte={(r) => rootNav.navigate('ReporteDetalle', { reporteId: r.id, token })}
          onPressAviso={(a) => rootNav.navigate('AvisoDetalle', { avisoId: a.id, token })}
        />
        <View style={styles.leyenda}>
          <View style={styles.leyItem}><View style={[styles.leyDot, { backgroundColor: '#d50000' }]} /><Text style={styles.leyText}>Urgente</Text></View>
          <View style={styles.leyItem}><View style={[styles.leyDot, { backgroundColor: '#ff6d00' }]} /><Text style={styles.leyText}>Pendiente</Text></View>
          <View style={styles.leyItem}><View style={[styles.leyDot, { backgroundColor: '#f9a825' }]} /><Text style={styles.leyText}>En proceso</Text></View>
          <View style={styles.leyItem}><View style={[styles.leyDot, { backgroundColor: '#00c853' }]} /><Text style={styles.leyText}>Resuelto</Text></View>
        </View>
      </View>

      {/* ---- LISTA DE REPORTES ---- */}
      <FlatList
        data={reportes}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={48} color="#334155" />
            <Text style={styles.emptyTitle}>No hay reportes</Text>
            <Text style={styles.emptySub}>Sé el primero en reportar</Text>
          </View>
        }
        keyboardShouldPersistTaps="handled"
      />

      {/* ---- FAB ---- */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {
          if (!token) rootNav.navigate('Login', { setToken });
          else rootNav.navigate('NuevoReporte', { token, setToken });
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  greeting: { color: '#f1f5f9', fontSize: 18, fontWeight: '800' },
  role: { color: '#64748b', fontSize: 12, marginTop: 1 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  filtrosScroll: { flexGrow: 0, flexShrink: 0, marginTop: 6, marginBottom: 6 },
  filtrosRow: { paddingHorizontal: 14, alignItems: 'center', gap: 8, height: 38 },
  filtroBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1.5,
    borderColor: '#475569',
    height: 36,
    justifyContent: 'center',
  },
  filtroBtnActive: { backgroundColor: '#2563eb', borderColor: '#3b82f6' },
  filtroText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  filtroTextActive: { color: '#fff' },
  mapWrapper: {
    height: 240,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  leyenda: {
    position: 'absolute',
    bottom: 6,
    left: 10,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#0f172add',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  leyItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leyDot: { width: 6, height: 6, borderRadius: 3 },
  leyText: { color: '#94a3b8', fontSize: 9 },
  listTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  listTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '700' },
  listCount: { color: '#64748b', fontSize: 12 },
  listContent: { paddingBottom: 80 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBody: { flex: 1 },
  cardTitle: { color: '#f1f5f9', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  cardDesc: { color: '#64748b', fontSize: 12, lineHeight: 17, marginBottom: 6 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  estadoBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  estadoDot: { width: 5, height: 5, borderRadius: 3 },
  estadoText: { fontSize: 11, fontWeight: '600' },
  cardFecha: { color: '#475569', fontSize: 11 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { color: '#64748b', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySub: { color: '#475569', fontSize: 13, marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
