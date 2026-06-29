import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const PRIMARY  = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_400 = '#9CA3AF';
const GRAY_500 = '#6B7280';
const GRAY_700 = '#374151';
const GRAY_800 = '#1F2937';
const GREEN    = '#16A34A';
const WHITE    = '#FFFFFF';

export interface SearchResultProperty {
  id: string;
  title: string;
  address: string;
  price: string;
  pricePerM2?: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  type: string;
  isFavorite: boolean;
  isNew?: boolean;
  isHot?: boolean;
  bgColor: string;
  bgEmoji: string;
  postedAt: string; // ví dụ: "2 giờ trước"
}

interface SearchResultItemProps {
  item: SearchResultProperty;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export function SearchResultItem({
  item,
  onPress,
  onToggleFavorite,
}: SearchResultItemProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityLabel={`Xem chi tiết ${item.title}`}
    >
      {/* Image placeholder (bên trái) */}
      <View style={[styles.imgWrap, { backgroundColor: item.bgColor }]}>
        <Text style={styles.imgEmoji}>{item.bgEmoji}</Text>

        {/* Badges */}
        {item.isNew && (
          <View style={[styles.badge, styles.badgeGreen]}>
            <Text style={styles.badgeText}>MỚI</Text>
          </View>
        )}
        {item.isHot && !item.isNew && (
          <View style={[styles.badge, styles.badgeRed]}>
            <Text style={styles.badgeText}>HOT</Text>
          </View>
        )}
      </View>

      {/* Content (bên phải) */}
      <View style={styles.content}>
        {/* Type + Favorite */}
        <View style={styles.topRow}>
          <View style={styles.typePill}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <TouchableOpacity
            onPress={onToggleFavorite}
            activeOpacity={0.7}
            style={styles.favBtn}
            accessibilityLabel={item.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
          >
            <Ionicons
              name={item.isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={item.isFavorite ? '#EF4444' : '#64748B'}
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

        {/* Address */}
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={13} color="#94A3B8" />
          <Text style={styles.address} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price}</Text>
          {item.pricePerM2 && (
            <Text style={styles.pricePerM2}> · {item.pricePerM2}</Text>
          )}
        </View>

        {/* Specs */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="ruler-square" size={12} color="#64748B" />
            <Text style={styles.specText}>{item.area}m²</Text>
          </View>
          {item.bedrooms != null && item.bedrooms > 0 && (
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="bed-double-outline" size={12} color="#64748B" />
              <Text style={styles.specText}>{item.bedrooms}PN</Text>
            </View>
          )}
          {item.bathrooms != null && item.bathrooms > 0 && (
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="shower" size={12} color="#64748B" />
              <Text style={styles.specText}>{item.bathrooms}WC</Text>
            </View>
          )}
          <View style={[styles.specItem, styles.postedAt]}>
            <Feather name="clock" size={11} color="#94A3B8" />
            <Text style={styles.postedAtText}>{item.postedAt}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },

  // Image block (120×140)
  imgWrap: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  imgEmoji: {
    fontSize: 40,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeGreen: { backgroundColor: GREEN },
  badgeRed:   { backgroundColor: '#EF4444' },
  badgeText: {
    color: WHITE,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Content block
  content: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typePill: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: PRIMARY,
  },
  favBtn: {
    padding: 2,
  },
  favIcon: {
    fontSize: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: GRAY_800,
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  address: {
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
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
  },
  pricePerM2: {
    fontSize: 11,
    color: GRAY_400,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  postedAt: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  postedAtText: {
    fontSize: 11,
    color: GRAY_400,
  },
});
