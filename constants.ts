
import { Continent, TicketState } from './types';

export const CONTINENTS = Object.values(Continent);
export const TICKET_STATES = Object.values(TicketState);

export const COUNTRY_ISO_MAP: Record<string, string> = {
  'Portugal': 'PT',
  'Spain': 'ES',
  'Brazil': 'BR',
  'USA': 'US',
  'United Kingdom': 'UK',
  'France': 'FR',
  'Italy': 'IT',
  'Germany': 'DE',
  'Japan': 'JP',
  'China': 'CN',
  'Australia': 'AU'
};

export const LOTTERY_TYPES = [
  'National Lottery',
  'Instant Win / Scratchcard',
  'Charity Lottery',
  'Raffle',
  'State Lottery',
  'Regional Lottery'
];
