/**
 * Component: ChatOverlay
 * Hiển thị Màn hình 14 – Chat Realtime dưới dạng Overlay trượt từ phải
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, FlatList, ListRenderItem,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, Alert, Animated, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatBubble, ChatMessage } from './chat-bubble';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');
const PRIMARY   = '#2563EB';
const GRAY_100  = '#F3F4F6';
const GRAY_200  = '#E5E7EB';
const GRAY_400  = '#9CA3AF';
const GRAY_500  = '#6B7280';
const GRAY_800  = '#1F2937';
const GREEN     = '#16A34A';
const WHITE     = '#FFFFFF';
const BG_CHAT   = '#F0F4F8';

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
    text: 'Đây là căn góc tầng cao, view sông Tắc cực đẹp. Pháp lý hoàn chỉnh, sổ hồng riêng.',
    isMine: true,
    time: '09:18',
    isRead: true,
  },
  {
    id: 'm4',
    type: 'text',
    text: 'Nghe hay quá anh ơi! Giá 3.2 tỷ đó có bao gồm phí quản lý chưa ạ?',
    isMine: false,
    time: '09:21',
    isRead: true,
  },
  {
    id: 'm5',
    type: 'text',
    text: 'Giá đó chưa bao gồm phí quản lý ạ. Cuối tuần này em rảnh qua xem trực tiếp nhé.',
    isMine: true,
    time: '09:24',
    isRead: true,
  },
];

function DateDivider({ label }: { label: string }) {
  return (
    <View style={styles.dateDivider}>
      <View style={styles.dateLine} />
      <Text style={styles.dateLabel}>{label}</Text>
      <View style={styles.dateLine} />
    </View>
  );
}

interface Props {
  visible: boolean;
  onClose: () => void;
  threadId: string | null;
  partnerName: string;
}

export function ChatOverlay({ visible, onClose, threadId, partnerName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText]   = useState('');
  const flatListRef = useRef<FlatList>(null);
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

  // Khi đổi threadId, có thể reset tin nhắn hoặc load mới
  useEffect(() => {
    if (threadId) {
      // Giả lập load hội thoại mới
      if (threadId === 't4' || threadId === 't6' || threadId === 't8') {
        // Thông báo hệ thống thì sẽ do modal đọc tin nhắn hệ thống hiển thị, 
        // nhưng nếu lỡ vào chat thì hiển thị tin nhắn hệ thống
        setMessages([
          {
            id: 'sys1',
            type: 'text',
            text: 'Đây là thông báo từ hệ thống MapZest. Bạn không thể trả lời tin nhắn này.',
            isMine: false,
            time: '12:00',
          }
        ]);
      } else {
        setMessages(MOCK_MESSAGES);
      }
    }
  }, [threadId]);

  if (!visible) return null;

  const handleSend = () => {
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

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem: ListRenderItem<ChatMessage> = ({ item }) => (
    <ChatBubble
      message={item}
      onPressProperty={(id) => {
        Alert.alert('Xem BĐS', `Xem chi tiết BĐS #${id}`);
      }}
    />
  );

  return (
    <Animated.View style={[styles.overlay, { transform: [{ translateX: slideX }] }]}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.7}>
            <Feather name="arrow-left" size={18} color={GRAY_800} />
          </TouchableOpacity>
          <View style={styles.partnerWrap}>
            <View style={styles.partnerAvatarWrap}>
              <Text style={styles.partnerEmoji}>👨</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName} numberOfLines={1}>{partnerName}</Text>
              <Text style={styles.onlineStatus}>● Đang hoạt động</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert('Gọi điện', `Đang kết nối cuộc gọi tới ${partnerName}...`)} activeOpacity={0.7}>
            <Feather name="phone" size={16} color={PRIMARY} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListHeaderComponent={<DateDivider label="Hôm nay" />}
          showsVerticalScrollIndicator={false}
        />

        {/* Input bar */}
        <SafeAreaView style={styles.inputSafe} edges={['bottom']}>
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn} onPress={() => Alert.alert('Đính kèm', 'Chức năng đính kèm đang kết nối Cloudflare R2.')} activeOpacity={0.7}>
              <Feather name="paperclip" size={18} color={GRAY_500} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={GRAY_400}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              activeOpacity={0.7}
              disabled={!inputText.trim()}
            >
              <Feather name="send" size={14} color={WHITE} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BG_CHAT,
    zIndex: 6000,
  },
  flex: { flex: 1 },
  headerSafe: { backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: GRAY_200, zIndex: 10 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: GRAY_100, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: GRAY_800, fontWeight: '700', marginTop: -1 },

  partnerWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  partnerAvatarWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  partnerEmoji: { fontSize: 20 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN, borderWidth: 1.5, borderColor: WHITE, position: 'absolute', bottom: 0, right: 0 },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 14, fontWeight: '800', color: GRAY_800 },
  onlineStatus: { fontSize: 10, color: GREEN, fontWeight: '600' },
  callBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DBEAFE' },
  callIcon: { fontSize: 16 },

  messageList: { paddingVertical: 12, paddingBottom: 8 },
  dateDivider: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginVertical: 16, gap: 8 },
  dateLine: { flex: 1, height: 1, backgroundColor: GRAY_200 },
  dateLabel: { fontSize: 11, color: GRAY_500, fontWeight: '600', backgroundColor: BG_CHAT, paddingHorizontal: 4 },

  inputSafe: { backgroundColor: WHITE, borderTopWidth: 1, borderTopColor: GRAY_200 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  attachBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: GRAY_100, alignItems: 'center', justifyContent: 'center', marginBottom: 1 },
  attachIcon: { fontSize: 18 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, fontSize: 14, color: GRAY_800, maxHeight: 100, lineHeight: 18 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginBottom: 1 },
  sendBtnDisabled: { backgroundColor: GRAY_200 },
  sendIcon: { fontSize: 14, color: WHITE, fontWeight: '800', marginLeft: 2 },
});
