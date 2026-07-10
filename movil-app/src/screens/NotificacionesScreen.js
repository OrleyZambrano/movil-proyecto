import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getNotificaciones, marcarNotificacionLeida } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function NotificacionesScreen({ token }) {
  const navigation = useNavigation();
  const rootNav = navigation.getParent();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { if (token) cargar(); else { setLoading(false); } }, [token]));

  const cargar = async () => {
    try { const r = await getNotificaciones(); setNotificaciones(r.data || []); }
    catch (e) { Alert.alert('Error', e.message || 'No se pudieron cargar las notificaciones'); } finally { setLoading(false); setRefreshing(false); }
  };

  const handlePress = async (item) => {
    if (!item.leida) { try { await marcarNotificacionLeida(item.id); } catch {} }
    rootNav.navigate('ReporteDetalle', { reporteId: item.reporte_id, token });
  };

  if (!token) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="notifications-off-outline" size={64} color="#334155" />
        <Text style={styles.emptyTitle}>Sin notificaciones</Text>
        <Text style={styles.emptySub}>Inicia sesión para ver tus notificaciones</Text>
      </View>
    );
  }

  if (loading) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <Text style={styles.headerCount}>{notificaciones.filter(n => !n.leida).length} nuevas</Text>
      </View>
      <FlatList data={notificaciones} renderItem={({ item }) => (
        <TouchableOpacity style={[styles.card, !item.leida && styles.cardUnread]} onPress={() => handlePress(item)}>
          <View style={[styles.iconWrap, { backgroundColor: item.leida ? '#1e293b' : '#3b82f620' }]}>
            <Ionicons name={item.leida ? 'notifications-outline' : 'notifications'} size={20} color={item.leida ? '#64748b' : '#3b82f6'} />
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardText, !item.leida && styles.cardTextUnread]}>{item.mensaje}</Text>
            <Text style={styles.cardDate}>{item.creado}</Text>
          </View>
          {!item.leida && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      )} keyExtractor={(item) => String(item.id)} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor="#3b82f6" />}
        contentContainerStyle={styles.list} ListEmptyComponent={
          <View style={styles.emptyBox}><Ionicons name="notifications-off-outline" size={64} color="#334155" /><Text style={styles.emptyTitle}>Sin notificaciones</Text></View>
        } />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { color: '#f1f5f9', fontSize: 24, fontWeight: '800' },
  headerCount: { color: '#3b82f6', fontSize: 13, fontWeight: '600' },
  list: { paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#1e293b', marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 14, alignItems: 'center' },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: '#3b82f6' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardBody: { flex: 1 },
  cardText: { color: '#94a3b8', fontSize: 14, lineHeight: 20 },
  cardTextUnread: { color: '#f1f5f9', fontWeight: '600' },
  cardDate: { color: '#475569', fontSize: 11, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6', marginLeft: 8 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#64748b', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { color: '#475569', fontSize: 14, marginTop: 6, textAlign: 'center' },
});
