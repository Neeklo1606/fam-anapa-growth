/**
 * Shared types across @fam/web and @fam/api.
 * Wire-level shape is filled in Этап 2 alongside Prisma schema.
 */

export const LEAD_STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "CONTACTED",
  "TRAINING_BOOKED",
  "NO_ANSWER",
  "REJECTED",
  "ARCHIVED",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const USER_ROLES = ["ADMIN", "MANAGER", "EDITOR", "VIEWER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface LeadDTO {
  id: string;
  createdAt: string;
  source: string | null;
  childName: string;
  childBirthDate: string | null;
  childAge: number | null;
  parentName: string;
  phone: string;
  email: string | null;
  telegram: string | null;
  whatsapp: string | null;
  direction: string | null;
  level: string | null;
  comment: string | null;
  privacyAccepted: boolean;
  status: LeadStatus;
  assignedManagerId: string | null;
  managerNotes: string | null;
  utm: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    content?: string | null;
    term?: string | null;
  } | null;
  landingPage: string | null;
  ip: string | null;
  userAgent: string | null;
  urgent: boolean;
  archived: boolean;
}

export type CreateLeadDTO = Omit<
  LeadDTO,
  "id" | "createdAt" | "status" | "assignedManagerId" | "managerNotes" | "urgent" | "archived"
>;

export type CoachDTO = {
  id: string;
  fullName: string;
  role: string;
  photo: string;
  education: string | null;
  license: string | null;
  experience: string | null;
  shortDescription: string;
  fullDescription: string | null;
  order: number;
  active: boolean;
};

export type GalleryCategory =
  | "trainings"
  | "tournaments"
  | "goalkeeper_school"
  | "field"
  | "team"
  | "other";

export type GalleryItemDTO = {
  id: string;
  image: string;
  alt: string;
  title: string | null;
  category: GalleryCategory;
  order: number;
  active: boolean;
};

export type AnalyticsEvent =
  | "form_open"
  | "form_submit"
  | "phone_click"
  | "whatsapp_click"
  | "telegram_click"
  | "max_click"
  | "map_click"
  | "video_play"
  | "menu_open"
  | "section_view";
