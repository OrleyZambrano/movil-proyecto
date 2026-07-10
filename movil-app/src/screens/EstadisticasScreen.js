import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getEstadisticas } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const ESTADO_COLOR = { pendiente: '#f97316', en_revision: '#3b82f6', en_proceso: '#8b5cf6', resuelto: '#22c55e', rechazado: '#ef4444' };

export default function EstadisticasScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { cargar(); }, []));

  const cargar = async () => {
    try {
      const r = await getEstadisticas();
      setData(r);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo cargar estadísticas');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  if (loading) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  if (!data) {
    return <View style={[styles.container, styles.center]}><Text style={styles.emptyTitle}>Sin datos</Text></View>;
  }

  const estados = Object.entries(data.reportes_por_estado || {});
  const cats = Object.entries(data.reportes_por_categoria || {});
  const roles = Object.entries(data.usuarios_por_rol || {});

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel administrativo</Text>
        <View style={styles.headerBtns}>
          <TouchableOpacity style={styles.catBtn} onPress={() => navigation.navigate('CategoriasAdmin')}>
            <Ionicons name="pricetag-outline" size={18} color="#fff" />
            <Text style={styles.catBtnText}> Categorías</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.catBtn} onPress={() => navigation.navigate('UsuariosAdmin')}>
            <Ionicons name="people-outline" size={18} color="#fff" />
            <Text style={styles.catBtnText}> Usuarios</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bigCard}>
        <Text style={styles.bigNum}>{data.total_reportes}</Text>
        <Text style={styles.bigLabel}>Reportes totales</Text>
      </View>

      <Text style={styles.sectionTitle}>Por estado</Text>
      {estados.map(([k, v]) => (
        <View key={k} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: ESTADO_COLOR[k] || '#64748b' }]} />
          <Text style={styles.rowLabel}>{k.replace(/_/g, ' ')}</Text>
          <Text style={styles.rowNum}>{v}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Por categoría</Text>
      {cats.map(([k, v]) => (
        <View key={k} style={styles.row}>
          <Text style={styles.rowLabel}>{k}</Text>
          <Text style={styles.rowNum}>{v}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Usuarios</Text>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Total</Text>
        <Text style={styles.rowNum}>{data.total_usuarios}</Text>
      </View>
      {roles.map(([k, v]) => (
        <View key={k} style={styles.row}>
          <Text style={styles.rowLabel}>{k}</Text>
          <Text style={styles.rowNum}>{v}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { color: '#f1f5f9', fontSize: 24, fontWeight: '800' },
  catBtn: { flexDirection: 'row', backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  catBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  headerBtns: { flexDirection: 'row', gap: 8 },
  bigCard: { backgroundColor: '#1e293b', marginHorizontal: 16, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 18 },
  bigNum: { color: '#3b82f6', fontSize: 40, fontWeight: '800' },
  bigLabel: { color: '#94a3b8', fontSize: 14, marginTop: 4 },
  sectionTitle: { color: '#94a3b8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 20, marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', marginHorizontal: 16, marginBottom: 6, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowLabel: { color: '#cbd5e1', fontSize: 14, flex: 1, textTransform: 'capitalize' },
  rowNum: { color: '#f1f5f9', fontSize: 16, fontWeight: '800' },
  emptyTitle: { color: '#64748b', fontSize: 18, fontWeight: '700' },
});
