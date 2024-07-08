export const options_pdf = {
  format: "A3",
  orientation: "portrait",
  border: "10mm",
  // Custom page size defined here
  width: "612px",
  height: "396px",
  footer: {
    height: '20mm',
    content: {
      first: "Cover Page",
      2: "Second Page",
      default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
      last: "Last Page"
    }
  }
};