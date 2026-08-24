// ─── Settings Types ───────────────────────────────────────────────────────────

export interface NotificationSettings {
  dailyVerseEnabled: boolean;
  dailyVerseHour: number;
  dailyVerseMinute: number;
  planEnabled: boolean;
  planHour: number;
  planMinute: number;
  atRiskEnabled: boolean;
  atRiskHour: number;
  atRiskMinute: number;
  timeZone: string;
}
