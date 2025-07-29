import type { NewsItem, SourceID } from "@shared/types"

export interface RSSInfo {
  title: string
  description: string
  link: string
  image: string
  updatedTime: string
  items: RSSItem[]
}
export interface RSSItem {
  title: string
  description: string
  link: string
  created?: string
}

export interface CacheInfo {
  id: SourceID
  items: NewsItem[]
  updated: number
}

export interface CacheRow {
  id: SourceID
  data: string
  updated: number
}

export interface RSSHubInfo {
  title: string
  home_page_url: string
  description: string
  items: RSSHubItem[]
}

export interface RSSHubItem {
  id: string
  url: string
  title: string
  content_html: string
  date_published: string
}

export interface UserInfo {
  id: string
  email: string
  type: "github"
  data: string
  created: number
  updated: number
}

export interface User {
  id: string
  name: string
  avatar: string
  created_at: number
  updated_at: number
}

export interface UserRow {
  id: string
  name: string
  avatar: string
  created_at: number
  updated_at: number
}

export interface PushRecord {
  id: string
  date: string
  title: string
  summary?: string
  recipients: string[]
  status: "sent" | "failed"
  sent_at: number
  created_at: number
  updated_at: number
}

export interface RSSHubOption {
  // default: true
  sorted?: boolean
  // default: 20
  limit?: number
}

export interface SourceOption {
  // default: false
  hiddenDate?: boolean
}

export type SourceGetter = () => Promise<NewsItem[]>
