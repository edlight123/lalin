# 🌙 Lalin - Setup & Development Guide

## Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app on your phone (iOS/Android)
- OR iOS Simulator / Android Emulator

### Installation

```bash
# Install dependencies (already done)
npm install

# Start the development server
npm start
```

### Running the App

**On Physical Device:**
1. Install Expo Go from App Store/Play Store
2. Scan the QR code from the terminal
3. App will load on your device

**On Simulator:**
```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android
```

**On Web (for testing):**
```bash
npm run web
```

## 🎨 What's Included

### ✅ Complete React Native + Expo Setup
- TypeScript configured
- Path aliases set up (@components, @screens, etc.)
- Proper project structure

### ✅ Full Trilingual Support (i18next)
- 🇭🇹 **Kreyòl Ayisyen** (Haitian Creole)
- 🇫🇷 **Français** (French)
- 🇺🇸 **English**
- Auto-detects device language
- Easy language switching in Profile screen

### ✅ Beautiful UI Theme
- Moon-inspired color palette
  - Primary: Soft purple/lavender (#9B87F5)
  - Secondary: Warm cream (#FFF9F0)
  - Accent: Deep blue (#4A5568)
- Consistent typography
- Predefined spacing & shadows
- Custom theme context

### ✅ Navigation Setup
- Bottom tab navigation
- 5 main screens: Home, Calendar, Insights, Learn, Profile
- Onboarding flow
- Stack navigator ready for modals

### ✅ Screen Implementations

**Onboarding Screen:**
- 4-step swipeable introduction
- Multilingual welcome flow
- Moon branding throughout

**Home Screen:**
- Cycle phase card with moon icon
- Quick action buttons (Log Period, Log Symptoms)
- Mood tracking interface
- Daily check-in features

**Profile Screen:**
- Language switcher (Kreyòl/Français/English)
- Settings menu structure
- App version info

**Placeholder Screens:**
- Calendar (for cycle tracking calendar)
- Insights (for data visualization)
- Learn (for health education content)

## 📁 Project Structure

```
lalin/
├── App.tsx                      # Root component
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── babel.config.js             # Babel config
├── src/
│   ├── components/             # Reusable components (empty, ready to add)
│   ├── screens/                # Screen components
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── InsightsScreen.tsx
│   │   ├── LearnScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/
│   │   └── RootNavigator.tsx   # Navigation setup
│   ├── contexts/
│   │   └── ThemeContext.tsx    # Theme provider
│   ├── constants/
│   │   └── theme.ts            # Design system
│   ├── i18n/
│   │   ├── i18n.ts            # i18n configuration
│   │   └── locales/
│   │       ├── en.json        # English translations
│   │       ├── fr.json        # French translations
│   │       └── ht.json        # Kreyòl translations
│   ├── services/              # API & data services (ready to add)
│   ├── utils/                 # Helper functions (ready to add)
│   ├── hooks/                 # Custom hooks (ready to add)
│   └── types/                 # TypeScript types (ready to add)
└── docs/
    └── translations.md         # Translation reference guide
```

## 🚀 Next Steps to Build

### Phase 1: Core Tracking
1. **Calendar Integration**
   - Integrate `react-native-calendars`
   - Period tracking UI
   - Flow intensity selector

2. **Data Persistence**
   - Set up AsyncStorage or SQLite
   - Save period data locally
   - Privacy-first storage

3. **Cycle Calculations**
   - Period predictions
   - Fertile window calculations
   - Ovulation estimates

### Phase 2: Enhanced Features
4. **Symptoms & Mood Tracking**
   - Log symptoms screen
   - Mood tracking interface
   - Notes and custom symptoms

5. **Insights & Analytics**
   - Cycle length charts
   - Pattern recognition
   - Health insights

6. **Educational Content**
   - Articles in 3 languages
   - Health tips
   - FAQ section

### Phase 3: Advanced Features
7. **Notifications**
   - Period reminders
   - Fertile window alerts
   - Custom notifications

8. **Data Export**
   - Export cycle data
   - Share with healthcare providers

9. **Community Features** (optional)
   - Health forums
   - Expert Q&A

## 🔑 Key Features Ready to Implement

- **Privacy-First**: All data stored locally on device
- **Offline-First**: Works without internet
- **Accessible**: Large touch targets, clear typography
- **Culturally Sensitive**: Language and tone appropriate for target audience

## 🌍 Internationalization

All text is translatable. To add new translations:

1. Edit files in `src/i18n/locales/`
2. Use translation keys: `t('key.subkey')`
3. Reference `docs/translations.md` for terminology

## 🎨 Theming

Colors and styles are centralized in `src/constants/theme.ts`. To change the look:

```typescript
import { useTheme } from '@/contexts/ThemeContext';

const theme = useTheme();
// Access theme.colors.primary, theme.spacing.md, etc.
```

## 📱 Testing

Test the app in all three languages:
1. Go to Profile screen
2. Tap language buttons
3. Navigate through app to verify translations

## 🐛 Troubleshooting

**Metro bundler issues:**
```bash
npx expo start -c
```

**iOS build issues:**
```bash
cd ios && pod install && cd ..
```

**Clear cache:**
```bash
rm -rf node_modules
npm install
npx expo start -c
```

## 📦 Build for Production

**iOS:**
```bash
eas build --platform ios
```

**Android:**
```bash
eas build --platform android
```

(Note: Requires Expo EAS account)

## 🙏 Credits

Built with love for women's health in Haiti and beyond. 

**Lalin** = Moon (Kreyòl) 🌙
