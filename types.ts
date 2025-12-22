
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
  id: string; // Internal UUID
  autoId: string; // The generated ID (e.g., PT-001)
  extractionNo: string;
  dimensions: string;
  drawDate: string;
  value: string;
  country: string;
  continent: Continent;
  state: TicketState;
  type: string;
  entity: string;
  imageUrl: string;
  notes?: string;
  createdAt: number;
}

export interface CollectionStats {
  totalItems: number;
  byContinent: Record<string, number>;
  byState: Record<string, number>;
  byCountry: Record<string, number>;
}
