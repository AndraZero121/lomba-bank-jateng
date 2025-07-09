// Auto-generated TS interface
// Generated at: 2025-06-29 09:36:21

export interface SlipGajiResource {
  id: any;
  id_payroll_run: any;
  id_karyawan: any;
  gaji_pokok: any;
  total_tunjangan: any;
  total_potongan: any;
  penghasilan_bruto: any;
  pph21_terpotong: any;
  total_iuran_bpjs_kesehatan: any;
  thp: any;
  detail_json: any;
  created_at: Date;
  updated_at: Date;
}

export interface SlipGajiResourceCollection {
  data: SlipGajiResource[];
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

export interface SlipGajiResourceResponse {
  data: SlipGajiResource;
}
