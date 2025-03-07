export default (chart, createData) => {
  let lpVal = document.getElementById("lp-val");
  let lpRange = document.getElementById("lp-range");

  /**
   * @param {number} position
   */
  function sliderToValue(position) {
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
  function valueToSlider(value) {
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
  function rangeChanged(valInput) {
    return (e) => {
      let value = sliderToValue(e.currentTarget.value).toFixed(0);
      valInput.value = value;
      chart.data.datasets[0].data = createData(value);
      chart.update();
    };
  }

  /**
   * @param {HTMLInputElement} rangeInput
   */
  function valueChanged(rangeInput) {
    return (e) => {
      rangeInput.value = valueToSlider(e.currentTarget.value);
    };
  }

  lpRange.addEventListener("mousemove", rangeChanged(lpVal));
  lpRange.addEventListener("change", rangeChanged(lpVal));
  lpVal.addEventListener("change", valueChanged(lpRange));
};
