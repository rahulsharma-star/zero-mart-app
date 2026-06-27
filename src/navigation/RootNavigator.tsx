import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { colors, radius, spacing } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import MemberLoginScreen from '../screens/auth/MemberLoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DeliveryHome from '../screens/delivery/DeliveryHome';
import DeliveryOrderDetail from '../screens/delivery/DeliveryOrderDetail';
import Earnings from '../screens/delivery/Earnings';
import VendorHome from '../screens/vendor/VendorHome';
import VendorOrderDetail from '../screens/vendor/VendorOrderDetail';
import OpenRequestScreen from '../screens/OpenRequestScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function tabIcon(label: string) {
  return ({ color }: { color: string }) => <Text style={{ color, fontSize: 18 }}>{label}</Text>;
}

function CustomerTabs() {
  const { t } = useTranslation();
  const { count } = useCart();
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: t('home'), tabBarIcon: tabIcon('🏠') }} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ title: t('orders'), tabBarIcon: tabIcon('🧾'), headerShown: true }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: t('profile'), tabBarIcon: tabIcon('👤'), headerShown: true, tabBarBadge: count || undefined }} />
    </Tab.Navigator>
  );
}

function CustomerStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.text }}>
      <Stack.Screen name="Tabs" component={CustomerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Category" component={CategoryScreen} options={{ title: '' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: t('cart') }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: t('checkout') }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: t('pay_now') }} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OpenRequest" component={OpenRequestScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}

function VendorStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.text }}>
      <Stack.Screen name="VendorHome" component={VendorHome} options={{ title: t('vendor_dashboard') }} />
      <Stack.Screen name="VendorOrderDetail" component={VendorOrderDetail} options={{ title: t('orders') }} />
    </Stack.Navigator>
  );
}

function DeliveryStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.text }}>
      <Stack.Screen name="DeliveryHome" component={DeliveryHome} options={{ title: t('dashboard') }} />
      <Stack.Screen name="DeliveryOrderDetail" component={DeliveryOrderDetail} options={{ title: t('assigned_orders') }} />
      <Stack.Screen name="Earnings" component={Earnings} options={{ title: t('earnings') }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.text }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MemberLogin" component={MemberLoginScreen} options={{ title: '' }} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}

function UseWebAdmin() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  return (
    <View style={styles.center}>
      <Text style={styles.brand}>● Zero</Text>
      <Text style={styles.notice}>{t('use_web_admin')}</Text>
      <TouchableOpacity style={styles.logout} onPress={signOut}>
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootNavigator() {
  const { user } = useAuth();

  let content: React.ReactNode;
  if (!user) content = <AuthStack />;
  else if (user.role === 'vendor') content = <VendorStack />;
  else if (user.role === 'delivery_boy') content = <DeliveryStack />;
  else if (user.role === 'customer') content = <CustomerStack />;
  else content = <UseWebAdmin />;

  return <NavigationContainer>{content}</NavigationContainer>;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.card },
  brand: { fontSize: 32, fontWeight: '900', color: colors.primary, marginBottom: spacing.lg },
  notice: { color: colors.text, textAlign: 'center', fontSize: 16, lineHeight: 24 },
  logout: { marginTop: spacing.xl, borderWidth: 1, borderColor: colors.danger, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 40 },
  logoutText: { color: colors.danger, fontWeight: '800' },
});
