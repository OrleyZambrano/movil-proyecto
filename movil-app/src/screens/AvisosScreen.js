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
import { getAvisos } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const TIPOS = [
  { key: 'todas', label: 'Todas', icon: 'list', color: '#3b82f6' },
  { key: 'corte_luz', label: 'Luz', icon: 'flash', color: '#ffd600' },
  { key: 'corte_agua', label: 'Agua', icon: 'water', color: '#2979ff' },
  { key: 'ayuda', label: 'Ayuda', icon: 'hand-left', color: '#ff3d00' },
  { key: 'evento', label: 'Evento', icon: 'calendar', color: '#aa00ff' },
  { key: 'emergencia', label: 'Emergencia', icon: 'warning', color: '#d50000' },
];

const TIPO_LABEL = {
  corte_luz: 'Corte de luz',
  corte_agua: 'Corte de agua',
  ayuda: 'Solicitud de ayuda',
  evento: 'Evento',
  emergencia: 'Emergencia',
  otro: 'Otro',
};

export default function AvisosScreen({ token, user }) {
  const navigation = useNavigation();
  const rootNav = navigation.getParent();
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todas');

  const esFuncionarioOAdmin = user?.rol === 'funcionario' || user?.rol === 'admin';

  const cargar = useCallback(async () => {
    try {
      const params = { activo: '1' };
      if (filtroTipo !== 'todas') params.tipo = filtroTipo;
      const r = await getAvisos(params);
      setAvisos(r.data || []);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudieron cargar los avisos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtroTipo]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const onRefresh = () => { setRefreshing(true); cargar(); };

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
        <Text style={styles.headerTitle}>Avisos</Text>
        {esFuncionarioOAdmin && (
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => rootNav.navigate('NuevoAviso', { token })}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tiposRow}>
        {TIPOS.map((t) => {
          const active = filtroTipo === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.tipoBtn,
                active && { backgroundColor: t.color, borderColor: t.color },
              ]}
              onPress={() => setFiltroTipo(t.key)}
            >
              <Ionicons name={t.icon} size={16} color={active ? '#fff' : t.color} />
              <Text style={[styles.tipoLabel, active && { color: '#fff' }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={avisos}
        renderItem={({ item }) => {
          const tipo = TIPOS.find((t) => t.key === item.tipo);
          const color = tipo?.color || '#64748b';
          const icon = tipo?.icon || 'information-circle';
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => rootNav.navigate('AvisoDetalle', { avisoId: item.id, token })}
            >
              <View style={[styles.cardLeft]}>
                <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
                  <Ionicons name={icon} size={22} color={color} />
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>
                <View style={styles.cardMeta}>
                  <View style={[styles.tipoBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.tipoBadgeText, { color }]}>
                      {TIPO_LABEL[item.tipo] || item.tipo}
                    </Text>
                  </View>
                  <View style={styles.prioDots}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <View
                        key={n}
                        style={[
                          styles.prioDot,
                          { backgroundColor: n <= (item.prioridad || 1) ? color : '#334155' },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.cardDate}>{item.creado}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#475569" />
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={64} color="#334155" />
            <Text style={styles.emptyTitle}>Sin avisos</Text>
            <Text style={styles.emptySub}>
              {esFuncionarioOAdmin
                ? 'Crea un nuevo aviso con el botón +'
                : 'No hay avisos activos en este momento'}
            </Text>
          </View>
        }
      />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { color: '#f1f5f9', fontSize: 24, fontWeight: '800' },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiposRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 6,
  },
  tipoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    gap: 5,
  },
  tipoLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  list: { paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cardLeft: { marginRight: 12 },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  cardDesc: { color: '#64748b', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tipoBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  prioDots: { flexDirection: 'row', gap: 3 },
  prioDot: { width: 6, height: 6, borderRadius: 3 },
  cardDate: { color: '#475569', fontSize: 11, marginLeft: 'auto' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#64748b', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { color: '#475569', fontSize: 14, marginTop: 6, textAlign: 'center' },
});
