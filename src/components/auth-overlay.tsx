/**
 * AuthOverlay - Màn hình Đăng nhập & Đăng ký
 *
 * Gồm 2 màn:
 * - LoginScreen: Form đăng nhập (SĐT/Email + Mật khẩu, Ghi nhớ, Quên mật khẩu, Google, Apple)
 * - RegisterScreen: Form đăng ký (Họ tên, SĐT, Email, Mật khẩu, Xác nhận, Điều khoản)
 *
 * Là overlay zIndex 8500, nằm trên AppTabs nhưng dưới Splash (9999) và Onboarding (9000).
 * Khi đăng nhập/đăng ký thành công → gọi onFinish() để bỏ overlay, vào AppTabs.
 *
 * TODO: Tích hợp API backend (POST /api/auth/login, /api/auth/register).
 * TODO: Lưu token vào AsyncStorage / SecureStore.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, AntDesign } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = '#2563EB';
const PRIMARY_DARK = '#1D4ED8';
const TEXT_MAIN = '#0F172A';
const TEXT_SECONDARY = '#64748B';
const BORDER_COLOR = '#E2E8F0';
const BG_INPUT = '#F8FAFC';

// ─── MapZest Logo Mini ────────────────────────────────────────────────────────
function LogoMini() {
  return (
    <View style={logoStyles.container}>
      {/* Pin shape */}
      <View style={logoStyles.pinOuter}>
        <View style={logoStyles.houseContainer}>
          <View style={logoStyles.houseRoof} />
          <View style={logoStyles.houseBody}>
            <View style={logoStyles.houseDoor} />
          </View>
        </View>
      </View>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    backgroundColor: PRIMARY,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  pinOuter: {
    width: 32,
    height: 32,
    borderWidth: 2.5,
    borderColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseContainer: {
    transform: [{ rotate: '-45deg' }],
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  houseRoof: {
    width: 9,
    height: 9,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
    marginBottom: -4,
  },
  houseBody: {
    width: 8,
    height: 6,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  houseDoor: {
    width: 3,
    height: 3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
});

// ─── Input Field component ────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  rightElement?: React.ReactNode;
  iconName?: keyof typeof Feather.glyphMap;
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  rightElement,
  iconName,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
      <View style={[
        inputStyles.inputRow,
        focused && inputStyles.inputRowFocused,
      ]}>
        {iconName && (
          <Feather
            name={iconName}
            size={18}
            color={focused ? PRIMARY : '#94A3B8'}
            style={inputStyles.leftIcon}
          />
        )}
        <TextInput
          style={inputStyles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightElement && <View style={inputStyles.rightEl}>{rightElement}</View>}
      </View>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MAIN,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_INPUT,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputRowFocused: {
    borderColor: PRIMARY,
    backgroundColor: '#EFF6FF',
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: TEXT_MAIN,
    height: '100%',
  },
  rightEl: {
    marginLeft: 8,
  },
});

// ─── Eye Toggle Button (ẩn/hiện mật khẩu) ────────────────────────────────────
function EyeToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.6} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      {/* Eye icon vẽ bằng View */}
      <View style={eyeStyles.eye}>
        <View style={[eyeStyles.eyeOuter, visible ? eyeStyles.eyeOpen : eyeStyles.eyeClosed]} />
        {visible && <View style={eyeStyles.eyePupil} />}
        {!visible && <View style={eyeStyles.eyeStrike} />}
      </View>
    </TouchableOpacity>
  );
}

const eyeStyles = StyleSheet.create({
  eye: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  eyeOuter: {
    width: 18,
    height: 12,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  eyeOpen: {},
  eyeClosed: { opacity: 0.4 },
  eyePupil: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  eyeStrike: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#94A3B8',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
});

// ─── Social Button (Google / Apple) ──────────────────────────────────────────
function SocialButton({ provider, onPress }: { provider: 'google' | 'apple'; onPress: () => void }) {
  return (
    <TouchableOpacity style={socialStyles.btn} onPress={onPress} activeOpacity={0.75}>
      {provider === 'google' ? (
        <AntDesign name="google" size={20} color="#EA4335" />
      ) : (
        <AntDesign name="apple" size={20} color="#000000" />
      )}
      <Text style={socialStyles.label}>
        {provider === 'google' ? 'Google' : 'Apple'}
      </Text>
    </TouchableOpacity>
  );
}

const socialStyles = StyleSheet.create({
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 48,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  label: { fontSize: 14, fontWeight: '600', color: TEXT_MAIN },
});

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <TouchableOpacity style={checkStyles.row} onPress={onToggle} activeOpacity={0.7}>
      <View style={[checkStyles.box, checked && checkStyles.boxChecked]}>
        {checked && (
          <>
            <View style={checkStyles.tick1} />
            <View style={checkStyles.tick2} />
          </>
        )}
      </View>
      <Text style={checkStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const checkStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  tick1: { position: 'absolute', width: 6, height: 2, backgroundColor: '#fff', borderRadius: 1, transform: [{ rotate: '45deg' }, { translateX: -2 }] },
  tick2: { position: 'absolute', width: 10, height: 2, backgroundColor: '#fff', borderRadius: 1, transform: [{ rotate: '-50deg' }, { translateX: 1 }] },
  label: { fontSize: 13, color: TEXT_SECONDARY, flex: 1, flexWrap: 'wrap' },
});

// ─── Login Screen ─────────────────────────────────────────────────────────────
interface LoginScreenProps {
  onLoginSuccess: () => void;
  onGoRegister: () => void;
}

function LoginScreen({ onLoginSuccess, onGoRegister }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  function handleLogin() {
    // TODO: Gọi API POST /api/auth/login
    // Tạm thời: đăng nhập thành công ngay
    onLoginSuccess();
  }

  return (
    <KeyboardAvoidingView
      style={authStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[authStyles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={authStyles.header}>
          <LogoMini />
          <View style={authStyles.headerText}>
            <Text style={authStyles.welcomeTitle}>Chào mừng trở lại!</Text>
            <Text style={authStyles.welcomeSubtitle}>Đăng nhập để tiếp tục hành trình</Text>
          </View>
        </View>

        {/* Form */}
        <View style={authStyles.formCard}>
          <InputField
            label="Số điện thoại / Email"
            placeholder="Nhập SĐT hoặc email"
            value={phone}
            onChangeText={setPhone}
            keyboardType="email-address"
            iconName="phone"
          />

          <InputField
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            iconName="lock"
            rightElement={
              <EyeToggle visible={showPass} onToggle={() => setShowPass(!showPass)} />
            }
          />

          {/* Remember + Forgot */}
          <View style={authStyles.rememberRow}>
            <Checkbox
              checked={rememberMe}
              onToggle={() => setRememberMe(!rememberMe)}
              label="Ghi nhớ đăng nhập"
            />
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={authStyles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity
            style={authStyles.primaryBtn}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[PRIMARY, PRIMARY_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={authStyles.primaryBtnGradient}
            >
              <Text style={authStyles.primaryBtnText}>Đăng nhập</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={authStyles.dividerRow}>
            <View style={authStyles.dividerLine} />
            <Text style={authStyles.dividerText}>hoặc đăng nhập với</Text>
            <View style={authStyles.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={authStyles.socialRow}>
            <SocialButton provider="google" onPress={() => {/* TODO */}} />
            <SocialButton provider="apple" onPress={() => {/* TODO */}} />
          </View>
        </View>

        {/* Footer */}
        <View style={authStyles.footerRow}>
          <Text style={authStyles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={onGoRegister} activeOpacity={0.7}>
            <Text style={[authStyles.footerText, authStyles.footerLink]}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Register Screen ──────────────────────────────────────────────────────────
interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onGoLogin: () => void;
}

function RegisterScreen({ onRegisterSuccess, onGoLogin }: RegisterScreenProps) {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  function handleRegister() {
    // TODO: Gọi API POST /api/auth/register
    // Tạm thời: đăng ký thành công ngay
    onRegisterSuccess();
  }

  return (
    <KeyboardAvoidingView
      style={authStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[authStyles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={authStyles.header}>
          <Text style={authStyles.registerTitle}>Tạo tài khoản mới</Text>
          <Text style={authStyles.registerSubtitle}>Chỉ vài bước để bắt đầu</Text>
        </View>

        {/* Form */}
        <View style={authStyles.formCard}>
          <InputField
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            iconName="user"
          />

          <InputField
            label="Số điện thoại"
            placeholder="0901 234 567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            iconName="phone"
          />

          <InputField
            label="Email (tùy chọn)"
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            iconName="mail"
          />

          <InputField
            label="Mật khẩu"
            placeholder="Tối thiểu 8 ký tự"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            iconName="lock"
            rightElement={
              <EyeToggle visible={showPass} onToggle={() => setShowPass(!showPass)} />
            }
          />

          <InputField
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPass}
            iconName="lock"
            rightElement={
              <EyeToggle visible={showConfirmPass} onToggle={() => setShowConfirmPass(!showConfirmPass)} />
            }
          />

          {/* Terms */}
          <Checkbox
            checked={agreedTerms}
            onToggle={() => setAgreedTerms(!agreedTerms)}
            label="Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật"
          />

          {/* Register button */}
          <TouchableOpacity
            style={[authStyles.primaryBtn, !agreedTerms && authStyles.primaryBtnDisabled]}
            onPress={agreedTerms ? handleRegister : undefined}
            activeOpacity={agreedTerms ? 0.85 : 1}
          >
            <LinearGradient
              colors={agreedTerms ? [PRIMARY, PRIMARY_DARK] : ['#94A3B8', '#94A3B8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={authStyles.primaryBtnGradient}
            >
              <Text style={authStyles.primaryBtnText}>Đăng ký</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={authStyles.footerRow}>
          <Text style={authStyles.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={onGoLogin} activeOpacity={0.7}>
            <Text style={[authStyles.footerText, authStyles.footerLink]}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Shared Auth Styles ───────────────────────────────────────────────────────
const authStyles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 24,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  headerText: { alignItems: 'center', gap: 4 },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT_MAIN,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
  registerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: TEXT_MAIN,
    textAlign: 'center',
  },
  registerSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotText: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '600',
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnGradient: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER_COLOR,
  },
  dividerText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  footerLink: {
    color: PRIMARY,
    fontWeight: '700',
  },
});

// ─── AuthOverlay (Main Export) ────────────────────────────────────────────────
type AuthScreen = 'login' | 'register';

interface AuthOverlayProps {
  /** Gọi khi đăng nhập hoặc đăng ký thành công → ẩn overlay, vào AppTabs */
  onFinish: () => void;
}

export function AuthOverlay({ onFinish }: AuthOverlayProps) {
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [visible, setVisible] = useState(true);
  const overlayOpacity = useSharedValue(1);
  const screenOpacity = useSharedValue(1);
  // Dùng useSharedValue để có thể đọc/ghi từ cả worklet và JS thread (Reanimated 4.x)
  const isTransitioning = useSharedValue(false);
  // Skip useEffect on first mount
  const isFirstRender = useRef(true);

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const screenAnimStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  /**
   * Phase 2: fade-in sau khi screen thay đổi.
   * useEffect chạy sau React commit → an toàn trên iOS + Android.
   */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Screen mới đã render → fade in, reset guard trong withTiming callback (worklet)
    screenOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) }, () => {
      isTransitioning.value = false; // worklet context — shared value an toàn
    });
  }, [screen]);

  /** Chuyển giữa Login ↔ Register với fade animation */
  function switchScreen(target: AuthScreen) {
    if (isTransitioning.value || screen === target) return; // JS thread đọc shared value — ok
    isTransitioning.value = true;

    // Phase 1: fade out
    screenOpacity.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) }, (done) => {
      if (done) {
        runOnJS(setScreen)(target); // triggers useEffect → Phase 2
      } else {
        isTransitioning.value = false; // worklet context — ok
      }
    });
  }

  /** Kết thúc Auth → fade out toàn bộ overlay */
  function handleSuccess() {
    overlayOpacity.value = withTiming(0, { duration: 350, easing: Easing.inOut(Easing.quad) }, (done) => {
      if (done) {
        runOnJS(setVisible)(false);
        runOnJS(onFinish)();
      }
    });
  }

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, overlayAnimStyle]}>
      {/* Background gradient nhẹ */}
      <LinearGradient
        colors={['#F0F9FF', '#EFF6FF', '#F8FAFC']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Screen content (fade khi chuyển Login ↔ Register) */}
      <Animated.View style={[{ flex: 1 }, screenAnimStyle]}>
        {screen === 'login' ? (
          <LoginScreen
            onLoginSuccess={handleSuccess}
            onGoRegister={() => switchScreen('register')}
          />
        ) : (
          <RegisterScreen
            onRegisterSuccess={handleSuccess}
            onGoLogin={() => switchScreen('login')}
          />
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 8500, // Onboarding: 9000, Splash: 9999
    backgroundColor: '#F0F9FF',
  },
});
