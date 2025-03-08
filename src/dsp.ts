import { EQConfig } from "./global";

function lowpassCoeffs(
  f0: number,
  Q: number,
  order: number = 2,
  sampleRate: number = 48000,
) {
  if (order !== 1 && order !== 2) {
    throw new Error("Order must be 1 or 2");
  }

  let omega = (2 * Math.PI * f0) / sampleRate;
  let alpha = Math.sin(omega) / (2 * Q);

  if (order === 1) {
    let b0 = omega / (omega + 1);
    let b1 = b0;
    let b2 = 0; // Not used in 1st order
    let a1 = (omega - 1) / (omega + 1);
    let a2 = 0; // Not used in 1st order

    return {
      b0: b0,
      b1: b1,
      b2: b2,
      a1: a1,
      a2: a2,
    };
  } else {
    let b0 = (1 - Math.cos(omega)) / 2;
    let b1 = 1 - Math.cos(omega);
    let b2 = (1 - Math.cos(omega)) / 2;
    let a0 = 1 + alpha;
    let a1 = -2 * Math.cos(omega);
    let a2 = 1 - alpha;

    return {
      b0: b0 / a0,
      b1: b1 / a0,
      b2: b2 / a0,
      a1: a1 / a0,
      a2: a2 / a0,
    };
  }
}

function highpassCoeffs(
  f0: number,
  Q: number,
  order: number = 2,
  sampleRate = 48000,
) {
  if (order !== 1 && order !== 2) {
    throw new Error("Order must be 1 or 2");
  }

  let omega = (2 * Math.PI * f0) / sampleRate;
  let alpha = Math.sin(omega) / (2 * Q);

  if (order === 1) {
    let b0 = (1 + Math.cos(omega)) / 2;
    let b1 = -(1 + Math.cos(omega));
    let b2 = 0; // Not used in 1st order
    let a0 = 1 + alpha;
    let a1 = -2 * Math.cos(omega);
    let a2 = 0; // Not used in 1st order

    return {
      b0: b0 / a0,
      b1: b1 / a0,
      b2: b2,
      a1: a1 / a0,
      a2: a2,
    };
  } else {
    let b0 = (1 + Math.cos(omega)) / 2;
    let b1 = -(1 + Math.cos(omega));
    let b2 = (1 + Math.cos(omega)) / 2;
    let a0 = 1 + alpha;
    let a1 = -2 * Math.cos(omega);
    let a2 = 1 - alpha;

    return {
      b0: b0 / a0,
      b1: b1 / a0,
      b2: b2 / a0,
      a1: a1 / a0,
      a2: a2 / a0,
    };
  }
}

function bellCoeffs(f0: number, Q: number, gainDB: number, sampleRate = 48000) {
  let A = Math.pow(10, gainDB / 40); // Convert dB gain to linear
  let omega = (2 * Math.PI * f0) / sampleRate;
  let alpha = Math.sin(omega) / (2 * Q);

  let b0 = 1 + alpha * A;
  let b1 = -2 * Math.cos(omega);
  let b2 = 1 - alpha * A;
  let a0 = 1 + alpha / A;
  let a1 = -2 * Math.cos(omega);
  let a2 = 1 - alpha / A;

  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}

function lowshelfCoeffs(
  f0: number,
  Q: number,
  gainDB: number,
  sampleRate = 48000,
) {
  let A = Math.pow(10, gainDB / 40);
  let omega = (2 * Math.PI * f0) / sampleRate;
  let alpha = Math.sin(omega) / (2 * Q);
  let sqrtA = Math.sqrt(A);

  let b0 = A * (A + 1 - (A - 1) * Math.cos(omega) + 2 * sqrtA * alpha);
  let b1 = 2 * A * (A - 1 - (A + 1) * Math.cos(omega));
  let b2 = A * (A + 1 - (A - 1) * Math.cos(omega) - 2 * sqrtA * alpha);
  let a0 = A + 1 + (A - 1) * Math.cos(omega) + 2 * sqrtA * alpha;
  let a1 = -2 * (A - 1 + (A + 1) * Math.cos(omega));
  let a2 = A + 1 + (A - 1) * Math.cos(omega) - 2 * sqrtA * alpha;

  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}

function highshelfCoeffs(
  f0: number,
  Q: number,
  gainDB: number,
  sampleRate = 48000,
) {
  let A = Math.pow(10, gainDB / 40);
  let omega = (2 * Math.PI * f0) / sampleRate;
  let alpha = Math.sin(omega) / (2 * Q);
  let sqrtA = Math.sqrt(A);

  let b0 = A * (A + 1 + (A - 1) * Math.cos(omega) + 2 * sqrtA * alpha);
  let b1 = -2 * A * (A - 1 + (A + 1) * Math.cos(omega));
  let b2 = A * (A + 1 + (A - 1) * Math.cos(omega) - 2 * sqrtA * alpha);
  let a0 = A + 1 - (A - 1) * Math.cos(omega) + 2 * sqrtA * alpha;
  let a1 = 2 * (A - 1 - (A + 1) * Math.cos(omega));
  let a2 = A + 1 - (A - 1) * Math.cos(omega) - 2 * sqrtA * alpha;

  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}
type FilterCoeffs = {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
};
function computeFrequencyResponse(
  freqGains: Array<[number, number]>,
  filterCoeffs: FilterCoeffs,
  sampleRate = 48000,
) {
  const { b0, b1, b2, a1, a2 } = filterCoeffs;
  let newFreqGains: Array<[number, number]> = [];
  for (let [freq, gain] of freqGains) {
    let omega = (2 * Math.PI * freq) / sampleRate;

    // Compute e^(-jω) = cos(ω) - j sin(ω)
    let cos1 = Math.cos(omega),
      sin1 = Math.sin(omega);
    let cos2 = Math.cos(2 * omega),
      sin2 = Math.sin(2 * omega);

    // Compute numerator in real/imaginary form
    let numReal = b0 + b1 * cos1 + b2 * cos2;
    let numImag = 0 + b1 * -sin1 + b2 * -sin2;

    // Compute denominator in real/imaginary form
    let denReal = 1 + a1 * cos1 + a2 * cos2;
    let denImag = 0 + a1 * -sin1 + a2 * -sin2;

    // Compute magnitude |H(f)|
    let denominatorMagnitude = Math.sqrt(denReal * denReal + denImag * denImag);
    let numeratorMagnitude = Math.sqrt(numReal * numReal + numImag * numImag);
    let magnitude = numeratorMagnitude / denominatorMagnitude;

    // Convert to dB
    let newGain = 20 * Math.log10(magnitude);
    newFreqGains.push([freq, gain + newGain]);
  }
  return newFreqGains;
}

export function createData(config: EQConfig) {
  let freqGains: Array<[number, number]> = [];
  for (let f = 10; f <= 20000; f *= 1.2) {
    freqGains.push([Math.round(f), 0]);
  }

  if (config.lowpass.order > 0) {
    let lpCoeffs = lowpassCoeffs(
      config.lowpass.freq,
      config.lowpass.q,
      config.lowpass.order,
    );
    freqGains = computeFrequencyResponse(freqGains, lpCoeffs);
  }

  if (config.highpass.order > 0) {
    let hpCoeffs = highpassCoeffs(
      config.highpass.freq,
      config.highpass.q,
      config.highpass.order,
    );
    freqGains = computeFrequencyResponse(freqGains, hpCoeffs);
  }

  let blCoeffs = bellCoeffs(500, 1, -5);
  freqGains = computeFrequencyResponse(freqGains, blCoeffs);

  return freqGains;
}
