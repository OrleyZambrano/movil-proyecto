import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

function buildDetailHTML(lat, lng) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
    body { background: #1e293b; touch-action: pan-x pan-y pinch-zoom; }
    .leaflet-container { touch-action: pan-x pan-y pinch-zoom; }
    .marker-pin { display: flex; align-items: center; justify-content: center; }
    .marker-dot { width: 28px; height: 28px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.5); }
    .marker-dot span { color: #fff; font-size: 15px; font-weight: 700; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { center: [${lat}, ${lng}], zoom: 17, zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; CartoDB' }).addTo(map);
    var icon = L.divIcon({
      className: 'marker-pin',
      html: '<div class="marker-dot"><span>\\uD83D\\uDCCD</span></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });
    L.marker([${lat}, ${lng}], { icon: icon }).addTo(map);
  <\/script>
</body>
</html>`;
}

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

  const html = buildDetailHTML(lat, lng);

  return (
    <View style={styles.wrap}>
      <WebView
        source={{ html }}
        style={styles.map}
        javaScriptEnabled={true}
        originWhitelist={['*']}
      />
      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => Linking.openURL(`https://www.openstreetmap.org/#map=17/${lat}/${lng}`)}
      >
        <Ionicons name="navigate-outline" size={14} color="#3b82f6" />
        <Text style={styles.linkText}>Abrir en el mapa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 200,
    marginHorizontal: 0,
    marginVertical: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  map: { flex: 1 },
  box: {
    height: 140,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    gap: 8,
  },
  boxText: { color: '#64748b', fontSize: 13 },
  linkRow: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172acc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  linkText: { color: '#3b82f6', fontSize: 12, fontWeight: '700' },
});
