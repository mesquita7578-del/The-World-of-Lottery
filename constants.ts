
import { Continent, TicketState } from './types';

export const CONTINENTS = Object.values(Continent);
export const TICKET_STATES = Object.values(TicketState);

export const COUNTRY_ISO_MAP: Record<string, string> = {
  'Portugal': 'PT',
  'Espanha': 'ES',
  'Brasil': 'BR',
  'EUA': 'US',
  'Reino Unido': 'UK',
  'França': 'FR',
  'Itália': 'IT',
  'Alemanha': 'DE',
  'Japão': 'JP',
  'China': 'CN',
  'Austrália': 'AU'
};

export const LOTTERY_TYPES = [
  'Lotaria Nacional',
  'Raspadinha / Instantânea',
  'Lotaria de Caridade',
  'Rifa',
  'Lotaria Estatal',
  'Lotaria Regional'
];
