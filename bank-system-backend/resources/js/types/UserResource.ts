// Auto-generated TS interface
// Generated at: 2025-06-29 09:36:21

export interface UserResource {
  id: any;
  name: any;
  email: any;
  created_at: Date;
  updated_at: Date;
}

export interface UserResourceCollection {
  data: UserResource[];
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

export interface UserResourceResponse {
  data: UserResource;
}
