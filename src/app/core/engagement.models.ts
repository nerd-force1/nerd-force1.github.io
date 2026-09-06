export interface SelectedConfig {
  modules: string[];
  environments: number;
  users_band?: string;
  data_band?: string;
  nodes_band?: string;
  hosting?: string;
  sla?: string;
}

export interface QuotePayload {
  company: string;
  contact_name: string;
  email: string;
  phone?: string;
  message?: string;
  selected_config: SelectedConfig;
  estimate_amount?: number;
  company_website?: string;
}

export interface CallbackPayload {
  email: string;
  name?: string;
  preferred_time?: string;
  message?: string;
  company_website?: string;
}

export interface Ack {
  ok: boolean;
  id: number | null;
}
