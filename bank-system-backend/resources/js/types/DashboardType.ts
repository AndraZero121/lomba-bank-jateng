// Auto-generated by ApiResourceTyper
// Generated at: 2025-07-01 06:01:55

export interface DashboardType {
  message: string;
  exception: string;
  file: string;
  line: number;
  trace: object[];
}

export interface DashboardTypeResponse {
  data: DashboardType;
}

export interface DashboardTypeCollection {
  data: DashboardType[];
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
