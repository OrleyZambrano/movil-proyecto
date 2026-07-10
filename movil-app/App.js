import { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { leerToken } from './src/services/storage';
import HomeScreen from './src/screens/HomeScreen';
import ReportesScreen from './src/screens/ReportesScreen';
import NuevoReporteScreen from './src/screens/NuevoReporteScreen';
import NotificacionesScreen from './src/screens/NotificacionesScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ReporteDetalleScreen from './src/screens/ReporteDetalleScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = { Inicio: 'home', Reportes: 'map', Reportar: 'add-circle', Notificaciones: 'notifications', Perfil: 'person' };

function TabNavigator({ token, updateToken }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b', paddingBottom: 4, height: 56 },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ color, size }) => <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Inicio">{() => <HomeScreen token={token} setToken={updateToken} />}</Tab.Screen>
      <Tab.Screen name="Reportes">{() => <ReportesScreen token={token} />}</Tab.Screen>
      <Tab.Screen name="Reportar">{() => <NuevoReporteScreen token={token} setToken={updateToken} />}</Tab.Screen>
      <Tab.Screen name="Notificaciones">{() => <NotificacionesScreen token={token} />}</Tab.Screen>
      <Tab.Screen name="Perfil">{() => <PerfilScreen token={token} setToken={updateToken} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    leerToken().then((t) => { setToken(t); setLoaded(true); });
  }, []);

  const updateToken = useCallback((t) => setToken(t), []);

  if (!loaded) {
    return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}><StatusBar style="light" translucent={false} backgroundColor="#0f172a" /><View style={styles.splash}><ActivityIndicator size="large" color="#3b82f6" /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" translucent={false} backgroundColor="#0f172a" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs">{() => <TabNavigator token={token} updateToken={updateToken} />}</Stack.Screen>
          <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="NuevoReporte" options={{ presentation: 'modal' }}>
            {() => <NuevoReporteScreen token={token} setToken={updateToken} />}
          </Stack.Screen>
          <Stack.Screen name="ReporteDetalle" component={ReporteDetalleScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
