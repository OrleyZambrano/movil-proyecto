import { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const ESTADO_COLOR = {
  pendiente: '#ff6d00',
  en_revision: '#1565c0',
  en_proceso: '#f9a825',
  resuelto: '#00c853',
  rechazado: '#d50000',
};

const AVISO_TIPO_COLOR = {
  corte_luz: '#ffd600',
  corte_agua: '#2979ff',
  ayuda: '#ff3d00',
  evento: '#aa00ff',
  emergencia: '#d50000',
  otro: '#546e7a',
};

const ICON_EMOJI = {
  'car': '🚗', 'trash': '🗑', 'bulb': '💡', 'water': '💧',
  'close-circle': '🚫', 'flag': '🚩', 'leaf': '🌿', 'football': '⚽',
  'rainy': '☔', 'flame': '🔥', 'ellipsis-horizontal': '📌',
  'location': '📍', 'flash': '⚡', 'hand-left': '✋',
  'calendar': '📅', 'information-circle': 'ℹ️', 'warning': '⚠️',
};

function getReporteColor(r) {
  if (r.estado === 'rechazado') return ESTADO_COLOR.rechazado;
  if (r.prioridad >= 4) return '#d50000';
  return ESTADO_COLOR[r.estado] || '#64748b';
}

function getAvisoColor(a) {
  return AVISO_TIPO_COLOR[a.tipo] || '#64748b';
}

function getAvisoIconName(a) {
  const map = { corte_luz:'flash', corte_agua:'water', ayuda:'hand-left', evento:'calendar', emergencia:'warning', otro:'information-circle' };
  return map[a.tipo] || 'information-circle';
}

function buildHTML(reportes, avisos, ubicacionUsuario, radio) {
  const markersJS = [];

  (reportes || []).forEach((r) => {
    if (!r.latitud || !r.longitud) return;
    const color = getReporteColor(r);
    const icon = r.categoria?.icono || 'location';
    markersJS.push(`{
      lat: ${Number(r.latitud)}, lng: ${Number(r.longitud)},
      color: '${color}', icon: '${icon}',
      type: 'reporte', id: ${r.id}, symbol: '${ICON_EMOJI[r.categoria?.icono] || '📍'}',
      title: ${JSON.stringify(r.titulo)}, subtitle: '${(r.estado || 'pendiente').replace(/_/g, ' ')}'
    }`);
  });

  (avisos || []).forEach((a) => {
    if (!a.latitud || !a.longitud) return;
    const color = getAvisoColor(a);
    const icon = getAvisoIconName(a);
    markersJS.push(`{
      lat: ${Number(a.latitud)}, lng: ${Number(a.longitud)},
      color: '${color}', icon: '${icon}',
      type: 'aviso', id: ${a.id}, symbol: '${ICON_EMOJI[getAvisoIconName(a)] || '⚠️'}',
      title: ${JSON.stringify(a.titulo)}, subtitle: '${(a.tipo || 'aviso').replace(/_/g, ' ')}'
    }`);
  });

  const centroid = markersJS.length > 0 ? (() => {
    const lats = [];
    const lngs = [];
    (reportes || []).forEach(r => { if(r.latitud && r.longitud){ lats.push(Number(r.latitud)); lngs.push(Number(r.longitud)); }});
    (avisos || []).forEach(a => { if(a.latitud && a.longitud){ lats.push(Number(a.latitud)); lngs.push(Number(a.longitud)); }});
    if (lats.length > 0) return { lat: lats.reduce((a,b)=>a+b,0)/lats.length, lng: lngs.reduce((a,b)=>a+b,0)/lngs.length };
    return null;
  })() : null;

  const centerJS = ubicacionUsuario && !centroid
    ? `center: [${ubicacionUsuario.lat}, ${ubicacionUsuario.lng}], zoom: 14`
    : centroid
    ? `center: [${centroid.lat}, ${centroid.lng}], zoom: 14`
    : `center: [-0.95, -80.73], zoom: 12`;

  const fitBounds = markersJS.length > 0
    ? `setTimeout(function(){ if(markersArray.length > 0){ var g = L.featureGroup(markersArray); map.fitBounds(g.getBounds().pad(0.15), {maxZoom: 15}); } }, 300);`
    : '';

  const radioCircle = ubicacionUsuario && radio
    ? `L.circle([${ubicacionUsuario.lat}, ${ubicacionUsuario.lng}], { radius: ${radio * 1000}, color: '#3b82f6', weight: 2, fillColor: '#3b82f640', fillOpacity: 0.2 }).addTo(map);`
    : '';

  const userMarker = ubicacionUsuario
    ? `L.circleMarker([${ubicacionUsuario.lat}, ${ubicacionUsuario.lng}], { radius: 8, color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }).addTo(map);`
    : '';

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
    .marker-dot { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.5); }
    .marker-dot span { font-size: 14px; line-height: 1; }
    .leaflet-popup-content-wrapper { background: #1e293b; color: #f1f5f9; border-radius: 10px; border: 1px solid #334155; }
    .leaflet-popup-content { margin: 10px 12px; font-family: sans-serif; }
    .leaflet-popup-tip { background: #1e293b; border: 1px solid #334155; }
    .popup-title { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
    .popup-sub { font-size: 11px; color: #64748b; text-transform: capitalize; }
    .popup-btn { display: block; margin-top: 6px; padding: 6px 10px; background: #3b82f6; color: #fff; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { ${centerJS ? centerJS + ',' : ''} zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; CartoDB' }).addTo(map);

    var markersArray = [];
    var data = [${markersJS.join(',')}];

    data.forEach(function(m) {
      var icon = L.divIcon({
        className: 'marker-pin',
        html: '<div class="marker-dot" style="background:' + m.color + ';"><span>' + (m.symbol || '📍') + '</span></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -28]
      });

      var popup = L.popup().setContent(
        '<div class="popup-title">' + m.title + '</div>' +
        '<div class="popup-sub">' + m.subtitle + '</div>' +
        '<button class="popup-btn" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({action:\\'navigate\\',type:\\'' + m.type + '\\',id:' + m.id + '}))">Ver detalle</button>'
      );

      var marker = L.marker([m.lat, m.lng], { icon: icon }).bindPopup(popup).addTo(map);
      marker.on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({action:'select',type:m.type,id:m.id}));
      });
      markersArray.push(marker);
    });

    ${fitBounds}
    ${radioCircle}
    ${userMarker}
  <\/script>
</body>
</html>`;
}

export default function MapaReportes({
  reportes = [],
  avisos = [],
  onPressReporte,
  onPressAviso,
  ubicacionUsuario,
  radio,
}) {
  const webViewRef = useRef(null);

  const html = useMemo(
    () => buildHTML(reportes, avisos, ubicacionUsuario, radio),
    [reportes, avisos, ubicacionUsuario, radio]
  );

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.action === 'navigate' || msg.action === 'select') {
        if (msg.type === 'reporte' && onPressReporte) {
          const r = reportes.find((x) => x.id === msg.id);
          if (r) onPressReporte(r);
        } else if (msg.type === 'aviso' && onPressAviso) {
          const a = avisos.find((x) => x.id === msg.id);
          if (a) onPressAviso(a);
        }
      }
    } catch {}
  };

  if (!reportes.length && !avisos.length) {
    return (
      <View style={styles.empty}>
        <Ionicons name="map-outline" size={48} color="#334155" />
        <Text style={styles.emptyText}>Sin ubicaciones para mostrar</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.map}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#1e293b' },
  map: { flex: 1 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    gap: 8,
  },
  emptyText: { color: '#64748b', fontSize: 14 },
});
