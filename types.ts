
export enum Continent {
  AFRICA = 'Africa',
  AMERICAS = 'Americas',
  ASIA = 'Asia',
  EUROPE = 'Europe',
  OCEANIA = 'Oceania'
}

export enum TicketState {
  AMOSTRA = 'Amostra',
  SPECIMEN = 'Specimen',
  CS = 'cs (Circulated)',
  UNCIRCULATED = 'Uncirculated'
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
}

export interface CollectionStats {
  totalItems: number;
  byContinent: Record<string, number>;
  byState: Record<string, number>;
  byCountry: Record<string, number>;
}
