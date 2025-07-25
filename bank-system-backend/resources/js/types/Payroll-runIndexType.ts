// Auto-generated by ApiResourceTyper
// Generated at: 2025-07-15 08:26:39

export interface Payroll-runIndexType {
  id: number;
  periode_gaji: string;
  tanggal_eksekusi: Date;
  status: string;
  dieksekusi_oleh: number;
  created_at: Date;
  updated_at: Date;
}

export interface Payroll-runIndexTypeResponse {
  data: Payroll-runIndexType;
}

export interface Payroll-runIndexTypeCollection {
  data: Payroll-runIndexType[];
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
