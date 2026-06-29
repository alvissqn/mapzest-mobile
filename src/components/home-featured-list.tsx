import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PRIMARY = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_400 = '#9CA3AF';
const GRAY_500 = '#6B7280';
const GRAY_700 = '#374151';
const GRAY_800 = '#1F2937';
const GREEN   = '#16A34A';

export interface FeaturedProperty {
  id: string;
  title: string;
  address: string;
  price: string;
  pricePerM2: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  isFavorite: boolean;
  tagNew?: boolean;
  bgColor: string;   // màu nền thay ảnh (placeholder)
  bgEmoji: string;   // icon đại diện loại BĐS
}

const MOCK_FEATURED: FeaturedProperty[] = [
  {
    id: '1',
    title: 'Vinhomes Grand Park',
    address: 'Long Bình, TP. Thủ Đức',
    price: '3.2 tỷ',
    pricePerM2: '52 tr/m²',
    area: 62, bedrooms: 2, bathrooms: 2,
    type: 'Căn hộ',
    isFavorite: true, tagNew: true,
    bgColor: '#DBEAFE', bgEmoji: '🏢',
  },
  {
    id: '2',
    title: 'Nhà phố Thảo Điền',
    address: 'Thảo Điền, TP. Thủ Đức',
    price: '12.5 tỷ',
    pricePerM2: '108 tr/m²',
    area: 115, bedrooms: 4, bathrooms: 3,
    type: 'Nhà phố',
    isFavorite: false,
    bgColor: '#FEF3C7', bgEmoji: '🏠',
  },
  {
    id: '3',
    title: 'Biệt thự Nam Sài Gòn',
    address: 'Phú Mỹ Hưng, Quận 7',
    price: '38 tỷ',
    pricePerM2: '95 tr/m²',
    area: 400, bedrooms: 6, bathrooms: 5,
    type: 'Biệt thự',
    isFavorite: false, tagNew: true,
    bgColor: '#F0FDF4', bgEmoji: '🏰',
  },
  {
    id: '4',
    title: 'Đất nền Bình Dương',
    address: 'Dĩ An, Bình Dương',
    price: '1.8 tỷ',
    pricePerM2: '18 tr/m²',
    area: 100, bedrooms: 0, bathrooms: 0,
    type: 'Đất nền',
    isFavorite: false,
    bgColor: '#FDF4FF', bgEmoji: '🌿',
  },
];

interface HomeFeaturedListProps {
  onPressItem?: (item: FeaturedProperty) => void;
  onToggleFavorite?: (id: string) => void;
  onSeeAll?: () => void;
}

export function HomeFeaturedList({ onPressItem, onToggleFavorite, onSeeAll }: HomeFeaturedListProps) {
  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>BĐS nổi bật</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSeeAll}>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOCK_FEATURED.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => onPressItem?.(item)}
            activeOpacity={0.88}
            accessibilityLabel={`Xem chi tiết ${item.title}`}
          >
            {/* Ảnh placeholder */}
            <View style={[styles.imgPlaceholder, { backgroundColor: item.bgColor }]}>
              <Text style={styles.imgEmoji}>{item.bgEmoji}</Text>

              {/* Tag NEW */}
              {item.tagNew && (
                <View style={styles.tagNew}>
                  <Text style={styles.tagNewText}>MỚI</Text>
                </View>
              )}

              {/* Favorite btn */}
              <TouchableOpacity
                style={styles.favBtn}
                onPress={() => onToggleFavorite?.(item.id)}
                activeOpacity={0.7}
                accessibilityLabel={item.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
              >
                <Ionicons
                  name={item.isFavorite ? 'heart' : 'heart-outline'}
                  size={18}
                  color={item.isFavorite ? '#EF4444' : '#64748B'}
                />
              </TouchableOpacity>

              {/* Type badge */}
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{item.type}</Text>
              </View>
            </View>

            {/* Card info */}
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              
              {/* Hàng địa chỉ với icon vector */}
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={13} color="#94A3B8" />
                <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>
              </View>

              {/* Price row */}
              <View style={styles.priceRow}>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.pricePerM2}>{item.pricePerM2}</Text>
              </View>

              {/* Specs row với icon vector */}
              <View style={styles.specsRow}>
                <View style={styles.specItem}>
                  <MaterialCommunityIcons name="ruler-square" size={13} color="#64748B" />
                  <Text style={styles.specText}>{item.area}m²</Text>
                </View>
                {item.bedrooms > 0 && (
                  <View style={styles.specItem}>
                    <MaterialCommunityIcons name="bed-double-outline" size={13} color="#64748B" />
                    <Text style={styles.specText}>{item.bedrooms}PN</Text>
                  </View>
                )}
                {item.bathrooms > 0 && (
                  <View style={styles.specItem}>
                    <MaterialCommunityIcons name="shower" size={13} color="#64748B" />
                    <Text style={styles.specText}>{item.bathrooms}WC</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: GRAY_800,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },

  // Card
  card: {
    width: 200,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Image
  imgPlaceholder: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imgEmoji: {
    fontSize: 48,
  },
  tagNew: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: GREEN,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  tagNewText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIcon: {
    fontSize: 16,
  },
  favIconActive: {},
  typeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  // Body
  cardBody: {
    padding: 12,
    gap: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GRAY_800,
    letterSpacing: -0.2,
  },
  cardAddress: {
    fontSize: 11,
    color: GRAY_500,
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
  },
  pricePerM2: {
    fontSize: 11,
    color: GRAY_400,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 11,
    color: GRAY_700,
  },
});
