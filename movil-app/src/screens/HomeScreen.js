import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert, Animated, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getReportes, getEstadisticas } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const ESTADOS = ['pendiente', 'en_revision', 'en_proceso', 'resuelto', 'rechazado'];
const ESTADO_COLOR = { pendiente: '#f97316', en_revision: '#3b82f6', en_proceso: '#8b5cf6', resuelto: '#22c55e', rechazado: '#ef4444' };
const PRIORIDAD_COLOR = { 1: '#22c55e', 2: '#84cc16', 3: '#eab308', 4: '#f97316', 5: '#ef4444' };

export default function HomeScreen({ token, setToken }) {
  const navigation = useNavigation();
  const rootNav = navigation.getParent();
  const [reportes, setReportes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { cargarDatos(); }, []));

  const cargarDatos = async () => {
    try {
      const [r, s] = await Promise.all([
        getReportes(),
        token ? getEstadisticas().catch(() => null) : null,
      ]);
      setReportes(r.data || []);
      if (s) setStats(s);
    } catch { Alert.alert('Error', 'No se pudieron cargar los reportes'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); cargarDatos(); };

  const total = reportes.length;
  const resueltos = reportes.filter((r) => r.estado === 'resuelto').length;
  const pendientes = reportes.filter((r) => r.estado === 'pendiente').length;
  const urgentes = reportes.filter((r) => r.prioridad >= 4).length;

  const statCards = [
    { icon: 'document-text', color: '#3b82f6', num: total, label: 'Total' },
    { icon: 'time', color: '#f97316', num: pendientes, label: 'Pendientes' },
    { icon: 'checkmark-circle', color: '#22c55e', num: resueltos, label: 'Resueltos' },
    { icon: 'alert-circle', color: '#ef4444', num: urgentes, label: 'Urgentes' },
  ];

  const listHeader = (
    <View>
      <View style={styles.headerSection}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>Reporte Ciudadano</Text>
            <Text style={styles.subtitle}>Reportes comunitarios</Text>
          </View>
          <TouchableOpacity style={styles.authBtn} onPress={() => token ? navigation.navigate('Perfil') : rootNav.navigate('Login', { setToken })}>
            <Ionicons name="person-outline" size={18} color="#fff" />
            <Text style={styles.authBtnText}>{token ? 'Perfil' : 'Entrar'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          {statCards.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Ionicons name={s.icon} size={20} color={s.color} />
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reportes recientes</Text>
      </View>
    </View>
  );

  if (loading) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#3b82f6" /><Text style={styles.loadingText}>Cargando reportes...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList data={reportes} renderItem={({ item }) => {
        const cat = item.categoria || {};
        return (
          <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => rootNav.navigate('ReporteDetalle', { reporteId: item.id, token })}>
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
                <View style={[styles.prioBadge, { backgroundColor: PRIORIDAD_COLOR[item.prioridad] }]}>
                  <Text style={styles.prioText}>{item.prioridad}</Text>
                </View>
              </View>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>
              <View style={styles.cardBottom}>
                <View style={styles.cardTags}>
                  {cat.icono && <Ionicons name={cat.icono} size={12} color={cat.color} />}
                  <Text style={[styles.cardCat, { color: cat.color || '#94a3b8' }]}>{cat.nombre || 'Sin categoría'}</Text>
                  <View style={[styles.dot, { backgroundColor: ESTADO_COLOR[item.estado] || '#64748b' }]} />
                  <Text style={[styles.cardEstado, { color: ESTADO_COLOR[item.estado] || '#64748b' }]}>{item.estado?.replace(/_/g, ' ')}</Text>
                </View>
                <Text style={styles.cardFecha}>{item.creado}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }} keyExtractor={(item) => String(item.id)} ListHeaderComponent={listHeader} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" colors={['#3b82f6']} />}
        ListEmptyComponent={<View style={styles.emptyBox}><Ionicons name="document-text-outline" size={64} color="#334155" /><Text style={styles.emptyTitle}>No hay reportes</Text><Text style={styles.emptySub}>Sé el primero en reportar algo</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#64748b', marginTop: 12, fontSize: 14 },
  list: { paddingBottom: 20 },
  headerSection: { padding: 20, paddingBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { color: '#f1f5f9', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: 14, marginTop: 2 },
  authBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  authBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, backgroundColor: '#1e293b', borderRadius: 14, padding: 12, alignItems: 'center' },
  statNum: { color: '#f1f5f9', fontSize: 20, fontWeight: '800', marginTop: 6 },
  statLabel: { color: '#64748b', fontSize: 11, marginTop: 2 },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { color: '#94a3b8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: '#1e293b', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, overflow: 'hidden' },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  prioBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  prioText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  cardDesc: { color: '#94a3b8', fontSize: 13, lineHeight: 18, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTags: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardCat: { fontSize: 11, fontWeight: '600' },
  dot: { width: 5, height: 5, borderRadius: 3, marginLeft: 4 },
  cardEstado: { fontSize: 11, fontWeight: '600' },
  cardFecha: { color: '#475569', fontSize: 11 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#64748b', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { color: '#475569', fontSize: 14, marginTop: 6 },
});
