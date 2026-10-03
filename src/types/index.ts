export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  legal_notice: string;
}

export interface UserProfile {
  id: string;
  company_id?: string;
  full_name: string;
  email: string;
  role: 'admin' | 'technician';
  avatar_url?: string;
}

export interface TechnicalReport {
  id: string;
  report_number: string;
  company_id?: string;
  date: string; // YYYY-MM-DD
  client_name: string;
  address: string;
  phone: string;
  email?: string;
  brand: string;
  model: string;
  equipment: string;
  serial_number?: string;
  diagnosis: string;
  cause: string;
  work_description: string;
  estimated_cost: number;
  created_at: string;
  created_by?: string;
}

export type CreateReportDTO = Omit<TechnicalReport, 'id' | 'report_number' | 'created_at'>;

export interface FilterOptions {
  searchQuery: string;
  equipment: string | 'ALL';
  sortBy: 'date_desc' | 'date_asc' | 'cost_desc' | 'cost_asc' | 'number_desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const EQUIPMENT_TYPES = [
  'Lavarropas',
  'Heladera',
  'Freezer',
  'Aire Acondicionado',
  'Lavavajillas',
  'Secarropas',
  'Microondas',
  'Horno Eléctrico',
  'Cocina',
  'Termotanque',
] as const;

export const POPULAR_BRANDS = [
  'Whirlpool',
  'Samsung',
  'LG',
  'Drean',
  'Patrick',
  'Gafa',
  'Electrolux',
  'Bosch',
  'Longvie',
  'Eslabón de Lujo',
  'Philco',
  'Midea',
  'Carrier',
  'BGH',
] as const;
