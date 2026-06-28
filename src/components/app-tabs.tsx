import { useEffect, useState } from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Text, View, StyleSheet, Platform, useColorScheme, DeviceEventEmitter } from 'react-native';
import { usePathname } from 'expo-router';

import { Colors } from '@/constants/theme';

const PRIMARY = '#2563EB';
const GRAY_400 = '#9CA3AF';

// Biến toàn cục lưu trữ vai trò tạm thời
declare global {
  var role: 'buyer' | 'seller' | undefined;
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const pathname = usePathname();

  // Khởi tạo vai trò từ global hoặc mặc định là 'buyer'
  const [role, setRole] = useState<'buyer' | 'seller'>(globalThis.role || 'buyer');

  useEffect(() => {
    // Lắng nghe sự kiện đổi vai trò từ các màn profile
    const subscription = DeviceEventEmitter.addListener('changeRole', (newRole: 'buyer' | 'seller') => {
      globalThis.role = newRole;
      setRole(newRole);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // Nếu đường dẫn hiện tại bắt đầu bằng /seller hoặc state role là seller -> Hiển thị Tab Bar của Người bán (Seller)
  const isSeller = role === 'seller' || pathname.startsWith('/seller');

  if (isSeller) {
    return (
      <NativeTabs
        backgroundColor={colors.background}
        indicatorColor={colors.backgroundElement}
        labelStyle={{ selected: { color: PRIMARY } }}
      >
        {/* Tab 1: Trang chủ Seller */}
        <NativeTabs.Trigger name="seller-dashboard">
          <NativeTabs.Trigger.Label>Trang chủ</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={require('@/assets/images/tabIcons/home.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        {/* Tab 2: Quản lý tin */}
        <NativeTabs.Trigger name="seller-listings">
          <NativeTabs.Trigger.Label>Tin đăng</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={require('@/assets/images/tabIcons/explore.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        {/* Tab 3: Đăng tin mới */}
        <NativeTabs.Trigger name="seller-post">
          <NativeTabs.Trigger.Label>Đăng tin</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={require('@/assets/images/tabIcons/saved.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        {/* Tab 4: Tài khoản */}
        <NativeTabs.Trigger name="seller-profile">
          <NativeTabs.Trigger.Label>Tài khoản</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={require('@/assets/images/tabIcons/profile.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // Mặc định: Hiển thị Tab Bar của Người mua (Buyer)
  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: PRIMARY } }}
    >
      {/* Tab 1: Trang chủ */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Trang chủ</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* Tab 2: Tìm kiếm */}
      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Tìm kiếm</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* Tab 3: Yêu thích */}
      <NativeTabs.Trigger name="saved">
        <NativeTabs.Trigger.Label>Yêu thích</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/saved.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* Tab 4: Tài khoản */}
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Tài khoản</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/profile.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
