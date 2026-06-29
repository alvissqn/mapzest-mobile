/**
 * Màn hình 24 – Thống kê hiệu suất (Analytics)
 * Route: /seller-analytics
 *
 * Giao diện:
 * - Dropdown chọn khoảng thời gian: 7 ngày | 30 ngày | 90 ngày
 * - 4 KPI card: Lượt xem, Yêu thích, Liên hệ, Lịch hẹn (kèm % tăng/giảm)
 * - Biểu đồ cột thể hiện lượt xem theo ngày (Bar chart thuần RN không cần thư viện)
 * - Biểu đồ phân tích tình trạng tin đăng (Segmented donut chart)
 * - Top 3 tin đăng hiệu quả nhất
 *
 * TODO: GET /api/analytics?period=7 để tải số liệu thật
 */
import { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomTabInset } from '@/constants/theme';

const BG       = '#F9FAFB';
const PRIMARY  = '#2563EB';
const INDIGO   = '#4F46E5';
const GREEN    = '#16A34A';
const ORANGE   = '#EA580C';
const RED      = '#DC2626';
const GRAY_100 = '#F3F4F6';
const GRAY_200 = '#E5E7EB';
const GRAY_400 = '#9CA3AF';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const WHITE    = '#FFFFFF';

// ---- Dữ liệu mock theo khoảng thời gian ----
type Period = '7' | '30' | '90';

const PERIODS: { key: Period; label: string }[] = [
  { key: '7',  label: '7 ngày'  },
  { key: '30', label: '30 ngày' },
  { key: '90', label: '90 ngày' },
];

const KPI_DATA: Record<Period, {
  views: { value: string; change: number };
  saves: { value: string; change: number };
  contacts: { value: string; change: number };
  appointments: { value: string; change: number };
}> = {
  '7': {
    views:        { value: '2,431', change: +18.5 },
    saves:        { value: '147',   change: +12.3 },
    contacts:     { value: '38',    change: +7.1  },
    appointments: { value: '12',    change: -2.4  },
  },
  '30': {
    views:        { value: '9,820', change: +24.7 },
    saves:        { value: '582',   change: +19.0 },
    contacts:     { value: '156',   change: +14.6 },
    appointments: { value: '48',    change: +8.3  },
  },
  '90': {
    views:        { value: '28,450', change: +32.1 },
    saves:        { value: '1,740',  change: +27.8 },
    contacts:     { value: '430',    change: +21.5 },
    appointments: { value: '134',    change: +15.2 },
  },
};

// Dữ liệu biểu đồ cột (7 ngày gần nhất - đơn vị: lượt xem/ngày)
const BAR_DATA: Record<Period, { day: string; value: number }[]> = {
  '7': [
    { day: 'T2', value: 280 }, { day: 'T3', value: 420 },
    { day: 'T4', value: 310 }, { day: 'T5', value: 590 },
    { day: 'T6', value: 480 }, { day: 'T7', value: 720 },
    { day: 'CN', value: 631 },
  ],
  '30': [
    { day: 'T1', value: 180 }, { day: 'T2', value: 320 },
    { day: 'T3', value: 410 }, { day: 'T4', value: 590 },
    { day: 'T5', value: 480 }, { day: 'T6', value: 720 },
    { day: 'T7', value: 631 },
  ],
  '90': [
    { day: 'T1', value: 220 }, { day: 'T2', value: 480 },
    { day: 'T3', value: 610 }, { day: 'T4', value: 890 },
    { day: 'T5', value: 740 }, { day: 'T6', value: 920 },
    { day: 'T7', value: 831 },
  ],
};

// Dữ liệu tình trạng tin đăng (cho biểu đồ phân đoạn)
const LISTING_STATUS_DATA = [
  { label: 'Đang hiển thị', count: 8,  color: GREEN,   pct: 62 },
  { label: 'Hết hạn',       count: 3,  color: ORANGE,  pct: 23 },
  { label: 'Bị ẩn',         count: 2,  color: RED,     pct: 15 },
];

// Top tin đăng hiệu quả nhất
const TOP_LISTINGS = [
  { rank: 1, title: 'Vinhomes Grand Park – The Rainbow', views: 892, saves: 56, bgColor: '#DBEAFE', bgEmoji: '🏢' },
  { rank: 2, title: 'Nhà phố Thảo Điền view sông Sài Gòn', views: 674, saves: 43, bgColor: '#FEF3C7', bgEmoji: '🏠' },
  { rank: 3, title: 'Căn hộ Masteri An Phú – 2PN', views: 465, saves: 28, bgColor: '#F0FDF4', bgEmoji: '🏗️' },
];

// ---- Component KPI Card ----
interface KpiCardProps {
  emoji: string;
  label: string;
  value: string;
  change: number;
  color: string;
}
function KpiCard({ emoji, label, value, change, color }: KpiCardProps) {
  const isUp = change >= 0;
  return (
    <View style={[kpiStyles.card, { borderTopColor: color }]}>
      <Text style={kpiStyles.emoji}>{emoji}</Text>
      <Text style={[kpiStyles.value, { color }]}>{value}</Text>
      <Text style={kpiStyles.label}>{label}</Text>
      <View style={[kpiStyles.changeBadge, { backgroundColor: isUp ? '#F0FDF4' : '#FEF2F2' }]}>
        <Text style={[kpiStyles.changeText, { color: isUp ? GREEN : RED }]}>
          {isUp ? '▲' : '▼'} {Math.abs(change)}%
        </Text>
      </View>
    </View>
  );
}
const kpiStyles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: WHITE, borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 4,
    borderTopWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  emoji: { fontSize: 22 },
  value: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  label: { fontSize: 11, color: GRAY_500, fontWeight: '600', textAlign: 'center' },
  changeBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  changeText: { fontSize: 11, fontWeight: '700' },
});

// ---- Component Biểu đồ cột (Bar Chart) ----
function BarChart({ data }: { data: { day: string; value: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.value));
  const CHART_HEIGHT = 120;

  return (
    <View style={barStyles.container}>
      {/* Nhãn trục Y */}
      <View style={barStyles.yAxis}>
        <Text style={barStyles.yLabel}>{maxVal}</Text>
        <Text style={barStyles.yLabel}>{Math.round(maxVal / 2)}</Text>
        <Text style={barStyles.yLabel}>0</Text>
      </View>

      {/* Các cột */}
      <View style={barStyles.barsWrap}>
        {data.map((d, i) => {
          const heightPct = (d.value / maxVal) * CHART_HEIGHT;
          const isHighest = d.value === maxVal;
          return (
            <View key={i} style={barStyles.barCol}>
              {/* Giá trị trên cột */}
              {isHighest && (
                <Text style={barStyles.barTopLabel}>{d.value}</Text>
              )}
              <View style={barStyles.barTrack} pointerEvents="none">
                <View
                  style={[
                    barStyles.bar,
                    {
                      height: heightPct,
                      backgroundColor: isHighest ? PRIMARY : '#BFDBFE',
                    }
                  ]}
                />
              </View>
              <Text style={barStyles.barLabel}>{d.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
const barStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', height: 155, gap: 4 },
  yAxis: {
    width: 36, height: 120,
    justifyContent: 'space-between', alignItems: 'flex-end',
    paddingBottom: 18,
  },
  yLabel: { fontSize: 9, color: GRAY_400, fontWeight: '500' },
  barsWrap: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: {
    width: '100%', height: 120,
    justifyContent: 'flex-end', backgroundColor: GRAY_100, borderRadius: 6,
  },
  bar: { width: '100%', borderRadius: 6 },
  barTopLabel: { fontSize: 10, color: PRIMARY, fontWeight: '800', marginBottom: 2 },
  barLabel: { fontSize: 11, color: GRAY_500, fontWeight: '600' },
});

// ---- Component Biểu đồ phân đoạn (Segment Bar) ----
function SegmentBar({ data }: { data: typeof LISTING_STATUS_DATA }) {
  return (
    <View style={segStyles.wrap}>
      {/* Thanh phân đoạn */}
      <View style={segStyles.bar}>
        {data.map((seg, i) => (
          <View
            key={i}
            style={[
              segStyles.segment,
              {
                flex: seg.pct,
                backgroundColor: seg.color,
                borderTopLeftRadius: i === 0 ? 6 : 0,
                borderBottomLeftRadius: i === 0 ? 6 : 0,
                borderTopRightRadius: i === data.length - 1 ? 6 : 0,
                borderBottomRightRadius: i === data.length - 1 ? 6 : 0,
              }
            ]}
          />
        ))}
      </View>

      {/* Chú thích */}
      <View style={segStyles.legendRow}>
        {data.map((seg, i) => (
          <View key={i} style={segStyles.legendItem}>
            <View style={[segStyles.dot, { backgroundColor: seg.color }]} />
            <Text style={segStyles.legendLabel}>{seg.label}</Text>
            <Text style={segStyles.legendCount}>{seg.count} tin ({seg.pct}%)</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
const segStyles = StyleSheet.create({
  wrap: { gap: 14 },
  bar: { height: 14, flexDirection: 'row', borderRadius: 6, overflow: 'hidden' },
  segment: {},
  legendRow: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 13, color: GRAY_800, fontWeight: '600', flex: 1 },
  legendCount: { fontSize: 13, color: GRAY_500 },
});

// ---- Màn hình chính ----
export default function SellerAnalyticsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('7');

  const kpi  = KPI_DATA[period];
  const bars = BAR_DATA[period];

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thống kê hiệu suất</Text>
        </View>

        {/* Bộ chọn khoảng thời gian */}
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: BottomTabInset + 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== 1. KPI CARDS ==================== */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <KpiCard emoji="👁️" label="Lượt xem" value={kpi.views.value} change={kpi.views.change} color={PRIMARY} />
            <KpiCard emoji="❤️" label="Yêu thích" value={kpi.saves.value} change={kpi.saves.change} color={RED} />
          </View>
          <View style={styles.kpiRow}>
            <KpiCard emoji="📞" label="Liên hệ" value={kpi.contacts.value} change={kpi.contacts.change} color={GREEN} />
            <KpiCard emoji="📅" label="Lịch hẹn" value={kpi.appointments.value} change={kpi.appointments.change} color={INDIGO} />
          </View>
        </View>

        {/* ==================== 2. BIỂU ĐỒ LƯỢT XEM ==================== */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Lượt xem theo ngày</Text>
          <Text style={styles.cardSubtitle}>{period === '7' ? '7 ngày gần nhất' : period === '30' ? '30 ngày gần nhất' : '90 ngày gần nhất'}</Text>
          <BarChart data={bars} />
        </View>

        {/* ==================== 3. PHÂN TÍCH TIN ĐĂNG ==================== */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Tình trạng tin đăng</Text>
          <Text style={styles.cardSubtitle}>Tổng: {LISTING_STATUS_DATA.reduce((s, d) => s + d.count, 0)} tin</Text>
          <SegmentBar data={LISTING_STATUS_DATA} />
        </View>

        {/* ==================== 4. TOP TIN ĐĂNG HIỆU QUẢ ==================== */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Top tin đăng hiệu quả</Text>
          <Text style={styles.cardSubtitle}>Theo lượt xem trong kỳ</Text>

          <View style={styles.topList}>
            {TOP_LISTINGS.map(item => (
              <View key={item.rank} style={styles.topItem}>
                {/* Hạng */}
                <View style={[
                  styles.rankBadge,
                  item.rank === 1 && { backgroundColor: '#FCD34D' },
                  item.rank === 2 && { backgroundColor: '#D1D5DB' },
                  item.rank === 3 && { backgroundColor: '#D97706' },
                ]}>
                  <Text style={styles.rankText}>#{item.rank}</Text>
                </View>

                {/* Ảnh mini */}
                <View style={[styles.topImg, { backgroundColor: item.bgColor }]}>
                  <Text style={styles.topEmoji}>{item.bgEmoji}</Text>
                </View>

                {/* Thông tin */}
                <View style={styles.topInfo}>
                  <Text style={styles.topTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.topMeta}>
                    <Text style={styles.topMetaText}>👁️ {item.views} lượt xem</Text>
                    <Text style={styles.topMetaText}>❤️ {item.saves} lưu</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ==================== 5. GỢI Ý HÀNH ĐỘNG ==================== */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Gợi ý của MapZest</Text>
          <Text style={styles.tipText}>
            Tin đăng "Vinhomes Grand Park" đang có lượt xem cao nhất. 
            Hãy nâng cấp lên gói VIP để tăng thêm 3× khả năng tiếp cận khách hàng tiềm năng!
          </Text>
          <TouchableOpacity
            style={styles.tipBtn}
            onPress={() => router.push('/seller-vip' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.tipBtnText}>✨ Nâng cấp VIP ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  headerSafe: {
    backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: GRAY_200, zIndex: 10,
  },
  header: {
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: GRAY_800, letterSpacing: -0.3 },
  scroll: { flex: 1 },

  // Bộ chọn kỳ
  periodRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingBottom: 10,
    justifyContent: 'center',
  },
  periodBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: GRAY_100, alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: PRIMARY },
  periodText: { fontSize: 13, fontWeight: '700', color: GRAY_500 },
  periodTextActive: { color: WHITE },

  // KPI grid
  kpiGrid: { gap: 10 },
  kpiRow: { flexDirection: 'row', gap: 10 },

  // Cards chung
  card: {
    backgroundColor: WHITE, borderRadius: 16, padding: 16, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: GRAY_800 },
  cardSubtitle: { fontSize: 12, color: GRAY_500, marginBottom: 4 },

  // Top listing
  topList: { gap: 12, marginTop: 4 },
  topItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankBadge: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F3F4F6', flexShrink: 0,
  },
  rankText: { fontSize: 12, fontWeight: '900', color: GRAY_800 },
  topImg: {
    width: 44, height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  topEmoji: { fontSize: 22 },
  topInfo: { flex: 1, gap: 3 },
  topTitle: { fontSize: 13, fontWeight: '700', color: GRAY_800, lineHeight: 17 },
  topMeta: { flexDirection: 'row', gap: 10 },
  topMetaText: { fontSize: 11, color: GRAY_500 },

  // Tip card
  tipCard: {
    backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, gap: 8,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  tipTitle: { fontSize: 14, fontWeight: '800', color: PRIMARY },
  tipText: { fontSize: 13, color: '#1E40AF', lineHeight: 19 },
  tipBtn: {
    backgroundColor: PRIMARY, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', marginTop: 4,
  },
  tipBtnText: { color: WHITE, fontSize: 13, fontWeight: '800' },
});
