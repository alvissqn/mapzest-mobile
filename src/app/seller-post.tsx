/**
 * Màn hình 17 - 21 – Đăng tin BĐS 5 bước
 * Route: /seller-post
 *
 * Giao diện:
 * - Progress Indicator: 1 – 2 – 3 – 4 – 5
 * - Bước 1: Cơ bản (Loại, Địa chỉ)
 * - Bước 2: Chi tiết (Cấu trúc, Pháp lý)
 * - Bước 3: Hình ảnh (Thêm/xóa emoji, ảnh chính)
 * - Bước 4: Giá & Mô tả (Giá, AI viết mô tả/tiêu đề)
 * - Bước 5: Review & Đăng tin (Xác nhận, Popup thành công, Đẩy VIP)
 */
import { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView,
  TouchableOpacity, TextInput, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomTabInset } from '@/constants/theme';

const BG = '#F9FAFB';
const PRIMARY = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_200 = '#E5E7EB';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const GREEN = '#16A34A';
const WHITE = '#FFFFFF';

export default function SellerPostScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form States
  const [dealType, setDealType] = useState<'sell' | 'rent'>('sell');
  const [propertyType, setPropertyType] = useState('Căn hộ');
  const [address, setAddress] = useState('15 Song Hành, Thảo Điền, TP. Thủ Đức');
  const [area, setArea] = useState('75');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [direction, setDirection] = useState('Đông Nam');
  const [legal, setLegal] = useState('Sổ hồng riêng');
  
  // Hình ảnh giả lập
  const [images, setImages] = useState<string[]>(['🏢', '🛋️', '🛏']);
  const [mainImageIdx, setMainImageIdx] = useState(0);

  // Giá & Mô tả
  const [price, setPrice] = useState('4.2 tỷ');
  const [title, setTitle] = useState('Căn hộ Vinhomes Grand Park 2PN full nội thất');
  const [description, setDescription] = useState('Căn hộ thiết kế hiện đại, ban công rộng mát, view sông trực diện. Sổ hồng chính chủ bàn giao ngay.');

  // Modal Thành công
  const [successVisible, setSuccessVisible] = useState(false);

  /** AI viết mô tả / tiêu đề */
  function handleAIGenerate() {
    setTitle(`Bán gấp ${propertyType} Thảo Điền ${area}m² - ${bedrooms}PN view sông đẹp`);
    setDescription(`Chính chủ cần bán ${propertyType} nằm tại địa chỉ ${address}. Diện tích ${area}m², thiết kế sang trọng gồm ${bedrooms} phòng ngủ và ${bathrooms} WC. Hướng ${direction}, pháp lý ${legal} đầy đủ. Vị trí đắc địa gần trung tâm thương mại, trường học, giao thông đi lại thuận tiện. Liên hệ ngay để ép giá.`);
    Alert.alert('Mapzest AI', 'Đã tự động tối ưu tiêu đề và mô tả chuẩn SEO Mapzest.');
  }

  function handleNext() {
    if (step < 5) setStep(step + 1);
    else setSuccessVisible(true); // Nhấn Đăng tin ở bước 5 -> hiện popup thành công
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <View style={styles.root}>
      {/* Header cố định */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đăng tin mới</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressWrap}>
          {[1, 2, 3, 4, 5].map((s) => (
            <View key={s} style={[styles.progressStep, step >= s && styles.progressStepActive]} />
          ))}
        </View>
        <Text style={styles.stepTitle}>Bước {step}/5: {
          step === 1 ? 'Thông tin cơ bản' :
          step === 2 ? 'Thông tin chi tiết' :
          step === 3 ? 'Hình ảnh & Video' :
          step === 4 ? 'Giá & Mô tả' : 'Xem trước & Đăng'
        }</Text>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* BƯỚC 1: CƠ BẢN */}
        {step === 1 && (
          <View style={styles.form}>
            <Text style={styles.label}>Loại hình giao dịch</Text>
            <View style={styles.btnGroup}>
              <TouchableOpacity style={[styles.choiceBtn, dealType === 'sell' && styles.choiceActive]} onPress={() => setDealType('sell')}>
                <Text style={[styles.choiceText, dealType === 'sell' && styles.choiceTextActive]}>Bán BĐS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.choiceBtn, dealType === 'rent' && styles.choiceActive]} onPress={() => setDealType('rent')}>
                <Text style={[styles.choiceText, dealType === 'rent' && styles.choiceTextActive]}>Cho thuê BĐS</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Loại hình bất động sản</Text>
            <View style={styles.badgeGroup}>
              {['Căn hộ', 'Nhà phố', 'Biệt thự', 'Đất nền'].map((t) => (
                <TouchableOpacity key={t} style={[styles.badgeBtn, propertyType === t && styles.badgeBtnActive]} onPress={() => setPropertyType(t)}>
                  <Text style={[styles.badgeText, propertyType === t && styles.badgeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Địa chỉ cụ thể</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Nhập địa chỉ nhà..." />
          </View>
        )}

        {/* BƯỚC 2: CHI TIẾT */}
        {step === 2 && (
          <View style={styles.form}>
            <Text style={styles.label}>Diện tích (m²)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={area} onChangeText={setArea} placeholder="Ví dụ: 75" />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Phòng ngủ</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={bedrooms} onChangeText={setBedrooms} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.label}>Phòng tắm</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={bathrooms} onChangeText={setBathrooms} />
              </View>
            </View>

            <Text style={styles.label}>Hướng ban công / cửa</Text>
            <TextInput style={styles.input} value={direction} onChangeText={setDirection} />

            <Text style={styles.label}>Pháp lý</Text>
            <TextInput style={styles.input} value={legal} onChangeText={setLegal} />
          </View>
        )}

        {/* BƯỚC 3: HÌNH ẢNH */}
        {step === 3 && (
          <View style={styles.form}>
            <Text style={styles.label}>Danh sách ảnh đã chọn ({images.length})</Text>
            <Text style={styles.hint}>Nhấn vào ảnh để đặt làm ảnh bìa chính đại diện tin đăng.</Text>
            
            <View style={styles.imgGrid}>
              {images.map((img, idx) => {
                const isMain = idx === mainImageIdx;
                return (
                  <TouchableOpacity key={idx} style={[styles.imgCard, isMain && styles.imgCardMain]} onPress={() => setMainImageIdx(idx)}>
                    <Text style={styles.imgCardEmoji}>{img}</Text>
                    {isMain && <View style={styles.mainBadge}><Text style={styles.mainBadgeText}>Ảnh bìa</Text></View>}
                    <TouchableOpacity style={styles.deleteBadge} onPress={() => setImages(images.filter((_, i) => i !== idx))}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>✕</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
              
              {/* Nút thêm ảnh */}
              <TouchableOpacity style={styles.addImgBtn} onPress={() => setImages([...images, ['🍽️', '🌅', '🛁'][Math.floor(Math.random() * 3)]])}>
                <Text style={{ fontSize: 24, color: GRAY_500 }}>＋</Text>
                <Text style={{ fontSize: 10, color: GRAY_500 }}>Thêm ảnh</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* BƯỚC 4: GIÁ & MÔ TẢ */}
        {step === 4 && (
          <View style={styles.form}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Giá yêu cầu</Text>
              <TouchableOpacity style={styles.aiBtn} onPress={handleAIGenerate}>
                <Text style={styles.aiBtnText}>✨ AI viết tin đăng</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Ví dụ: 4.2 tỷ hoặc 15 triệu/tháng" />

            <Text style={styles.label}>Tiêu đề tin đăng</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Tiêu đề ít nhất 30 ký tự..." />

            <Text style={styles.label}>Mô tả chi tiết</Text>
            <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} multiline value={description} onChangeText={setDescription} placeholder="Mô tả chi tiết về BĐS..." />
          </View>
        )}

        {/* BƯỚC 5: REVIEW & ĐĂNG TIN */}
        {step === 5 && (
          <View style={styles.reviewWrap}>
            <Text style={styles.reviewHeading}>Xem trước tin đăng</Text>
            
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>🏷️ Cơ bản:</Text>
              <Text style={styles.reviewValue}>{dealType === 'sell' ? 'Bán BĐS' : 'Cho thuê BĐS'} · {propertyType}</Text>
              <Text style={styles.reviewValue}>📍 {address}</Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>📏 Chi tiết & Giá:</Text>
              <Text style={styles.reviewValue}>📐 {area}m² · 🛏 {bedrooms}PN · 🚿 {bathrooms}WC · 🧭 {direction}</Text>
              <Text style={[styles.reviewValue, { color: PRIMARY, fontWeight: '800', fontSize: 16 }]}>💰 {price}</Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>✏️ Tiêu đề & Mô tả:</Text>
              <Text style={[styles.reviewValue, { fontWeight: '700' }]}>{title}</Text>
              <Text style={styles.reviewValue} numberOfLines={3}>{description}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* CTA Bottom Bar */}
      <View style={styles.ctaBar}>
        <SafeAreaView edges={['bottom']}>
          <View style={styles.ctaRow}>
            {step > 1 && (
              <TouchableOpacity style={styles.btnOutline} onPress={handleBack}>
                <Text style={styles.btnOutlineText}>Quay lại</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnPrimary} onPress={handleNext}>
              <Text style={styles.btnPrimaryText}>{step === 5 ? 'Xác nhận & Đăng' : 'Tiếp tục'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* POPUP THÀNH CÔNG */}
      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Đăng tin thành công!</Text>
            <Text style={styles.modalText}>Bài đăng của bạn đã được gửi tới hệ thống kiểm duyệt và tạo mã số tin: <Text style={{ fontWeight: '700', color: PRIMARY }}>MZ-NEW-99</Text></Text>
            
            <TouchableOpacity style={styles.modalPromoteBtn} onPress={() => { setSuccessVisible(false); router.replace('/seller-listings'); Alert.alert('Gói VIP', 'Đăng ký tin VIP thành công.'); }}>
              <Text style={styles.modalPromoteText}>⚡ Đẩy VIP tin đăng này ngay</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => { setSuccessVisible(false); router.replace('/seller-listings'); }}>
              <Text style={styles.modalCloseText}>Về trang quản lý tin</Text>
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
  header: { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: GRAY_800 },
  
  // Progress
  progressWrap: { flexDirection: 'row', height: 4, backgroundColor: GRAY_100 },
  progressStep: { flex: 1, backgroundColor: GRAY_200 },
  progressStepActive: { backgroundColor: PRIMARY },
  stepTitle: { fontSize: 12, fontWeight: '700', color: PRIMARY, paddingHorizontal: 16, paddingVertical: 8, textTransform: 'uppercase' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // Form
  form: { gap: 12 },
  label: { fontSize: 13, fontWeight: '700', color: GRAY_800, marginTop: 4 },
  input: { backgroundColor: WHITE, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderStyle: 'solid', borderWidth: 1, borderColor: GRAY_200, fontSize: 13, color: GRAY_800 },
  
  row: { flexDirection: 'row' },
  btnGroup: { flexDirection: 'row', gap: 10 },
  choiceBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: GRAY_200, alignItems: 'center', backgroundColor: WHITE },
  choiceActive: { borderColor: PRIMARY, backgroundColor: '#EFF6FF' },
  choiceText: { fontSize: 13, fontWeight: '700', color: GRAY_500 },
  choiceTextActive: { color: PRIMARY },

  badgeGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: WHITE, borderWidth: 1, borderColor: GRAY_200 },
  badgeBtnActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  badgeText: { fontSize: 12, fontWeight: '600', color: GRAY_500 },
  badgeTextActive: { color: WHITE },

  // Step 3 images
  hint: { fontSize: 11, color: GRAY_500, marginTop: -6 },
  imgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  imgCard: { width: 74, height: 74, borderRadius: 10, backgroundColor: WHITE, borderWidth: 1, borderColor: GRAY_200, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  imgCardMain: { borderColor: PRIMARY, borderWidth: 2 },
  imgCardEmoji: { fontSize: 32 },
  mainBadge: { position: 'absolute', bottom: 4, backgroundColor: PRIMARY, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  mainBadgeText: { color: WHITE, fontSize: 8, fontWeight: '800' },
  deleteBadge: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  addImgBtn: { width: 74, height: 74, borderRadius: 10, borderStyle: 'dashed', borderWidth: 1.5, borderColor: GRAY_500, alignItems: 'center', justifyContent: 'center', gap: 4 },

  // Step 4 AI button
  aiBtn: { backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  aiBtnText: { color: '#4F46E5', fontSize: 11, fontWeight: '700' },

  // Step 5 Review
  reviewWrap: { gap: 12 },
  reviewHeading: { fontSize: 15, fontWeight: '800', color: GRAY_800, marginBottom: 4 },
  reviewSection: { backgroundColor: WHITE, borderRadius: 14, padding: 14, gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  reviewLabel: { fontSize: 11, fontWeight: '700', color: GRAY_500, textTransform: 'uppercase' },
  reviewValue: { fontSize: 13, color: GRAY_800, lineHeight: 18 },

  // CTA sticky below
  ctaBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: WHITE, borderTopWidth: 1, borderTopColor: GRAY_200, paddingVertical: 10, paddingHorizontal: 16 },
  ctaRow: { flexDirection: 'row', gap: 10 },
  btnOutline: { flex: 1, borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnOutlineText: { color: PRIMARY, fontSize: 14, fontWeight: '700' },
  btnPrimary: { flex: 1.5, backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnPrimaryText: { color: WHITE, fontSize: 14, fontWeight: '700' },

  // Modal Success
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: WHITE, borderRadius: 20, padding: 24, alignItems: 'center', gap: 12, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10 },
  modalEmoji: { fontSize: 56 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: GRAY_800 },
  modalText: { fontSize: 13, color: GRAY_500, textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },
  modalPromoteBtn: { backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 12, width: '100%', alignItems: 'center', marginTop: 10 },
  modalPromoteText: { color: WHITE, fontSize: 14, fontWeight: '700' },
  modalCloseBtn: { paddingVertical: 10, width: '100%', alignItems: 'center' },
  modalCloseText: { color: GRAY_500, fontSize: 13, fontWeight: '600' }
});
