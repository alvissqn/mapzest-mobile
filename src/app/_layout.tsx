import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useState } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { OnboardingOverlay } from '@/components/onboarding-overlay';
import { AuthOverlay } from '@/components/auth-overlay';
import AppTabs from '@/components/app-tabs';

/**
 * Luồng màn hình:
 * 1. SplashScreen      → zIndex 9999, tự ẩn sau ~3s
 * 2. OnboardingOverlay → zIndex 9000, render ngay từ đầu (dưới Splash)
 * 3. AuthOverlay       → zIndex 8500, Login + Register
 * 4. AppTabs (Home)    → giao diện chính
 *
 * Tất cả overlay render từ đầu, tầng cao hơn che tầng thấp hơn.
 * Không có flash vì không chờ setState để mount component mới.
 *
 * TODO: Đọc AsyncStorage khi khởi động:
 * - Nếu đã xem onboarding → bỏ qua OnboardingOverlay
 * - Nếu đã đăng nhập (token hợp lệ) → bỏ qua AuthOverlay
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [splashDone, setSplashDone] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [authDone, setAuthDone] = useState(false);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* AppTabs: luôn render bên dưới tất cả overlay */}
      <AppTabs />

      {/* Auth overlay (zIndex 8500): Login + Register */}
      {!authDone && (
        <AuthOverlay onFinish={() => setAuthDone(true)} />
      )}

      {/* Onboarding overlay (zIndex 9000): render ngay, Splash che trên */}
      {!onboardingDone && (
        <OnboardingOverlay onFinish={() => setOnboardingDone(true)} />
      )}

      {/* Splash overlay (zIndex 9999): trên cùng */}
      {!splashDone && (
        <AnimatedSplashOverlay onFinish={() => setSplashDone(true)} />
      )}
    </ThemeProvider>
  );
}
