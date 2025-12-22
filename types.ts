
export enum Continent {
  AFRICA = 'África',
  AMERICAS = 'Américas',
  ASIA = 'Ásia',
  EUROPE = 'Europa',
  OCEANIA = 'Oceânia'
}

export enum TicketState {
  AMOSTRA = 'Amostra',
  SPECIMEN = 'Specimen',
  CS = 'cs (Circulado)',
  UNCIRCULATED = 'Não Circulado'
}

export interface LotteryTicket {
  id: string; 
  autoId: string; 
  extractionNo: string;
  dimensions: string;
  drawDate: string;
  value: string;
  country: string;
  continent: Continent;
  state: TicketState;
  type: string;
  entity: string;
  frontImageUrl: string;
  backImageUrl?: string;
  notes?: string;
  createdAt: number;
  isFavorite?: boolean;
}

export interface CollectionStats {
  totalItems: number;
  byContinent: Record<string, number>;
  byState: Record<string, number>;
  byCountry: Record<string, number>;
}
