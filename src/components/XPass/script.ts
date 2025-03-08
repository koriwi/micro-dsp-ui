import { eq, PassConfig } from "../../global.ts";

export function attach(elem: HTMLElement, pass: "low" | "high") {
  let passFreq = elem.querySelector("#p-f") as HTMLInputElement;
  let passFreqRange = elem.querySelector("#p-f-range") as HTMLInputElement;

  let passQ = elem.querySelector("#p-q") as HTMLInputElement;
  let passQRange = elem.querySelector("#p-q-range") as HTMLInputElement;

  let passOrder = elem.querySelector("#p-order") as HTMLInputElement;

  type setting = keyof PassConfig;
  type settingVal = PassConfig[setting];

  function update(settingKey: setting, settingValue: settingVal) {
    let key = pass === "low" ? "lowpass" : "highpass";
    let parentObject = eq.value[key];
    parentObject[settingKey] = settingValue;
    eq.set({
      ...eq.value,
      [key]: parentObject,
    });
    window.dispatchEvent(new CustomEvent("update"));
  }

  function toLog(position: number) {
    // position will be between 0 and 100
    var minp = 10;
    var maxp = 20000;

    // The result should be between 100 an 10000000
    var minv = Math.log(10);
    var maxv = Math.log(20000);

    // calculate adjustment factor
    var scale = (maxv - minv) / (maxp - minp);

    return Math.exp(minv + scale * (position - minp));
  }

  function fromLog(value: number) {
    // value will be between 100 and 10000000
    var minp = 10;
    var maxp = 20000;

    var minv = Math.log(10);
    var maxv = Math.log(20000);

    // calculate adjustment factor
    var scale = (maxp - minp) / (maxv - minv);

    return minp + scale * (Math.log(value) - minv);
  }

  function rangeChangedLog(valInput: HTMLInputElement) {
    return (e: Event) => {
      let rawValue = (e.target as HTMLInputElement).value;
      let value = toLog(parseInt(rawValue)).toFixed(0);
      valInput.value = value;
      return parseInt(value);
    };
  }

  function valueChangedLog(rangeInput: HTMLInputElement) {
    return (e: Event) => {
      let rawValue = (e.target as HTMLInputElement).value;
      let value = fromLog(parseInt(rawValue)).toString();
      rangeInput.value = value;
      return parseInt(value);
    };
  }

  function valueChanged(input: HTMLInputElement) {
    return (e: Event) => {
      let value = (e.target as HTMLInputElement).value;
      input.value = value;
      return parseInt(value);
    };
  }
  passFreqRange.addEventListener("input", (e) => {
    const value = rangeChangedLog(passFreq)(e);
    update("freq", value);
  });
  passFreq.addEventListener("change", (e) => {
    const value = valueChangedLog(passFreqRange)(e);
    update("freq", value);
  });

  passQRange.addEventListener("input", valueChanged(passQ));
  passQ.addEventListener("change", valueChanged(passQRange));

  passOrder.addEventListener("change", (e) => {
    update("order", parseInt((e.target as HTMLInputElement).value));
  });
}
