// Auto-generated by ApiResourceTyper
// Generated at: 2025-07-01 07:29:41

export interface Payroll-runDestroyType {
  status: boolean;
  message: string;
}

export interface Payroll-runDestroyTypeResponse {
  data: Payroll-runDestroyType;
}

export interface Payroll-runDestroyTypeCollection {
  data: Payroll-runDestroyType[];
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
