export default function month_diff(d1, d2) {
  let months;
  months = (parseInt(d2.substring(0, 4)) - parseInt(d1.substring(0, 4))) * 12;
  months -= parseInt(d1.substring(4, 6));
  months += parseInt(d2.substring(4, 6));
  return Math.abs(months);
}