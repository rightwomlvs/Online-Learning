
import { TeachingMode, Action } from './types';

export const SUBJECTS = ['國文', '英文', '數學', '自然', '社會', '體育', '藝術', '綜合'];

export const MODES: TeachingMode[] = [
  { id: 'lecture', label: '講述教學' },
  { id: 'discussion', label: '小組討論' },
  { id: 'practice', label: '實作/演算' },
  { id: 'digital', label: '數位運用' }
];

export const ACTIONS: Action[] = [
  { id: 'praise', label: '正向鼓勵' },
  { id: 'correction', label: '糾正規範' },
  { id: 'open_q', label: '開放提問' },
  { id: 'closed_q', label: '封閉提問' },
  { id: 'walking', label: '巡視走動' }
];

export const ENGAGEMENT_REMINDER_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms
