# Zero — Mobile App (React Native CLI)

Customer app: phone-OTP login/signup, browse catalog, cart, checkout, PayU (UPI + card) and COD, order tracking, English/Hindi.

## Requirements
> ⚠️ React Native 0.85 needs **Node ≥ 22.11**. Your machine currently has Node 20.
> Use `nvm install 22 && nvm use 22` before running Metro / building the app.

- Node 22+, JDK 17, Android Studio (Android SDK) and/or Xcode (iOS)
- CocoaPods (iOS): `sudo gem install cocoapods`

## Setup
```bash
cd apps/mobile
npm install
# iOS only:
cd ios && pod install && cd ..
```

## Run
```bash
# terminal 1 — Metro
npm run start
# terminal 2
npm run android      # or
npm run ios
```

The backend must be running (`apps/backend`). The app points at:
- Android emulator → `http://10.0.2.2:4000`
- iOS simulator → `http://localhost:4000`

Change in [src/config.ts](src/config.ts). For a real device, set it to your machine's LAN IP.

## Structure
```
src/
├── config.ts                 API base URL + deep-link scheme
├── theme.ts                  colors / spacing / radius tokens
├── i18n.ts                   en/hi dictionaries (persisted in AsyncStorage)
├── api/client.ts             axios instance (JWT + x-lang headers)
├── store/
│   ├── AuthContext.tsx       token + user, bootstrap from storage
│   └── CartContext.tsx       server-synced cart + totals
├── components/               QtyStepper, ProductCard, CartBar
├── screens/                  Login, Otp, Home, Category, ProductDetail,
│                             Cart, Checkout, Payment, OrderSuccess, Orders, Profile
└── navigation/RootNavigator.tsx
```

## Payments (PayU)
`CheckoutScreen` → `POST /payments/payu/initiate` returns `{ action, params }`.
`PaymentScreen` renders an auto-submitting HTML form inside a WebView that POSTs to PayU.
After payment, the backend `/payments/payu/callback` verifies the hash and redirects to
`zero://payment/result?orderId=..&status=..`, which the WebView intercepts to show the result.

> For production, register the `zero://` deep link in `AndroidManifest.xml` / `Info.plist`,
> or replace the WebView flow with PayU's official React Native SDK.

## OTP in dev
The backend runs with `OTP_DEV_MODE=true`, so the OTP is **printed in the backend console**
instead of being sent over SMS. Set MSG91 keys + `OTP_DEV_MODE=false` for real SMS.
# zero-mart-app
