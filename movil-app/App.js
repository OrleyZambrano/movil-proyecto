import { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { leerSesion, guardarSesion } from './src/services/storage';
import { getUser, getNotificaciones } from './src/services/api';
import HomeScreen from './src/screens/HomeScreen';
import ReportesScreen from './src/screens/ReportesScreen';
import NuevoReporteScreen from './src/screens/NuevoReporteScreen';
import NotificacionesScreen from './src/screens/NotificacionesScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ReporteDetalleScreen from './src/screens/ReporteDetalleScreen';
import EstadisticasScreen from './src/screens/EstadisticasScreen';
import CategoriasAdminScreen from './src/screens/CategoriasAdminScreen';
import UsuariosAdminScreen from './src/screens/UsuariosAdminScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Inicio: 'home',
  Reportes: 'map',
  Reportar: 'add-circle',
  Notificaciones: 'notifications',
  Perfil: 'person',
  Admin: 'shield-checkmark',
};

function TabNavigator({ token, user, updateToken, updateUser, unread, refrescarNoLeidas }) {
  const esAdmin = user?.rol === 'admin';

  useEffect(() => {
    refrescarNoLeidas();
    const id = setInterval(refrescarNoLeidas, 20000);
    return () => clearInterval(id);
  }, [refrescarNoLeidas]);

  useFocusEffect(useCallback(() => { refrescarNoLeidas(); }, [refrescarNoLeidas]));

  return (
    <Tab.Navigator
      // key cambia al cambiar de usuario -> React Navigation remonta todas las
      // pestañas y se borra el estado de los formularios (ej. pantalla Reportar).
      key={user?.id || 'invitado'}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b', paddingBottom: 4, height: 56 },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ color, size }) => <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />,
        tabBarBadge: route.name === 'Notificaciones' && unread > 0 ? String(unread) : undefined,
        tabBarBadgeStyle: { backgroundColor: '#ef4444', color: '#fff', fontSize: 10 },
      })}
    >
      <Tab.Screen name="Inicio">{() => <HomeScreen token={token} user={user} setToken={updateToken} />}</Tab.Screen>
      <Tab.Screen name="Reportes">{() => <ReportesScreen token={token} user={user} />}</Tab.Screen>
      <Tab.Screen name="Reportar">{() => <NuevoReporteScreen token={token} setToken={updateToken} />}</Tab.Screen>
      <Tab.Screen name="Notificaciones">{() => <NotificacionesScreen token={token} />}</Tab.Screen>
      <Tab.Screen name="Perfil">{() => <PerfilScreen token={token} user={user} setToken={updateToken} setUser={updateUser} />}</Tab.Screen>
      {esAdmin && (
        <Tab.Screen name="Admin">{() => <EstadisticasScreen token={token} user={user} />}</Tab.Screen>
      )}
    </Tab.Navigator>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    leerSesion().then(async ({ token: t, user: u }) => {
      try {
        if (t && !u) {
          // Sesión de una versión anterior: hay token pero no guardamos el user.
          const u2 = await getUser();
          setUser(u2);
          guardarSesion(t, u2);
        } else {
          setUser(u);
        }
      } catch {
        setUser(null);
      }
      setToken(t);
      setLoaded(true);
    });
  }, []);

  const updateToken = useCallback((t) => setToken(t), []);
  const updateUser = useCallback((u) => setUser(u), []);
  const [unread, setUnread] = useState(0);

  const refrescarNoLeidas = useCallback(async () => {
    if (!token) { setUnread(0); return; }
    try {
      const r = await getNotificaciones();
      const lista = Array.isArray(r) ? r : (r?.data || []);
      setUnread(lista.filter((n) => !n.leida).length);
    } catch { /* noop */ }
  }, [token]);

  useEffect(() => { if (!token) setUnread(0); }, [token]);

  if (!loaded) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar style="light" translucent={false} backgroundColor="#0f172a" />
        <View style={styles.splash}><ActivityIndicator size="large" color="#3b82f6" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" translucent={false} backgroundColor="#0f172a" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs">{() => <TabNavigator token={token} user={user} updateToken={updateToken} updateUser={updateUser} unread={unread} refrescarNoLeidas={refrescarNoLeidas} />}</Stack.Screen>
          <Stack.Screen name="Login">{({ route, navigation }) => (
            <LoginScreen navigation={navigation} route={route} setToken={updateToken} setUser={updateUser} />
          )}</Stack.Screen>
          <Stack.Screen name="Register">{({ route, navigation }) => (
            <RegisterScreen navigation={navigation} route={route} setToken={updateToken} setUser={updateUser} />
          )}</Stack.Screen>
          <Stack.Screen name="NuevoReporte" options={{ presentation: 'modal' }}>
            {({ route }) => <NuevoReporteScreen route={route} token={token} setToken={updateToken} />}
          </Stack.Screen>
          <Stack.Screen name="ReporteDetalle" component={ReporteDetalleScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="CategoriasAdmin" component={CategoriasAdminScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="UsuariosAdmin" component={UsuariosAdminScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
