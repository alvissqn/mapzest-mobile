/**
 * Component: InboxThreadItem
 * Hiển thị một thread tin nhắn trong danh sách Hộp thư (Màn 13)
 *
 * Gồm: Avatar, Tên, Preview tin nhắn cuối, Thời gian, Badge chưa đọc
 */
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const GRAY_900 = '#111827';
const GRAY_100 = '#F3F4F6';
const PRIMARY  = '#2563EB';
const WHITE    = '#FFFFFF';

/** Loại người gửi: khách hàng, hệ thống, hoặc bình thường */
export type ThreadType = 'client' | 'system' | 'normal';

/** Dữ liệu một thread tin nhắn */
export interface InboxThread {
  id: string;
  name: string;          // Tên người/hệ thống gửi
  avatarEmoji: string;   // Emoji thay avatar
  avatarBg: string;      // Màu nền avatar
  preview: string;       // Nội dung preview của tin nhắn cuối
  time: string;          // Thời gian gửi (ví dụ: '2 phút')
  unreadCount: number;   // Số tin chưa đọc (0 = đã đọc hết)
  type: ThreadType;      // Loại thread
  propertyTitle?: string; // BĐS liên quan (nếu có)
}

interface Props {
  thread: InboxThread;
  onPress: (thread: InboxThread) => void;
}

export function InboxThreadItem({ thread, onPress }: Props) {
  const isUnread = thread.unreadCount > 0;

  return (
    <TouchableOpacity
      style={[styles.container, isUnread && styles.containerUnread]}
      onPress={() => onPress(thread)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={[styles.avatarWrap, { backgroundColor: thread.avatarBg }]}>
        {thread.type === 'system' ? (
          <Ionicons name="notifications-outline" size={24} color={PRIMARY} />
        ) : (
          <Text style={styles.avatarEmoji}>{thread.avatarEmoji}</Text>
        )}
      </View>

      {/* Nội dung thread */}
      <View style={styles.contentWrap}>
        {/* Hàng trên: Tên + Thời gian */}
        <View style={styles.topRow}>
          <Text style={[styles.name, isUnread && styles.nameUnread]} numberOfLines={1}>
            {thread.name}
          </Text>
          <Text style={styles.time}>{thread.time}</Text>
        </View>

        {/* BĐS liên quan (nếu có) */}
        {thread.propertyTitle ? (
          <View style={styles.propertyTag}>
            <Ionicons name="home-outline" size={11} color={PRIMARY} style={{ marginRight: 3 }} />
            <Text style={styles.propertyTagText} numberOfLines={1}>
              {thread.propertyTitle}
            </Text>
          </View>
        ) : null}

        {/* Hàng dưới: Preview + Badge chưa đọc */}
        <View style={styles.bottomRow}>
          <Text
            style={[styles.preview, isUnread && styles.previewUnread]}
            numberOfLines={1}
          >
            {thread.preview}
          </Text>
          {isUnread ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: WHITE,
    gap: 12,
  },
  // Thread chưa đọc có nền nhẹ xanh
  containerUnread: {
    backgroundColor: '#F0F7FF',
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  contentWrap: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: GRAY_800,
    flex: 1,
    marginRight: 8,
  },
  nameUnread: {
    fontWeight: '800',
    color: GRAY_900,
  },
  time: {
    fontSize: 12,
    color: GRAY_500,
    flexShrink: 0,
  },
  propertyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  propertyTagText: {
    fontSize: 11,
    color: PRIMARY,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preview: {
    fontSize: 13,
    color: GRAY_500,
    flex: 1,
  },
  previewUnread: {
    color: GRAY_800,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: PRIMARY,
    borderRadius: 99,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    flexShrink: 0,
  },
  badgeText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '800',
  },
});
