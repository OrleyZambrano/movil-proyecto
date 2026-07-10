import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

// Nativo (Android/iOS): OpenStreetMap embebido en un WebView. Sin Google Maps,
// sin API key. El embed de OSM dibuja el pin en la ubicación (&marker=lat,lng).
export default function ReporteMapaDetalle({ reporte }) {
  const lat = Number(reporte.latitud);
  const lng = Number(reporte.longitud);

  if (!lat || !lng) {
    return (
      <View style={styles.box}>
        <Ionicons name="map-outline" size={40} color="#334155" />
        <Text style={styles.boxText}>Sin ubicación</Text>
      </View>
    );
  }

  const pad = 0.005;
  const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - pad},${lat - pad},${lng + pad},${lat + pad}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <View style={styles.wrap}>
      <WebView source={{ uri: url }} style={styles.map} />
      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => Linking.openURL(`https://www.openstreetmap.org/#map=16/${lat}/${lng}`)}
      >
        <Ionicons name="navigate-outline" size={14} color="#3b82f6" />
        <Text style={styles.linkText}>Ver en el mapa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 220, marginHorizontal: 0, marginVertical: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: '#1e293b' },
  map: { flex: 1 },
  box: { height: 140, marginHorizontal: 0, marginVertical: 12, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b', gap: 8 },
  boxText: { color: '#64748b', fontSize: 13 },
  linkRow: { position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172acc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 5 },
  linkText: { color: '#3b82f6', fontSize: 12, fontWeight: '700' },
});
