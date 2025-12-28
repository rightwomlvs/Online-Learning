
export type TeachingModeId = 'lecture' | 'discussion' | 'practice' | 'digital';

export interface TeachingMode {
  id: TeachingModeId;
  label: string;
}

export type ActionId = 'praise' | 'correction' | 'open_q' | 'closed_q' | 'walking';

export interface Action {
  id: ActionId;
  label: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'mode_change' | 'action' | 'engagement' | 'note' | 'action_timed_start' | 'action_timed_end';
  name: string;
  value?: string;
  duration?: number; // In seconds
}

export type EngagementLevel = 'high' | 'med' | 'low';

export interface AppState {
  isSessionActive: boolean;
  activeMode: TeachingModeId | null;
  modeTimes: Record<TeachingModeId, number>;
  actionCounts: Record<ActionId, number>;
  actionTimes: Record<ActionId, number>; // Total cumulative time per action
  activeActions: ActionId[]; // Actions currently being timed
  logs: LogEntry[];
  engagement: EngagementLevel;
  subject: string;
  lastInteraction: number;
}
