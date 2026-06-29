/**
 * Component: InboxOverlay
 * Hiển thị Màn hình 13 – Hộp thư dưới dạng Overlay trượt từ phải
 */
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, FlatList,
  TouchableOpacity, TextInput, Animated, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InboxThreadItem, InboxThread } from './inbox-thread-item';
import { ChatOverlay } from './chat-overlay';

const { width: SCREEN_W } = Dimensions.get('window');
const BG       = '#F9FAFB';
const PRIMARY  = '#2563EB';
const GRAY_200 = '#E5E7EB';
const GRAY_400 = '#9CA3AF';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const WHITE    = '#FFFFFF';

type TabKey = 'all' | 'client' | 'system';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',    label: 'Tất cả'     },
  { key: 'client', label: 'Khách hàng' },
  { key: 'system', label: 'Hệ thống'   },
];

const MOCK_THREADS: InboxThread[] = [
  {
    id: 't1',
    name: 'Nguyễn Văn Minh',
    avatarEmoji: '👨',
    avatarBg: '#DBEAFE',
    preview: 'Anh ơi cho em hỏi căn đó còn không ạ? Em muốn đặt lịch xem cuối tuần này.',
    time: '2 phút',
    unreadCount: 3,
    type: 'client',
    propertyTitle: 'Vinhomes Grand Park – The Rainbow',
  },
  {
    id: 't2',
    name: 'Trần Thị Hoa',
    avatarEmoji: '👩',
    avatarBg: '#FEF3C7',
    preview: 'Cảm ơn anh đã tư vấn, em sẽ xem thêm rồi phản hồi sau ạ',
    time: '15 phút',
    unreadCount: 1,
    type: 'client',
    propertyTitle: 'Nhà phố Thảo Điền view sông',
  },
  {
    id: 't3',
    name: 'Lê Quang Hải',
    avatarEmoji: '🧔',
    avatarBg: '#F0FDF4',
    preview: 'Bạn có thể gửi thêm thông tin pháp lý của căn hộ không?',
    time: '1 giờ',
    unreadCount: 0,
    type: 'client',
    propertyTitle: 'Căn hộ Masteri An Phú',
  },
  {
    id: 't4',
    name: 'Hệ thống MapZest',
    avatarEmoji: '🏠',
    avatarBg: '#EFF6FF',
    preview: '✅ Tin đăng "Biệt thự Nam Sài Gòn" của bạn đã được duyệt và đang hiển thị.',
    time: '2 giờ',
    unreadCount: 0,
    type: 'system',
  },
  {
    id: 't5',
    name: 'Phạm Thanh Tú',
    avatarEmoji: '👧',
    avatarBg: '#FDF2F8',
    preview: 'Anh ơi, giá của căn đó có thể thương lượng không ạ?',
    time: '3 giờ',
    unreadCount: 0,
    type: 'client',
    propertyTitle: 'Căn hộ Q7 Boulevard',
  },
  {
    id: 't6',
    name: 'Hệ thống MapZest',
    avatarEmoji: '🏠',
    avatarBg: '#EFF6FF',
    preview: '⚠️ Tin đăng "Nhà phố Bình Thạnh" sẽ hết hạn sau 3 ngày nữa. Đăng lại để tiếp tục hiển thị.',
    time: '5 giờ',
    unreadCount: 1,
    type: 'system',
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function InboxOverlay({ visible, onClose }: Props) {
  const [activeTab, setActiveTab]   = useState<TabKey>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);
  
  // State đọc chi tiết thông báo hệ thống (Màn hình đọc chi tiết tin nhắn hệ thống)
  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  const slideX = useRef(new Animated.Value(SCREEN_W)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideX, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideX, {
        toValue: SCREEN_W,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const filteredThreads = useMemo(() => {
    let list = MOCK_THREADS;
    if (activeTab !== 'all') {
      list = list.filter(t => t.type === activeTab);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q) ||
        (t.propertyTitle?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [activeTab, searchText]);

  const totalUnread = useMemo(() =>
    filteredThreads.reduce((sum, t) => sum + t.unreadCount, 0),
    [filteredThreads]
  );

  function handleThreadPress(thread: InboxThread) {
    if (thread.type === 'system') {
      // Mở màn hình đọc chi tiết tin nhắn hệ thống
      setSystemMessage(thread.preview);
    } else {
      // Mở chat realtime
      setSelectedThread(thread);
    }
  }

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { transform: [{ translateX: slideX }] }]}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Hộp thư
            {totalUnread > 0 ? <Text style={styles.headerBadge}> ({totalUnread})</Text> : null}
          </Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        {/* Ô tìm kiếm */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, nội dung..."
            placeholderTextColor={GRAY_400}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs lọc */}
        <View style={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      {/* Danh sách thread */}
      <FlatList
        data={filteredThreads}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <InboxThreadItem thread={item} onPress={handleThreadPress} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>Chưa có tin nhắn nào</Text>
          </View>
        }
      />

      {/* CHAT REALTIME OVERLAY */}
      <ChatOverlay
        visible={selectedThread !== null}
        onClose={() => setSelectedThread(null)}
        threadId={selectedThread?.id ?? null}
        partnerName={selectedThread?.name ?? 'Khách hàng'}
      />

      {/* MODAL ĐỌC CHI TIẾT TIN NHẮN HỆ THỐNG */}
      {systemMessage !== null && (
        <View style={styles.sysModalOverlay}>
          <View style={styles.sysModalCard}>
            <View style={styles.sysModalHeader}>
              <Text style={styles.sysModalEmoji}>🏠</Text>
              <Text style={styles.sysModalTitle}>Thông báo hệ thống</Text>
            </View>
            <Text style={styles.sysModalBody}>{systemMessage}</Text>
            <TouchableOpacity 
              style={styles.sysModalCloseBtn} 
              onPress={() => setSystemMessage(null)}
            >
              <Text style={styles.sysModalCloseText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BG,
    zIndex: 5000,
  },
  headerSafe: { backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: GRAY_200, zIndex: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4, paddingBottom: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: GRAY_800, fontWeight: '700', marginTop: -1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: GRAY_800 },
  headerBadge: { color: PRIMARY, fontSize: 16, fontWeight: '800' },
  backBtnPlaceholder: { width: 38 },

  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, gap: 8, height: 40 },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: GRAY_800, paddingVertical: 0 },
  searchClear: { fontSize: 13, color: GRAY_500, fontWeight: '700' },

  tabsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 6, gap: 4 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6' },
  tabActive: { backgroundColor: PRIMARY },
  tabText: { fontSize: 13, fontWeight: '600', color: GRAY_500 },
  tabTextActive: { color: WHITE, fontWeight: '700' },

  separator: { height: 1, backgroundColor: GRAY_200, marginLeft: 80 },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: GRAY_800 },

  // System Message Modal
  sysModalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 8000,
    paddingHorizontal: 24,
  },
  sysModalCard: {
    width: '100%',
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sysModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
    paddingBottom: 12,
  },
  sysModalEmoji: {
    fontSize: 24,
  },
  sysModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GRAY_800,
  },
  sysModalBody: {
    fontSize: 15,
    color: GRAY_800,
    lineHeight: 22,
  },
  sysModalCloseBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  sysModalCloseText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
});
