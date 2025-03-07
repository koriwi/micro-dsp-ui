import { Chart } from "chart.js/auto";
import render from "./ui.js";

function lowpassCoeffs(f0, Q, order = 2, sampleRate = 48000) {
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

function highpassCoeffs(f0, Q, order = 2, sampleRate = 48000) {
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

function createData(config) {
  let freqGains = [];
  for (let f = 10; f <= 20000; f *= 1.2) {
    freqGains.push([f.toFixed(0), 0]);
  }

  if (config.lpOrder > 0) {
    let lpCoeffs = lowpassCoeffs(config.lpFreq, config.lpQ, config.lpOrder);
    freqGains = computeFrequencyResponse(freqGains, lpCoeffs);
  }

  let hpCoeffs = highpassCoeffs(10, 0.7, 2);
  freqGains = computeFrequencyResponse(freqGains, hpCoeffs);

  let blCoeffs = bellCoeffs(500, 1, -5);
  freqGains = computeFrequencyResponse(freqGains, blCoeffs);

  return freqGains;
}

async function main() {
  const graphCanvas = document.getElementById("graph");
  if (!graphCanvas) return;

  const chart = new Chart(graphCanvas, {
    data: {
      datasets: [
        {
          data: [],
          label: "output 1",
          fill: "start",
          backgroundColor: "#ffffff55",
          borderColor: "#ffffff",
        },
      ],
    },
    type: "line",
    options: {
      animation: {
        duration: 100,
      },
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#fff", // Legend text color
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)", // Tooltip background
          titleColor: "#fff", // Tooltip title color
          bodyColor: "#fff", // Tooltip body color
          callbacks: {
            title: (item) => (
              console.log(item), item[0].parsed.x.toFixed(0) + " Hz"
            ),
            label: (item) => item.parsed.y.toFixed(1) + " dB",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#fff", // X-axis label color
          },
          type: "logarithmic",
          min: 10,
          title: { display: true, text: "Frequency (Hz)", color: "#fff" },
          max: 20000,
          grid: {
            color: "rgba(255, 255, 255, 0.1)", // X-axis grid lines
          },
        },
        y: {
          ticks: {
            color: "#fff", // X-axis label color
          },
          min: -30,
          max: 30,
          type: "linear",
          axis: "y",
          title: { display: true, text: "Gain (dB)", color: "#fff" },
          grid: {
            color: "rgba(255, 255, 255, 0.1)", // X-axis grid lines
          },
        },
      },
      elements: {
        line: {
          borderWidth: 2, // Line thickness
        },
        point: {
          radius: 5, // Point radius
          backgroundColor: "#fff", // Point color
        },
      },
    },
  });
  chart.data.datasets[0].data = createData(0);
  chart.update();
  render(chart, createData);
}

main();
