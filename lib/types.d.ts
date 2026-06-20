export interface WaterRow {
  year: string;
  Takari: number;
  Mhaisal: number;
  Tembhu: number;
  Total: number;
}

export interface TaxRow {
  scheme: string;
  year: string;
  waterIncl: number;
  waterExcl: number;
  expectedTax: number;
  actualRecovery: number;
  difference: number;
}

export interface ElecRow {
  month: string;
  charges: number;
}
