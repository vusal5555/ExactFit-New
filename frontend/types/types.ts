export interface LeadRecord {
  id: string;
  title: string;
  url: string;
  platform: string;
  author: string;
  intent_score: number;
  buying_stage: string;
  urgency: string;
  created_at: string;
  is_contacted: boolean;
  is_dismissed: boolean;
  keyword?: string;
  monitor_id?: string;
}

export interface MonitorRecord {
  id: string;
  keyword: string;
  platforms: string[];
  min_intent_score: number;
  is_active: boolean;
  created_at: string;
  last_scanned_at?: string;
}

export interface LeadStats {
  total_leads: number;
  avg_score: number;
  leads_by_platform: Record<string, number>;
  leads_by_stage: Record<string, number>;
  leads_today: number;
  leads_this_week: number;
}
