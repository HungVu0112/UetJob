import type { ApiCustomEmojiJSON } from "./custom_emoji";

export interface ApiOrganizationJSON {
  id: string;
  name: string;
  description: string;
  email_domain: string;
  created_at: string;
  updated_at: string;
  avatar: string;
  avatar_static: string;
  members_count: number;
  emojis: ApiCustomEmojiJSON[];
}

export interface ApiOrganizationCreateParams {
  name: string;
  email_domain: string;
  description?: string;
  avatar?: File;
}

export interface ApiOrganizationUpdateParams {
  name?: string;
  description?: string;
  avatar?: File;
}