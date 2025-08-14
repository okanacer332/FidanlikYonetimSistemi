export interface InflationData {
  id: string;
  date: string; // Backend'den string olarak gelir, frontend'de formatlarız.
  value: number;
  seriesName: string;
}