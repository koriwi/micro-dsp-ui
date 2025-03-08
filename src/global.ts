import { atom } from "nanostores";

export interface PassConfig {
  order: 1 | 2;
  q: number;
  freq: number;
}
export interface EQConfig {
  lowpass: PassConfig;
  highpass: PassConfig;
}
export const eq = atom<EQConfig>({
  lowpass: {
    order: 1,
    q: 0.7,
    freq: 1000,
  },
  highpass: {
    order: 1,
    q: 0.7,
    freq: 1000,
  },
});
