export const options_invoice = {
  format: "A3",
  orientation: "portrait",
  border: "10mm",
  // Custom page size defined here
  width: "612px",
  height: "396px",
  footer: {
    height: "20mm",
    content: {
      first: "Cover Page",
      2: "Second Page",
      default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
      last: "Last Page",
    },
  },
};

export const options_report = {
  format: "F4",
  orientation: "portrait",
  border: "5mm",
  // footer: {
  //   height: "20mm",
  //   content: {
  //     first: "Cover Page",
  //     2: "Second Page",
  //     default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
  //     last: "Last Page",
  //   },
  // },
};