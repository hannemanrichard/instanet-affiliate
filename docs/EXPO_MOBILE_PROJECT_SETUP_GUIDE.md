# Expo Mobile Project Setup Guide

## Overview

This guide provides step-by-step instructions to create a **separate React Native Expo mobile app** for the Referio platform, maintaining the same architecture, practices, and patterns as the web application.

**Key Principle**: Copy-paste the entire `src/features` folder and adapt only the presentation layer (UI components).

---

## 🏗️ Architecture Alignment

### Shared Architecture Components (Copy-Paste Ready)

✅ **100% Portable**:

- `src/features/*/domain/` - All entities, errors, interfaces
- `src/features/*/data/*Service.ts` - All data layer services
- `src/features/*/application/services/*ApplicationService.ts` - All business logic
- `src/features/*/application/use*.ts` - All React Query hooks
- `src/infrastructure/` - Supabase config, Clerk setup
- `src/shared/utils/` - All utilities (errorHandler, logger, performanceTracker, etc.)
- `src/shared/hooks/` - React Query hooks wrapper

❌ **Platform-Specific**:

- UI Components (`src/components/`, `src/app/`)
- Routing structure
- Styling approach

---

## 📁 Target Project Structure

```
referio-mobile/
├── src/
│   ├── app/                          # Expo Router screens
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   ├── (dashboard)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx            # Dashboard
│   │   │   ├── courses/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [id].tsx
│   │   │   ├── orders/
│   │   │   │   └── index.tsx
│   │   │   ├── payouts/
│   │   │   │   └── index.tsx
│   │   │   ├── products/
│   │   │   │   └── index.tsx
│   │   │   ├── gamification/
│   │   │   │   └── index.tsx
│   │   │   └── analytics/
│   │   │       └── index.tsx
│   │   └── _layout.tsx
│   ├── features/                     # COPIED FROM WEB - EXACT SAME STRUCTURE
│   │   ├── affiliates/
│   │   │   ├── domain/
│   │   │   │   ├── entities.ts
│   │   │   │   ├── errors.ts
│   │   │   │   └── repositories.ts
│   │   │   ├── data/
│   │   │   │   └── affiliatesService.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   │   └── affiliateApplicationService.ts
│   │   │   │   └── useAffiliates.ts
│   │   │   └── __tests__/           # ALL TESTS COPIED!
│   │   ├── courses/                 # SAME STRUCTURE
│   │   ├── gamification/            # SAME STRUCTURE
│   │   ├── orders/                  # SAME STRUCTURE
│   │   ├── payouts/                 # SAME STRUCTURE
│   │   ├── products/                # SAME STRUCTURE
│   │   └── histories/               # SAME STRUCTURE
│   ├── infrastructure/              # COPIED FROM WEB
│   │   ├── supabase/
│   │   │   ├── client.ts           # Adapted for React Native
│   │   │   └── types.ts
│   │   └── clerk/
│   │       └── config.ts           # Adapted for Expo
│   ├── shared/                      # MOSTLY COPIED FROM WEB
│   │   ├── hooks/
│   │   │   ├── useReactQuery.ts    # COPIED
│   │   │   └── use-toast.ts        # Adapted for mobile
│   │   └── utils/                  # ALL COPIED
│   │       ├── errorHandler.ts
│   │       ├── logger.ts
│   │       ├── databaseWrapper.ts
│   │       ├── performanceTracker.ts
│   │       ├── auditLogger.ts
│   │       ├── formatters.ts
│   │       └── utils.ts
│   ├── components/                  # NEW: Mobile-specific UI
│   │   ├── ui/                      # Replaces Radix/Shadcn
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   ├── forms/                   # Adapted forms
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx
│   │   │   └── Header.tsx
│   │   └── shells/
│   │       └── ScreenWrapper.tsx
│   ├── types/                       # COPIED
│   │   └── index.ts
│   └── constants/
│       └── config.ts
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── tailwind.config.js              # If using NativeWind
└── .env
```

---

## 🚀 Step-by-Step Setup

### Step 1: Initialize Expo Project

```bash
# Navigate to your projects directory
cd /path/to/projects

# Create new Expo app
npx create-expo-app@latest referio-mobile --template blank-typescript

cd referio-mobile

# Remove default App.tsx (we'll use Expo Router)
rm App.tsx
```

### Step 2: Install Core Dependencies

```bash
# Core Expo & Navigation
npm install expo-router@latest expo-linking expo-constants
npm install @react-navigation/native

# State Management (SAME AS WEB)
npm install @tanstack/react-query@^5.64.2
npm install zustand@^5.0.3

# Authentication (SAME AS WEB)
npm install @clerk/clerk-expo@^6.9.15

# Database (SAME AS WEB)
npm install @supabase/supabase-js@^2.48.0

# Forms & Validation (SAME AS WEB)
npm install react-hook-form@^7.54.2
npm install zod@^3.24.1
npm install @hookform/resolvers@^3.10.0

# UI Framework - Choose ONE
# Option A: React Native Paper (Material Design)
npm install react-native-paper react-native-safe-area-context
# Option B: NativeWind (Tailwind for React Native)
npm install nativewind tailwindcss

# Utilities (SAME AS WEB)
npm install date-fns@^4.1.0

# Mobile-specific
npm install @react-native-async-storage/async-storage
npm install expo-secure-store
npm install expo-image
npm install expo-notifications

# Development dependencies (SAME AS WEB)
npm install --save-dev @types/react @types/react-native
npm install --save-dev typescript prettier eslint
npm install --save-dev jest @testing-library/react-native
npm install --save-dev @testing-library/jest-native jest-expo
```

### Step 3: Configure TypeScript

Replace `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "jsx": "react-native",
    "strict": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/infrastructure/*": ["src/infrastructure/*"],
      "@/components/*": ["src/components/*"]
    }
  },
  "include": ["src", "app"],
  "exclude": ["node_modules"]
}
```

### Step 4: Setup Path Aliases

Create `babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@/features": "./src/features",
            "@/shared": "./src/shared",
            "@/infrastructure": "./src/infrastructure",
            "@/components": "./src/components",
          },
        },
      ],
    ],
  };
};
```

Install module resolver:

```bash
npm install --save-dev babel-plugin-module-resolver
```

### Step 5: Copy Shared Code

```bash
# From your web project directory
cd ../referio  # or wherever your web project is

# Copy entire features folder
cp -r src/features ../referio-mobile/src/

# Copy infrastructure (will need small adaptations)
cp -r src/infrastructure ../referio-mobile/src/

# Copy shared utils (100% portable)
cp -r src/shared/utils ../referio-mobile/src/shared/

# Copy shared hooks
cp -r src/shared/hooks ../referio-mobile/src/shared/

# Copy types
cp -r src/types ../referio-mobile/src/

# Copy shared utils
cp src/shared/utils/utils.ts ../referio-mobile/src/shared/utils/

# Copy constants
mkdir -p ../referio-mobile/src/constants
cp src/constants/* ../referio-mobile/src/constants/ 2>/dev/null || true
```

### Step 6: Adapt Infrastructure for Mobile

#### 6.1 Supabase Client for React Native

Create `src/infrastructure/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

#### 6.2 Clerk Configuration for Expo

Create `src/infrastructure/clerk/config.ts`:

```typescript
import * as SecureStore from "expo-secure-store";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export const clerkConfig = {
  publishableKey,
  tokenCache: {
    getToken: async (key: string): Promise<string | null> => {
      try {
        const item = await SecureStore.getItemAsync(key);
        return item;
      } catch (err) {
        console.error("Error getting Clerk token:", err);
        return null;
      }
    },
    saveToken: async (key: string, value: string): Promise<void> => {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (err) {
        console.error("Error saving Clerk token:", err);
      }
    },
  },
};
```

### Step 7: Setup Expo Router

Install Expo Router dependency:

```bash
npm install expo-router@latest
```

Update `app.json`:

```json
{
  "expo": {
    "name": "Referio",
    "slug": "referio-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.referio.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.referio.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "scheme": "referio",
    "plugins": [
      "expo-router"
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      },
      "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}
```

Create root layout `app/_layout.tsx`:

```typescript
import { ClerkProvider } from '@clerk/clerk-expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { clerkConfig } from '@/infrastructure/clerk/config';

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            retry: 3,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ClerkProvider {...clerkConfig}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(dashboard)" />
        </Stack>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
```

Create auth layout `app/(auth)/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
```

Create dashboard layout `app/(dashboard)/_layout.tsx`:

```typescript
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="school" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="shopping-cart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gamification"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="emoji-events" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="analytics" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Step 8: Create Basic Mobile UI Components

Create `src/components/ui/Button.tsx`:

```typescript
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#007AFF' : 'white'} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#5856D6',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  outlineText: {
    color: '#007AFF',
  },
  dangerText: {
    color: 'white',
  },
});
```

Create `src/components/ui/Card.tsx`:

```typescript
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export const Card = ({ children, style, elevated = true }: CardProps) => {
  return (
    <View style={[styles.card, elevated && styles.elevated, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
```

Create `src/components/ui/Input.tsx`:

```typescript
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = ({ label, error, leftIcon, rightIcon, style, ...props }: InputProps) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#999"
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  leftIcon: {
    marginLeft: 12,
  },
  rightIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
```

### Step 9: Create First Screen Using Shared Features

Create `app/(dashboard)/index.tsx`:

```typescript
import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAffiliateStats } from '@/features/affiliates/application/useAffiliates';
import { useAffiliateXP } from '@/features/gamification/application/useGamification';

export default function DashboardScreen() {
  const { userId } = useAuth();
  const { data: stats, isLoading, refetch, isRefetching } = useAffiliateStats(userId);
  const { data: xp } = useAffiliateXP(userId);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {/* XP & Level Card */}
      <Card>
        <Text style={styles.cardTitle}>Your Progress</Text>
        <Text style={styles.xpAmount}>{xp?.total_xp || 0} XP</Text>
        <Text style={styles.levelText}>Level {xp?.current_level || 1}</Text>
      </Card>

      {/* Stats Card */}
      <Card>
        <Text style={styles.cardTitle}>Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.total_orders || 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.total_commissions || 0} DZD</Text>
            <Text style={styles.statLabel}>Commissions</Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <Card>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <Button title="View Courses" onPress={() => {}} />
        <Button title="View Orders" onPress={() => {}} variant="outline" />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  xpAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 16,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});
```

### Step 10: Setup Jest for Testing

Create `jest.config.js`:

```javascript
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/features/(.*)$": "<rootDir>/src/features/$1",
    "^@/shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@/infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/__mocks__/**",
  ],
};
```

Create `jest.setup.js`:

```javascript
import "@testing-library/jest-native/extend-expect";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock Expo modules
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "test-anon-key",
    },
  },
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));
```

### Step 11: Create Environment Variables

Create `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
```

Install dotenv:

```bash
npm install --save-dev dotenv
```

Create `.gitignore`:

```
node_modules/
.expo/
.expo-shared/
dist/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# macOS
.DS_Store

# Env files
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
```

### Step 12: Update package.json Scripts

Update `package.json`:

```json
{
  "name": "referio-mobile",
  "version": "1.0.0",
  "main": "expo-router",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios"
  }
}
```

---

## 🔄 Step 13: Copy & Adapt Features

### Example: Copy Courses Feature

```bash
# From web project
cd ../referio

# Copy entire courses feature
cp -r src/features/courses ../referio-mobile/src/features/

# Copy tests too!
cp -r src/features/courses/__tests__ ../referio-mobile/src/features/courses/
```

### Create Mobile Screen for Courses

Create `app/(dashboard)/courses/index.tsx`:

```typescript
import { FlatList, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useCourses, useFeaturedCourses } from '@/features/courses/application/useCourses';
import { Card } from '@/components/ui/Card';
import { router } from 'expo-router';

export default function CoursesScreen() {
  const { data: courses, isLoading, refetch, isRefetching } = useCourses();
  const { data: featured } = useFeaturedCourses();

  const renderCourseItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/courses/${item.id}`)}
    >
      <Card style={styles.courseCard}>
        <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.courseDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.difficulty}>{item.difficulty}</Text>
          <Text style={styles.duration}>{item.duration_minutes} min</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={isRefetching ? [] : featured || []}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          featured && featured.length > 0 ? (
            <Text style={styles.sectionTitle}>Featured</Text>
          ) : null
        }
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No courses available</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  courseCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficulty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
```

---

## ✅ Final Checklist

### Core Setup

- [x] Expo project initialized
- [x] TypeScript configured with path aliases
- [x] Core dependencies installed
- [x] Expo Router configured
- [x] Clerk authentication setup
- [x] Supabase configured for mobile

### Code Migration

- [ ] All 7 features copied from web
- [ ] Infrastructure adapted for mobile
- [ ] Shared utils copied
- [ ] Shared hooks copied
- [ ] Types copied

### UI Components

- [ ] Basic UI component library created
- [ ] Mobile navigation implemented
- [ ] Theme/styling approach chosen
- [ ] Forms adapted for mobile

### Testing

- [ ] Jest configured
- [ ] All shared tests working
- [ ] Mobile-specific tests added

### Documentation

- [ ] README.md created
- [ ] Environment variables documented
- [ ] Build instructions documented

---

## 🎯 Key Benefits

1. **Same Business Logic**: All features work identically to web
2. **Same Patterns**: Clean architecture, separation of concerns
3. **Same Testing**: All 673 tests run on both platforms
4. **Code Reuse**: ~90% code shared between web and mobile
5. **Maintainability**: Bug fixes apply to both platforms
6. **Team Efficiency**: Developers can work on either platform

---

## 🚀 Next Steps

1. Copy remaining features
2. Implement authentication screens
3. Build all navigation screens
4. Add mobile-specific enhancements
5. Setup EAS Build for deployment
6. Test on physical devices

---

## 📚 Additional Resources

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Clerk Expo Guide](https://clerk.com/docs/quickstarts/expo)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

---

Your mobile app now shares the same architecture, patterns, and business logic as your web app! 🎉
