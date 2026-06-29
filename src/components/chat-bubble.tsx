/**
 * Component: ChatBubble
 * Bong bóng tin nhắn trong màn Chat realtime (Màn 14)
 *
 * Hỗ trợ:
 * - Tin nhắn văn bản
 * - Card BĐS chia sẻ trong chat (property card preview)
 * - Phân biệt tin của mình (bên phải) và đối phương (bên trái)
 * - Timestamp + trạng thái đã đọc (tick xanh)
 */
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY   = '#2563EB';
const GRAY_100  = '#F3F4F6';
const GRAY_500  = '#6B7280';
const GRAY_800  = '#1F2937';
const WHITE     = '#FFFFFF';
const BLUE_DARK = '#1D4ED8';

/** Loại nội dung tin nhắn */
export type MessageType = 'text' | 'property';

/** Dữ liệu một tin nhắn */
export interface ChatMessage {
  id: string;
  type: MessageType;
  text?: string;                 // Nội dung văn bản
  property?: {                   // BĐS được chia sẻ trong chat
    id: string;
    title: string;
    address: string;
    price: string;
    area: number;
    bedrooms?: number;
    bgColor: string;
    bgEmoji: string;
  };
  isMine: boolean;               // true = tin của mình (bên phải)
  time: string;                  // Giờ gửi (ví dụ: '14:30')
  isRead?: boolean;              // Đã đọc chưa (chỉ dành cho tin của mình)
}

interface Props {
  message: ChatMessage;
  onPressProperty?: (propertyId: string) => void;
}

export function ChatBubble({ message, onPressProperty }: Props) {
  const isMine = message.isMine;

  return (
    <View style={[styles.row, isMine ? styles.rowRight : styles.rowLeft]}>

      {/* Bong bóng tin nhắn */}
      {message.type === 'text' && message.text ? (
        <View style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleOther
        ]}>
          <Text style={[
            styles.bubbleText,
            isMine ? styles.textMine : styles.textOther
          ]}>
            {message.text}
          </Text>
        </View>
      ) : null}

      {/* Card BĐS được chia sẻ */}
      {message.type === 'property' && message.property ? (
        <TouchableOpacity
          style={[styles.propertyCard, isMine && styles.propertyCardMine]}
          onPress={() => onPressProperty?.(message.property!.id)}
          activeOpacity={0.8}
        >
          {/* Ảnh giả lập BĐS */}
          <View style={[styles.propertyImg, { backgroundColor: message.property.bgColor }]}>
            <Text style={styles.propertyEmoji}>{message.property.bgEmoji}</Text>
          </View>

          {/* Thông tin BĐS */}
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle} numberOfLines={2}>
              {message.property.title}
            </Text>
            <View style={styles.propertyAddressRow}>
              <Ionicons name="location-outline" size={11} color="#64748B" />
              <Text style={styles.propertyAddress} numberOfLines={1}>
                {message.property.address}
              </Text>
            </View>
            <View style={styles.propertyMeta}>
              <Text style={styles.propertyPrice}>{message.property.price}</Text>
              <Text style={styles.propertyDot}>·</Text>
              <Text style={styles.propertyArea}>{message.property.area}m²</Text>
              {message.property.bedrooms ? (
                <>
                  <Text style={styles.propertyDot}>·</Text>
                  <Text style={styles.propertyArea}>{message.property.bedrooms}PN</Text>
                </>
              ) : null}
            </View>
          </View>

          {/* Nút xem chi tiết */}
          <View style={styles.propertyBtn}>
            <Text style={styles.propertyBtnText}>Xem chi tiết</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Thời gian + trạng thái đọc */}
      <View style={[styles.metaRow, isMine ? styles.metaRight : styles.metaLeft]}>
        <Text style={styles.timeText}>{message.time}</Text>
        {/* Chỉ hiện tick đọc cho tin của mình */}
        {isMine ? (
          <Text style={[styles.readTick, message.isRead && styles.readTickBlue]}>
            {message.isRead ? '✓✓' : '✓'}
          </Text>
        ) : null}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 3,
    paddingHorizontal: 12,
    maxWidth: '100%',
    gap: 2,
  },
  rowLeft: {
    alignItems: 'flex-start',
  },
  rowRight: {
    alignItems: 'flex-end',
  },

  // Bong bóng văn bản
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: GRAY_100,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  textMine: {
    color: WHITE,
  },
  textOther: {
    color: GRAY_800,
  },

  // Card BĐS chia sẻ
  propertyCard: {
    width: 260,
    backgroundColor: WHITE,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyCardMine: {
    // Tin của mình vẫn nền trắng để nội dung dễ đọc
    borderColor: '#BFDBFE',
  },
  propertyImg: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyEmoji: {
    fontSize: 40,
  },
  propertyInfo: {
    padding: 10,
    gap: 3,
  },
  propertyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: GRAY_800,
    lineHeight: 17,
  },
  propertyAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  propertyAddress: {
    fontSize: 11,
    color: GRAY_500,
    flex: 1,
  },
  propertyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: PRIMARY,
  },
  propertyDot: {
    color: GRAY_500,
    fontSize: 12,
  },
  propertyArea: {
    fontSize: 12,
    color: GRAY_500,
  },
  propertyBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DBEAFE',
  },
  propertyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },

  // Meta: thời gian + tick đọc
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  metaLeft: {},
  metaRight: {},
  timeText: {
    fontSize: 10,
    color: GRAY_500,
  },
  readTick: {
    fontSize: 10,
    color: GRAY_500,
    fontWeight: '700',
  },
  readTickBlue: {
    color: PRIMARY,
  },
});
