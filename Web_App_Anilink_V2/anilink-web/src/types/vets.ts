/** UI shape for VetCard and detail pages. id is backend UUID string from API. */
export interface Vet {
  id: string | number;
  clinic: string;
  vet: string;
  rating: number;
  reviews: number;
  distance: string;
  /** Service badges: Livestock, Poultry, Pets, Farm Visits, 24/7 */
  specialties: string[];
  availability: string;
  phone: string;
  hours: string;
  /** For "Get directions" / map */
  address?: string;
  lat?: number;
  lng?: number;
  /** Farm visit offered */
  farmVisits?: boolean;
  /** 24/7 */
  twentyFourSeven?: boolean;
  /** Services: Livestock, Poultry, Pets */
  services?: string[];
  whatsapp?: string;
}

/** API response shape from GET /v1/vets and GET /v1/vets/:id */
export interface VetDto {
  id: string;
  clinicName: string;
  name: string;
  rating: number;
  reviewCount: number;
  is24Hours?: boolean;
  offersFarmVisits?: boolean;
  district?: string;
  distance_km?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  locationLabel?: string;
  phone?: string;
  services?: string[] | { name: string }[];
  specialization?: string;
  availability?: string;
  isVerified?: boolean;
}

/** GET /vets/me - vet profile (me). */
export interface VetProfileMeDto {
  id: string;
  name: string;
  clinicName: string;
  district?: string | null;
  address?: string | null;
  locationLabel?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  offersFarmVisits?: boolean;
  is24Hours?: boolean;
}

/** Time range HH:MM. */
export interface TimeRangeDto {
  start: string;
  end: string;
}

/** GET/PUT /vets/me/availability - weekly schedule + toggles. */
export interface VetAvailabilityDto {
  acceptFarmVisits: boolean;
  isEmergency247: boolean;
  weeklySchedule?: {
    mon?: TimeRangeDto[];
    tue?: TimeRangeDto[];
    wed?: TimeRangeDto[];
    thu?: TimeRangeDto[];
    fri?: TimeRangeDto[];
    sat?: TimeRangeDto[];
    sun?: TimeRangeDto[];
  };
}
