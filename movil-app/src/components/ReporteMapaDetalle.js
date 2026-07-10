import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// En web usamos OpenStreetMap embebido (iframe). No requiere API key y evita
// importar react-native-maps, que no tiene soporte para web.
export default function ReporteMapaDetalle({ reporte }) {
  const lat = Number(reporte.latitud);
  const lng = Number(reporte.longitud);
  const containerRef = useRef(null);

  if (!lat || !lng) {
    return (
      <View style={styles.box}>
        <Ionicons name="map-outline" size={40} color="#334155" />
        <Text style={styles.boxText}>Sin ubicación</Text>
      </View>
    );
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';
    const pad = 0.01;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - pad},${lat - pad},${lng + pad},${lat + pad}&layer=mapnik&marker=${lat},${lng}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.title = 'Ubicación del reporte';
    el.appendChild(iframe);
    return () => { el.innerHTML = ''; };
  }, [lat, lng]);

  return (
    <View style={styles.wrap}>
      <View ref={containerRef} style={styles.mapHost} />
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
  mapHost: { flex: 1, width: '100%', height: '100%' },
  box: { height: 140, marginHorizontal: 16, marginVertical: 12, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b', gap: 8 },
  boxText: { color: '#64748b', fontSize: 13 },
  linkRow: { position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172acc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 5 },
  linkText: { color: '#3b82f6', fontSize: 12, fontWeight: '700' },
});
