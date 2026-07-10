import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Web: OpenStreetMap embebido (iframe). No importa react-native-maps.
export default function MapaReportes({ reportes = [] }) {
  const validos = reportes.filter((r) => r.latitud && r.longitud);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';
    if (!validos.length) return;

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

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markers}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.title = 'Mapa de reportes';
    el.appendChild(iframe);

    return () => { el.innerHTML = ''; };
  }, [reportes, validos.length]);

  if (!validos.length) {
    return (
      <View style={styles.box}>
        <Ionicons name="map-outline" size={48} color="#334155" />
        <Text style={styles.boxText}>Sin ubicaciones para mostrar</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View ref={containerRef} style={styles.mapHost} />
      <Text style={styles.attr}>© OpenStreetMap</Text>
      <View style={styles.badge}>
        <Ionicons name="location" size={14} color="#fff" />
        <Text style={styles.badgeText}>{validos.length} reporte(s) en el mapa</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 320, backgroundColor: '#1e293b', position: 'relative' },
  mapHost: { flex: 1, width: '100%', height: '100%' },
  attr: { position: 'absolute', bottom: 10, left: 10, zIndex: 5, color: '#cbd5e1', fontSize: 10, backgroundColor: '#0f172acc', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badge: { position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172acc', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  box: { height: 320, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', gap: 8 },
  boxText: { color: '#64748b', fontSize: 14 },
});
