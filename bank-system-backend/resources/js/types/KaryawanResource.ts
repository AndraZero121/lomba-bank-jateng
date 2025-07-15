// Auto-generated TS interface
// Generated at: 2025-06-29 09:36:20

export interface KaryawanResource {
  id: any;
  id_jabatan: any;
  id_departemen: any;
  nama_lengkap: any;
  nik_ktp: any;
  npwp: any;
  status_ptkp: any;
  tanggal_bergabung: Date;
  gaji_pokok: any;
  nomor_rekening: any;
  nama_bank: any;
  status_kepegawaian: any;
  is_active: any;
  created_at: Date;
  updated_at: Date;
}

export interface KaryawanResourceCollection {
  data: KaryawanResource[];
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

export interface KaryawanResourceResponse {
  data: KaryawanResource;
}
