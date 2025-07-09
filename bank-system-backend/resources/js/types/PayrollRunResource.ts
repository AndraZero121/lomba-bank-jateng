// Auto-generated TS interface
// Generated at: 2025-06-29 09:36:21

export interface PayrollRunResource {
  id: any;
  periode_gaji: any;
  tanggal_eksekusi: Date;
  status: any;
  dieksekusi_oleh: number;
  created_at: Date;
  updated_at: Date;
}

export interface PayrollRunResourceCollection {
  data: PayrollRunResource[];
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

export interface PayrollRunResourceResponse {
  data: PayrollRunResource;
}
