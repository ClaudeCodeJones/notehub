export interface Project {
  id: string
  name: string
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  project_id: string
  title: string
  content: string
  note_type: 'checkbox' | 'note'
  sort_order: number
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface VaultItem {
  id: string
  name: string
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BookmarkCollection {
  id: string
  name: string
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  collection_id: string
  url: string
  title: string | null
  domain: string | null
  sort_order: number
  created_at: string
  updated_at: string
  archived_at: string | null
}
