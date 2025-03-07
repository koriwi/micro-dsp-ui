/**
 * @param {function} createData
 */
export default (chart, createData) => {
  let lpF = document.getElementById("lp-f");
  let lpFRange = document.getElementById("lp-f-range");

  let lpQ = document.getElementById("lp-q");
  let lpQRange = document.getElementById("lp-q-range");

  let lpOrder = document.getElementById("lp-order");

  function update() {
    chart.data.datasets[0].data = createData({
      lpFreq: lpF.value,
      lpQ: lpQ.value,
      lpOrder: parseInt(lpOrder.value),
    });
    chart.update();
  }

  /**
   * @param {number} position
   */
  function toLog(position) {
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

  /**
   * @param {number} position
   */
  function fromLog(value) {
    // value will be between 100 and 10000000
    var minp = 10;
    var maxp = 20000;

    var minv = Math.log(10);
    var maxv = Math.log(20000);

    // calculate adjustment factor
    var scale = (maxp - minp) / (maxv - minv);

    return minp + scale * (Math.log(value) - minv);
  }

  /**
   * @param {HTMLInputElement} valInput
   */
  function rangeChangedLog(valInput) {
    return (e) => {
      let value = toLog(e.currentTarget.value).toFixed(0);
      console.log(value);
      valInput.value = value;
      update();
    };
  }

  /**
   * @param {HTMLInputElement} rangeInput
   */
  function valueChangedLog(rangeInput) {
    return (e) => {
      rangeInput.value = fromLog(e.currentTarget.value);
      update();
    };
  }

  function valueChanged(input) {
    return (e) => {
      input.value = e.currentTarget.value;
      update();
    };
  }

  lpFRange.addEventListener("input", rangeChangedLog(lpF));
  lpF.addEventListener("change", valueChangedLog(lpFRange));

  lpQRange.addEventListener("input", valueChanged(lpQ));
  lpQ.addEventListener("change", valueChanged(lpQRange));

  lpOrder.addEventListener("change", (_e) => {
    update();
  });

  // todo use initial value from function call
  lpF.value = 1000;
  lpFRange.value = fromLog(1000);

  lpQRange.value = 0.7;
  lpQ.value = 0.7;

  lpOrder.selectedIndex = 0;
};
