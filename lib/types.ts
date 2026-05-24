export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
  subscription_plan: 'free' | 'pro' | 'premium';
  created_at: string;
}

export interface PartnerProfile {
  id: string;
  user_id: string;
  partner_name: string;
  relationship_type: 'wife' | 'girlfriend' | 'fiancée' | 'partner';
  birthday?: string;
  anniversary_date?: string;
  communication_style?: string;
  love_language?: string;
  likes: string[];
  dislikes: string[];
  sensitive_topics: string[];
  preferred_tone: 'romantic' | 'funny' | 'simple' | 'deep' | 'playful' | 'apologetic';
  religious_cultural_background?: string;
  things_to_avoid?: string;
  favourite_food?: string;
  favourite_flowers?: string;
  favourite_restaurants?: string;
}

export interface ImportantDate {
  id: string;
  user_id: string;
  title: string;
  date: string;
  repeats_yearly: boolean;
  reminder_days_before: number[];
  category: 'birthday' | 'anniversary' | 'holiday' | 'custom';
  notes?: string;
}

export type MessageType =
  | 'good_morning'
  | 'midday_checkin'
  | 'good_night'
  | 'appreciation'
  | 'apology'
  | 'romantic'
  | 'funny'
  | 'anniversary'
  | 'birthday'
  | 'supportive'
  | 'been_busy'
  | 'reconnect'
  | 'celebration';

export interface GeneratedMessages {
  simple: string;
  romantic: string;
  playful: string;
}

export interface GiftIdea {
  id: string;
  user_id: string;
  title: string;
  occasion?: string;
  budget?: number;
  link?: string;
  notes?: string;
  status: 'idea' | 'ordered' | 'delivered' | 'completed';
  reminder_date?: string;
}

export interface DateIdea {
  id: string;
  user_id: string;
  title: string;
  budget?: string;
  location?: string;
  notes?: string;
  status: 'idea' | 'planned' | 'done';
}

export type ApologyReason =
  | 'forgot_something'
  | 'too_busy'
  | 'upset_her'
  | 'replied_badly'
  | 'calm_situation'
  | 'take_responsibility';
