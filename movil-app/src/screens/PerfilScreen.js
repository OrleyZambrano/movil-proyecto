import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUser, getMisReportes, logout } from '../services/api';
import { borrarSesion } from '../services/storage';

export default function PerfilScreen({ token, user, setToken, setUser }) {
  const navigation = useNavigation();
  const rootNav = navigation.getParent();
  const [perfil, setPerfil] = useState(null);
  const [misReportes, setMisReportes] = useState([]);
  const [showReportes, setShowReportes] = useState(false);

  useEffect(() => {
    if (token) {
      getUser().then(setPerfil).catch(() => Alert.alert('Error', 'No se pudo cargar tu perfil'));
      getMisReportes().then(r => setMisReportes(r.data || [])).catch(() => {});
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    if (token) getMisReportes().then(r => setMisReportes(r.data || [])).catch(() => {});
  }, [token]));

  const handleLogout = async () => {
    try { await logout(); } catch {}
    await borrarSesion();
    setToken(null);
    setPerfil(null);
    if (setUser) setUser(null);
  };

  const ESTADO_COLOR = { pendiente: '#f97316', en_revision: '#3b82f6', en_proceso: '#8b5cf6', resuelto: '#22c55e', rechazado: '#ef4444' };

  if (!token) {
    return (
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.iconWrap}><Ionicons name="person-outline" size={48} color="#64748b" /></View>
          <Text style={styles.title}>Cuenta</Text>
          <Text style={styles.sub}>Inicia sesión para crear reportes</Text>
        </View>
        <TouchableOpacity style={styles.loginBtn} onPress={() => rootNav.navigate('Login', { setToken })}>
          <Ionicons name="log-in-outline" size={18} color="#fff" />
          <Text style={styles.loginText}> Iniciar sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={() => rootNav.navigate('Register', { setToken })}>
          <Text style={styles.registerText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: '#3b82f6' }]}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.userName}>{perfil?.name || user?.name || 'Usuario'}</Text>
        <Text style={styles.userEmail}>{perfil?.email || user?.email || ''}</Text>
        <View style={styles.rolBadge}>
          <Text style={styles.rolText}>{user?.rol || 'ciudadano'}</Text>
        </View>
      </View>

      {user?.rol === 'admin' && (
        <TouchableOpacity style={styles.adminBtn} onPress={() => navigation.navigate('Admin')}>
          <Ionicons name="shield-checkmark" size={20} color="#fff" />
          <Text style={styles.adminText}> Panel administrativo</Text>
        </TouchableOpacity>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{misReportes.length}</Text>
          <Text style={styles.statLabel}>Mis reportes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{misReportes.filter(r => r.estado === 'resuelto').length}</Text>
          <Text style={styles.statLabel}>Resueltos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{misReportes.filter(r => r.estado === 'pendiente').length}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.menuItem} onPress={() => setShowReportes(!showReportes)}>
        <Ionicons name="document-text-outline" size={20} color="#3b82f6" />
        <Text style={styles.menuText}>Mis reportes</Text>
        <Ionicons name={showReportes ? 'chevron-up' : 'chevron-down'} size={18} color="#64748b" />
      </TouchableOpacity>

      {showReportes && misReportes.map((r) => (
        <TouchableOpacity key={r.id} style={styles.reporteItem} onPress={() => rootNav.navigate('ReporteDetalle', { reporteId: r.id, token })}>
          <View style={[styles.estadoLine, { backgroundColor: ESTADO_COLOR[r.estado] || '#64748b' }]} />
          <View style={styles.reporteItemBody}>
            <Text style={styles.reporteItemTitle} numberOfLines={1}>{r.titulo}</Text>
            <View style={styles.reporteItemBottom}>
              <Text style={[styles.reporteItemEstado, { color: ESTADO_COLOR[r.estado] || '#64748b' }]}>{r.estado?.replace(/_/g, ' ')}</Text>
              <Text style={styles.reporteItemFecha}>{r.creado}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={styles.logoutText}> Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { paddingBottom: 40 },
  topSection: { alignItems: 'center', paddingTop: 48, paddingBottom: 32, paddingHorizontal: 24 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { color: '#f1f5f9', fontSize: 22, fontWeight: '800' },
  sub: { color: '#64748b', fontSize: 14, marginTop: 4, textAlign: 'center' },
  loginBtn: { flexDirection: 'row', backgroundColor: '#3b82f6', marginHorizontal: 24, padding: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  loginText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerBtn: { marginHorizontal: 24, padding: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#3b82f6' },
  registerText: { color: '#3b82f6', fontSize: 15, fontWeight: '600' },
  profileCard: { alignItems: 'center', paddingTop: 24, paddingBottom: 20, paddingHorizontal: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  userName: { color: '#f1f5f9', fontSize: 20, fontWeight: '800' },
  userEmail: { color: '#64748b', fontSize: 14, marginTop: 2 },
  rolBadge: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  rolText: { color: '#3b82f6', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#1e293b', borderRadius: 14, padding: 14, alignItems: 'center' },
  statNum: { color: '#f1f5f9', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#64748b', fontSize: 11, marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  menuText: { color: '#f1f5f9', fontSize: 15, fontWeight: '600', flex: 1 },
  reporteItem: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 6, backgroundColor: '#1e293b', borderRadius: 12, overflow: 'hidden' },
  estadoLine: { width: 3 },
  reporteItemBody: { flex: 1, padding: 12 },
  reporteItemTitle: { color: '#f1f5f9', fontSize: 14, fontWeight: '600' },
  reporteItemBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  reporteItemEstado: { fontSize: 11, fontWeight: '600' },
  reporteItemFecha: { color: '#475569', fontSize: 11 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, marginTop: 8, gap: 6 },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
  adminBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8b5cf6', marginHorizontal: 20, padding: 14, borderRadius: 14, marginTop: 4, marginBottom: 20 },
  adminText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
