import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getAviso, updateAviso, deleteAviso } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

function buildAvisoMapHTML(lat, lng) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    *{margin:0;padding:0}    html,body,#map{width:100%;height:100%}body{background:#1e293b;touch-action:pan-x pan-y pinch-zoom}
    .leaflet-container{touch-action:pan-x pan-y pinch-zoom}
    .mk{display:flex;align-items:center;justify-content:center}
    .mkd{width:28px;height:28px;border-radius:50%;background:#3b82f6;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5)}
    .mkd span{font-size:15px;line-height:1}
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var m=L.map('map',{center:[${lat},${lng}],zoom:17,zoomControl:false,attributionControl:false});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:19,attribution:'&copy; CartoDB'}).addTo(m);
    L.marker([${lat},${lng}],{icon:L.divIcon({className:'mk',html:'<div class="mkd"><span>\\uD83D\\uDCCD</span></div>',iconSize:[28,28],iconAnchor:[14,28]})}).addTo(m);
  <\/script>
</body>
</html>`;
}

const TIPO_ICON = {
  corte_luz: 'flash',
  corte_agua: 'water',
  ayuda: 'hand-left',
  evento: 'calendar',
  emergencia: 'warning',
  otro: 'information-circle',
};

const TIPO_COLOR = {
  corte_luz: '#ffd600',
  corte_agua: '#2979ff',
  ayuda: '#ff3d00',
  evento: '#aa00ff',
  emergencia: '#d50000',
  otro: '#546e7a',
};

const TIPO_LABEL = {
  corte_luz: 'Corte de luz',
  corte_agua: 'Corte de agua',
  ayuda: 'Solicitud de ayuda',
  evento: 'Evento',
  emergencia: 'Emergencia',
  otro: 'Otro',
};

export default function AvisoDetalleScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { avisoId, token } = route.params;
  const [aviso, setAviso] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userState, setUserState] = useState(null);

  useEffect(() => {
    import('../services/storage').then(({ leerUsuario }) => {
      leerUsuario().then(setUserState);
    });
  }, []);

  const user = userState;
  const esAutor = aviso?.usuario_id === user?.id;
  const esAdmin = user?.rol === 'admin';
  const puedeEditar = esAutor || esAdmin;

  useEffect(() => {
    getAviso(avisoId)
      .then((r) => setAviso(r.data || r))
      .catch(() => Alert.alert('Error', 'No se pudo cargar el aviso'))
      .finally(() => setLoading(false));
  }, [avisoId]);

  const toggleActivo = async () => {
    try {
      const nuevo = !aviso.activo;
      await updateAviso(avisoId, { activo: nuevo });
      setAviso((prev) => ({ ...prev, activo: nuevo }));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar aviso', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAviso(avisoId);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!aviso) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={64} color="#334155" />
        <Text style={styles.emptyText}>Aviso no encontrado</Text>
      </View>
    );
  }

  const color = TIPO_COLOR[aviso.tipo] || '#64748b';
  const icon = TIPO_ICON[aviso.tipo] || 'information-circle';
  const lat = Number(aviso.latitud);
  const lng = Number(aviso.longitud);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del aviso</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={48} color={color} />
          </View>
          <Text style={styles.titulo}>{aviso.titulo}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.badgeText, { color }]}>{TIPO_LABEL[aviso.tipo]}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: aviso.activo ? '#22c55e20' : '#64748b20' }]}>
              <View style={[styles.badgeDot, { backgroundColor: aviso.activo ? '#22c55e' : '#64748b' }]} />
              <Text style={[styles.badgeText, { color: aviso.activo ? '#22c55e' : '#64748b' }]}>
                {aviso.activo ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.prioSection}>
          <Text style={styles.sectionLabel}>PRIORIDAD</Text>
          <View style={styles.prioRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <View
                key={n}
                style={[
                  styles.prioBar,
                  {
                    backgroundColor: n <= (aviso.prioridad || 1) ? color : '#334155',
                    width: `${18}%`,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.prioValue}>{aviso.prioridad}/5</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DESCRIPCIÓN</Text>
          <Text style={styles.descripcion}>{aviso.descripcion}</Text>
        </View>

        {lat && lng ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>UBICACIÓN</Text>
            <View style={styles.mapWrap}>
              <WebView
                source={{ html: buildAvisoMapHTML(lat, lng) }}
                style={styles.map}
                javaScriptEnabled={true}
                originWhitelist={['*']}
              />
            </View>
            {aviso.direccion && <Text style={styles.direccion}>{aviso.direccion}</Text>}
          </View>
        ) : aviso.direccion ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DIRECCIÓN</Text>
            <Text style={styles.descripcion}>{aviso.direccion}</Text>
          </View>
        ) : null}

        {(aviso.fecha_inicio || aviso.fecha_fin) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>VIGENCIA</Text>
            <View style={styles.fechaRow}>
              {aviso.fecha_inicio && (
                <View style={styles.fechaCard}>
                  <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                  <Text style={styles.fechaText}>Inicio: {aviso.fecha_inicio}</Text>
                </View>
              )}
              {aviso.fecha_fin && (
                <View style={styles.fechaCard}>
                  <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                  <Text style={styles.fechaText}>Fin: {aviso.fecha_fin}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color="#64748b" />
            <Text style={styles.metaText}>
              Creado por {aviso.usuario?.name || 'Desconocido'}
            </Text>
          </View>
          <Text style={styles.metaDate}>{aviso.creado}</Text>
        </View>

        {puedeEditar && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: aviso.activo ? '#64748b20' : '#22c55e20' }]}
              onPress={toggleActivo}
            >
              <Ionicons
                name={aviso.activo ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={aviso.activo ? '#64748b' : '#22c55e'}
              />
              <Text style={[styles.actionText, { color: aviso.activo ? '#64748b' : '#22c55e' }]}>
                {aviso.activo ? 'Desactivar' : 'Activar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#3b82f620' }]}
              onPress={() => navigation.navigate('NuevoAviso', { token, avisoId })}
            >
              <Ionicons name="create-outline" size={18} color="#3b82f6" />
              <Text style={[styles.actionText, { color: '#3b82f6' }]}>Editar</Text>
            </TouchableOpacity>

            {esAdmin && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#ef444420' }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={[styles.actionText, { color: '#ef4444' }]}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: '700' },
  body: { flex: 1 },
  bodyContent: { padding: 16 },
  heroSection: { alignItems: 'center', paddingVertical: 16 },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  titulo: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  badges: { flexDirection: 'row', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  prioSection: { marginTop: 8 },
  sectionLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  prioRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  prioBar: { height: 6, borderRadius: 3 },
  prioValue: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  section: { marginTop: 20 },
  descripcion: { color: '#e2e8f0', fontSize: 15, lineHeight: 22 },
  mapWrap: {
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  map: { flex: 1 },
  markerWrap: { alignItems: 'center', justifyContent: 'center', width: 40, height: 48 },
  markerDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  direccion: { color: '#94a3b8', fontSize: 13, marginTop: 8 },
  fechaRow: { flexDirection: 'row', gap: 10 },
  fechaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1e293b',
  },
  fechaText: { color: '#94a3b8', fontSize: 12 },
  metaSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaText: { color: '#64748b', fontSize: 13 },
  metaDate: { color: '#475569', fontSize: 12 },
  actionsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionText: { fontSize: 13, fontWeight: '700' },
  emptyText: { color: '#64748b', fontSize: 16, marginTop: 16 },
});
