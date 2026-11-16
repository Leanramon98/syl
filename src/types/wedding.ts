export type GuestRSVPStatus = 'pending' | 'attending' | 'declined';

export interface GuestGroup {
  id: string;
  name: string;
  token: string;
  max_guests: number;
  guest_names?: string[];
  rsvp_status: GuestRSVPStatus;
  confirmed_count: number;
  dietary_requirements: string;
  confirmed_name?: string;
  notes?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DietaryEntry {
  family: string;
  diet: string;
}

export interface SummaryMetrics {
  total_groups: number;
  total_allowed_passes: number;
  attending_count: number;
  declined_count: number;
  pending_count: number;
  pending_passes: number;
  dietary_list: DietaryEntry[];
}

export interface PublicRsvpResolveResponse {
  group: GuestGroup;
}

export interface SubmitRsvpPayload {
  token: string;
  name?: string;
  rsvp_status: 'attending' | 'declined';
  confirmed_count: number;
  dietary_requirements?: string;
}
