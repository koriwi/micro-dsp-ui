import {
  CategoryScale,
  Chart,
  line,
  LinearScale,
  LineController,
  LineElement,
  LogarithmicScale,
  PointElement,
} from "chart.js";

function lowpassCoeffs(f0, Q, sampleRate = 48000) {
  let omega = (2 * Math.PI * f0) / sampleRate;
  let alpha = Math.sin(omega) / (2 * Q);

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

function highpassCoeffs(f0, Q, sampleRate = 48000) {
  let omega = (2 * Math.PI * f0) / sampleRate;
  let alpha = Math.sin(omega) / (2 * Q);

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

function bellCoeffs(f0, Q, gainDB, sampleRate = 48000) {
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

function lowshelfCoeffs(f0, Q, gainDB, sampleRate = 48000) {
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

function highshelfCoeffs(f0, Q, gainDB, sampleRate = 48000) {
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

function computeFrequencyResponse(freqGains, filterCoeffs, sampleRate = 48000) {
  const { b0, b1, b2, a1, a2 } = filterCoeffs;
  let newFreqGains = [];
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

function qToDbPerDecade(Q) {
  return 20 * Math.log10(Q);
}

async function main() {
  const graphCanvas = document.getElementById("graph");
  if (!graphCanvas) return;

  let freqGains = [];
  for (let f = 10; f <= 20000; f *= 1.1) {
    freqGains.push([f, 0]);
  }

  let lpCoeffs = lowpassCoeffs(4000, 0.707);
  let hpCoeffs = highpassCoeffs(100, 0.707);
  let blCoeffs = bellCoeffs(500, 1, -5);

  freqGains = computeFrequencyResponse(freqGains, lpCoeffs);
  freqGains = computeFrequencyResponse(freqGains, hpCoeffs);
  freqGains = computeFrequencyResponse(freqGains, blCoeffs);

  Chart.register(
    LogarithmicScale,
    LineController,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
  );
  const chart = new Chart(graphCanvas, {
    data: { datasets: [{ data: freqGains, label: "output 1" }] },
    type: "line",
    options: {
      scales: {
        x: {
          type: "logarithmic",
          min: 10,
          max: 20000,
          ticks: {
            callback: (value) => value.toLocaleString(), // Format log scale
          },
        },
        y: {
          min: -30,
          max: 30,
          type: "linear",
          axis: "y",
        },
      },
    },
  });
}

main();
