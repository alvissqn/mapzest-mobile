/**
 * Màn hình 25 – Gói VIP & Thanh toán
 * Route: /seller-vip
 *
 * Giao diện:
 * - Chọn chu kỳ: Tháng | 6 tháng (-10%) | 12 tháng (-20%)
 * - 3 gói dịch vụ: Pro | Business (nổi bật) | Premium
 * - Danh sách tính năng so sánh từng gói (checklist)
 * - Phương thức thanh toán: VISA, Mastercard, Momo, ZaloPay, ePay
 * - Nút "Thanh toán ngay" + Modal xác nhận
 *
 * TODO: GET /api/packages để tải thông tin gói thật
 * TODO: POST /api/payments để khởi tạo giao dịch thanh toán
 * TODO: Tích hợp MoMo / ZaloPay / VNPay deeplink
 */
import { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView,
  TouchableOpacity, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomTabInset } from '@/constants/theme';

const BG       = '#F9FAFB';
const PRIMARY  = '#2563EB';
const INDIGO   = '#4F46E5';
const GOLD     = '#D97706';
const GREEN    = '#16A34A';
const GRAY_100 = '#F3F4F6';
const GRAY_200 = '#E5E7EB';
const GRAY_400 = '#9CA3AF';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const WHITE    = '#FFFFFF';

// ---- Loại chu kỳ thanh toán ----
type Cycle = 'month' | 'half' | 'year';

const CYCLES: { key: Cycle; label: string; discount?: string }[] = [
  { key: 'month', label: 'Tháng'    },
  { key: 'half',  label: '6 tháng', discount: '-10%' },
  { key: 'year',  label: '12 tháng', discount: '-20%' },
];

// ---- Định nghĩa các gói dịch vụ ----
interface Package {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  basePrice: number;   // Giá gốc (đồng/tháng)
  isPopular?: boolean;
  features: { text: string; included: boolean }[];
}

const PACKAGES: Package[] = [
  {
    id: 'pro',
    name: 'Pro',
    emoji: '⚡',
    color: PRIMARY,
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    basePrice: 599000,
    features: [
      { text: 'Tối đa 10 tin đăng',             included: true  },
      { text: 'Hiển thị trên danh sách thường',  included: true  },
      { text: 'Thống kê cơ bản (lượt xem)',      included: true  },
      { text: 'Quản lý leads cơ bản',            included: true  },
      { text: 'Hỗ trợ email',                    included: true  },
      { text: 'Pin nổi bật trên bản đồ',         included: false },
      { text: 'AI viết mô tả tin đăng',          included: false },
      { text: 'Phân tích nâng cao',              included: false },
      { text: 'CRM leads đầy đủ',                included: false },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    emoji: '🚀',
    color: INDIGO,
    bgColor: '#EEF2FF',
    borderColor: '#A5B4FC',
    basePrice: 999000,
    isPopular: true,
    features: [
      { text: 'Tối đa 30 tin đăng',             included: true  },
      { text: 'Hiển thị ưu tiên trên danh sách', included: true  },
      { text: 'Thống kê đầy đủ + báo cáo tuần', included: true  },
      { text: 'CRM leads đầy đủ',                included: true  },
      { text: 'Hỗ trợ chat 24/7',               included: true  },
      { text: 'Pin nổi bật trên bản đồ',         included: true  },
      { text: 'AI viết mô tả tin đăng',          included: true  },
      { text: 'Phân tích nâng cao',              included: false },
      { text: 'Quản lý nhiều chi nhánh',         included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    emoji: '👑',
    color: GOLD,
    bgColor: '#FFFBEB',
    borderColor: '#FCD34D',
    basePrice: 1999000,
    features: [
      { text: 'Không giới hạn tin đăng',         included: true  },
      { text: 'Vị trí #1 trên tất cả tìm kiếm', included: true  },
      { text: 'Phân tích nâng cao + dự báo',     included: true  },
      { text: 'CRM + pipeline quản lý deals',    included: true  },
      { text: 'Hỗ trợ chuyên viên riêng',       included: true  },
      { text: 'Pin nổi bật trên bản đồ',         included: true  },
      { text: 'AI viết mô tả tin đăng',          included: true  },
      { text: 'Phân tích nâng cao',              included: true  },
      { text: 'Quản lý nhiều chi nhánh',         included: true  },
    ],
  },
];

// ---- Phương thức thanh toán ----
const PAYMENT_METHODS = [
  { id: 'visa',       label: 'VISA',       emoji: '💳', color: '#1A1F71' },
  { id: 'mastercard', label: 'Mastercard', emoji: '🔴', color: '#EB001B' },
  { id: 'momo',       label: 'MoMo',       emoji: '💜', color: '#A50064' },
  { id: 'zalopay',    label: 'ZaloPay',    emoji: '🔵', color: '#0068FF' },
  { id: 'epay',       label: 'ePay',       emoji: '🟢', color: '#00A859' },
];

// ---- Tính giá theo chu kỳ ----
function calcPrice(base: number, cycle: Cycle): { price: number; monthly: number } {
  const map: Record<Cycle, number> = { month: 1, half: 6, year: 12 };
  const discount: Record<Cycle, number> = { month: 1, half: 0.9, year: 0.8 };
  const months = map[cycle];
  const monthly = Math.round(base * discount[cycle]);
  return { price: monthly * months, monthly };
}

// ---- Format số tiền VND ----
function fmtVnd(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + ' triệu';
  return (n / 1000).toFixed(0) + 'K';
}

// ---- Component gói dịch vụ ----
interface PackageCardProps {
  pkg: Package;
  cycle: Cycle;
  isSelected: boolean;
  onSelect: () => void;
}
function PackageCard({ pkg, cycle, isSelected, onSelect }: PackageCardProps) {
  const { price, monthly } = calcPrice(pkg.basePrice, cycle);
  const isCycleDiscounted = cycle !== 'month';

  return (
    <TouchableOpacity
      style={[
        pkgStyles.card,
        { borderColor: isSelected ? pkg.color : GRAY_200 },
        pkg.isPopular && pkgStyles.popularCard,
        isSelected && { borderWidth: 2 },
      ]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {/* Badge phổ biến */}
      {pkg.isPopular && (
        <View style={[pkgStyles.popularBadge, { backgroundColor: pkg.color }]}>
          <Text style={pkgStyles.popularText}>⭐ PHỔ BIẾN NHẤT</Text>
        </View>
      )}

      {/* Tiêu đề gói */}
      <View style={pkgStyles.header}>
        <View style={[pkgStyles.iconWrap, { backgroundColor: pkg.bgColor }]}>
          <Text style={pkgStyles.icon}>{pkg.emoji}</Text>
        </View>
        <View style={pkgStyles.titleWrap}>
          <Text style={[pkgStyles.name, { color: pkg.color }]}>{pkg.name}</Text>
          <View style={pkgStyles.priceRow}>
            <Text style={[pkgStyles.price, { color: pkg.color }]}>{fmtVnd(monthly)}</Text>
            <Text style={pkgStyles.priceUnit}>/tháng</Text>
          </View>
          {isCycleDiscounted && (
            <Text style={pkgStyles.totalNote}>Tổng: {fmtVnd(price)} / {cycle === 'half' ? '6' : '12'} tháng</Text>
          )}
          {isCycleDiscounted && (
            <Text style={[pkgStyles.originalPrice]}>
              Giá gốc: {fmtVnd(pkg.basePrice)}/tháng
            </Text>
          )}
        </View>
        {/* Checkbox */}
        <View style={[pkgStyles.checkbox, isSelected && { backgroundColor: pkg.color, borderColor: pkg.color }]}>
          {isSelected && <Text style={pkgStyles.checkmark}>✓</Text>}
        </View>
      </View>

      {/* Danh sách tính năng */}
      <View style={pkgStyles.featureList}>
        {pkg.features.map((f, i) => (
          <View key={i} style={pkgStyles.featureRow}>
            <Text style={[
              pkgStyles.featureCheck,
              { color: f.included ? GREEN : GRAY_400 }
            ]}>
              {f.included ? '✓' : '✗'}
            </Text>
            <Text style={[
              pkgStyles.featureText,
              !f.included && { color: GRAY_400, textDecorationLine: 'line-through' }
            ]}>
              {f.text}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const pkgStyles = StyleSheet.create({
  card: {
    backgroundColor: WHITE, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: GRAY_200, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  popularCard: {
    shadowOpacity: 0.12, shadowRadius: 14, elevation: 6,
  },
  popularBadge: {
    position: 'absolute', top: 0, right: 0,
    paddingHorizontal: 12, paddingVertical: 5,
    borderBottomLeftRadius: 12,
  },
  popularText: { color: WHITE, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  icon: { fontSize: 22 },
  titleWrap: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: '900' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  price: { fontSize: 22, fontWeight: '900' },
  priceUnit: { fontSize: 13, color: GRAY_500 },
  totalNote: { fontSize: 12, color: GRAY_800, fontWeight: '600' },
  originalPrice: { fontSize: 11, color: GRAY_400, textDecorationLine: 'line-through' },

  checkbox: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: GRAY_200,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4,
  },
  checkmark: { color: WHITE, fontSize: 12, fontWeight: '900' },

  featureList: { gap: 7 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureCheck: { fontSize: 13, fontWeight: '800', width: 14, textAlign: 'center' },
  featureText: { fontSize: 13, color: GRAY_800, flex: 1, lineHeight: 18 },
});

// ---- Màn hình chính ----
export default function SellerVipScreen() {
  const router = useRouter();
  const [cycle, setCycle]             = useState<Cycle>('month');
  const [selectedPkg, setSelectedPkg] = useState<string>('business');
  const [selectedMethod, setSelectedMethod] = useState<string>('momo');
  const [showConfirm, setShowConfirm] = useState(false);

  const pkg = PACKAGES.find(p => p.id === selectedPkg)!;
  const { price, monthly } = calcPrice(pkg.basePrice, cycle);

  // Nhấn "Thanh toán ngay"
  function handlePayPress() {
    setShowConfirm(true);
  }

  // Xác nhận thanh toán
  function handleConfirmPay() {
    setShowConfirm(false);
    Alert.alert(
      '✅ Thanh toán thành công!',
      `Gói ${pkg.name} đã được kích hoạt.\nMã giao dịch: MZ-PAY-${Date.now().toString().slice(-6)}\n\nTODO: Tích hợp cổng thanh toán thật (MoMo / ZaloPay / VNPay)`,
      [{ text: 'Về Trang chủ', onPress: () => router.push('/seller-dashboard' as any) }]
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gói VIP & Thanh toán</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Bộ chọn chu kỳ */}
        <View style={styles.cycleRow}>
          {CYCLES.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[styles.cycleBtn, cycle === c.key && styles.cycleBtnActive]}
              onPress={() => setCycle(c.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.cycleText, cycle === c.key && styles.cycleTextActive]}>
                {c.label}
              </Text>
              {c.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{c.discount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: BottomTabInset + 120, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== CÁC GÓI DỊCH VỤ ==================== */}
        {PACKAGES.map(pkg => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            cycle={cycle}
            isSelected={selectedPkg === pkg.id}
            onSelect={() => setSelectedPkg(pkg.id)}
          />
        ))}

        {/* ==================== PHƯƠNG THỨC THANH TOÁN ==================== */}
        <View style={styles.methodCard}>
          <Text style={styles.methodTitle}>💳 Phương thức thanh toán</Text>
          <View style={styles.methodGrid}>
            {PAYMENT_METHODS.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.methodItem,
                  selectedMethod === m.id && { borderColor: PRIMARY, borderWidth: 2, backgroundColor: '#EFF6FF' }
                ]}
                onPress={() => setSelectedMethod(m.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.methodEmoji}>{m.emoji}</Text>
                <Text style={styles.methodLabel}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ==================== GHI CHÚ BẢO MẬT ==================== */}
        <View style={styles.secureNote}>
          <Text style={styles.secureText}>🔒 Thông tin thanh toán được mã hóa SSL 256-bit. MapZest không lưu thông tin thẻ của bạn.</Text>
        </View>
      </ScrollView>

      {/* ==================== CTA STICKY BOTTOM ==================== */}
      <SafeAreaView style={styles.ctaSafe} edges={['bottom']}>
        <View style={styles.ctaBar}>
          <View style={styles.ctaSummary}>
            <Text style={styles.ctaPackageName}>{pkg.emoji} Gói {pkg.name}</Text>
            <Text style={styles.ctaPrice}>{fmtVnd(price)}</Text>
            <Text style={styles.ctaCycle}>
              {cycle === 'month' ? '/ tháng' : cycle === 'half' ? '/ 6 tháng' : '/ 12 tháng'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: pkg.color }]}
            onPress={handlePayPress}
            activeOpacity={0.85}
          >
            <Text style={styles.payBtnText}>Thanh toán ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ==================== MODAL XÁC NHẬN ==================== */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <Text style={modalStyles.title}>Xác nhận thanh toán</Text>

            <View style={modalStyles.summaryCard}>
              <View style={modalStyles.summaryRow}>
                <Text style={modalStyles.summaryLabel}>Gói dịch vụ</Text>
                <Text style={modalStyles.summaryValue}>{pkg.emoji} {pkg.name}</Text>
              </View>
              <View style={modalStyles.summaryRow}>
                <Text style={modalStyles.summaryLabel}>Chu kỳ</Text>
                <Text style={modalStyles.summaryValue}>
                  {cycle === 'month' ? '1 tháng' : cycle === 'half' ? '6 tháng' : '12 tháng'}
                </Text>
              </View>
              <View style={modalStyles.summaryRow}>
                <Text style={modalStyles.summaryLabel}>Phương thức</Text>
                <Text style={modalStyles.summaryValue}>
                  {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.emoji} {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label}
                </Text>
              </View>
              <View style={[modalStyles.summaryRow, modalStyles.totalRow]}>
                <Text style={modalStyles.totalLabel}>Tổng thanh toán</Text>
                <Text style={[modalStyles.totalValue, { color: pkg.color }]}>{fmtVnd(price)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[modalStyles.confirmBtn, { backgroundColor: pkg.color }]}
              onPress={handleConfirmPay}
              activeOpacity={0.85}
            >
              <Text style={modalStyles.confirmText}>✅ Xác nhận thanh toán</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setShowConfirm(false)}>
              <Text style={modalStyles.cancelText}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  headerSafe: { backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: GRAY_200, zIndex: 10 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 4, paddingBottom: 8,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: GRAY_100, alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: GRAY_800, fontWeight: '700', marginTop: -1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: GRAY_800 },
  scroll: { flex: 1 },

  // Chu kỳ
  cycleRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10, gap: 8,
  },
  cycleBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 12,
    backgroundColor: GRAY_100, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  cycleBtnActive: { backgroundColor: PRIMARY },
  cycleText: { fontSize: 13, fontWeight: '700', color: GRAY_500 },
  cycleTextActive: { color: WHITE },
  discountBadge: {
    backgroundColor: '#D1FAE5', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1,
  },
  discountText: { fontSize: 10, color: GREEN, fontWeight: '900' },

  // Phương thức thanh toán
  methodCard: {
    backgroundColor: WHITE, borderRadius: 16, padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  methodTitle: { fontSize: 15, fontWeight: '800', color: GRAY_800 },
  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  methodItem: {
    borderWidth: 1.5, borderColor: GRAY_200, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: WHITE,
  },
  methodEmoji: { fontSize: 18 },
  methodLabel: { fontSize: 13, fontWeight: '700', color: GRAY_800 },

  // Secure note
  secureNote: {
    backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  secureText: { fontSize: 12, color: '#166534', lineHeight: 17 },

  // CTA bottom bar
  ctaSafe: { backgroundColor: WHITE, borderTopWidth: 1, borderTopColor: GRAY_200 },
  ctaBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  ctaSummary: { flex: 1, flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 },
  ctaPackageName: { fontSize: 13, color: GRAY_500, fontWeight: '600' },
  ctaPrice: { fontSize: 22, fontWeight: '900', color: GRAY_800 },
  ctaCycle: { fontSize: 12, color: GRAY_500 },
  payBtn: {
    paddingHorizontal: 22, paddingVertical: 14, borderRadius: 14,
    flexShrink: 0,
  },
  payBtnText: { color: WHITE, fontSize: 15, fontWeight: '900' },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 10,
  },
  title: { fontSize: 20, fontWeight: '900', color: GRAY_800, textAlign: 'center' },
  summaryCard: {
    backgroundColor: BG, borderRadius: 14, padding: 14, gap: 10,
    borderWidth: 1, borderColor: GRAY_200,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: GRAY_500 },
  summaryValue: { fontSize: 14, fontWeight: '700', color: GRAY_800 },
  totalRow: {
    borderTopWidth: 1, borderTopColor: GRAY_200, paddingTop: 10, marginTop: 2,
  },
  totalLabel: { fontSize: 15, fontWeight: '800', color: GRAY_800 },
  totalValue: { fontSize: 22, fontWeight: '900' },
  confirmBtn: {
    paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  confirmText: { color: WHITE, fontSize: 16, fontWeight: '900' },
  cancelBtn: {
    paddingVertical: 12, alignItems: 'center',
  },
  cancelText: { fontSize: 15, color: GRAY_500, fontWeight: '600' },
});
