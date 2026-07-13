import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  getNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
} from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const NOTIF_ICON = {
  aviso: { icon: 'warning', color: '#ffd600' },
  estado: { icon: 'refresh', color: '#f9a825' },
  asignacion: { icon: 'person', color: '#1565c0' },
  comentario: { icon: 'chatbubble', color: '#00c853' },
  default: { icon: 'notifications', color: '#3b82f6' },
};

function getNotifType(item) {
  if (item.tipo === 'aviso') return 'aviso';
  if (item.mensaje && item.mensaje.includes('cambió a estado')) return 'estado';
  if (item.mensaje && item.mensaje.includes('asignó')) return 'asignacion';
  if (item.mensaje && item.mensaje.includes('coment')) return 'comentario';
  return 'default';
}

export default function NotificacionesScreen({ token }) {
  const navigation = useNavigation();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (token) cargar();
      else setLoading(false);
    }, [token])
  );

  const cargar = async () => {
    try {
      const r = await getNotificaciones();
      setNotificaciones(r.data || []);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePress = async (item) => {
    if (!item.leida) {
      try { await marcarNotificacionLeida(item.id); } catch {}
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, leida: true } : n))
      );
    }
    if (item.tipo === 'aviso' && item.aviso_id) {
      navigation.goBack();
      setTimeout(() => navigation.getParent()?.navigate('AvisoDetalle', { avisoId: item.aviso_id, token }), 100);
    } else if (item.reporte_id) {
      navigation.goBack();
      setTimeout(() => navigation.getParent()?.navigate('ReporteDetalle', { reporteId: item.reporte_id, token }), 100);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Eliminar', '¿Quieres eliminar esta notificación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarNotificacion(item.id);
            setNotificaciones((prev) => prev.filter((n) => n.id !== item.id));
          } catch {}
        },
      },
    ]);
  };

  const handleMarcarTodas = async () => {
    try {
      await marcarTodasLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch {}
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

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
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.headerActions}>
          {noLeidas > 0 && (
            <TouchableOpacity onPress={handleMarcarTodas} style={styles.actionBtn}>
              <Ionicons name="checkmark-done" size={18} color="#3b82f6" />
              <Text style={styles.actionText}>Todas leídas</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {noLeidas > 0 && (
        <View style={styles.countBar}>
          <View style={styles.countDot} />
          <Text style={styles.countText}>{noLeidas} sin leer</Text>
        </View>
      )}

      <FlatList
        data={notificaciones}
        renderItem={({ item }) => {
          const type = getNotifType(item);
          const { icon, color } = NOTIF_ICON[type] || NOTIF_ICON.default;
          return (
            <TouchableOpacity
              style={[styles.card, !item.leida && styles.cardUnread]}
              onPress={() => handlePress(item)}
              onLongPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, { backgroundColor: color + (item.leida ? '10' : '20') }]}>
                <Ionicons name={item.leida ? icon + '-outline' : icon} size={20} color={item.leida ? '#475569' : color} />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardText, !item.leida && styles.cardTextUnread]} numberOfLines={3}>
                  {item.mensaje}
                </Text>
                <View style={styles.cardBottom}>
                  <View style={[styles.typeBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.typeBadgeText, { color }]}>
                      {type === 'aviso' ? 'Aviso' : type === 'estado' ? 'Estado' : type === 'asignacion' ? 'Asignación' : type === 'comentario' ? 'Comentario' : 'General'}
                    </Text>
                  </View>
                  <Text style={styles.cardDate}>{item.creado}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
                hitSlop={8}
              >
                <Ionicons name="close" size={14} color="#475569" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargar(); }}
            tintColor="#3b82f6"
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#334155" />
            <Text style={styles.emptyTitle}>Todo al día</Text>
            <Text style={styles.emptySub}>No tienes notificaciones pendientes</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, color: '#f1f5f9', fontSize: 18, fontWeight: '700', marginLeft: 12 },
  headerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  actionText: { color: '#3b82f6', fontSize: 12, fontWeight: '600' },
  countBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 6,
  },
  countDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3b82f6' },
  countText: { color: '#3b82f6', fontSize: 12, fontWeight: '600' },
  list: { paddingBottom: 20, paddingTop: 4 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    alignItems: 'flex-start',
  },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: '#3b82f6' },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  cardBody: { flex: 1 },
  cardText: { color: '#94a3b8', fontSize: 13, lineHeight: 19 },
  cardTextUnread: { color: '#e2e8f0', fontWeight: '600' },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  cardDate: { color: '#475569', fontSize: 11 },
  deleteBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginTop: 2,
  },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#64748b', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { color: '#475569', fontSize: 14, marginTop: 6, textAlign: 'center' },
});
