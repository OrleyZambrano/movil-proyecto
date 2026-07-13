import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function buildWebHTML(reportes = [], avisos = []) {
  const emojiMap = {
    'car':'🚗','trash':'🗑','bulb':'💡','water':'💧',
    'close-circle':'🚫','flag':'🚩','leaf':'🌿','football':'⚽',
    'rainy':'☔','flame':'🔥','ellipsis-horizontal':'📌',
    'location':'📍','flash':'⚡','hand-left':'✋',
    'calendar':'📅','information-circle':'ℹ️','warning':'⚠️',
  };
  const markersJS = [];

  (reportes || []).forEach((r) => {
    if (!r.latitud || !r.longitud) return;
    const estado = (r.estado || 'pendiente').replace(/_/g, ' ');
    let color = '#ff6d00';
    if (r.estado === 'resuelto') color = '#00c853';
    if (r.prioridad >= 4) color = '#d50000';
    const sym = emojiMap[r.categoria?.icono] || '📍';
    markersJS.push(`{lat:${Number(r.latitud)},lng:${Number(r.longitud)},color:'${color}',sym:'${sym}',title:${JSON.stringify(r.titulo)},sub:'${estado}'}`);
  });

  (avisos || []).forEach((a) => {
    if (!a.latitud || !a.longitud) return;
    const sym = emojiMap['warning'] || '⚠️';
    markersJS.push(`{lat:${Number(a.latitud)},lng:${Number(a.longitud)},color:'#aa00ff',sym:'${sym}',title:${JSON.stringify(a.titulo)},sub:'${a.tipo||'aviso'}'}`);
  });

  const all = [...reportes.filter(r=>r.latitud&&r.longitud), ...avisos.filter(a=>a.latitud&&a.longitud)];
  let center = '';
  if (all.length > 0) {
    const lats = all.map(m => Number(m.latitud));
    const lngs = all.map(m => Number(m.longitud));
    center = `center:[${(Math.min(...lats)+Math.max(...lats))/2},${(Math.min(...lngs)+Math.max(...lngs))/2}],zoom:13`;
  } else {
    center = `center:[-0.95,-80.73],zoom:12`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    *{margin:0;padding:0}html,body,#map{width:100%;height:100%}body{background:#1e293b}
    .mk{display:flex;align-items:center;justify-content:center}
    .mkd{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5)}
    .mkd span{font-size:14px;line-height:1}
    .lpw{background:#1e293b;color:#f1f5f9;border-radius:10px;border:1px solid #334155}
    .lpc{margin:8px 10px;font-family:sans-serif}
    .lptip{background:#1e293b;border:1px solid #334155}
    .pt{font-size:12px;font-weight:700}.ps{font-size:10px;color:#64748b;text-transform:capitalize}
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var m=L.map('map',{${center},zoomControl:false,attributionControl:false});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:19,attribution:'&copy; CartoDB'}).addTo(m);
    var data=[${markersJS.join(',')}];
    data.forEach(function(d){
      var ic=L.divIcon({className:'mk',html:'<div class="mkd" style="background:'+d.color+';"><span>'+d.sym+'</span></div>',iconSize:[26,26],iconAnchor:[13,26],popupAnchor:[0,-26]});
      L.marker([d.lat,d.lng],{icon:ic}).bindPopup('<div class="pt">'+d.title+'</div><div class="ps">'+d.sub+'</div>').addTo(m);
    });
    if(data.length>0){var g=L.featureGroup([]);m.eachLayer(function(l){if(l.getLatLng)g.addLayer(l)});m.fitBounds(g.getBounds().pad(0.15),{maxZoom:15})}
  <\/script>
</body>
</html>`;
}

export default function MapaReportes({ reportes = [], avisos = [] }) {
  const containerRef = useRef(null);

  const validos = [...(reportes || []), ...(avisos || [])].filter(
    (r) => r.latitud && r.longitud
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';
    if (!validos.length) return;

    const iframe = document.createElement('iframe');
    iframe.src = URL.createObjectURL(
      new Blob([buildWebHTML(reportes, avisos)], { type: 'text/html' })
    );
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.title = 'Mapa de reportes';
    el.appendChild(iframe);

    return () => {
      if (el) el.innerHTML = '';
    };
  }, [reportes, avisos, validos.length]);

  if (!validos.length) {
    return (
      <View style={styles.box}>
        <Ionicons name="map-outline" size={48} color="#334155" />
        <Text style={styles.boxText}>Sin ubicaciones</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View ref={containerRef} style={styles.host} />
      <View style={styles.badge}>
        <Ionicons name="location" size={14} color="#fff" />
        <Text style={styles.badgeText}>{validos.length} pines</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 320, backgroundColor: '#1e293b', position: 'relative' },
  host: { flex: 1, width: '100%', height: '100%' },
  box: { height: 320, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', gap: 8 },
  boxText: { color: '#64748b', fontSize: 14 },
  badge: { position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172acc', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
