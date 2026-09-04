# React Native Expo Migration Roadmap

## Overview

This document outlines the complete roadmap for migrating the Referio affiliate marketing platform from Next.js to React Native Expo, enabling native mobile apps for iOS and Android while maintaining the existing web platform.

**Project Goal**: Build mobile-first native apps for iOS and Android using Expo, while keeping the existing Next.js web application.

---

## 🎯 Migration Strategy

### Philosophy: Mobile-First, Code Reuse, Gradual Migration

**Key Principles:**

1. **Features folder is 100% portable** - All business logic, domain entities, data services, and application services can be copied directly
2. **Shared infrastructure** - Database, authentication, and API layer remain unchanged
3. **Gradual migration** - Start with core features, expand incrementally
4. **Parallel development** - Web and mobile apps share backend but have separate UIs

### Architecture Decisions

- **Backend**: Keep existing Supabase + Clerk setup
- **State Management**: React Query for server state (portable), Zustand for client state (portable)
- **UI Framework**: Replace Radix UI with React Native Paper or NativeBase
- **Routing**: Replace Next.js routing with Expo Router
- **Styling**: Replace Tailwind with NativeWind

---

## 📁 Project Structure

```
referio/
├── apps/
│   ├── web/                    # Existing Next.js app (unchanged)
│   └── mobile/                 # NEW: React Native Expo app
├── packages/
│   ├── shared-features/        # NEW: Shared business logic
│   │   └── src/
│   │       ├── affiliates/     # Copied from web/src/features
│   │       ├── courses/        # Copied from web/src/features
│   │       ├── gamification/   # Copied from web/src/features
│   │       ├── orders/         # Copied from web/src/features
│   │       ├── payouts/        # Copied from web/src/features
│   │       ├── products/       # Copied from web/src/features
│   │       └── histories/      # Copied from web/src/features
│   ├── shared-infrastructure/  # NEW: Shared utilities
│   │   └── src/
│   │       ├── supabase/       # Copied from web/src/infrastructure/supabase
│   │       ├── clerk/          # Copied from web/src/infrastructure/clerk
│   │       └── utils/          # Copied from web/src/shared/utils
│   └── shared-hooks/           # NEW: Shared React Query hooks
│       └── src/
│           ├── useReactQuery.ts
│           ├── use-workflow.ts
│           └── auth/
├── web/                        # MOVE: Existing Next.js app
└── mobile/                     # NEW: React Native Expo app
    └── src/
        ├── app/                # Expo Router screens
        ├── components/         # Mobile-specific UI components
        ├── features/           # Symlink or import from packages/shared-features
        └── infrastructure/     # Symlink or import from packages/shared-infrastructure
```

**Recommended Setup**: Monorepo with Turborepo or Nx for optimal code sharing and build orchestration.

---

## 🚀 Migration Phases

### Phase 1: Foundation Setup (Week 1-2)

#### 1.1 Initialize Expo Project

```bash
# Create new Expo app with TypeScript
npx create-expo-app@latest mobile --template blank-typescript

# Install core dependencies
cd mobile
npm install @react-navigation/native @react-navigation/stack
npm install @tanstack/react-query@^5.64.2
npm install zustand@^5.0.3
npm install @clerk/clerk-expo
npm install @supabase/supabase-js@^2.48.0
npm install expo-router expo-linking expo-constants
npm install react-hook-form zod @hookform/resolvers
npm install react-native-paper react-native-safe-area-context
npm install nativewind tailwindcss # Optional: if using Tailwind-like styling

# Development dependencies
npm install --save-dev @types/react-native prettier eslint
```

#### 1.2 Setup Shared Packages

```bash
# Initialize monorepo structure (choose one approach)

# Option A: Turborepo
npm install -g turbo
turbo init

# Option B: Simple monorepo with workspace linking
# Root package.json:
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

#### 1.3 Copy Shared Code

```bash
# Copy features folder
cp -r apps/web/src/features packages/shared-features/src/

# Copy infrastructure
cp -r apps/web/src/infrastructure packages/shared-infrastructure/src/

# Copy shared utilities
cp -r apps/web/src/shared/utils packages/shared-infrastructure/src/

# Copy React Query hooks
cp -r apps/web/src/shared/hooks packages/shared-hooks/src/
```

#### 1.4 Configure Supabase Client for React Native

Create `packages/shared-infrastructure/src/supabase/nativeClient.ts`:

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

#### 1.5 Configure Clerk for Expo

Create `packages/shared-infrastructure/src/clerk/nativeConfig.ts`:

```typescript
import * as SecureStore from "expo-secure-store";
import { ClerkProvider } from "@clerk/clerk-expo";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export const nativeClerkConfig = {
  publishableKey,
  tokenCache: {
    getToken: async (key: string) => {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (err) {
        return null;
      }
    },
    saveToken: async (key: string, value: string) => {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (err) {
        // Handle error
      }
    },
  },
};
```

#### 1.6 Setup React Query Provider

Create `mobile/src/providers/ReactQueryProvider.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

**✅ Deliverables:**

- Expo app initialized and running
- Monorepo structure with shared packages
- All business logic successfully copied
- Supabase and Clerk configured for mobile
- React Query provider setup

---

### Phase 2: Core Authentication & Navigation (Week 3)

#### 2.1 Setup Expo Router

Create `mobile/app/` directory structure:

```
mobile/app/
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── signup.tsx
├── (dashboard)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── profile/
│   │   └── [id].tsx
│   ├── courses/
│   │   └── index.tsx
│   └── analytics/
│       └── index.tsx
└── _layout.tsx
```

#### 2.2 Implement Clerk Auth Guard

Create `mobile/src/components/auth/AuthGuard.tsx`:

```typescript
import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { ReactNode } from 'react';

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
};
```

#### 2.3 Create Mobile Navigation

Create `mobile/app/(dashboard)/_layout.tsx`:

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
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="school" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="analytics" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

#### 2.4 Create Mobile UI Components Library

Create `mobile/src/components/ui/` with basic mobile components:

- `Button.tsx` - Using React Native's TouchableOpacity
- `Card.tsx` - Using React Native's View with shadows
- `Input.tsx` - Using React Native's TextInput
- `Modal.tsx` - Using React Native's Modal
- `Loading.tsx` - Using ActivityIndicator

**Example: Mobile Button Component**

```typescript
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export const Button = ({ onPress, title, variant = 'primary', disabled }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  disabled: {
    opacity: 0.5,
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
});
```

**✅ Deliverables:**

- Expo Router configured with auth and dashboard routes
- Clerk authentication working on mobile
- Bottom tab navigation implemented
- Basic mobile UI component library
- Login/signup screens functional

---

### Phase 3: Feature Integration - Core Features (Week 4-6)

#### 3.1 Integrate React Query Hooks

All existing React Query hooks in the features work identically! Just import from the shared package:

```typescript
// mobile/app/(dashboard)/dashboard/index.tsx
import { useAffiliateStats, useAffiliateXP } from '@referio/shared-features';
import { useAuth } from '@clerk/clerk-expo';

export default function DashboardScreen() {
  const { userId } = useAuth();
  const { data: stats, isLoading } = useAffiliateStats(userId);
  const { data: xp } = useAffiliateXP(userId);

  if (isLoading) return <LoadingScreen />;

  return (
    <ScrollView>
      <Card>
        <Text style={styles.title}>Total Commissions</Text>
        <Text style={styles.amount}>{stats?.total_commissions}</Text>
      </Card>
      {/* More stats */}
    </ScrollView>
  );
}
```

#### 3.2 Build Dashboard Screen

Create `mobile/app/(dashboard)/index.tsx`:

```typescript
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAffiliateStats } from '@referio/shared-features/affiliates';
import { useAuth } from '@clerk/clerk-expo';
import { useAffiliateXP, useAffiliateLevel } from '@referio/shared-features/gamification';

export default function Dashboard() {
  const { userId } = useAuth();
  const { data: stats } = useAffiliateStats(userId);
  const { data: xp } = useAffiliateXP(userId);
  const { data: level } = useAffiliateLevel(xp?.current_level);

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.cardTitle}>XP & Level</Text>
        <Text style={styles.xpAmount}>{xp?.total_xp} XP</Text>
        <Text style={styles.levelText}>Level {xp?.current_level}</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.total_orders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.total_commissions}</Text>
            <Text style={styles.statLabel}>Commissions</Text>
          </View>
        </View>
      </Card>

      <Button title="View Analytics" onPress={() => router.push('/analytics')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  xpAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  levelText: {
    fontSize: 16,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});
```

#### 3.3 Build Courses Feature

Create `mobile/app/(dashboard)/courses/index.tsx`:

```typescript
import { FlatList, View, Text, Image, TouchableOpacity } from 'react-native';
import { useCourses, useFeaturedCourses } from '@referio/shared-features/courses';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

export default function CoursesScreen() {
  const { userId } = useAuth();
  const { data: courses, isLoading } = useCourses();
  const { data: featured } = useFeaturedCourses();

  const renderCourseItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => router.push(`/courses/${item.id}`)}
    >
      <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
      <Text style={styles.courseTitle}>{item.title}</Text>
      <Text style={styles.courseDescription}>{item.description}</Text>
      <Text style={styles.difficulty}>{item.difficulty}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Featured Courses</Text>
      <FlatList
        data={featured || []}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.sectionTitle}>All Courses</Text>
      <FlatList
        data={courses || []}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        onRefresh={() => refetch()}
        refreshing={isLoading}
      />
    </View>
  );
}
```

#### 3.4 Build Orders List

Create `mobile/app/(dashboard)/orders/index.tsx`:

```typescript
import { FlatList, View, Text } from 'react-native';
import { useOrdersByAffiliate } from '@referio/shared-features/orders';
import { useAuth } from '@clerk/clerk-expo';
import { Card } from '@/components/ui/Card';

export default function OrdersScreen() {
  const { userId } = useAuth();
  const { data: orders, isLoading } = useOrdersByAffiliate(userId);

  const renderOrderItem = ({ item }: { item: any }) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.order_number}</Text>
        <Text style={styles.orderStatus}>{item.status}</Text>
      </View>
      <Text style={styles.orderAmount}>{item.total_amount} DZD</Text>
      <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={orders || []}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No orders yet</Text>}
      />
    </View>
  );
}
```

#### 3.5 Build Gamification UI

Create `mobile/app/(dashboard)/gamification/index.tsx`:

```typescript
import { ScrollView, View, Text } from 'react-native';
import { useAffiliateXP, useAffiliateLevel } from '@referio/shared-features/gamification';
import { useAffiliateBadges } from '@referio/shared-features/gamification';
import { useAuth } from '@clerk/clerk-expo';
import { ProgressBar } from 'react-native-paper';

export default function GamificationScreen() {
  const { userId } = useAuth();
  const { data: xp } = useAffiliateXP(userId);
  const { data: level } = useAffiliateLevel(userId);
  const { data: badges } = useAffiliateBadges(userId);

  const progress = level ? (xp?.total_xp / level.xp_required) * 100 : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Level Card */}
      <Card style={styles.levelCard}>
        <Text style={styles.levelNumber}>Level {level?.level_number}</Text>
        <Text style={styles.levelName}>{level?.name}</Text>
        <ProgressBar progress={progress / 100} color="#007AFF" style={styles.progress} />
        <Text style={styles.xpText}>{xp?.xp_to_next_level} XP to next level</Text>
      </Card>

      {/* Badges Section */}
      <Text style={styles.sectionTitle}>Badges ({badges?.length})</Text>
      <View style={styles.badgesGrid}>
        {badges?.map((badge) => (
          <Card key={badge.id} style={styles.badgeCard}>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
```

**✅ Deliverables:**

- Dashboard with stats and XP
- Courses list and detail screens
- Orders list view
- Gamification screen with levels and badges
- All features using shared business logic

---

### Phase 4: Enhanced Features & Polish (Week 7-9)

#### 4.1 Implement Charts & Analytics

Install charting library:

```bash
npm install react-native-chart-kit react-native-svg
```

Create `mobile/app/(dashboard)/analytics/index.tsx`:

```typescript
import { ScrollView, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAffiliateStats } from '@referio/shared-features/affiliates';
import { useCommissionSummary } from '@referio/shared-features/payouts';

export default function AnalyticsScreen() {
  const { data: stats } = useAffiliateStats(userId);
  const { data: commissionSummary } = useCommissionSummary(userId);

  const chartData = {
    labels: commissionSummary?.monthly_data.map(d => d.month) || [],
    datasets: [{
      data: commissionSummary?.monthly_data.map(d => d.amount) || [],
    }],
  };

  return (
    <ScrollView>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        }}
        bezier
        style={styles.chart}
      />
    </ScrollView>
  );
}
```

#### 4.2 Implement Notifications

Install expo-notifications:

```bash
npm install expo-notifications expo-device
```

Setup push notifications in `mobile/src/services/notifications.ts`:

```typescript
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.getPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  return token.data;
}
```

#### 4.3 Implement Deep Linking

Configure deep linking in `app.json`:

```json
{
  "expo": {
    "scheme": "referio",
    "ios": {
      "bundleIdentifier": "com.referio.app"
    },
    "android": {
      "package": "com.referio.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "referio"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

Create `mobile/src/navigation/linking.ts`:

```typescript
export const linking = {
  prefixes: ["referio://", "https://referio.com", "https://referio.com"],
  config: {
    screens: {
      "(dashboard)": {
        screens: {
          courses: {
            screens: {
              "courses/index": "courses",
              "courses/[id]": "courses/:id",
            },
          },
          orders: "orders",
          analytics: "analytics",
        },
      },
    },
  },
};
```

#### 4.4 Implement Offline Support

Install offline utilities:

```bash
npm install @react-native-async-storage/async-storage
npm install react-query-offline
```

Configure offline-first queries:

```typescript
import { useQuery, QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 24 * 60 * 60 * 1000, // 24 hours
      networkMode: 'offlineFirst',
    },
  },
});

// Use React Query DevTools for mobile
<QueryClientProvider client={queryClient}>
  {/* App */}
</QueryClientProvider>
```

**✅ Deliverables:**

- Analytics with charts
- Push notifications setup
- Deep linking configured
- Offline support with caching
- App navigation smooth and polished

---

### Phase 5: Testing & Optimization (Week 10-11)

#### 5.1 Unit Testing

Install React Native testing tools:

```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native
npm install --save-dev jest-expo
```

**ALL EXISTING TESTS WORK!** Your shared feature tests can be run on both web and mobile:

```bash
# Run all shared tests
npm run test -- packages/shared-features
npm run test -- packages/shared-infrastructure

# Run mobile-specific tests
npm run test -- apps/mobile
```

#### 5.2 Performance Optimization

Implement performance best practices:

```typescript
// Use React.memo for list items
const CourseItem = React.memo(({ item }: { item: CourseEntity }) => {
  // ...
});

// Use FlatList optimization
<FlatList
  data={courses}
  renderItem={renderCourseItem}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
/>

// Use image optimization
import { Image } from 'expo-image';

<Image
  source={{ uri: course.thumbnail_url }}
  style={styles.thumbnail}
  contentFit="cover"
  transition={200}
  placeholder={blurHash}
/>
```

#### 5.3 Error Boundary

Create global error handler:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Button title="Try Again" onPress={resetErrorBoundary} />
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        {/* App */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

**✅ Deliverables:**

- All tests passing
- Performance optimized
- Error handling robust
- App ready for production

---

### Phase 6: Build & Deployment (Week 12)

#### 6.1 EAS Build Setup

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Create `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "bundleIdentifier": "com.referio.app",
        "buildConfiguration": "Release"
      }
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-email@example.com",
        "ascAppId": "1234567890"
      }
    }
  }
}
```

#### 6.2 Build APK/IPA

```bash
# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production

# Build for both
eas build --platform all --profile production
```

#### 6.3 Submit to Stores

```bash
# Submit to Google Play
eas submit --platform android --latest

# Submit to App Store
eas submit --platform ios --latest
```

**✅ Deliverables:**

- APK and IPA built successfully
- Apps submitted to stores
- Deployment pipeline established

---

## 🔧 Technical Considerations

### Mobile-Specific Adaptations

#### 1. UI Components Mapping

| Next.js/Web     | React Native         | Alternative                    |
| --------------- | -------------------- | ------------------------------ |
| Radix UI Dialog | React Native Modal   | React Native Paper Dialog      |
| Shadcn Button   | TouchableOpacity     | React Native Paper Button      |
| HTML Input      | TextInput            | React Native Paper TextInput   |
| HTML Table      | FlatList/SectionList | react-native-super-grid        |
| Div/View        | View                 | View (native)                  |
| P/Text          | Text                 | Text (native)                  |
| CSS/Tailwind    | StyleSheet           | NativeWind / styled-components |

#### 2. Navigation Differences

| Next.js                | Expo Router                    |
| ---------------------- | ------------------------------ |
| `useRouter()`          | `useRouter()` from expo-router |
| `router.push('/path')` | `router.push('/path')` (same!) |
| `Link` component       | `Link` from expo-router        |
| Server-side routing    | Client-side only               |

#### 3. Image Handling

```typescript
// Web (Next.js)
import Image from 'next/image';
<Image src="/logo.png" width={100} height={100} />

// Mobile (React Native)
import { Image } from 'react-native';
<Image source={require('./assets/logo.png')} style={styles.logo} />

// Or with expo-image for better performance
import { Image } from 'expo-image';
<Image source={require('./assets/logo.png')} style={styles.logo} />
```

#### 4. Environment Variables

Create `.env` files:

```bash
# .env.production
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key

# .env.development
EXPO_PUBLIC_SUPABASE_URL=your-dev-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
```

Load in `app.config.js`:

```javascript
export default {
  expo: {
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
  },
};
```

---

## 📊 Estimated Timeline

| Phase                      | Duration     | Effort        |
| -------------------------- | ------------ | ------------- |
| Phase 1: Foundation        | 2 weeks      | High          |
| Phase 2: Auth & Navigation | 1 week       | Medium        |
| Phase 3: Core Features     | 3 weeks      | High          |
| Phase 4: Enhanced Features | 3 weeks      | Medium        |
| Phase 5: Testing           | 2 weeks      | Medium        |
| Phase 6: Build & Deploy    | 1 week       | Low           |
| **Total**                  | **12 weeks** | **~3 months** |

---

## 🎯 Success Criteria

✅ **Week 2**: App runs with auth and basic navigation  
✅ **Week 4**: Dashboard showing real data from Supabase  
✅ **Week 6**: Core features (courses, orders, gamification) working  
✅ **Week 9**: Analytics, notifications, offline support complete  
✅ **Week 11**: All tests passing, performance optimized  
✅ **Week 12**: Apps live on Play Store and App Store

---

## 📦 Key Dependencies

### Core (Production)

- `@clerk/clerk-expo` - Authentication
- `@supabase/supabase-js` - Database
- `@tanstack/react-query` - State management
- `zustand` - Client state
- `expo-router` - Navigation
- `expo` - Core Expo SDK
- `react-native` - React Native core

### UI & Styling

- `react-native-paper` or `native-base` - Component library
- `react-native-svg` - SVG support
- `react-native-reanimated` - Animations
- `react-native-gesture-handler` - Gestures
- `nativewind` - Optional Tailwind support

### Utilities

- `@react-native-async-storage/async-storage` - Storage
- `expo-secure-store` - Secure storage
- `expo-notifications` - Push notifications
- `expo-image` - Optimized images
- `date-fns` - Date utilities (portable)
- `zod` - Validation (portable)

### Development

- `jest` - Testing
- `@testing-library/react-native` - Testing utils
- `eslint` - Linting
- `typescript` - Type checking
- `eas-cli` - Build & deployment

---

## 🚨 Potential Challenges & Solutions

### Challenge 1: File Upload

**Problem**: Mobile file uploads work differently from web.

**Solution**:

```typescript
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

// Pick image
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  quality: 1,
});

// Upload to Supabase
const formData = new FormData();
formData.append("file", {
  uri: result.uri,
  name: "image.jpg",
  type: "image/jpeg",
});

await supabase.storage.from("avatars").upload(path, formData);
```

### Challenge 2: Large List Performance

**Problem**: Rendering 1000+ items causes performance issues.

**Solution**:

- Use `FlatList` with pagination
- Implement virtualization
- Use `React.memo` for item components
- Implement pull-to-refresh

### Challenge 3: Biometric Auth

**Problem**: Adding Touch ID/Face ID support.

**Solution**:

```bash
npm install expo-local-authentication
```

```typescript
import * as LocalAuthentication from "expo-local-authentication";

const authenticate = async () => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Authenticate",
    cancelLabel: "Cancel",
  });

  if (result.success) {
    // Proceed with sensitive operation
  }
};
```

### Challenge 4: Splash Screen

**Solution**: Configure in `app.json`:

```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

---

## 🔄 Code Reuse Strategy

### What Can Be 100% Reused

✅ **All features folder code**:

- Domain entities
- Data services
- Application services
- React Query hooks
- Validation schemas (Zod)
- Error handling
- Utility functions

✅ **Shared infrastructure**:

- Supabase client configuration
- Clerk configuration (with mobile-specific storage)
- Database wrapper
- Performance tracking
- Audit logging
- React Query setup

### What Needs Mobile-Specific Implementations

❌ **UI Components**: Complete rewrite with React Native
❌ **Routing**: Expo Router instead of Next.js routing
❌ **Forms**: React Hook Form works, but UI needs adaptation
❌ **Charts**: Replace Recharts with react-native-chart-kit
❌ **File Upload**: Use Expo Document Picker
❌ **Navigation**: Expo Router navigation structure

---

## 📱 Mobile-Specific Enhancements

### 1. Haptic Feedback

```bash
npm install expo-haptics
```

```typescript
import * as Haptics from "expo-haptics";

const onPress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};
```

### 2. Share Functionality

```typescript
import { Share } from "react-native";

const shareReferral = async () => {
  await Share.share({
    message: `Join Referio with my code: ${user.referralCode}`,
  });
};
```

### 3. Camera Integration

```typescript
import * as ImagePicker from "expo-image-picker";

const takePhoto = async () => {
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    // Handle image
  }
};
```

---

## 🎨 Design Considerations

### Mobile-First Design Principles

1. **Thumb-Friendly Zones**: Place important actions in easy-to-reach areas
2. **Larger Touch Targets**: Minimum 44x44 points
3. **Swipe Gestures**: Use for navigation, delete, etc.
4. **Bottom Navigation**: Keep tabs at bottom for easy access
5. **Loading States**: Show skeletons instead of spinners
6. **Pull-to-Refresh**: Standard mobile pattern
7. **Empty States**: Friendly illustrations and clear messaging

### Platform-Specific Guidelines

- **iOS**: Follow Human Interface Guidelines
- **Android**: Follow Material Design 3
- Consider platform-specific UI elements
- Test on both platforms regularly

---

## 🏗️ Monorepo Best Practices

### Workspace Configuration

**Root `package.json`**:

```json
{
  "name": "referio-monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev:web": "turbo run dev --filter=web",
    "dev:mobile": "turbo run dev --filter=mobile",
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.0.0"
  }
}
```

### Package Linking

**`packages/shared-features/package.json`**:

```json
{
  "name": "@referio/shared-features",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@referio/shared-infrastructure": "*",
    "@tanstack/react-query": "^5.64.2"
  }
}
```

### Build Orchestration

**`turbo.json`**:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "outputs": ["coverage/**"]
    }
  }
}
```

---

## 📝 Additional Resources

### Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Clerk Mobile Documentation](https://clerk.com/docs/quickstarts/expo)
- [Supabase Mobile Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

### Recommended Reading

- "React Native in Action" by Nader Dabit
- Expo Router migration guides
- React Query mobile best practices
- Mobile performance optimization guides

---

## ✅ Checklist

### Week 1-2: Foundation

- [ ] Initialize Expo app
- [ ] Setup monorepo structure
- [ ] Copy shared features folder
- [ ] Configure Supabase for mobile
- [ ] Configure Clerk for mobile
- [ ] Setup React Query provider
- [ ] Create basic app layout

### Week 3: Auth & Navigation

- [ ] Implement Expo Router
- [ ] Create auth screens
- [ ] Setup Clerk integration
- [ ] Create dashboard layout
- [ ] Implement bottom tabs
- [ ] Build basic UI component library

### Week 4-6: Core Features

- [ ] Dashboard with stats
- [ ] Courses list and detail
- [ ] Orders list view
- [ ] Gamification screen
- [ ] Profile screen
- [ ] Analytics screen

### Week 7-9: Enhanced Features

- [ ] Charts and graphs
- [ ] Push notifications
- [ ] Deep linking
- [ ] Offline support
- [ ] Image optimization
- [ ] Animations

### Week 10-11: Testing

- [ ] Unit tests for shared code
- [ ] Integration tests
- [ ] E2E tests with Detox
- [ ] Performance profiling
- [ ] Bug fixing

### Week 12: Deployment

- [ ] EAS build configuration
- [ ] Build production apps
- [ ] Submit to stores
- [ ] Monitor crash reports
- [ ] Analytics integration

---

## 🎓 Learning Resources

### Essential Skills to Learn

1. Expo Router navigation patterns
2. React Native styling with StyleSheet
3. Mobile-specific UX patterns
4. Expo SDK APIs
5. Build and deployment process

### Recommended Courses

- Expo Documentation tutorials
- React Native official docs
- React Query for mobile apps
- Mobile app design patterns

---

## 🎉 Conclusion

This migration roadmap provides a clear path to transform your Next.js web application into a fully functional React Native mobile app using Expo. The key advantage is that **most of your business logic can be shared between web and mobile**, significantly reducing development time.

**Estimated Timeline**: 12 weeks for a complete, production-ready mobile app.

**Key Success Factors**:

1. Leverage existing business logic
2. Use shared infrastructure
3. Focus on mobile-first UI/UX
4. Test early and often
5. Iterate based on user feedback

Start with Phase 1 and build incrementally. The shared codebase will make each phase faster than the last!

---

**Questions or need help?** Review the Expo documentation and join the Expo Discord community for support.

Happy coding! 🚀
