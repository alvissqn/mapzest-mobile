/**
 * Bản đồ trên trang chủ (Home Map Preview)
 * Hiển thị bản đồ OpenStreetMap thật bằng WebView + Leaflet.
 * Có các pin giá BĐS và nút "Mở bản đồ" toàn màn hình.
 *
 * Dùng WebView + Leaflet thay cho react-native-maps vì:
 * - Không cần Google Maps API key
 * - Hoạt động ngay trên Expo Go
 * - Hỗ trợ cluster tốt
 */
import { useRef, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const PRIMARY = '#2563EB';

// Tọa độ trung tâm TP.HCM – khu vực Thủ Đức / Quận 2
const CENTER_LAT = 10.8031;
const CENTER_LNG = 106.7148;
const ZOOM = 13;

// Danh sách BĐS mẫu với tọa độ thật khu vực TP.HCM
const MOCK_PINS = [
  { id: '1', lat: 10.8120, lng: 106.7105, price: '2.5 tỷ', active: true },
  { id: '2', lat: 10.7950, lng: 106.7250, price: '4.1 tỷ', active: false },
  { id: '3', lat: 10.8230, lng: 106.7350, price: '1.8 tỷ', active: false },
  { id: '4', lat: 10.7880, lng: 106.7000, price: '3.2 tỷ', active: false },
];

/**
 * Tạo HTML chứa bản đồ Leaflet với OpenStreetMap tiles và các pin giá BĐS
 */
function buildMapHtml(): string {
  const pinsJson = JSON.stringify(MOCK_PINS);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
    /* Ẩn attribution trên preview nhỏ */
    .leaflet-control-attribution { font-size: 8px !important; }
    .leaflet-control-zoom { display: none !important; }
    /* Custom pin marker */
    .pin-marker {
      background: #FFFFFF;
      border: 2px solid #D1D5DB;
      border-radius: 8px;
      padding: 3px 7px;
      font-size: 11px;
      font-weight: 800;
      color: #1F2937;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      text-align: center;
    }
    .pin-marker.active {
      background: ${PRIMARY};
      border-color: ${PRIMARY};
      color: #FFFFFF;
    }
    .pin-marker::after {
      content: '';
      position: absolute;
      bottom: -7px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 7px solid #D1D5DB;
    }
    .pin-marker.active::after {
      border-top-color: ${PRIMARY};
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
    }).setView([${CENTER_LAT}, ${CENTER_LNG}], ${ZOOM});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    var pins = ${pinsJson};
    pins.forEach(function(pin) {
      var icon = L.divIcon({
        className: '',
        html: '<div class="pin-marker ' + (pin.active ? 'active' : '') + '">' + pin.price + '</div>',
        iconSize: [70, 32],
        iconAnchor: [35, 38],
      });
      L.marker([pin.lat, pin.lng], { icon: icon }).addTo(map);
    });
  </script>
</body>
</html>`;
}

interface HomeMapPreviewProps {
  onOpenFullMap?: () => void;
}

export function HomeMapPreview({ onOpenFullMap }: HomeMapPreviewProps) {
  const html = useMemo(() => buildMapHtml(), []);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.mapContainer}
        onPress={onOpenFullMap}
        activeOpacity={0.95}
        accessibilityLabel="Mở bản đồ toàn màn hình"
      >
        {/* Bản đồ Leaflet/OpenStreetMap thật */}
        <View style={styles.webviewContainer} pointerEvents="none">
          <WebView
            source={{ html }}
            style={styles.webview}
            scrollEnabled={false}
            bounces={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
          />
        </View>

        {/* Nút mở bản đồ toàn màn hình */}
        <View style={styles.openMapBtn}>
          <Text style={styles.openMapIcon}>🗺️</Text>
          <Text style={styles.openMapText}>Mở bản đồ</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
  },
  mapContainer: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#E8F0FE',
  },

  // Nút mở bản đồ toàn màn hình
  openMapBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  openMapIcon: {
    fontSize: 14,
  },
  openMapText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
});
