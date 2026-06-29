/**
 * Màn hình 14 – Chat Realtime
 * Route: /chat?threadId=xxx&name=xxx
 *
 * Giao diện:
 * - Header: Avatar + Tên + Trạng thái online + Icon gọi điện
 * - Danh sách bong bóng chat (text + property card preview)
 * - Thanh nhập tin nhắn sticky ở bottom (ô nhập + emoji + đính kèm + gửi)
 * - Swipe để back về màn Hộp thư
 *
 * TODO: Kết nối WebSocket / Pusher để nhận tin nhắn thật
 * TODO: GET /api/conversations/{id}/messages để tải lịch sử chat
 * TODO: POST /api/conversations/{id}/messages để gửi tin nhắn
 * TODO: Upload ảnh đính kèm qua Cloudflare R2
 */
import { useState, useRef, useCallback } from 'react';
import {
  StyleSheet, View, Text, FlatList, ListRenderItem,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChatBubble, ChatMessage } from '@/components/chat-bubble';

const PRIMARY   = '#2563EB';
const GRAY_100  = '#F3F4F6';
const GRAY_200  = '#E5E7EB';
const GRAY_400  = '#9CA3AF';
const GRAY_500  = '#6B7280';
const GRAY_800  = '#1F2937';
const GREEN     = '#16A34A';
const WHITE     = '#FFFFFF';
const BG_CHAT   = '#F0F4F8'; // Nền nhẹ xanh-xám dành riêng cho màn chat

// ---- Dữ liệu mock lịch sử chat ----
const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    type: 'text',
    text: 'Chào anh, em thấy căn này rất ưng ý. Anh có thể cho em xem thêm thông tin không ạ?',
    isMine: false,
    time: '09:15',
    isRead: true,
  },
  {
    id: 'm2',
    type: 'property',
    property: {
      id: 'p1',
      title: 'Vinhomes Grand Park – The Rainbow',
      address: 'Long Bình, TP. Thủ Đức, TP.HCM',
      price: '3.2 tỷ',
      area: 62,
      bedrooms: 2,
      bgColor: '#DBEAFE',
      bgEmoji: '🏢',
    },
    isMine: true,
    time: '09:17',
    isRead: true,
  },
  {
    id: 'm3',
    type: 'text',
    text: 'Đây là căn góc tầng cao, view sông Tắc cực đẹp. Pháp lý hoàn chỉnh, sổ hồng riêng. Thanh toán 50 đợt theo tiến độ xây dựng.',
    isMine: true,
    time: '09:18',
    isRead: true,
  },
  {
    id: 'm4',
    type: 'text',
    text: 'Ôi nghe hay quá anh ơi! Giá 3.2 tỷ đó có bao gồm phí quản lý chưa ạ? Và lãi suất vay ngân hàng hiện tại bao nhiêu?',
    isMine: false,
    time: '09:21',
    isRead: true,
  },
  {
    id: 'm5',
    type: 'text',
    text: 'Giá 3.2 tỷ là giá thương lượng rồi ạ, chưa bao phí quản lý. Phí quản lý khoảng 18k/m²/tháng. Ngân hàng Vietcombank đang hỗ trợ lãi suất 7.5%/năm 2 năm đầu. Em quan tâm anh đặt lịch xem thực tế nhé!',
    isMine: true,
    time: '09:24',
    isRead: true,
  },
  {
    id: 'm6',
    type: 'text',
    text: 'Vậy cuối tuần này anh có rảnh cho em xem không ạ? Em muốn xem trực tiếp căn đó.',
    isMine: false,
    time: '09:26',
    isRead: true,
  },
  {
    id: 'm7',
    type: 'text',
    text: '✅ Được ạ! Thứ 7 hoặc Chủ nhật anh đều ok. Em thích khung giờ nào?',
    isMine: true,
    time: '09:27',
    isRead: true,
  },
  {
    id: 'm8',
    type: 'text',
    text: 'Anh ơi cho em hỏi căn đó còn không ạ? Em muốn đặt lịch xem cuối tuần này.',
    isMine: false,
    time: '14:05',
    isRead: false,
  },
];

// ---- Component hiển thị đường phân cách ngày ----
function DateDivider({ label }: { label: string }) {
  return (
    <View style={styles.dateDivider}>
      <View style={styles.dateLine} />
      <Text style={styles.dateLabel}>{label}</Text>
      <View style={styles.dateLine} />
    </View>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ threadId: string; name: string }>();
  const partnerName = params.name ?? 'Người dùng';

  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText]   = useState('');
  const [isOnline, setIsOnline]     = useState(true); // TODO: kết nối presence channel

  const flatListRef = useRef<FlatList>(null);

  // Gửi tin nhắn mới (hiện tại chỉ local state)
  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      type: 'text',
      text,
      isMine: true,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Cuộn xuống cuối danh sách sau khi gửi
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // TODO: POST /api/conversations/{id}/messages
  }, [inputText]);

  // Nhấn đính kèm
  function handleAttach() {
    Alert.alert('Đính kèm', 'Tính năng đính kèm ảnh đang được phát triển.\nSẽ tích hợp upload ảnh qua Cloudflare R2.');
  }

  // Nhấn gọi điện
  function handleCall() {
    Alert.alert('Gọi điện', `Chức năng gọi điện cho ${partnerName} sẽ mở ứng dụng điện thoại.\nTODO: Linking.openURL("tel:...")`)
  }

  // Render từng tin nhắn
  const renderItem: ListRenderItem<ChatMessage> = ({ item }) => (
    <ChatBubble
      message={item}
      onPressProperty={(id) => {
        // TODO: mở PropertyDetailOverlay với BĐS id tương ứng
        Alert.alert('Xem BĐS', `Đang chuyển đến chi tiết BĐS #${id}`);
      }}
    />
  );

  return (
    <View style={styles.root}>

      {/* ==================== HEADER ==================== */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          {/* Nút back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          {/* Thông tin người đối diện */}
          <View style={styles.partnerWrap}>
            <View style={styles.partnerAvatarWrap}>
              <Text style={styles.partnerEmoji}>👨</Text>
              {/* Chấm online */}
              <View style={[styles.onlineDot, !isOnline && styles.offlineDot]} />
            </View>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName} numberOfLines={1}>{partnerName}</Text>
              <Text style={[styles.onlineStatus, !isOnline && styles.offlineStatus]}>
                {isOnline ? '● Đang online' : '● Offline'}
              </Text>
            </View>
          </View>

          {/* Nút gọi điện */}
          <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.7}>
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ==================== DANH SÁCH TIN NHẮN ==================== */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          // Chèn nhãn ngày phân cách giữa các nhóm tin nhắn
          ListHeaderComponent={<DateDivider label="Hôm nay, 28/06/2026" />}
          showsVerticalScrollIndicator={false}
        />

        {/* ==================== INPUT BAR ==================== */}
        <SafeAreaView style={styles.inputSafe} edges={['bottom']}>
          <View style={styles.inputBar}>
            {/* Nút đính kèm ảnh */}
            <TouchableOpacity style={styles.attachBtn} onPress={handleAttach} activeOpacity={0.7}>
              <Text style={styles.attachIcon}>📎</Text>
            </TouchableOpacity>

            {/* Ô nhập nội dung */}
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={GRAY_400}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              returnKeyType="default"
            />

            {/* Nút gửi */}
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              activeOpacity={0.7}
              disabled={!inputText.trim()}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG_CHAT,
  },
  flex: {
    flex: 1,
  },

  // Header
  headerSafe: {
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GRAY_100,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backIcon: {
    fontSize: 18,
    color: GRAY_800,
    fontWeight: '700',
    marginTop: -1,
  },

  // Thông tin partner
  partnerWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  partnerAvatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  partnerEmoji: {
    fontSize: 22,
  },
  // Chấm online
  onlineDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: GREEN,
    borderWidth: 2,
    borderColor: WHITE,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  offlineDot: {
    backgroundColor: GRAY_400,
  },
  partnerInfo: {
    flex: 1,
    gap: 1,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '800',
    color: GRAY_800,
  },
  onlineStatus: {
    fontSize: 11,
    color: GREEN,
    fontWeight: '600',
  },
  offlineStatus: {
    color: GRAY_500,
  },

  // Nút gọi
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    flexShrink: 0,
  },
  callIcon: {
    fontSize: 18,
  },

  // Danh sách tin nhắn
  messageList: {
    paddingVertical: 12,
    paddingBottom: 8,
  },

  // Nhãn phân cách ngày
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
    gap: 8,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: GRAY_200,
  },
  dateLabel: {
    fontSize: 11,
    color: GRAY_500,
    fontWeight: '600',
    backgroundColor: BG_CHAT,
    paddingHorizontal: 4,
  },

  // Input bar
  inputSafe: {
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: GRAY_200,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GRAY_100,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 1,
  },
  attachIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: GRAY_800,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 1,
  },
  sendBtnDisabled: {
    backgroundColor: GRAY_200,
  },
  sendIcon: {
    fontSize: 16,
    color: WHITE,
    fontWeight: '800',
    marginLeft: 2,
  },
});
