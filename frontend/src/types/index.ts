// User Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Options Types
export interface Option {
  id_opcji: string;
  kategoria: string;
  nazwa: string;
  cena_netto_eur: number;
}

export interface OptionsByCategory {
  [category: string]: Option[];
}

// Offer Types
export interface OfferItem {
  id?: number;
  offer_id?: number;
  typ: string;
  szerokosc: number;
  wysokosc: number;
  konfiguracja: Record<string, string>;
  cena_netto: number;
}

export interface Offer {
  id?: number;
  user_id?: number;
  numer: string;
  data: string;
  klient: string;
  uwagi?: string;
  suma_netto: number;
  suma_vat: number;
  suma_brutto: number;
  items: OfferItem[];
}

export interface OfferFilter {
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: string;
}

export interface ProductConfig {
  typ: string;
  szerokosc: number;
  wysokosc: number;
  options: Record<string, string>;
  price?: number;
}