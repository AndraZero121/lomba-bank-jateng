// Auto-generated TS interface
// Generated at: 2025-06-29 09:36:20

export interface JabatanResource {
  id: any;
  nama_jabatan: any;
  created_at: Date;
  updated_at: Date;
}

export interface JabatanResourceCollection {
  data: JabatanResource[];
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

export interface JabatanResourceResponse {
  data: JabatanResource;
}
