# Gamification Feature Guide

## Overview

The gamification system is a reward and engagement feature that motivates affiliates through XP (Experience Points), levels, badges, streaks, quests, bonuses, and leaderboards. Think of it like a video game where users earn points and rewards for their activities.

## Core Concept

**Simple Idea**: When affiliates do things (create orders, complete courses, etc.), they earn XP. As XP grows, they level up, unlock badges, maintain streaks, complete quests, and earn bonuses. Everything is tracked and ranked on leaderboards.

---

## Main Components

### 1. **XP (Experience Points)** 🎯

**What it is**: Points earned for doing activities.

**How it works**:

- Every action (order created, course completed, etc.) gives XP
- XP accumulates over time
- More XP = Higher level
- XP events are logged for history tracking

**Example**:

- Create an order → +50 XP
- Complete a course → +200 XP
- Refer a friend → +100 XP

---

### 2. **Levels** 📈

**What it is**: Progression tiers based on total XP.

**How it works**:

- Start at Level 1 with 0 XP
- Need a certain amount of XP to reach each level
- Higher levels unlock better benefits
- Level increases automatically when XP threshold is reached

**Example**:

- Level 1: 0-99 XP
- Level 2: 100-249 XP
- Level 3: 250-499 XP
- And so on...

---

### 3. **Badges** 🏆

**What it is**: Achievements awarded for reaching milestones.

**How it works**:

- Badges have requirements (e.g., "Complete 10 orders", "Reach Level 5")
- System automatically checks if affiliate meets requirements
- Badges can be earned only once (some are repeatable)
- Earning a badge gives bonus XP

**Badge Types**:

- **Milestone Badges**: "First Order", "10 Orders", "100 Orders"
- **Level Badges**: "Level 5 Reached", "Level 10 Reached"
- **Activity Badges**: "Course Master", "Social Star"
- **Rarity**: Common, Rare, Epic, Legendary

---

### 4. **Streaks** 🔥

**What it is**: Consecutive days of activity tracking.

**How it works**:

- Track daily activity (e.g., daily login, daily order)
- Streak continues if activity happens every day
- Streak breaks if a day is missed
- Track both "current streak" and "longest streak ever"

**Example**:

- Login 3 days in a row → 3-day streak
- Miss a day → streak resets to 0
- Longest streak: 10 days (personal best)

---

### 5. **Quests** 📜

**What it is**: Challenges with specific goals and rewards.

**How it works**:

- Quests have multiple steps to complete
- Each step requires a specific action
- Complete all steps → Quest completed → Rewards unlocked
- Rewards can be XP, badges, or bonuses

**Quest Example**:

1. **Step 1**: Create your first order (+50 XP)
2. **Step 2**: Complete a course (+200 XP)
3. **Step 3**: Refer 3 friends (+300 XP)
4. **Completion**: Unlock "Beginner Master" badge

---

### 6. **Bonuses** 💰

**What it is**: Financial rewards unlocked by reaching XP milestones.

**How it works**:

- Bonuses require certain XP amounts
- Start as "pending" (not unlocked yet)
- Become "unlocked" when XP requirement is met
- Affiliate must "claim" the bonus to receive it
- Some bonuses have expiration dates

**Bonus Example**:

- **Signup Bonus**: Earn 100 XP → Unlock 1000 DZD bonus → Claim it
- **Level 5 Bonus**: Reach Level 5 → Unlock 5000 DZD bonus

---

### 7. **Leaderboards** 🏅

**What it is**: Rankings showing top performers.

**How it works**:

- Rank affiliates by different metrics (XP, orders, courses, etc.)
- Show top 10, top 50, or top 100
- Updated periodically (daily, weekly, monthly)
- Cached for performance

**Leaderboard Types**:

- **XP Leaderboard**: Highest total XP
- **Orders Leaderboard**: Most orders created
- **Courses Leaderboard**: Most courses completed
- **Streaks Leaderboard**: Longest active streaks

---

## How It All Works Together

### The Flow: When an Affiliate Completes an Action

```
1. Affiliate creates an order
   ↓
2. System awards XP (e.g., +50 XP)
   ↓
3. System checks for level up (if XP threshold reached)
   ↓
4. System checks for badge eligibility (new badges unlocked?)
   ↓
5. System updates streaks (daily activity tracked)
   ↓
6. System checks quest progress (quest steps completed?)
   ↓
7. System checks bonus eligibility (XP milestone reached?)
   ↓
8. Leaderboards updated (if needed)
```

### Example Flow in Detail

**Scenario**: Affiliate creates their 10th order

```
1. Order created → System receives event
   ↓
2. Award 50 XP → Total XP: 500 → 550
   ↓
3. Check level: 550 XP = Level 3 reached! 🎉
   ↓
4. Check badges: "10 Orders" badge unlocked! 🏆
   ↓
5. Award badge → Badge gives +25 bonus XP → Total: 575 XP
   ↓
6. Update streak: Daily order streak = 7 days 🔥
   ↓
7. Check quest: "Complete 10 Orders" quest step completed ✅
   ↓
8. Check bonus: Level 3 bonus unlocked (requires 550 XP) 💰
   ↓
9. Update leaderboard: Affiliate moves up in rankings 📈
```

---

## Database Tables

### Core Tables

- **`affiliate_xp`**: Stores each affiliate's total XP, current level, and XP to next level
- **`xp_events`**: Logs every XP-earning activity with details
  - `activity_type`: The type of activity (e.g., "order_created", "course_completed")
  - `activity_id`: Optional reference to the related entity (e.g., order ID, course ID)
  - Note: There is NO separate "activities" table. `activity_id` is a polymorphic reference that can point to different tables based on `activity_type`
- **`levels`**: Defines level thresholds and benefits
- **`badges`**: Master list of available badges
- **`affiliate_badges`**: Tracks which badges each affiliate has earned
- **`streaks`**: Tracks daily activity streaks per affiliate
- **`quests`**: Available quests with steps and rewards
- **`affiliate_quests`**: Tracks affiliate progress on quests
- **`affiliate_bonuses`**: Tracks unlocked and claimed bonuses
- **`leaderboard_cache`**: Cached leaderboard rankings for performance

### How `activity_id` Works

The `activity_id` field in `xp_events` is a flexible reference system:

- **`activity_type`** = `"order_created"` → `activity_id` = order UUID
- **`activity_type`** = `"course_completed"` → `activity_id` = course UUID
- **`activity_type`** = `"badge_earned"` → `activity_id` = badge UUID
- **`activity_type`** = `"daily_login"` → `activity_id` = `null` (no specific entity)

This allows tracking XP events back to their source without requiring a separate activities table.

---

## API Usage

### React Hook: `useGamification`

```typescript
import { useGamification } from "@/features/gamification";

// Get full gamification data for an affiliate
const { data, isLoading } = useGamification(affiliateId);

// Returns:
// - XP profile (total XP, level, XP to next level)
// - Earned badges
// - Active streaks
// - Active quests
// - Available bonuses
// - Recent XP events
```

### Adding XP (Usually Automatic)

```typescript
import { gamificationApplicationService } from "@/features/gamification";

// When affiliate creates an order
await gamificationApplicationService.addXP(
  affiliateId,
  50, // XP amount
  "order_created", // Activity type
  { orderId: "123" } // Optional metadata
);
```

### Getting Specific Data

```typescript
// Get affiliate XP
const xp = await gamificationApplicationService.getAffiliateXP(affiliateId);

// Get badges
const badges =
  await gamificationApplicationService.getAffiliateBadges(affiliateId);

// Get leaderboard
const leaderboard = await gamificationApplicationService.getLeaderboard(
  "xp",
  "monthly"
);
```

---

## Key Features

### ✅ Automatic Tracking

- XP awarded automatically when actions occur
- Badges, bonuses, and levels checked automatically
- No manual intervention needed

### ✅ Real-time Updates

- Leaderboards refresh periodically
- XP and levels update immediately
- Badges awarded instantly

### ✅ Flexible Configuration

- XP amounts configurable per activity
- Badge requirements customizable
- Quest steps and rewards adjustable
- Bonus amounts and XP thresholds configurable

### ✅ Performance Optimized

- Leaderboards cached for fast loading
- Database queries optimized
- Batch operations where possible

---

## Configuration

### Setting XP Values

Configure how much XP different activities give:

```typescript
// Example configuration
{
  'order_created': 50,
  'course_completed': 200,
  'referral_made': 100,
  'daily_login': 10
}
```

### Creating Badges

Define badge requirements in database:

```json
{
  "badge_id": "first_order",
  "name": "First Order",
  "requirement": {
    "type": "total_orders",
    "value": 1
  },
  "xp_reward": 25
}
```

### Setting Up Quests

Create quests with steps:

1. Define quest with title, description, rewards
2. Add quest steps (specific actions to complete)
3. Set quest as active
4. Affiliates can start and progress through quest

---

## Best Practices

### 🎯 Keep It Engaging

- Balance XP rewards (not too high, not too low)
- Make badges meaningful and achievable
- Create varied quests for different play styles

### 📊 Monitor Performance

- Track which badges are most earned
- Monitor quest completion rates
- Analyze leaderboard engagement

### 🔄 Regular Updates

- Add new badges periodically
- Create seasonal quests
- Update bonus amounts based on business goals

---

## Summary

The gamification system is a complete engagement platform that:

- **Rewards** affiliates for activities (XP, badges, bonuses)
- **Tracks** progress (levels, streaks, quests)
- **Motivates** through competition (leaderboards)
- **Automates** everything (no manual work needed)

It transforms routine activities into a fun, game-like experience that keeps affiliates engaged and motivated! 🎮✨
