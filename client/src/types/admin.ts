export interface AdminLog {
  apiRequestLogId: number;
  userId?: number;
  provider?: string;
  endpoint?: string;
  model?: string | null;
  tokensIn?: number | null;
  tokensOut?: number | null;
  statusCode?: number;
  durationMs?: number;
  timestamp?: string;
}

export interface LogsSummary {
  totalRequests: number;
  avgLatencyMs: number;
  ok2xx: number;
  errors4xx: number;
  errors5xx: number;
}

export interface TopModel {
  model: string;
  count: number;
}
