/**
 * Màn hình 08 – Bản đồ toàn màn hình & Màn hình 09 – Property Preview on Map
 * Hiển thị dưới dạng overlay toàn màn hình trượt lên từ dưới.
 *
 * Tính năng:
 * - Bản đồ OpenStreetMap thật (WebView + Leaflet + MarkerCluster)
 * - Cluster markers gộp nhóm tự động khi zoom ra
 * - Pin markers giá cụ thể từng BĐS khi zoom vào
 * - Tab loại BĐS ở bottom: Căn hộ, Nhà phố, Biệt thự, Đất nền để lọc nhanh
 * - Popup preview (màn 09) hiển thị ở phía dưới khi click vào Pin cụ thể
 * - Nút "Bộ lọc" mở overlay filter, nút "Hiển thị" (Danh sách) đóng bản đồ
 * - Ô tìm kiếm overlay ở top kèm nút quay lại
 */
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  TextInput, Animated, Dimensions, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const PRIMARY = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_300 = '#D1D5DB';
const GRAY_400 = '#9CA3AF';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const WHITE = '#FFFFFF';

// Tọa độ trung tâm TP.HCM – khu vực Thủ Đức / Quận 2
const CENTER_LAT = 10.8031;
const CENTER_LNG = 106.7148;
const ZOOM = 12;

// Danh sách BĐS trên bản đồ với tọa độ thật khu vực TP.HCM
interface MapProperty {
  id: string;
  title: string;
  address: string;
  price: string;
  pricePerM2: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  typeId: 'can-ho' | 'nha-pho' | 'biet-thu' | 'dat-nen';
  bgColor: string;
  bgEmoji: string;
  lat: number;
  lng: number;
}

const ALL_PROPERTIES: MapProperty[] = [
  {
    id: 'm1', title: 'Vinhomes Grand Park',
    address: 'Long Bình, TP. Thủ Đức',
    price: '3.2 tỷ', pricePerM2: '52 tr/m²',
    area: 62, bedrooms: 2, bathrooms: 2,
    type: 'Căn hộ', typeId: 'can-ho',
    bgColor: '#DBEAFE', bgEmoji: '🏢',
    lat: 10.8445, lng: 106.8382,
  },
  {
    id: 'm2', title: 'Nhà phố Thảo Điền',
    address: 'Thảo Điền, TP. Thủ Đức',
    price: '12.5 tỷ', pricePerM2: '108 tr/m²',
    area: 115, bedrooms: 4, bathrooms: 3,
    type: 'Nhà phố', typeId: 'nha-pho',
    bgColor: '#FEF3C7', bgEmoji: '🏠',
    lat: 10.8031, lng: 106.7368,
  },
  {
    id: 'm3', title: 'Biệt thự Phú Mỹ Hưng',
    address: 'Phú Mỹ Hưng, Quận 7',
    price: '38 tỷ', pricePerM2: '95 tr/m²',
    area: 400, bedrooms: 6, bathrooms: 5,
    type: 'Biệt thự', typeId: 'biet-thu',
    bgColor: '#F0FDF4', bgEmoji: '🏰',
    lat: 10.7280, lng: 106.7090,
  },
  {
    id: 'm4', title: 'Đất nền Dĩ An',
    address: 'Dĩ An, Bình Dương',
    price: '1.8 tỷ', pricePerM2: '18 tr/m²',
    area: 100, bedrooms: 0, bathrooms: 0,
    type: 'Đất nền', typeId: 'dat-nen',
    bgColor: '#FDF4FF', bgEmoji: '🌿',
    lat: 10.8900, lng: 106.7620,
  },
  {
    id: 'm5', title: 'Masteri Thảo Điền',
    address: 'Thảo Điền, TP. Thủ Đức',
    price: '6.8 tỷ', pricePerM2: '113 tr/m²',
    area: 60, bedrooms: 2, bathrooms: 2,
    type: 'Căn hộ', typeId: 'can-ho',
    bgColor: '#DBEAFE', bgEmoji: '🏢',
    lat: 10.8050, lng: 106.7420,
  },
  {
    id: 'm6', title: 'Biệt thự Riviera Cove',
    address: 'Phước Long B, TP. Thủ Đức',
    price: '45 tỷ', pricePerM2: '120 tr/m²',
    area: 350, bedrooms: 5, bathrooms: 5,
    type: 'Biệt thự', typeId: 'biet-thu',
    bgColor: '#F0FDF4', bgEmoji: '🏰',
    lat: 10.8200, lng: 106.7700,
  },
  {
    id: 'm7', title: 'Căn hộ Sunrise City',
    address: 'Nguyễn Hữu Thọ, Quận 7',
    price: '4.5 tỷ', pricePerM2: '65 tr/m²',
    area: 69, bedrooms: 2, bathrooms: 2,
    type: 'Căn hộ', typeId: 'can-ho',
    bgColor: '#DBEAFE', bgEmoji: '🏢',
    lat: 10.7350, lng: 106.7200,
  },
  {
    id: 'm8', title: 'Nhà phố Bình Dương',
    address: 'Thuận An, Bình Dương',
    price: '3.9 tỷ', pricePerM2: '42 tr/m²',
    area: 92, bedrooms: 3, bathrooms: 3,
    type: 'Nhà phố', typeId: 'nha-pho',
    bgColor: '#FEF3C7', bgEmoji: '🏠',
    lat: 10.8800, lng: 106.7150,
  },
  {
    id: 'm9', title: 'Đất nền Long Thành',
    address: 'Long Thành, Đồng Nai',
    price: '2.1 tỷ', pricePerM2: '15 tr/m²',
    area: 140, bedrooms: 0, bathrooms: 0,
    type: 'Đất nền', typeId: 'dat-nen',
    bgColor: '#FDF4FF', bgEmoji: '🌿',
    lat: 10.7900, lng: 106.8200,
  },
  {
    id: 'm10', title: 'Căn hộ The Sun Avenue',
    address: 'Mai Chí Thọ, TP. Thủ Đức',
    price: '4.2 tỷ', pricePerM2: '58 tr/m²',
    area: 72, bedrooms: 2, bathrooms: 2,
    type: 'Căn hộ', typeId: 'can-ho',
    bgColor: '#DBEAFE', bgEmoji: '🏢',
    lat: 10.7860, lng: 106.7520,
  },
];

const BOTTOM_TABS = [
  { id: 'can-ho', label: 'Căn hộ', iconName: 'office-building-outline', iconType: 'material' },
  { id: 'nha-pho', label: 'Nhà phố', iconName: 'home-outline', iconType: 'ionicons' },
  { id: 'biet-thu', label: 'Biệt thự', iconName: 'home-city-outline', iconType: 'material' },
  { id: 'dat-nen', label: 'Đất nền', iconName: 'sprout-outline', iconType: 'material' },
] as const;

/**
 * Tạo HTML chứa bản đồ Leaflet toàn màn hình với MarkerCluster
 * Cluster markers tự gộp nhóm khi zoom ra, tách riêng pin khi zoom vào
 */
function buildFullMapHtml(properties: MapProperty[]): string {
  const pinsJson = JSON.stringify(properties.map(p => ({
    id: p.id,
    lat: p.lat,
    lng: p.lng,
    price: p.price,
    title: p.title,
    address: p.address,
    area: p.area,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    type: p.type,
    typeId: p.typeId,
  })));

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #f0f0f0; }

    /* Ẩn nút zoom mặc định */
    .leaflet-control-zoom { display: none !important; }
    .leaflet-control-attribution { font-size: 8px !important; opacity: 0.6; }

    /* Custom cluster markers – vòng tròn xanh Primary */
    .marker-cluster-small,
    .marker-cluster-medium,
    .marker-cluster-large {
      background: rgba(37, 99, 235, 0.25) !important;
    }
    .marker-cluster-small div,
    .marker-cluster-medium div,
    .marker-cluster-large div {
      background: rgba(37, 99, 235, 0.9) !important;
      color: #FFFFFF !important;
      font-weight: 800 !important;
      font-size: 14px !important;
      border: 3px solid rgba(255, 255, 255, 0.8) !important;
      border-radius: 50% !important;
      width: 40px !important;
      height: 40px !important;
      line-height: 34px !important;
      text-align: center !important;
      margin-left: 0 !important;
      margin-top: 0 !important;
    }
    .marker-cluster-small { width: 50px !important; height: 50px !important; }
    .marker-cluster-medium { width: 56px !important; height: 56px !important; }
    .marker-cluster-large { width: 62px !important; height: 62px !important; }

    /* Custom pin marker – bubble giá BĐS */
    .price-pin {
      position: relative;
      background: #FFFFFF;
      border: 2px solid #D1D5DB;
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 800;
      color: #1F2937;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      text-align: center;
      cursor: pointer;
      transition: all 0.15s;
    }
    .price-pin::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 0; height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 8px solid #D1D5DB;
    }
    .price-pin.active {
      background: ${PRIMARY};
      border-color: ${PRIMARY};
      color: #FFFFFF;
      transform: scale(1.1);
      z-index: 9999 !important;
    }
    .price-pin.active::after {
      border-top-color: ${PRIMARY};
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Khởi tạo bản đồ Leaflet
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true,
    }).setView([${CENTER_LAT}, ${CENTER_LNG}], ${ZOOM});

    // Sử dụng tile OpenStreetMap (miễn phí, không cần API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Tạo cluster group với cấu hình tùy chỉnh
    var clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: function(cluster) {
        var count = cluster.getChildCount();
        var size = count < 10 ? 'small' : count < 30 ? 'medium' : 'large';
        return L.divIcon({
          html: '<div>' + count + '</div>',
          className: 'marker-cluster marker-cluster-' + size,
          iconSize: L.point(50, 50),
        });
      },
    });

    var pins = ${pinsJson};
    var activeMarkerId = null;
    var markerRefs = {};

    // Thêm từng pin vào cluster group
    pins.forEach(function(pin) {
      var icon = L.divIcon({
        className: '',
        html: '<div class="price-pin" id="pin-' + pin.id + '">' + pin.price + '</div>',
        iconSize: [80, 36],
        iconAnchor: [40, 42],
      });

      var marker = L.marker([pin.lat, pin.lng], { icon: icon });
      markerRefs[pin.id] = marker;

      // Nhấn vào pin → gửi thông tin về React Native
      marker.on('click', function() {
        // Bỏ active cũ
        if (activeMarkerId) {
          var oldEl = document.getElementById('pin-' + activeMarkerId);
          if (oldEl) oldEl.classList.remove('active');
        }

        // Đặt active mới
        activeMarkerId = pin.id;
        var el = document.getElementById('pin-' + pin.id);
        if (el) el.classList.add('active');

        // Gửi message về React Native
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PIN_PRESS',
          data: pin,
        }));
      });

      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    // Nhấn vào bản đồ (không phải pin) → đóng popup preview
    map.on('click', function(e) {
      if (activeMarkerId) {
        var oldEl = document.getElementById('pin-' + activeMarkerId);
        if (oldEl) oldEl.classList.remove('active');
        activeMarkerId = null;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_PRESS' }));
      }
    });

    // Lắng nghe lệnh từ React Native
    document.addEventListener('message', function(e) {
      try {
        var msg = JSON.parse(e.data);
        if (msg.type === 'UPDATE_PINS') {
          // Cập nhật danh sách pins khi filter thay đổi
          clusterGroup.clearLayers();
          activeMarkerId = null;
          msg.data.forEach(function(pin) {
            var icon = L.divIcon({
              className: '',
              html: '<div class="price-pin" id="pin-' + pin.id + '">' + pin.price + '</div>',
              iconSize: [80, 36],
              iconAnchor: [40, 42],
            });
            var marker = L.marker([pin.lat, pin.lng], { icon: icon });
            markerRefs[pin.id] = marker;
            marker.on('click', function() {
              if (activeMarkerId) {
                var oldEl = document.getElementById('pin-' + activeMarkerId);
                if (oldEl) oldEl.classList.remove('active');
              }
              activeMarkerId = pin.id;
              var el = document.getElementById('pin-' + pin.id);
              if (el) el.classList.add('active');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PIN_PRESS',
                data: pin,
              }));
            });
            clusterGroup.addLayer(marker);
          });
        }
      } catch(err) {}
    });
    // Tương thích cả iOS và Android
    window.addEventListener('message', function(e) {
      document.dispatchEvent(new MessageEvent('message', { data: e.data }));
    });
  </script>
</body>
</html>`;
}

interface MapOverlayProps {
  visible: boolean;
  onClose: () => void;
  onFilterPress?: () => void;
  onPropertyPress?: (property: any) => void;
}

export function MapOverlay({ visible, onClose, onFilterPress, onPropertyPress }: MapOverlayProps) {
  const slideY = useRef(new Animated.Value(SCREEN_H)).current;
  const webviewRef = useRef<WebView>(null);

  // Lọc nhanh theo loại BĐS
  const [selectedType, setSelectedType] = useState<string | null>(null);
  // Pin BĐS đang chọn để xem popup preview
  const [activeProperty, setActiveProperty] = useState<MapProperty | null>(null);
  // Từ khóa tìm kiếm
  const [searchText, setSearchText] = useState('');

  // Lọc danh sách properties theo loại và từ khóa
  const filteredProperties = useMemo(() => {
    let list: MapProperty[] = ALL_PROPERTIES;
    if (selectedType) {
      list = list.filter((p) => p.typeId === selectedType);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedType, searchText]);

  // Tạo HTML bản đồ (chỉ tạo lại khi filteredProperties thay đổi)
  const mapHtml = useMemo(() => buildFullMapHtml(filteredProperties), [filteredProperties]);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
      // Reset trạng thái
      setActiveProperty(null);
      setSelectedType(null);
      setSearchText('');
    } else {
      Animated.timing(slideY, {
        toValue: SCREEN_H,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Xử lý message từ WebView (nhấn pin, nhấn bản đồ)
  const handleMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'PIN_PRESS') {
        // Tìm property đầy đủ từ danh sách gốc
        const found = ALL_PROPERTIES.find(p => p.id === msg.data.id);
        if (found) setActiveProperty(found);
      } else if (msg.type === 'MAP_PRESS') {
        setActiveProperty(null);
      }
    } catch (e) {}
  }, []);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { transform: [{ translateY: slideY }] }]}>
      <View style={styles.container}>

        {/* ======================================================== */}
        {/* 1. BẢN ĐỒ LEAFLET TOÀN MÀN HÌNH (Màn hình 08)            */}
        {/* ======================================================== */}
        <WebView
          ref={webviewRef}
          source={{ html: mapHtml }}
          style={StyleSheet.absoluteFill}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          onMessage={handleMessage}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
        />

        {/* ======================================================== */}
        {/* 2. THANH TÌM KIẾM OVERLAY Ở TOP (Màn hình 08)              */}
        {/* ======================================================== */}
        <SafeAreaView style={styles.headerSafe} edges={['top']}>
          <View style={styles.searchBar}>
            {/* Nút quay lại */}
            <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Đóng bản đồ">
              <Feather name="arrow-left" size={20} color={GRAY_800} />
            </TouchableOpacity>

            {/* Ô tìm kiếm */}
            <View style={styles.inputWrap}>
              <Feather name="search" size={16} color={GRAY_400} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm khu vực, dự án, địa điểm..."
                placeholderTextColor={GRAY_400}
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Feather name="x" size={16} color={GRAY_400} />
                </TouchableOpacity>
              )}
            </View>

            {/* Nút bộ lọc nâng cao */}
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={onFilterPress}
              accessibilityLabel="Mở bộ lọc nâng cao"
            >
              <Feather name="sliders" size={18} color={GRAY_800} />
            </TouchableOpacity>
          </View>

          {/* Thanh trạng thái hiển thị */}
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>
              Hiển thị: {selectedType ? BOTTOM_TABS.find(t => t.id === selectedType)?.label : 'Tất cả'}
              {' '}({filteredProperties.length})
            </Text>
            <TouchableOpacity style={styles.filterChip} onPress={onFilterPress}>
              <Feather name="sliders" size={12} color={PRIMARY} />
              <Text style={styles.filterChipText}>Bộ lọc</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Nút hành động nổi: "Bộ lọc" và "Danh sách" */}
        <View style={[styles.floatingActionRow, activeProperty && { bottom: 250 }]}>
          <TouchableOpacity style={styles.floatBtn} onPress={onFilterPress} accessibilityLabel="Mở bộ lọc">
            <Feather name="sliders" size={13} color="#FFFFFF" />
            <Text style={styles.floatBtnText}>Bộ lọc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatBtn} onPress={onClose} accessibilityLabel="Hiển thị danh sách">
            <Feather name="list" size={13} color="#FFFFFF" />
            <Text style={styles.floatBtnText}>Hiển thị</Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* 3. POPUP PREVIEW CARD (Màn hình 09)                        */}
        {/* ======================================================== */}
        {activeProperty && (
          <View style={styles.previewContainer}>
            <TouchableOpacity
              style={styles.previewCard}
              activeOpacity={0.95}
              onPress={() => onPropertyPress?.(activeProperty)}
              accessibilityLabel={`Xem chi tiết ${activeProperty.title}`}
            >
              {/* Ảnh placeholder bên trái */}
              <View style={[styles.previewImg, { backgroundColor: activeProperty.bgColor }]}>
                <Text style={styles.previewEmoji}>{activeProperty.bgEmoji}</Text>
                <View style={styles.previewTypeBadge}>
                  <Text style={styles.previewTypeText}>{activeProperty.type}</Text>
                </View>
              </View>

              {/* Thông tin bên phải */}
              <View style={styles.previewInfo}>
                <Text style={styles.previewTitle} numberOfLines={1}>{activeProperty.title}</Text>
                <View style={styles.previewAddressRow}>
                  <Ionicons name="location-outline" size={13} color="#94A3B8" />
                  <Text style={styles.previewAddress} numberOfLines={1}>{activeProperty.address}</Text>
                </View>

                <View style={styles.previewPriceRow}>
                  <Text style={styles.previewPrice}>{activeProperty.price}</Text>
                  <Text style={styles.previewPricePerM2}>{activeProperty.pricePerM2}</Text>
                </View>

                <View style={styles.previewSpecs}>
                  <View style={styles.previewSpecItem}>
                    <MaterialCommunityIcons name="ruler-square" size={12} color="#64748B" />
                    <Text style={styles.previewSpecText}>{activeProperty.area}m²</Text>
                  </View>
                  {activeProperty.bedrooms > 0 && (
                    <View style={styles.previewSpecItem}>
                      <MaterialCommunityIcons name="bed-double-outline" size={12} color="#64748B" />
                      <Text style={styles.previewSpecText}>{activeProperty.bedrooms}PN</Text>
                    </View>
                  )}
                  {activeProperty.bathrooms > 0 && (
                    <View style={styles.previewSpecItem}>
                      <MaterialCommunityIcons name="shower" size={12} color="#64748B" />
                      <Text style={styles.previewSpecText}>{activeProperty.bathrooms}WC</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => onPropertyPress?.(activeProperty)}
                >
                  <Text style={styles.detailBtnText}>Xem chi tiết</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ======================================================== */}
        {/* 4. TAB PHÂN LOẠI BĐS Ở BOTTOM (Màn hình 08)                */}
        {/* ======================================================== */}
        {!activeProperty && (
          <View style={styles.bottomTabContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bottomTabScroll}
            >
              <TouchableOpacity
                style={[styles.bottomChip, selectedType === null && styles.bottomChipActive]}
                onPress={() => setSelectedType(null)}
                activeOpacity={0.8}
              >
                <Feather
                  name="map-pin"
                  size={12}
                  color={selectedType === null ? '#FFFFFF' : GRAY_800}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.bottomChipText, selectedType === null && styles.bottomChipTextActive]}>
                  Tất cả
                </Text>
              </TouchableOpacity>
              {BOTTOM_TABS.map((tab) => {
                const isActive = selectedType === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.bottomChip, isActive && styles.bottomChipActive]}
                    onPress={() => setSelectedType(isActive ? null : tab.id)}
                    activeOpacity={0.8}
                  >
                    {tab.iconType === 'material' ? (
                      <MaterialCommunityIcons
                        name={tab.iconName as any}
                        size={13}
                        color={isActive ? '#FFFFFF' : GRAY_800}
                        style={{ marginRight: 4 }}
                      />
                    ) : (
                      <Ionicons
                        name={tab.iconName as any}
                        size={13}
                        color={isActive ? '#FFFFFF' : GRAY_800}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text style={[styles.bottomChipText, isActive && styles.bottomChipTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#E8F0FE',
    zIndex: 4000,
  },
  container: {
    flex: 1,
    position: 'relative',
  },

  // Search header
  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: Platform.OS === 'android' ? 12 : 6,
    gap: 10,
  },
  backBtn: {
    width: 44, height: 44,
    borderRadius: 14,
    backgroundColor: WHITE,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  backIcon: {
    fontSize: 20, fontWeight: '700', color: GRAY_800,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 14, paddingHorizontal: 14, height: 44, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  searchEmoji: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: GRAY_800, padding: 0 },
  clearEmoji: { fontSize: 14, color: GRAY_400, padding: 2 },
  filterBtn: {
    width: 44, height: 44,
    borderRadius: 14,
    backgroundColor: WHITE,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  filterEmoji: { fontSize: 18 },

  // Thanh trạng thái
  statusBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginTop: 8,
  },
  statusText: {
    fontSize: 12, color: GRAY_500,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, overflow: 'hidden',
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, gap: 4,
  },
  filterChipIcon: { fontSize: 12 },
  filterChipText: { fontSize: 12, color: PRIMARY, fontWeight: '600' },

  // Floating Action Row
  floatingActionRow: {
    position: 'absolute', bottom: 90, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center',
    gap: 12, zIndex: 100,
  },
  floatBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(31,41,55,0.9)',
    borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  floatBtnIcon: { fontSize: 13 },
  floatBtnText: { color: WHITE, fontSize: 12, fontWeight: '700' },

  // Bottom Type Tabs
  bottomTabContainer: {
    position: 'absolute', bottom: 24, left: 0, right: 0, zIndex: 100,
  },
  bottomTabScroll: { paddingHorizontal: 16, gap: 8 },
  bottomChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 9,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  bottomChipActive: { backgroundColor: PRIMARY },
  bottomChipText: { fontSize: 13, fontWeight: '600', color: GRAY_800 },
  bottomChipTextActive: { color: WHITE },

  // Preview Card (Màn 09)
  previewContainer: {
    position: 'absolute', bottom: 24, left: 16, right: 16, zIndex: 200,
  },
  previewCard: {
    flexDirection: 'row', backgroundColor: WHITE, borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16, shadowRadius: 12, elevation: 6,
  },
  previewImg: {
    width: 110, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  previewEmoji: { fontSize: 36 },
  previewTypeBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  previewTypeText: { color: WHITE, fontSize: 9, fontWeight: '600' },
  previewInfo: { flex: 1, padding: 12, gap: 4 },
  previewTitle: { fontSize: 14, fontWeight: '700', color: GRAY_800 },
  previewAddress: { fontSize: 11, color: GRAY_500, flex: 1 },
  previewAddressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  previewPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  previewPrice: { fontSize: 15, fontWeight: '800', color: PRIMARY },
  previewPricePerM2: { fontSize: 10, color: GRAY_400 },
  previewSpecs: { flexDirection: 'row', gap: 10, marginTop: 2 },
  previewSpecItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  previewSpecText: { fontSize: 10, color: GRAY_500 },
  detailBtn: {
    backgroundColor: '#EFF6FF', borderRadius: 8, paddingVertical: 6,
    alignItems: 'center', marginTop: 4,
  },
  detailBtnText: { color: PRIMARY, fontSize: 11, fontWeight: '700' },
});
