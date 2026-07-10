import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

// Nativo (Android/iOS): OpenStreetMap embebido (WebView) con un pin por reporte.
// Sin Google Maps, sin API key. El bbox abarca todos los reportes con coords.
export default function MapaReportes({ reportes = [] }) {
  const validos = reportes.filter((r) => r.latitud && r.longitud);

  if (!validos.length) {
    return (
      <View style={styles.box}>
        <Ionicons name="map-outline" size={48} color="#334155" />
        <Text style={styles.boxText}>Sin ubicaciones para mostrar</Text>
      </View>
    );
  }

  const lats = validos.map((r) => Number(r.latitud));
  const lngs = validos.map((r) => Number(r.longitud));
  const pad = 0.01;
  const bbox = [
    Math.min(...lngs) - pad,
    Math.min(...lats) - pad,
    Math.max(...lngs) + pad,
    Math.max(...lats) + pad,
  ].join(',');
  const markers = validos.map((r) => `&marker=${r.latitud},${r.longitud}`).join('');
  const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markers}`;

  return (
    <View style={styles.wrap}>
      <WebView source={{ uri: url }} style={styles.map} />
      <View style={styles.badge}>
        <Ionicons name="location" size={14} color="#fff" />
        <Text style={styles.badgeText}>{validos.length} reporte(s) en el mapa</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 320, backgroundColor: '#1e293b', position: 'relative' },
  map: { flex: 1 },
  badge: { position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172acc', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  box: { height: 320, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', gap: 8 },
  boxText: { color: '#64748b', fontSize: 14 },
});
