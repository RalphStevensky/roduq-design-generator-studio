/** Structured brief consumed by the generator (matches tests/roduq/fixtures/briefs/*.json). */
export interface Brief {
  readonly clientId: string;
  readonly brief: string;
  readonly audience: string;
  readonly toneAdjectives: string[];
  readonly brandColors: string[] | null;
  readonly _meta?: {
    readonly skill?: string;
    readonly expectedMatrix?: {
      readonly conservative?: string;
      readonly modern?: string;
      readonly bold?: string;
    };
  };
  readonly industryHints?: {
    readonly uniqueValueProp?: string;
    readonly competitors?: string[];
    readonly pricingModel?: string;
  };
}

export interface GenerateResult {
  readonly clientDir: string;
  readonly files: string[];
  readonly preset: string;
  readonly usage: { input: number; output: number; total: number };
}
