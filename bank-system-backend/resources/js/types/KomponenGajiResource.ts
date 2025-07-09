// Auto-generated TS interface
// Generated at: 2025-06-29 09:36:21

export interface KomponenGajiResource {
  id: any;
  nama_komponen: any;
  tipe: any;
  sifat: any;
  is_taxable: any;
  is_bpjs_base: any;
  created_at: Date;
  updated_at: Date;
}

export interface KomponenGajiResourceCollection {
  data: KomponenGajiResource[];
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

export interface KomponenGajiResourceResponse {
  data: KomponenGajiResource;
}
