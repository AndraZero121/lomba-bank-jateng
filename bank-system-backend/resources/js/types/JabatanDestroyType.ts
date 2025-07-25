// Auto-generated by ApiResourceTyper
// Generated at: 2025-07-01 11:29:41

export interface JabatanDestroyType {
  status: boolean;
  message: string;
  data: null;
}

export interface JabatanDestroyTypeResponse {
  data: JabatanDestroyType;
}

export interface JabatanDestroyTypeCollection {
  data: JabatanDestroyType[];
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
