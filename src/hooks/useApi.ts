/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🪝 REACT QUERY HOOKS - Synced with Discord Bot v3.8.2
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, listsApi, itemsApi, classesApi, skillsApi, achievementsApi, leaderboardApi, gamesApi } from '@/lib/api';
import { toast } from 'sonner';

// Helper to show achievement notifications
function showAchievementNotifications(newAchievements: any[], queryClient: any) {
  if (newAchievements && newAchievements.length > 0) {
    newAchievements.forEach((ach: any) => {
      toast.success(`🏆 Achievement Unlocked: ${ach.name}!`, {
        description: ach.description,
        duration: 5000,
      });
    });
    // Refresh achievements data
    queryClient.invalidateQueries({ queryKey: ['achievements'] });
    // Also refresh user data (for achievement count on dashboard)
    queryClient.invalidateQueries({ queryKey: ['user'] });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MOCK DATA - Synced from Discord Bot v3.8.2
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_LISTS = [
  { id: 1, name: 'Weekly Goals', description: 'Important tasks for this week', category: 'Personal', priority: 'HIGH', deadline: null, itemsTotal: 5, itemsCompleted: 3, created_at: new Date().toISOString() },
  { id: 2, name: 'Work Projects', description: 'Current work assignments', category: 'Work', priority: 'MEDIUM', deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString(), itemsTotal: 8, itemsCompleted: 5, created_at: new Date().toISOString() },
];

const MOCK_ITEMS: Record<number, any[]> = {
  1: [
    { id: 1, name: 'Complete project proposal', description: 'Draft and submit the Q1 proposal', completed: true, position: 1 },
    { id: 2, name: 'Review team updates', description: '', completed: true, position: 2 },
    { id: 3, name: 'Schedule meetings', description: 'Set up weekly sync calls', completed: true, position: 3 },
    { id: 4, name: 'Update documentation', description: '', completed: false, position: 4 },
    { id: 5, name: 'Send weekly report', description: 'Include metrics from this week', completed: false, position: 5 },
  ],
  2: [
    { id: 6, name: 'API integration', description: 'Connect to external services', completed: true, position: 1 },
    { id: 7, name: 'Unit tests', description: '', completed: true, position: 2 },
  ],
};

// Classes - EXACT match from Discord bot (gameLogic.js)
const MOCK_CLASSES = {
  classes: [
    { key: 'DEFAULT', name: 'Default', emoji: '⚪', description: 'No XP bonus. Balanced starter class.', playstyle: 'Standard XP gains with no modifiers', cost: 0, owned: true, equipped: true },
    { key: 'HERO', name: 'Hero', emoji: '⚔️', description: '+25 XP on every action. Reliable and simple.', playstyle: 'Consistent bonus XP on everything', cost: 500, owned: false, equipped: false },
    { key: 'GAMBLER', name: 'Gambler', emoji: '🎲', description: 'RNG-based XP. High-risk, high-reward.', playstyle: 'Variable 0.5x-2x XP on tasks. High risk, high reward!', cost: 300, owned: false, equipped: false },
    { key: 'ASSASSIN', name: 'Assassin', emoji: '🗡️', description: 'XP streak mechanic. +5% per stack (max 10).', playstyle: 'Streak bonuses stack multiplicatively.', cost: 400, owned: false, equipped: false },
    { key: 'WIZARD', name: 'Wizard', emoji: '🔮', description: 'Spell combos + Wisdom scaling (+5 XP/level).', playstyle: 'Every 3rd task grants 2x XP.', cost: 700, owned: false, equipped: false },
    { key: 'ARCHER', name: 'Archer', emoji: '🏹', description: 'Precision shot system with crits.', playstyle: 'Bonus XP for high priority and on-time tasks.', cost: 600, owned: false, equipped: false },
    { key: 'TANK', name: 'Tank', emoji: '🛡️', description: 'Shield momentum stacking. Strong early.', playstyle: 'Build stacks for massive XP bursts.', cost: 500, owned: false, equipped: false },
  ],
  playerXP: 1250,
};

// Skill trees - EXACT match from Discord bot (gameLogic.js)
const MOCK_SKILLS = {
  skillTrees: [
    { classKey: 'DEFAULT', name: 'Default', emoji: '⚪', description: 'Basic skills available to all classes', skills: [
      { id: 'default_xp_boost', name: 'Quick Learner', emoji: '📚', description: '+5% XP from all sources', maxLevel: 3, currentLevel: 0, cost: 50, requires: null },
      { id: 'default_daily_boost', name: 'Early Bird', emoji: '🌅', description: '+10 bonus daily XP', maxLevel: 2, currentLevel: 0, cost: 75, requires: 'default_xp_boost' },
      { id: 'default_streak_shield', name: 'Streak Shield', emoji: '🛡️', description: 'Protect streak on miss', maxLevel: 1, currentLevel: 0, cost: 100, requires: 'default_daily_boost' },
    ]},
    { classKey: 'HERO', name: 'Hero', emoji: '⚔️', description: 'Reliable XP gains, inspiring others', skills: [
      { id: 'hero_valor', name: 'Valor', emoji: '⚔️', description: '+10 flat XP per action', maxLevel: 3, currentLevel: 0, cost: 100, requires: null },
      { id: 'hero_inspire', name: 'Inspire', emoji: '✨', description: 'Bonus XP when helping others', maxLevel: 2, currentLevel: 0, cost: 150, requires: 'hero_valor' },
      { id: 'hero_champion', name: 'Champion', emoji: '👑', description: 'Double XP on level milestones', maxLevel: 1, currentLevel: 0, cost: 200, requires: 'hero_inspire' },
      { id: 'hero_legend', name: 'Legendary', emoji: '🏆', description: 'Permanent XP multiplier', maxLevel: 1, currentLevel: 0, cost: 300, requires: 'hero_champion' },
    ]},
    { classKey: 'GAMBLER', name: 'Gambler', emoji: '🎲', description: 'High risk, high reward playstyle', skills: [
      { id: 'gambler_lucky', name: 'Lucky Streak', emoji: '🍀', description: 'Better RNG outcomes', maxLevel: 3, currentLevel: 0, cost: 80, requires: null },
      { id: 'gambler_double', name: 'Double Down', emoji: '🎰', description: 'Chance for double rewards', maxLevel: 2, currentLevel: 0, cost: 120, requires: 'gambler_lucky' },
      { id: 'gambler_safety', name: 'Safety Net', emoji: '🪢', description: 'Reduce maximum losses', maxLevel: 2, currentLevel: 0, cost: 150, requires: 'gambler_double' },
      { id: 'gambler_jackpot', name: 'Jackpot', emoji: '💎', description: 'Rare massive payouts', maxLevel: 1, currentLevel: 0, cost: 250, requires: 'gambler_safety' },
    ]},
    { classKey: 'ASSASSIN', name: 'Assassin', emoji: '🗡️', description: 'Streak-based damage dealer', skills: [
      { id: 'assassin_swift', name: 'Swift Strike', emoji: '💨', description: 'Faster streak building', maxLevel: 3, currentLevel: 0, cost: 90, requires: null },
      { id: 'assassin_critical', name: 'Critical Hit', emoji: '🎯', description: 'Crit chance on tasks', maxLevel: 2, currentLevel: 0, cost: 130, requires: 'assassin_swift' },
      { id: 'assassin_shadow', name: 'Shadow Step', emoji: '🌑', description: 'Preserve streak on fail', maxLevel: 1, currentLevel: 0, cost: 180, requires: 'assassin_critical' },
      { id: 'assassin_execute', name: 'Execute', emoji: '☠️', description: 'Massive bonus at max streak', maxLevel: 1, currentLevel: 0, cost: 280, requires: 'assassin_shadow' },
    ]},
    { classKey: 'WIZARD', name: 'Wizard', emoji: '🔮', description: 'Spell combos and wisdom scaling', skills: [
      { id: 'wizard_study', name: 'Arcane Study', emoji: '📖', description: 'XP scales with level', maxLevel: 3, currentLevel: 0, cost: 100, requires: null },
      { id: 'wizard_combo', name: 'Spell Combo', emoji: '🔥', description: 'Chaining bonus XP', maxLevel: 2, currentLevel: 0, cost: 150, requires: 'wizard_study' },
      { id: 'wizard_focus', name: 'Focus', emoji: '🧘', description: 'Bonus XP for consecutive tasks', maxLevel: 2, currentLevel: 0, cost: 200, requires: 'wizard_combo' },
      { id: 'wizard_mastery', name: 'Arcane Mastery', emoji: '🌟', description: 'Ultimate wisdom power', maxLevel: 1, currentLevel: 0, cost: 350, requires: 'wizard_focus' },
    ]},
    { classKey: 'ARCHER', name: 'Archer', emoji: '🏹', description: 'Precision and critical strikes', skills: [
      { id: 'archer_aim', name: 'Steady Aim', emoji: '🎯', description: 'Increased base accuracy', maxLevel: 3, currentLevel: 0, cost: 85, requires: null },
      { id: 'archer_multishot', name: 'Multishot', emoji: '🏹', description: 'Multiple task completion bonus', maxLevel: 2, currentLevel: 0, cost: 140, requires: 'archer_aim' },
      { id: 'archer_piercing', name: 'Piercing Shot', emoji: '💫', description: 'Ignore XP penalties', maxLevel: 1, currentLevel: 0, cost: 190, requires: 'archer_multishot' },
      { id: 'archer_sniper', name: 'Sniper', emoji: '🦅', description: 'Guaranteed crits on priority tasks', maxLevel: 1, currentLevel: 0, cost: 300, requires: 'archer_piercing' },
    ]},
    { classKey: 'TANK', name: 'Tank', emoji: '🛡️', description: 'Slow but unstoppable momentum', skills: [
      { id: 'tank_fortify', name: 'Fortify', emoji: '🧱', description: 'Build defensive stacks', maxLevel: 3, currentLevel: 0, cost: 95, requires: null },
      { id: 'tank_absorb', name: 'Absorb', emoji: '💪', description: 'Convert damage to XP', maxLevel: 2, currentLevel: 0, cost: 145, requires: 'tank_fortify' },
      { id: 'tank_revenge', name: 'Revenge', emoji: '⚡', description: 'Bonus XP after losses', maxLevel: 2, currentLevel: 0, cost: 200, requires: 'tank_absorb' },
      { id: 'tank_unstoppable', name: 'Unstoppable', emoji: '🚀', description: 'Cannot lose streak', maxLevel: 1, currentLevel: 0, cost: 320, requires: 'tank_revenge' },
    ]},
  ],
  userXP: 1250,
};

// Achievements - EXACT match from Discord bot (gameLogic.js)
const MOCK_ACHIEVEMENTS = {
  achievements: [
    // Lists
    { key: 'FIRST_LIST', name: 'Getting Started', emoji: '📋', description: 'Create your first list', category: 'lists', unlocked: false },
    { key: 'FIVE_LISTS', name: 'List Master', emoji: '📚', description: 'Create 5 lists', category: 'lists', unlocked: false },
    { key: 'TEN_LISTS', name: 'Organization Pro', emoji: '🗂️', description: 'Create 10 lists', category: 'lists', unlocked: false },
    // Tasks
    { key: 'FIRST_ITEM', name: 'Task Beginner', emoji: '✏️', description: 'Add your first task', category: 'productivity', unlocked: false },
    { key: 'TEN_ITEMS', name: 'Busy Bee', emoji: '🐝', description: 'Add 10 tasks', category: 'productivity', unlocked: false },
    { key: 'FIFTY_ITEMS', name: 'Productivity Machine', emoji: '⚙️', description: 'Add 50 tasks', category: 'productivity', unlocked: false },
    { key: 'HUNDRED_ITEMS', name: 'Task Centurion', emoji: '💯', description: 'Add 100 tasks', category: 'productivity', unlocked: false },
    // Completion
    { key: 'FIRST_COMPLETE', name: 'First Victory', emoji: '✅', description: 'Complete your first task', category: 'completion', unlocked: false },
    { key: 'TEN_COMPLETE', name: 'Getting Things Done', emoji: '📈', description: 'Complete 10 tasks', category: 'completion', unlocked: false },
    { key: 'FIFTY_COMPLETE', name: 'Achievement Hunter', emoji: '🎯', description: 'Complete 50 tasks', category: 'completion', unlocked: false },
    { key: 'HUNDRED_COMPLETE', name: 'Completion Master', emoji: '🏅', description: 'Complete 100 tasks', category: 'completion', unlocked: false },
    // Streaks
    { key: 'STREAK_3', name: 'Consistent', emoji: '🔥', description: '3 day streak', category: 'streaks', unlocked: false },
    { key: 'STREAK_7', name: 'Week Warrior', emoji: '⚡', description: '7 day streak', category: 'streaks', unlocked: false },
    { key: 'STREAK_14', name: 'Fortnight Fighter', emoji: '💪', description: '14 day streak', category: 'streaks', unlocked: false },
    { key: 'STREAK_30', name: 'Monthly Dedication', emoji: '📅', description: '30 day streak', category: 'streaks', unlocked: false },
    // Levels
    { key: 'LEVEL_5', name: 'Rising Star', emoji: '⭐', description: 'Reach level 5', category: 'levels', unlocked: false },
    { key: 'LEVEL_10', name: 'Veteran', emoji: '🎖️', description: 'Reach level 10', category: 'levels', unlocked: false },
    { key: 'LEVEL_25', name: 'Elite', emoji: '💎', description: 'Reach level 25', category: 'levels', unlocked: false },
    { key: 'LEVEL_50', name: 'Legend', emoji: '👑', description: 'Reach level 50', category: 'levels', unlocked: false },
    // Classes
    { key: 'BUY_CLASS', name: 'Class Act', emoji: '🎭', description: 'Purchase your first class', category: 'classes', unlocked: false },
    { key: 'ALL_CLASSES', name: 'Collector', emoji: '🏆', description: 'Own all classes', category: 'classes', unlocked: false },
    // XP
    { key: 'XP_1000', name: 'XP Hunter', emoji: '💰', description: 'Earn 1,000 total XP', category: 'levels', unlocked: false },
    { key: 'XP_5000', name: 'XP Master', emoji: '💵', description: 'Earn 5,000 total XP', category: 'levels', unlocked: false },
    { key: 'XP_10000', name: 'XP Legend', emoji: '🤑', description: 'Earn 10,000 total XP', category: 'levels', unlocked: false },
  ],
  unlockedCount: 0,
  totalCount: 24,
};

const MOCK_LEADERBOARD = [
  { discordId: '111111111', xp: 5420, level: 54, playerClass: 'WIZARD', streak: 45, tasksCompleted: 312, rank: 1 },
  { discordId: '222222222', xp: 4180, level: 41, playerClass: 'HERO', streak: 23, tasksCompleted: 256, rank: 2 },
  { discordId: '333333333', xp: 3650, level: 36, playerClass: 'ASSASSIN', streak: 67, tasksCompleted: 198, rank: 3 },
];

const MOCK_GAME_HISTORY: any[] = [];

// Hangman words - EXACT match from Discord bot
export const HANGMAN_WORDS = [
  'APPLE', 'TABLE', 'CHAIR', 'PHONE', 'RIVER',
  'HOUSE', 'LIGHT', 'TRAIN', 'WATER', 'BREAD',
  'PAPER', 'MUSIC', 'HAPPY', 'DREAM', 'SMILE',
  'BEACH', 'CLOUD', 'DANCE', 'MONEY', 'CLOCK',
  'EARTH', 'FLOWER', 'GRASS', 'HORSE', 'JUICE',
  'CANDY', 'PIZZA', 'TIGER', 'WHALE', 'ZEBRA',
  'NIGHT', 'PIANO', 'STORM', 'QUEEN', 'MAGIC'
];

// Blackjack config - EXACT match from Discord bot
export const BLACKJACK_CONFIG = {
  MIN_BET: 10,
  MAX_BET_PERCENT: 0.25,
  HARD_CAP: 1000,
  BLACKJACK_MULTIPLIER: 1.5,
  WIN_MULTIPLIER: 1.0
};

// ═══════════════════════════════════════════════════════════════════════════════
//  HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useUserProfile() {
  return useQuery({ queryKey: ['user', 'profile'], queryFn: async () => { try { return await userApi.getProfile(); } catch { return null; } } });
}

export function useClaimDaily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => { try { return await userApi.claimDaily(); } catch { return { success: true, xp: 100, newBalance: 1350 }; } },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['user'] });
      if (result?.newAchievements) showAchievementNotifications(result.newAchievements, qc);
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: any) => { try { return await userApi.updateSettings(settings); } catch { return settings; } },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user'] }),
  });
}

export function useResetProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => { 
      try { return await userApi.resetProgress(); } 
      catch { return { success: false, message: 'Failed to reset' }; } 
    },
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function useLists() {
  return useQuery({ queryKey: ['lists'], queryFn: async () => { try { return await listsApi.getAll(); } catch { return MOCK_LISTS; } } });
}

export function useList(listId: number) {
  return useQuery({
    queryKey: ['lists', listId],
    queryFn: async () => { 
      try { 
        return await listsApi.getById(listId); 
      } catch { 
        const l = MOCK_LISTS.find(x => x.id === listId); 
        const items = (MOCK_ITEMS[listId] || []).slice().sort((a, b) => (a.position || 0) - (b.position || 0));
        return l ? { ...l, items } : null; 
      } 
    },
    enabled: listId > 0,
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => { try { return await listsApi.create(data); } catch { const nl = { id: Date.now(), ...data, itemsTotal: 0, itemsCompleted: 0, created_at: new Date().toISOString() }; MOCK_LISTS.push(nl); return nl; } },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['lists'] });
      if (result?.newAchievements) showAchievementNotifications(result.newAchievements, qc);
    },
  });
}

export function useUpdateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, data }: { listId: number; data: any }) => { try { return await listsApi.update(listId, data); } catch { const l = MOCK_LISTS.find(x => x.id === listId); if (l) Object.assign(l, data); return l; } },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (listId: number) => { try { return await listsApi.delete(listId); } catch { const i = MOCK_LISTS.findIndex(x => x.id === listId); if (i > -1) MOCK_LISTS.splice(i, 1); } },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, name, description }: { listId: number; name: string; description?: string }) => {
      try { return await itemsApi.create(listId, { name, description }); }
      catch { const items = MOCK_ITEMS[listId] || []; const ni = { id: Date.now(), name, description, completed: false, position: items.length + 1 }; if (!MOCK_ITEMS[listId]) MOCK_ITEMS[listId] = []; MOCK_ITEMS[listId].push(ni); return ni; }
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['lists'] });
      if (result?.newAchievements) showAchievementNotifications(result.newAchievements, qc);
    },
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, data }: { itemId: number; data: any }) => { 
      try { 
        return await itemsApi.update(itemId, data); 
      } catch { 
        // Handle mock data update including position reordering
        for (const lid of Object.keys(MOCK_ITEMS)) {
          const listId = Number(lid);
          const items = MOCK_ITEMS[listId];
          if (!items) continue;
          const itemIndex = items.findIndex(x => x.id === itemId);
          if (itemIndex > -1) {
            const item = items[itemIndex];
            // If position is being updated, reorder the array
            if (data.position !== undefined && data.position !== item.position) {
              // Remove item from current position
              items.splice(itemIndex, 1);
              // Insert at new position (position is 1-indexed)
              const newIndex = Math.max(0, Math.min(items.length, data.position - 1));
              items.splice(newIndex, 0, { ...item, ...data });
              // Update all positions
              items.forEach((it, idx) => it.position = idx + 1);
            } else {
              Object.assign(item, data);
            }
            break;
          }
        }
        return { id: itemId, ...data }; 
      } 
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: number) => { try { return await itemsApi.delete(itemId); } catch { for (const lid in MOCK_ITEMS) { const i = MOCK_ITEMS[lid].findIndex(x => x.id === itemId); if (i > -1) MOCK_ITEMS[lid].splice(i, 1); } } },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export function useToggleItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: number) => { try { return await itemsApi.toggle(itemId); } catch { for (const lid in MOCK_ITEMS) { const item = MOCK_ITEMS[lid].find(x => x.id === itemId); if (item) item.completed = !item.completed; } return { id: itemId, completed: true }; } },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['lists'] });
      if (result?.newAchievements) showAchievementNotifications(result.newAchievements, qc);
    },
  });
}

export function useClasses() {
  return useQuery({ queryKey: ['classes'], queryFn: async () => { try { return await classesApi.getAll(); } catch { return MOCK_CLASSES; } } });
}

export function useBuyClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (classKey: string) => { try { return await classesApi.buy(classKey); } catch { const c = MOCK_CLASSES.classes.find(x => x.key === classKey); if (c) c.owned = true; return { success: true }; } },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['classes'] });
      if (result?.newAchievements) showAchievementNotifications(result.newAchievements, qc);
    },
  });
}

export function useEquipClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (classKey: string) => { try { return await classesApi.equip(classKey); } catch { MOCK_CLASSES.classes.forEach(c => c.equipped = c.key === classKey); return { success: true }; } },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });
}

export function useSkills() {
  return useQuery({ queryKey: ['skills'], queryFn: async () => { try { return await skillsApi.getAll(); } catch { return MOCK_SKILLS; } } });
}

export function useUnlockSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ skillId, classKey }: { skillId: string; classKey: string }) => {
      try { return await skillsApi.unlock(skillId, classKey); }
      catch { const tree = MOCK_SKILLS.skillTrees.find(t => t.classKey === classKey); const skill = tree?.skills.find(s => s.id === skillId); if (skill && skill.currentLevel < skill.maxLevel) skill.currentLevel++; return { success: true }; }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  });
}

export function useAchievements() {
  return useQuery({ queryKey: ['achievements'], queryFn: async () => { try { return await achievementsApi.getAll(); } catch { return MOCK_ACHIEVEMENTS; } } });
}

export function useLeaderboard() {
  return useQuery({ queryKey: ['leaderboard'], queryFn: async () => { try { return await leaderboardApi.get(); } catch { return MOCK_LEADERBOARD; } } });
}

export function useGameHistory() {
  return useQuery({ queryKey: ['games', 'history'], queryFn: async () => { try { return await gamesApi.getHistory(); } catch { return MOCK_GAME_HISTORY; } } });
}

export function useRecordGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { gameType: string; result: string; bet: number; payout: number }) => {
      try { return await gamesApi.recordResult(data); }
      catch { MOCK_GAME_HISTORY.unshift({ game_type: data.gameType, state: data.result, bet_amount: data.bet, payout: data.payout, ended_at: new Date().toISOString() }); return { success: true }; }
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['games'] });
      qc.invalidateQueries({ queryKey: ['user'] });
      if (result?.newAchievements) showAchievementNotifications(result.newAchievements, qc);
    },
  });
}
