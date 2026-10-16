export interface CharityEvent {
  event_id?: number;
  id?: number;
  title: string;
  event_name?: string;
  description: string;
  event_short_desc?: string;
  full_description?: string;
  location: string;
  category: string;
  cat_name?: string;
  event_date: string;
  price: number;
  progress_percent: number;
  imageUrl?: string;
  image_url?: string;
  org_name?: string;
  org_logo_url?: string;
  longitude?: number;
  latitude?: number;
}

export interface HomeStats {
  totalFund: number;
  totalEvent: number;
  totalReg: number;
  partner: number;
}

export interface Registration {
  registration_id?: number;
  event_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  num_tickets: number;
  registration_date: string;
  message?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Organisation {
  id: number;
  name: string;
}
