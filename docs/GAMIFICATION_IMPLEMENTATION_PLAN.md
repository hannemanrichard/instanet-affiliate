# Gamification Implementation Plan for Referio Platform

## Overview

This document outlines a comprehensive plan to implement gamification features for affiliates in the Referio affiliate marketing platform. The implementation follows the established clean architecture patterns with domain-driven design principles used throughout the codebase.

## Gamification Features

### 1. XP Points System

- **Experience Points**: Affiliates earn XP for various activities
- **Activity Types**: Order completion, streak maintenance, badge earning, course completion
- **XP Calculation**: Configurable points per activity with multipliers
- **XP History**: Track all XP gains with timestamps and reasons

### 2. Badge System

- **Achievement Badges**: Unlockable badges for milestones and achievements
- **Badge Categories**: Performance, consistency, milestones, special events
- **Badge Rarity**: Common, Rare, Epic, Legendary
- **Badge Display**: Visual representation with descriptions and unlock criteria

### 3. Level System

- **Affiliate Levels**: Progressive levels based on total XP
- **Level Benefits**: Unlock features, higher commission rates, exclusive access
- **Level Requirements**: XP thresholds for each level
- **Level Progression**: Visual progress bars and level-up notifications
- **Progress Visualization**: Multiple progress bar types for different gamification elements

### 4. Streak System

- **Activity Streaks**: Consecutive days of specific activities
- **Streak Types**: Daily login, lead creation, order completion
- **Streak Bonuses**: XP multipliers and special rewards
- **Streak Recovery**: Grace periods and streak protection

### 5. Leaderboards

- **Ranking Systems**: Multiple leaderboard categories
- **Leaderboard Types**: XP, badges, streaks, monthly performance
- **Leaderboard Periods**: Daily, weekly, monthly, all-time
- **Leaderboard Rewards**: Top performers get special recognition

### 6. Guided Quests

- **Quest System**: Structured tasks to guide affiliate onboarding and engagement
- **Quest Types**: Tutorial, achievement, daily, weekly, special events
- **Quest Rewards**: XP, badges, exclusive access, special benefits
- **Quest Progression**: Step-by-step guidance with clear objectives and rewards

### 7. Signup Bonus System

- **Signup Bonuses**: 5000 DZD bonus for eligible affiliates upon signup
- **XP Requirements**: Affiliates must earn 100 XP to unlock their signup bonus
- **Bonus Tracking**: Complete lifecycle tracking from pending to claimed
- **Expiration System**: 30-day expiration window for unclaimed bonuses
- **Automatic Unlocking**: Bonuses automatically unlock when XP threshold is reached
- **Flexible Configuration**: Support for multiple bonus types and amounts

## Architecture Design

### Feature Structure

```
src/features/gamification/
├── domain/
│   ├── entities.ts              # Core gamification entities
│   ├── valueObjects.ts         # Value objects and enums
│   ├── repositories.ts          # Repository interfaces
│   ├── errors.ts               # Domain-specific errors
│   └── validations.ts          # Validation schemas
├── data/
│   ├── xpService.ts            # XP data operations
│   ├── badgeService.ts         # Badge data operations
│   ├── levelService.ts         # Level data operations
│   ├── streakService.ts        # Streak data operations
│   ├── leaderboardService.ts   # Leaderboard data operations
│   ├── bonusService.ts         # Bonus data operations
│   └── index.ts                # Data layer exports
├── application/
│   ├── services/
│   │   ├── gamificationApplicationService.ts
│   │   ├── xpApplicationService.ts
│   │   ├── badgeApplicationService.ts
│   │   ├── levelApplicationService.ts
│   │   ├── streakApplicationService.ts
│   │   ├── leaderboardApplicationService.ts
│   │   └── bonusApplicationService.ts
│   ├── useGamification.ts      # Main gamification hook
│   ├── useXP.ts                # XP management hook
│   ├── useBadges.ts            # Badge management hook
│   ├── useLevels.ts            # Level management hook
│   ├── useStreaks.ts           # Streak management hook
│   ├── useLeaderboards.ts     # Leaderboard hook
│   ├── useQuests.ts           # Quest management hook
│   ├── useBonuses.ts          # Bonus management hook
│   └── index.ts                # Application layer exports
├── presentation/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── GamificationDashboard.tsx
│   │   │   ├── XPCard.tsx
│   │   │   ├── LevelCard.tsx
│   │   │   ├── BadgeCard.tsx
│   │   │   ├── StreakCard.tsx
│   │   │   ├── LeaderboardCard.tsx
│   │   │   └── BonusCard.tsx
│   │   ├── badges/
│   │   │   ├── BadgeGrid.tsx
│   │   │   ├── BadgeItem.tsx
│   │   │   ├── BadgeDetails.tsx
│   │   │   └── BadgeProgress.tsx
│   │   ├── leaderboards/
│   │   │   ├── LeaderboardTable.tsx
│   │   │   ├── LeaderboardItem.tsx
│   │   │   ├── LeaderboardFilters.tsx
│   │   │   └── LeaderboardPagination.tsx
│   │   ├── quests/
│   │   │   ├── QuestCard.tsx
│   │   │   ├── QuestList.tsx
│   │   │   ├── QuestDetails.tsx
│   │   │   ├── QuestProgress.tsx
│   │   │   ├── QuestRewards.tsx
│   │   │   ├── QuestGuide.tsx
│   │   │   ├── QuestTutorial.tsx
│   │   │   └── QuestCompletion.tsx
│   │   └── bonuses/
│   │       ├── BonusCard.tsx
│   │       ├── BonusList.tsx
│   │       ├── BonusDetails.tsx
│   │       ├── BonusProgress.tsx
│   │       └── BonusClaim.tsx
│   │   ├── levels/
│   │   │   ├── LevelProgress.tsx
│   │   │   ├── LevelBenefits.tsx
│   │   │   └── LevelUpModal.tsx
│   │   ├── progress/
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── CircularProgress.tsx
│   │   │   ├── MultiStepProgress.tsx
│   │   │   ├── XPProgressBar.tsx
│   │   │   ├── BadgeProgressBar.tsx
│   │   │   ├── StreakProgressBar.tsx
│   │   │   └── LevelProgressBar.tsx
│   │   └── notifications/
│   │       ├── AchievementNotification.tsx
│   │       ├── LevelUpNotification.tsx
│   │       └── StreakNotification.tsx
│   ├── pages/
│   │   ├── GamificationPage.tsx
│   │   ├── BadgesPage.tsx
│   │   ├── LeaderboardPage.tsx
│   │   ├── QuestsPage.tsx
│   │   └── ProfilePage.tsx
│   └── index.ts                 # Presentation layer exports
└── __tests__/
    ├── data/
    │   ├── xpService.test.ts
    │   ├── badgeService.test.ts
    │   ├── levelService.test.ts
    │   ├── streakService.test.ts
    │   ├── leaderboardService.test.ts
    │   └── questService.test.ts
    ├── application/
    │   ├── gamificationApplicationService.test.ts
    │   ├── xpApplicationService.test.ts
    │   ├── badgeApplicationService.test.ts
    │   ├── levelApplicationService.test.ts
    │   ├── streakApplicationService.test.ts
    │   ├── leaderboardApplicationService.test.ts
    │   └── questApplicationService.test.ts
    ├── presentation/
    │   ├── useGamification.test.ts
    │   ├── useXP.test.ts
    │   ├── useBadges.test.ts
    │   ├── useLevels.test.ts
    │   ├── useStreaks.test.ts
    │   ├── useLeaderboards.test.ts
    │   └── useQuests.test.ts
    └── integration/
        └── gamificationIntegration.test.ts
```

## Domain Layer Implementation

### Core Entities

```typescript
// src/features/gamification/domain/entities.ts

export interface AffiliateXP {
  id: string;
  affiliate_id: number;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  created_at: string;
  updated_at: string;
}

export interface XPEvent {
  id: string;
  affiliate_id: number;
  xp_amount: number;
  activity_type: ActivityType;
  activity_id?: string;
  description: string;
  multiplier: number;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  xp_reward: number;
  criteria: BadgeCriteria;
  is_active: boolean;
  created_at: string;
}

export interface AffiliateBadge {
  id: string;
  affiliate_id: number;
  badge_id: string;
  earned_at: string;
  progress: number;
  is_earned: boolean;
}

export interface Level {
  id: string;
  level_number: number;
  name: string;
  description: string;
  xp_required: number;
  benefits: LevelBenefits;
  icon_url: string;
  is_active: boolean;
}

export interface Streak {
  id: string;
  affiliate_id: number;
  streak_type: StreakType;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  affiliate_id: number;
  affiliate_name: string;
  affiliate_avatar?: string;
  rank: number;
  score: number;
  level: number;
  badges_count: number;
  streak_days: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: QuestType;
  difficulty: QuestDifficulty;
  xp_reward: number;
  badge_reward?: string;
  requirements: QuestRequirement[];
  steps: QuestStep[];
  is_active: boolean;
  is_repeatable: boolean;
  expires_at?: string;
  created_at: string;
}

export interface QuestStep {
  id: string;
  quest_id: string;
  step_number: number;
  title: string;
  description: string;
  action_type: QuestActionType;
  action_data: any;
  is_required: boolean;
  is_completed: boolean;
}

export interface AffiliateQuest {
  id: string;
  affiliate_id: number;
  quest_id: string;
  status: QuestStatus;
  progress: number;
  started_at: string;
  completed_at?: string;
  current_step: number;
}

export interface QuestReward {
  id: string;
  quest_id: string;
  reward_type: RewardType;
  reward_value: number;
  reward_data?: any;
}

export interface AffiliateBonus {
  id: string;
  affiliate_id: number;
  bonus_type: string;
  bonus_amount: number;
  currency: string;
  xp_required: number;
  xp_earned: number;
  status: BonusStatus;
  unlocked_at?: string;
  claimed_at?: string;
  expires_at?: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface BonusConfiguration {
  id: string;
  bonus_type: string;
  bonus_amount: number;
  currency: string;
  xp_required: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Value Objects

```typescript
// src/features/gamification/domain/valueObjects.ts

export enum ActivityType {
  LEAD_CREATED = "lead_created",
  ORDER_COMPLETED = "order_completed",
  DAILY_LOGIN = "daily_login",
  BADGE_EARNED = "badge_earned",
  STREAK_MAINTAINED = "streak_maintained",
  LEVEL_UP = "level_up",
  REFERRAL_MADE = "referral_made",
  SOCIAL_SHARE = "social_share",
}

export enum BadgeCategory {
  PERFORMANCE = "performance",
  CONSISTENCY = "consistency",
  MILESTONE = "milestone",
  SOCIAL = "social",
  SPECIAL = "special",
}

export enum BadgeRarity {
  COMMON = "common",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
}

export enum StreakType {
  DAILY_LOGIN = "daily_login",
  LEAD_CREATION = "lead_creation",
  ORDER_COMPLETION = "order_completion",
}

export enum LeaderboardType {
  XP = "xp",
  BADGES = "badges",
  STREAKS = "streaks",
  MONTHLY_PERFORMANCE = "monthly_performance",
}

export enum LeaderboardPeriod {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  ALL_TIME = "all_time",
}

export enum QuestType {
  TUTORIAL = "tutorial",
  ACHIEVEMENT = "achievement",
  DAILY = "daily",
  WEEKLY = "weekly",
  SPECIAL = "special",
  ONBOARDING = "onboarding",
}

export enum QuestDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert",
}

export enum QuestStatus {
  AVAILABLE = "available",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  EXPIRED = "expired",
  LOCKED = "locked",
}

export enum BonusStatus {
  PENDING = "pending",
  UNLOCKED = "unlocked",
  CLAIMED = "claimed",
  EXPIRED = "expired",
}

export enum QuestActionType {
  CREATE_LEAD = "create_lead",
  COMPLETE_ORDER = "complete_order",
  EARN_XP = "earn_xp",
  EARN_BADGE = "earn_badge",
  MAINTAIN_STREAK = "maintain_streak",
  VISIT_PAGE = "visit_page",
  COMPLETE_PROFILE = "complete_profile",
  SHARE_SOCIAL = "share_social",
}

export enum RewardType {
  XP = "xp",
  BADGE = "badge",
  LEVEL_UP = "level_up",
  EXCLUSIVE_ACCESS = "exclusive_access",
  COMMISSION_BOOST = "commission_boost",
  SPECIAL_TITLE = "special_title",
}
```

## Data Layer Implementation

### XP Service

```typescript
// src/features/gamification/data/xpService.ts

export class SupabaseXPService implements XPRepository {
  async getAffiliateXP(affiliateId: number): Promise<AffiliateXP | null> {
    // Implementation following established patterns
  }

  async addXP(
    affiliateId: number,
    xpAmount: number,
    activityType: ActivityType,
    description: string
  ): Promise<XPEvent> {
    // Implementation with transaction support
  }

  async getXPEvents(
    affiliateId: number,
    limit?: number,
    offset?: number
  ): Promise<XPEvent[]> {
    // Implementation with pagination
  }

  async updateAffiliateLevel(
    affiliateId: number,
    newLevel: number
  ): Promise<void> {
    // Implementation for level updates
  }
}
```

### Badge Service

```typescript
// src/features/gamification/data/badgeService.ts

export class SupabaseBadgeService implements BadgeRepository {
  async getAllBadges(): Promise<Badge[]> {
    // Implementation following established patterns
  }

  async getAffiliateBadges(affiliateId: number): Promise<AffiliateBadge[]> {
    // Implementation with progress tracking
  }

  async earnBadge(
    affiliateId: number,
    badgeId: string
  ): Promise<AffiliateBadge> {
    // Implementation with duplicate prevention
  }

  async checkBadgeEligibility(
    affiliateId: number,
    badgeId: string
  ): Promise<boolean> {
    // Implementation for badge criteria checking
  }
}
```

### Quest Service

```typescript
// src/features/gamification/data/questService.ts

export class SupabaseQuestService implements QuestRepository {
  async getAllQuests(): Promise<Quest[]> {
    // Implementation following established patterns
  }

  async getQuestsByType(questType: QuestType): Promise<Quest[]> {
    // Implementation for filtering quests by type
  }

  async getAffiliateQuests(affiliateId: number): Promise<AffiliateQuest[]> {
    // Implementation with progress tracking
  }

  async startQuest(
    affiliateId: number,
    questId: string
  ): Promise<AffiliateQuest> {
    // Implementation with duplicate prevention
  }

  async updateQuestProgress(
    affiliateId: number,
    questId: string,
    stepId: string
  ): Promise<AffiliateQuest> {
    // Implementation for quest progress updates
  }

  async completeQuest(
    affiliateId: number,
    questId: string
  ): Promise<QuestReward[]> {
    // Implementation for quest completion and reward distribution
  }
}
```

### Bonus Service

```typescript
// src/features/gamification/data/bonusService.ts

export class SupabaseBonusService implements BonusRepository {
  async getAffiliateBonuses(affiliateId: number): Promise<AffiliateBonus[]> {
    // Implementation following established patterns
  }

  async getBonusById(bonusId: string): Promise<AffiliateBonus | null> {
    // Implementation for bonus retrieval
  }

  async createSignupBonus(affiliateId: number): Promise<AffiliateBonus> {
    // Implementation for creating signup bonus
  }

  async checkAndUnlockBonuses(
    affiliateId: number,
    totalXp: number
  ): Promise<AffiliateBonus[]> {
    // Implementation for automatic bonus unlocking
  }

  async claimBonus(bonusId: string): Promise<AffiliateBonus> {
    // Implementation for bonus claiming
  }

  async getBonusConfigurations(): Promise<BonusConfiguration[]> {
    // Implementation for bonus configuration retrieval
  }

  async updateBonusConfiguration(
    configId: string,
    updates: Partial<BonusConfiguration>
  ): Promise<BonusConfiguration> {
    // Implementation for bonus configuration updates
  }
}
```

## Application Layer Implementation

### Gamification Application Service

```typescript
// src/features/gamification/application/services/gamificationApplicationService.ts

export class GamificationApplicationService {
  constructor(
    private xpService: XPRepository,
    private badgeService: BadgeRepository,
    private levelService: LevelRepository,
    private streakService: StreakRepository,
    private leaderboardService: LeaderboardRepository
  ) {}

  async processActivity(
    affiliateId: number,
    activityType: ActivityType,
    activityData: any
  ): Promise<GamificationResult> {
    // Process XP, check badges, update streaks, check level up
  }

  async getAffiliateGamificationData(
    affiliateId: number
  ): Promise<AffiliateGamificationData> {
    // Get comprehensive gamification data for affiliate
  }

  async checkAndAwardBadges(affiliateId: number): Promise<Badge[]> {
    // Check all badge criteria and award eligible badges
  }
}
```

### Bonus Application Service

```typescript
// src/features/gamification/application/services/bonusApplicationService.ts

export class BonusApplicationService {
  constructor(
    private bonusService: BonusRepository,
    private xpService: XPRepository
  ) {}

  async createSignupBonus(affiliateId: number): Promise<AffiliateBonus> {
    // Create signup bonus for new affiliate
  }

  async checkAndUnlockBonuses(affiliateId: number): Promise<AffiliateBonus[]> {
    // Check XP and unlock eligible bonuses
  }

  async claimBonus(
    affiliateId: number,
    bonusId: string
  ): Promise<AffiliateBonus> {
    // Claim unlocked bonus
  }

  async getAffiliateBonuses(affiliateId: number): Promise<AffiliateBonus[]> {
    // Get all affiliate bonuses
  }

  async getBonusProgress(
    affiliateId: number,
    bonusId: string
  ): Promise<{
    currentXp: number;
    requiredXp: number;
    progressPercentage: number;
  }> {
    // Get bonus progress information
  }
}
```

### React Hooks

```typescript
// src/features/gamification/application/useGamification.ts

export const useGamification = (affiliateId: number) => {
  const [gamificationData, setGamificationData] =
    useState<PartnerGamificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Implementation following established hook patterns
};

// src/features/gamification/application/useBonuses.ts

export const useBonuses = (partnerId: number) => {
  const [bonuses, setBonuses] = useState<PartnerBonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Implementation for bonus management
};
```

## Presentation Layer Implementation

### Gamification Dashboard

```typescript
// src/features/gamification/presentation/components/dashboard/GamificationDashboard.tsx

export const GamificationDashboard = () => {
  const { user } = useUser();
  const { data: partner } = usePartnerByEmail(user?.emailAddresses[0]?.emailAddress);
  const { data: gamificationData, isLoading } = useGamification(partner?.id);

  if (isLoading) return <GamificationDashboardSkeleton />;
  if (!gamificationData) return <GamificationNotFound />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <XPCard xp={gamificationData.xp} />
      <LevelCard level={gamificationData.level} />
      <BadgeCard badges={gamificationData.badges} />
      <StreakCard streaks={gamificationData.streaks} />
    </div>
  );
};
```

### Badge Components

```typescript
// src/features/gamification/presentation/components/badges/BadgeGrid.tsx

export const BadgeGrid = ({ badges, onBadgeClick }: BadgeGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <BadgeItem
          key={badge.id}
          badge={badge}
          onClick={() => onBadgeClick(badge)}
        />
      ))}
    </div>
  );
};
```

### Quest Components

```typescript
// src/features/gamification/presentation/components/quests/QuestCard.tsx

interface QuestCardProps {
  quest: Quest;
  partnerQuest?: PartnerQuest;
  onStartQuest: (questId: string) => void;
  onViewDetails: (questId: string) => void;
}

export const QuestCard = ({
  quest,
  partnerQuest,
  onStartQuest,
  onViewDetails
}: QuestCardProps) => {
  const isCompleted = partnerQuest?.status === QuestStatus.COMPLETED;
  const isInProgress = partnerQuest?.status === QuestStatus.IN_PROGRESS;
  const isAvailable = quest.is_active && !partnerQuest;

  return (
    <div className={`p-4 rounded-lg border ${
      isCompleted ? 'bg-green-50 border-green-200' :
      isInProgress ? 'bg-blue-50 border-blue-200' :
      'bg-white border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{quest.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          quest.difficulty === QuestDifficulty.EASY ? 'bg-green-100 text-green-800' :
          quest.difficulty === QuestDifficulty.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
          quest.difficulty === QuestDifficulty.HARD ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {quest.difficulty}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{quest.description}</p>

      {isInProgress && partnerQuest && (
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{partnerQuest.progress}%</span>
          </div>
          <ProgressBar
            current={partnerQuest.progress}
            target={100}
            size="sm"
            variant="default"
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Reward:</span>
          <span className="text-sm font-medium text-blue-600">
            {quest.xp_reward} XP
          </span>
          {quest.badge_reward && (
            <span className="text-sm text-purple-600">+ Badge</span>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(quest.id)}
          >
            Details
          </Button>
          {isAvailable && (
            <Button
              size="sm"
              onClick={() => onStartQuest(quest.id)}
            >
              Start Quest
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// src/features/gamification/presentation/components/quests/QuestDetails.tsx

interface QuestDetailsProps {
  quest: Quest;
  partnerQuest?: PartnerQuest;
  onStartQuest: (questId: string) => void;
  onCompleteStep: (questId: string, stepId: string) => void;
}

export const QuestDetails = ({
  quest,
  partnerQuest,
  onStartQuest,
  onCompleteStep
}: QuestDetailsProps) => {
  const isInProgress = partnerQuest?.status === QuestStatus.IN_PROGRESS;
  const isCompleted = partnerQuest?.status === QuestStatus.COMPLETED;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{quest.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            quest.difficulty === QuestDifficulty.EASY ? 'bg-green-100 text-green-800' :
            quest.difficulty === QuestDifficulty.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
            quest.difficulty === QuestDifficulty.HARD ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {quest.difficulty}
          </span>
        </div>
        <p className="text-gray-600">{quest.description}</p>
      </div>

      {isInProgress && partnerQuest && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{partnerQuest.progress}%</span>
          </div>
          <ProgressBar
            current={partnerQuest.progress}
            target={100}
            variant="default"
            animated={true}
          />
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quest Steps</h2>
        <div className="space-y-3">
          {quest.steps.map((step, index) => {
            const isStepCompleted = partnerQuest?.current_step > step.step_number;
            const isCurrentStep = partnerQuest?.current_step === step.step_number;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg border ${
                  isStepCompleted ? 'bg-green-50 border-green-200' :
                  isCurrentStep ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                    isStepCompleted ? 'bg-green-500 text-white' :
                    isCurrentStep ? 'bg-blue-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {isStepCompleted ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {isCurrentStep && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => onCompleteStep(quest.id, step.id)}
                      >
                        Complete Step
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{quest.xp_reward}</div>
            <div className="text-sm text-gray-500">XP Reward</div>
          </div>
          {quest.badge_reward && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">+</div>
              <div className="text-sm text-gray-500">Badge</div>
            </div>
          )}
        </div>

        {!partnerQuest && (
          <Button onClick={() => onStartQuest(quest.id)}>
            Start Quest
          </Button>
        )}
      </div>
    </div>
  );
};

// src/features/gamification/presentation/components/quests/QuestTutorial.tsx

interface QuestTutorialProps {
  quest: Quest;
  onNext: () => void;
  onSkip: () => void;
}

export const QuestTutorial = ({ quest, onNext, onSkip }: QuestTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < quest.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestStep = quest.steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Quest Tutorial</h2>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {quest.steps.length}</span>
              <span>{Math.round(((currentStep + 1) / quest.steps.length) * 100)}%</span>
            </div>
            <ProgressBar
              current={currentStep + 1}
              target={quest.steps.length}
              size="sm"
              variant="default"
            />
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">
              {currentQuestStep.title}
            </h3>
            <p className="text-sm text-gray-600">
              {currentQuestStep.description}
            </p>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentStep === quest.steps.length - 1 ? 'Start Quest' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Bonus Components

```typescript
// src/features/gamification/presentation/components/bonuses/BonusCard.tsx

interface BonusCardProps {
  bonus: PartnerBonus;
  onClaim: (bonusId: string) => void;
  onViewDetails: (bonusId: string) => void;
}

export const BonusCard = ({
  bonus,
  onClaim,
  onViewDetails
}: BonusCardProps) => {
  const isUnlocked = bonus.status === BonusStatus.UNLOCKED;
  const isClaimed = bonus.status === BonusStatus.CLAIMED;
  const isExpired = bonus.status === BonusStatus.EXPIRED;
  const isPending = bonus.status === BonusStatus.PENDING;

  const progressPercentage = (bonus.xp_earned / bonus.xp_required) * 100;

  return (
    <div className={`p-4 rounded-lg border ${
      isClaimed ? 'bg-green-50 border-green-200' :
      isUnlocked ? 'bg-blue-50 border-blue-200' :
      isExpired ? 'bg-red-50 border-red-200' :
      'bg-white border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{bonus.bonus_type}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isClaimed ? 'bg-green-100 text-green-800' :
          isUnlocked ? 'bg-blue-100 text-blue-800' :
          isExpired ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {bonus.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{bonus.description}</p>

      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Amount</span>
          <span className="font-medium text-green-600">
            {bonus.bonus_amount} {bonus.currency}
          </span>
        </div>
      </div>

      {isPending && (
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{bonus.xp_earned}/{bonus.xp_required} XP</span>
          </div>
          <ProgressBar
            current={progressPercentage}
            target={100}
            size="sm"
            variant="default"
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Required:</span>
          <span className="text-sm font-medium text-blue-600">
            {bonus.xp_required} XP
          </span>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(bonus.id)}
          >
            Details
          </Button>
          {isUnlocked && (
            <Button
              size="sm"
              onClick={() => onClaim(bonus.id)}
            >
              Claim Bonus
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// src/features/gamification/presentation/components/bonuses/BonusList.tsx

interface BonusListProps {
  bonuses: PartnerBonus[];
  onClaim: (bonusId: string) => void;
  onViewDetails: (bonusId: string) => void;
}

export const BonusList = ({
  bonuses,
  onClaim,
  onViewDetails
}: BonusListProps) => {
  const pendingBonuses = bonuses.filter(b => b.status === BonusStatus.PENDING);
  const unlockedBonuses = bonuses.filter(b => b.status === BonusStatus.UNLOCKED);
  const claimedBonuses = bonuses.filter(b => b.status === BonusStatus.CLAIMED);

  return (
    <div className="space-y-6">
      {unlockedBonuses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available to Claim</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unlockedBonuses.map((bonus) => (
              <BonusCard
                key={bonus.id}
                bonus={bonus}
                onClaim={onClaim}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {pendingBonuses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">In Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingBonuses.map((bonus) => (
              <BonusCard
                key={bonus.id}
                bonus={bonus}
                onClaim={onClaim}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {claimedBonuses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Claimed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claimedBonuses.map((bonus) => (
              <BonusCard
                key={bonus.id}
                bonus={bonus}
                onClaim={onClaim}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### Progress Bar Components

```typescript
// src/features/gamification/presentation/components/progress/ProgressBar.tsx

interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const ProgressBar = ({
  current,
  target,
  label,
  showPercentage = true,
  variant = 'default',
  size = 'md',
  animated = true
}: ProgressBarProps) => {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3'}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            variant === 'success' ? 'bg-green-500' :
            variant === 'warning' ? 'bg-yellow-500' :
            variant === 'danger' ? 'bg-red-500' :
            'bg-blue-500'
          } ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// src/features/gamification/presentation/components/progress/XPProgressBar.tsx

interface XPProgressBarProps {
  currentXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  totalXPForNextLevel: number;
}

export const XPProgressBar = ({
  currentXP,
  currentLevel,
  xpToNextLevel,
  totalXPForNextLevel
}: XPProgressBarProps) => {
  const xpInCurrentLevel = currentXP - (totalXPForNextLevel - xpToNextLevel);
  const progressPercentage = (xpInCurrentLevel / xpToNextLevel) * 100;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Level {currentLevel}
        </span>
        <span className="text-sm text-gray-500">
          {xpInCurrentLevel.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
        </span>
      </div>
      <ProgressBar
        current={xpInCurrentLevel}
        target={xpToNextLevel}
        variant="success"
        animated={true}
      />
      <div className="mt-2 text-xs text-gray-500">
        {xpToNextLevel - xpInCurrentLevel} XP to next level
      </div>
    </div>
  );
};

// src/features/gamification/presentation/components/progress/BadgeProgressBar.tsx

interface BadgeProgressBarProps {
  badge: Badge;
  progress: number;
  isEarned: boolean;
}

export const BadgeProgressBar = ({
  badge,
  progress,
  isEarned
}: BadgeProgressBarProps) => {
  const progressPercentage = isEarned ? 100 : (progress / badge.criteria.target) * 100;

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">
        <img
          src={badge.icon_url}
          alt={badge.name}
          className={`w-8 h-8 ${isEarned ? '' : 'opacity-50 grayscale'}`}
        />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-900">
            {badge.name}
          </span>
          <span className="text-xs text-gray-500">
            {isEarned ? 'Earned!' : `${progress}/${badge.criteria.target}`}
          </span>
        </div>
        <ProgressBar
          current={progress}
          target={badge.criteria.target}
          variant={isEarned ? 'success' : 'default'}
          size="sm"
        />
      </div>
    </div>
  );
};

// src/features/gamification/presentation/components/progress/CircularProgress.tsx

interface CircularProgressProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const CircularProgress = ({
  current,
  target,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  variant = 'default'
}: CircularProgressProps) => {
  const percentage = Math.min((current / target) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    switch (variant) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'danger': return '#EF4444';
      default: return '#3B82F6';
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

// src/features/gamification/presentation/components/progress/MultiStepProgress.tsx

interface Step {
  id: string;
  title: string;
  completed: boolean;
  current: boolean;
}

interface MultiStepProgressProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
}

export const MultiStepProgress = ({
  steps,
  orientation = 'horizontal'
}: MultiStepProgressProps) => {
  if (orientation === 'vertical') {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : step.current
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.completed ? '✓' : index + 1}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : step.current
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="ml-2 text-sm font-medium text-gray-900">
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={`h-0.5 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Database Schema

### Tables Structure

```sql
-- Affiliate XP tracking
CREATE TABLE affiliate_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XP events history
CREATE TABLE xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  xp_amount INTEGER NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_id VARCHAR(100),
  description TEXT NOT NULL,
  multiplier DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges definition
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_url VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  rarity VARCHAR(20) NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate badges earned
CREATE TABLE affiliate_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  badge_id UUID NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  is_earned BOOLEAN DEFAULT false,
  UNIQUE(affiliate_id, badge_id)
);

-- Levels definition
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INTEGER NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  xp_required INTEGER NOT NULL,
  benefits JSONB,
  icon_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true
);

-- Streaks tracking
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  streak_type VARCHAR(50) NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(affiliate_id, streak_type)
);

-- Leaderboard cache
CREATE TABLE leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type VARCHAR(50) NOT NULL,
  period VARCHAR(20) NOT NULL,
  entries JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Quests definition
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  quest_type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  badge_reward UUID REFERENCES badges(id),
  requirements JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_repeatable BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quest steps
CREATE TABLE quest_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_data JSONB DEFAULT '{}',
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quest_id, step_number)
);

-- Affiliate quests
CREATE TABLE affiliate_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  quest_id UUID NOT NULL REFERENCES quests(id),
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_step INTEGER DEFAULT 1,
  UNIQUE(affiliate_id, quest_id)
);

-- Quest rewards
CREATE TABLE quest_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id),
  reward_type VARCHAR(50) NOT NULL,
  reward_value INTEGER NOT NULL,
  reward_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal**: Set up core gamification infrastructure

#### Tasks:

1. **Database Setup**
   - Create gamification tables
   - Set up indexes and constraints
   - Create initial data (levels, badges)

2. **Domain Layer**
   - Implement core entities
   - Define value objects and enums
   - Create repository interfaces
   - Set up validation schemas

3. **Data Layer**
   - Implement XP service
   - Implement badge service
   - Implement level service
   - Add comprehensive tests

#### Deliverables:

- Complete database schema
- Domain entities and value objects
- Data layer services with tests
- Repository interfaces

### Phase 2: Core Features (Week 3-4)

**Goal**: Implement XP and level systems

#### Tasks:

1. **XP System**
   - XP earning logic
   - XP history tracking
   - Level progression
   - XP multipliers

2. **Level System**
   - Level calculation
   - Level benefits
   - Level-up notifications
   - Level progression tracking

3. **Application Layer**
   - Gamification application service
   - XP application service
   - Level application service
   - React hooks for XP and levels

#### Deliverables:

- Working XP system
- Level progression system
- Application services with tests
- React hooks with tests

### Phase 3: Badge System (Week 5-6)

**Goal**: Implement badge system with criteria checking

#### Tasks:

1. **Badge System**
   - Badge definition and management
   - Badge criteria checking
   - Badge earning logic
   - Badge progress tracking

2. **Badge Categories**
   - Performance badges
   - Consistency badges
   - Milestone badges
   - Social badges

3. **Presentation Layer**
   - Badge components
   - Badge grid and details
   - Badge progress indicators
   - Badge notifications
   - Progress bar components for all gamification elements

#### Deliverables:

- Complete badge system
- Badge management interface
- Badge earning logic
- Badge display components

### Phase 3.5: Quest System (Week 6-7)

**Goal**: Implement guided quest system for partner onboarding and engagement

#### Tasks:

1. **Quest System**
   - Quest definition and management
   - Quest step tracking
   - Quest progress calculation
   - Quest completion logic

2. **Quest Types**
   - Tutorial quests for onboarding
   - Daily and weekly quests
   - Achievement quests
   - Special event quests

3. **Quest Features**
   - Quest tutorials and guidance
   - Step-by-step progress tracking
   - Quest rewards and benefits
   - Quest expiration and renewal

4. **Presentation Layer**
   - Quest cards and lists
   - Quest details and progress
   - Quest tutorials and guides
   - Quest completion celebrations

#### Deliverables:

- Complete quest system
- Quest management interface
- Quest progress tracking
- Quest display components

### Phase 4: Streak System (Week 7-8)

**Goal**: Implement streak tracking and maintenance

#### Tasks:

1. **Streak System**
   - Streak calculation
   - Streak maintenance
   - Streak recovery
   - Streak bonuses

2. **Streak Types**
   - Daily login streaks
   - Lead creation streaks
   - Order completion streaks

3. **Streak Features**
   - Streak notifications
   - Streak protection
   - Streak recovery options

#### Deliverables:

- Streak tracking system
- Streak maintenance logic
- Streak display components
- Streak notifications

### Phase 5: Leaderboards (Week 9-10)

**Goal**: Implement leaderboard system with caching

#### Tasks:

1. **Leaderboard System**
   - Leaderboard calculation
   - Leaderboard caching
   - Leaderboard updates
   - Leaderboard queries

2. **Leaderboard Types**
   - XP leaderboards
   - Badge leaderboards
   - Streak leaderboards
   - Performance leaderboards

3. **Leaderboard Features**
   - Multiple time periods
   - Ranking algorithms
   - Leaderboard filters
   - Leaderboard pagination

#### Deliverables:

- Leaderboard system
- Leaderboard caching
- Leaderboard components
- Leaderboard management

### Phase 6: Integration & Polish (Week 11-12)

**Goal**: Integrate all systems and add polish

#### Tasks:

1. **System Integration**
   - Integrate all gamification features
   - Cross-feature interactions
   - Performance optimization
   - Error handling

2. **UI/UX Polish**
   - Gamification dashboard
   - Achievement notifications
   - Progress animations
   - Mobile responsiveness
   - Comprehensive progress bar system
   - Visual feedback for all gamification elements

3. **Testing & Documentation**
   - Integration tests
   - End-to-end tests
   - Performance tests
   - Documentation updates

#### Deliverables:

- Complete gamification system
- Polished user interface
- Comprehensive test coverage
- Updated documentation

## Testing Strategy

### Test Coverage Requirements

- **Unit Tests**: 90%+ coverage for all services and hooks
- **Integration Tests**: All cross-feature interactions
- **E2E Tests**: Complete user journeys
- **Performance Tests**: Load testing for leaderboards

### Test Patterns

Following established patterns from existing features:

```typescript
// Data Layer Tests
describe("SupabaseXPService", () => {
  beforeEach(() => {
    // Mock DatabaseWrapper and withPerformanceTracking
    mockDatabaseWrapper.executeQuery.mockImplementation(async (queryFn) => {
      const result = await queryFn();
      return result.data;
    });

    mockWithPerformanceTracking.mockImplementation(
      async (service, method, fn) => {
        return await fn();
      }
    );
  });

  it("should add XP successfully", async () => {
    // Test implementation following established patterns
  });
});

// Application Layer Tests
describe("GamificationApplicationService", () => {
  it("should process activity and award XP", async () => {
    // Test with proper mocking
  });
});

// React Hook Tests
describe("useGamification", () => {
  it("should return gamification data", async () => {
    // Test with useAsyncOperation mocking
  });
});
```

## Progress Bar System

### Progress Bar Types

The gamification system includes multiple types of progress bars to provide visual feedback for different gamification elements:

#### 1. **Linear Progress Bars**

- **XP Progress**: Shows current level progress with XP remaining
- **Badge Progress**: Displays progress toward earning specific badges
- **Streak Progress**: Visual representation of streak maintenance
- **Goal Progress**: Track progress toward specific objectives

#### 2. **Circular Progress Bars**

- **Level Overview**: Circular display of current level progress
- **Achievement Summary**: Overall completion percentage
- **Quick Stats**: Compact progress indicators for dashboard cards

#### 3. **Multi-Step Progress**

- **Badge Requirements**: Step-by-step progress for complex badges
- **Level Milestones**: Progress through level requirements
- **Achievement Paths**: Visual journey through achievement sequences

#### 4. **Animated Progress Bars**

- **Real-time Updates**: Smooth animations when XP is earned
- **Level-up Animations**: Special effects when leveling up
- **Achievement Unlocks**: Animated progress when badges are earned

### Progress Bar Features

#### Visual Design

- **Color Coding**: Different colors for different types of progress
  - Green: Completed/Success
  - Blue: In Progress
  - Yellow: Warning/Attention needed
  - Red: Failed/Behind schedule
- **Size Variants**: Small, medium, large for different contexts
- **Responsive Design**: Adapts to different screen sizes

#### Interactive Elements

- **Hover Effects**: Show detailed information on hover
- **Click Actions**: Navigate to detailed views
- **Tooltips**: Display additional context and information
- **Progress Animations**: Smooth transitions and effects

#### Data Integration

- **Real-time Updates**: Progress bars update immediately when data changes
- **Historical Data**: Show progress over time
- **Comparative Views**: Compare progress with other partners
- **Trend Indicators**: Show whether progress is increasing or decreasing

### Implementation Examples

#### XP Progress Bar Usage

```typescript
// In dashboard components
<XPProgressBar
  currentXP={partnerXP.total_xp}
  currentLevel={partnerXP.current_level}
  xpToNextLevel={partnerXP.xp_to_next_level}
  totalXPForNextLevel={nextLevel.xp_required}
/>

// In level progression views
<CircularProgress
  current={currentXP}
  target={nextLevelXP}
  size={150}
  variant="success"
  showPercentage={true}
/>
```

#### Badge Progress Integration

```typescript
// In badge collection views
{badges.map(badge => (
  <BadgeProgressBar
    key={badge.id}
    badge={badge}
    progress={badgeProgress[badge.id]}
    isEarned={earnedBadges.includes(badge.id)}
  />
))}
```

#### Streak Progress Display

```typescript
// In streak tracking components
<ProgressBar
  current={currentStreak}
  target={streakGoal}
  label={`${streakType} Streak`}
  variant={currentStreak >= streakGoal ? 'success' : 'default'}
  animated={true}
/>
```

### Progress Bar Customization

#### Theme Integration

- **Brand Colors**: Use platform brand colors for consistency
- **Dark Mode**: Adapt colors for dark theme
- **Accessibility**: High contrast options for accessibility
- **Custom Styling**: Allow partners to customize progress bar appearance

#### Animation Options

- **Smooth Transitions**: CSS transitions for smooth progress updates
- **Pulse Effects**: Subtle animations to draw attention
- **Completion Celebrations**: Special effects when goals are reached
- **Loading States**: Skeleton loaders while data is being fetched

#### Performance Optimization

- **Lazy Loading**: Load progress bar components only when needed
- **Memoization**: Cache progress calculations to avoid unnecessary re-renders
- **Debounced Updates**: Prevent excessive updates during rapid changes
- **Efficient Animations**: Use CSS transforms for smooth performance

### Progress Bar Analytics

#### User Engagement Metrics

- **Progress Viewing**: Track which progress bars are viewed most
- **Interaction Rates**: Monitor clicks and hovers on progress elements
- **Completion Rates**: Measure how often users complete progress goals
- **Time to Completion**: Track how long it takes to reach milestones

#### A/B Testing

- **Progress Bar Designs**: Test different visual designs
- **Animation Styles**: Compare different animation approaches
- **Color Schemes**: Test various color combinations
- **Layout Options**: Experiment with different progress bar layouts

## Guided Quest System

### Quest System Overview

The guided quest system provides structured, step-by-step guidance to help partners navigate the platform and achieve their goals. It combines tutorial elements with gamification to create an engaging onboarding and engagement experience.

### Quest Types

#### 1. **Tutorial Quests**

- **Onboarding Quests**: Guide new partners through platform setup
- **Feature Introduction**: Introduce specific platform features
- **Best Practices**: Teach optimal platform usage
- **Goal**: Ensure partners understand how to use the platform effectively

#### 2. **Daily Quests**

- **Daily Login**: Encourage daily platform engagement
- **Daily Activities**: Simple tasks to maintain engagement
- **Daily Goals**: Achievable daily objectives
- **Goal**: Maintain consistent partner engagement

#### 3. **Weekly Quests**

- **Weekly Challenges**: More complex weekly objectives
- **Performance Goals**: Weekly performance targets
- **Skill Development**: Weekly learning objectives
- **Goal**: Provide medium-term engagement goals

#### 4. **Achievement Quests**

- **Milestone Quests**: Major platform milestones
- **Skill Mastery**: Advanced platform features
- **Performance Excellence**: High-performance achievements
- **Goal**: Recognize and reward significant achievements

#### 5. **Special Event Quests**

- **Seasonal Events**: Holiday or seasonal challenges
- **Campaign Quests**: Marketing campaign participation
- **Community Events**: Partner community engagement
- **Goal**: Create excitement and community engagement

### Quest Features

#### Quest Structure

- **Multi-Step Design**: Break complex tasks into manageable steps
- **Progressive Difficulty**: Start easy and increase complexity
- **Clear Objectives**: Each step has clear, actionable objectives
- **Visual Progress**: Show progress through quest completion

#### Quest Guidance

- **Interactive Tutorials**: Step-by-step guided tutorials
- **Contextual Help**: Help text and tips at each step
- **Video Guides**: Optional video explanations
- **Tooltips and Hints**: Contextual assistance throughout

#### Quest Rewards

- **XP Rewards**: Experience points for quest completion
- **Badge Rewards**: Special badges for quest achievements
- **Unlock Rewards**: Unlock new features or content
- **Bonus Rewards**: Additional rewards for quick completion

### Quest Implementation Examples

#### Onboarding Quest Example

```typescript
const onboardingQuest: Quest = {
  id: "onboarding-001",
  title: "Welcome to Referio!",
  description: "Complete your profile and learn the basics",
  quest_type: QuestType.ONBOARDING,
  difficulty: QuestDifficulty.EASY,
  xp_reward: 100,
  steps: [
    {
      id: "step-1",
      title: "Complete Your Profile",
      description: "Add your personal information and profile picture",
      action_type: QuestActionType.COMPLETE_PROFILE,
      action_data: { required_fields: ["name", "email", "avatar"] },
    },
    {
      id: "step-2",
      title: "Explore the Dashboard",
      description: "Take a tour of your partner dashboard",
      action_type: QuestActionType.VISIT_PAGE,
      action_data: { page: "/dashboard" },
    },
    {
      id: "step-3",
      title: "Create Your First Lead",
      description: "Learn how to create and manage leads",
      action_type: QuestActionType.CREATE_LEAD,
      action_data: { min_leads: 1 },
    },
  ],
};
```

#### Daily Quest Example

```typescript
const dailyQuest: Quest = {
  id: "daily-001",
  title: "Daily Engagement",
  description: "Complete your daily platform activities",
  quest_type: QuestType.DAILY,
  difficulty: QuestDifficulty.EASY,
  xp_reward: 50,
  is_repeatable: true,
  expires_at: "2024-01-02T00:00:00Z",
  steps: [
    {
      id: "daily-step-1",
      title: "Login to Platform",
      description: "Visit the platform today",
      action_type: QuestActionType.VISIT_PAGE,
      action_data: { page: "/dashboard" },
    },
    {
      id: "daily-step-2",
      title: "Check Your Stats",
      description: "Review your performance metrics",
      action_type: QuestActionType.VISIT_PAGE,
      action_data: { page: "/stats" },
    },
  ],
};
```

### Quest Management

#### Quest Creation

- **Admin Interface**: Create and manage quests through admin panel
- **Quest Templates**: Pre-built quest templates for common scenarios
- **Quest Scheduling**: Schedule quests for specific times or events
- **Quest Targeting**: Target quests to specific partner segments

#### Quest Analytics

- **Completion Rates**: Track quest completion rates
- **Time to Completion**: Measure how long quests take to complete
- **Drop-off Points**: Identify where partners abandon quests
- **Engagement Impact**: Measure quest impact on partner engagement

#### Quest Optimization

- **A/B Testing**: Test different quest designs and flows
- **Difficulty Adjustment**: Adjust quest difficulty based on completion rates
- **Reward Optimization**: Optimize rewards for maximum engagement
- **Content Updates**: Regularly update quest content and objectives

### Quest Integration

#### Platform Integration

- **Feature Unlocking**: Quests can unlock new platform features
- **Content Access**: Quests can provide access to exclusive content
- **Tool Access**: Quests can unlock advanced tools and features
- **Community Access**: Quests can provide access to partner communities

#### Gamification Integration

- **XP Integration**: Quests provide XP rewards
- **Badge Integration**: Quests can award special badges
- **Level Integration**: Quest completion contributes to level progression
- **Streak Integration**: Quest completion can maintain streaks

#### Notification System

- **Quest Notifications**: Notify partners of new available quests
- **Progress Updates**: Notify partners of quest progress
- **Completion Celebrations**: Celebrate quest completion
- **Reminder System**: Remind partners of incomplete quests

## Performance Considerations

### Database Optimization

- **Indexes**: Strategic indexes on frequently queried columns
- **Partitioning**: Partition large tables by date ranges
- **Caching**: Redis cache for leaderboards and frequently accessed data

### Application Optimization

- **Lazy Loading**: Load gamification data on demand
- **Caching**: Client-side caching for static data
- **Pagination**: Implement pagination for large datasets
- **Background Jobs**: Process gamification updates asynchronously

### Monitoring

- **Performance Metrics**: Track gamification system performance
- **User Engagement**: Monitor gamification feature usage
- **Error Tracking**: Comprehensive error logging and monitoring

## Security Considerations

### Data Protection

- **Input Validation**: Validate all gamification inputs
- **Rate Limiting**: Prevent XP farming and abuse
- **Audit Logging**: Track all gamification activities
- **Access Control**: Ensure proper authorization

### Anti-Cheating

- **Server-Side Validation**: All gamification logic on server
- **Activity Verification**: Verify activities before awarding XP
- **Suspicious Activity Detection**: Monitor for unusual patterns
- **Rollback Capability**: Ability to reverse fraudulent activities

## Migration Strategy

### Data Migration

1. **Existing Partners**: Initialize XP and level data for existing partners
2. **Historical Data**: Calculate initial XP based on historical activities
3. **Badge Assignment**: Award badges based on historical performance
4. **Streak Calculation**: Calculate initial streaks from activity history

### Rollout Strategy

1. **Beta Testing**: Limited rollout to select partners
2. **Gradual Rollout**: Phased rollout to all partners
3. **Feature Flags**: Use feature flags for gradual feature activation
4. **Monitoring**: Continuous monitoring during rollout

## Success Metrics

### Engagement Metrics

- **Daily Active Users**: Increase in partner engagement
- **Session Duration**: Longer time spent on platform
- **Feature Usage**: Usage of gamification features
- **Retention Rate**: Improved partner retention

### Business Metrics

- **Lead Generation**: Increase in lead creation
- **Order Completion**: Higher order completion rates
- **Partner Satisfaction**: Improved partner satisfaction scores
- **Revenue Impact**: Positive impact on platform revenue

## Maintenance & Updates

### Regular Maintenance

- **Data Cleanup**: Regular cleanup of old data
- **Performance Monitoring**: Continuous performance monitoring
- **Bug Fixes**: Regular bug fixes and improvements
- **Feature Updates**: Regular feature updates and enhancements

### Future Enhancements

- **New Badge Types**: Additional badge categories
- **Advanced Leaderboards**: More sophisticated ranking algorithms
- **Social Features**: Partner-to-partner interactions
- **Mobile App**: Dedicated mobile app for gamification
- **API Integration**: Third-party integrations

## Conclusion

This comprehensive gamification implementation plan provides a structured approach to adding engaging features to the Referio platform. By following the established architecture patterns and implementing in phases, we can create a robust, scalable, and maintainable gamification system that enhances partner engagement and drives business results.

The plan emphasizes:

- **Clean Architecture**: Following established domain-driven design patterns
- **Comprehensive Testing**: Following proven testing patterns from existing features
- **Performance Optimization**: Ensuring scalability and performance
- **Security**: Implementing proper security measures
- **User Experience**: Creating engaging and intuitive interfaces

This implementation will significantly enhance partner engagement and drive platform growth while maintaining the high code quality standards established in the project.
