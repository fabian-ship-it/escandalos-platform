export interface Scandal {
  id: string;
  name: string;
  description: string;
  status: string;
  color: string;
  created_at: string;
}

export interface Person {
  id: string;
  name: string;
  role_title: string;
  description: string;
  photo_url: string | null;
  created_at: string;
  relationship?: string;
  link_id?: string;
}

export interface Evidence {
  id: string;
  scandal_id: string;
  person_id: string | null;
  tip_id: string | null;
  title: string;
  description: string;
  evidence_type: 'document' | 'image' | 'link' | 'testimony';
  file_path: string | null;
  original_file_name: string | null;
  link_url: string | null;
  status: string;
  created_at: string;
  person_name?: string;
}

export interface Tip {
  id: string;
  scandal_id: string;
  person_id: string | null;
  person_name_suggestion: string | null;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_id: string | null;
  review_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  scandal_name?: string;
  files?: TipFile[];
}

export interface TipFile {
  id: string;
  tip_id: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: number;
}

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface BoardData {
  nodes: any[];
  edges: any[];
  scandal: Scandal;
}
