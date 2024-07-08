export function format_rupiah(
  angka,
  options = {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }
) {
  return new Intl.NumberFormat("id-ID", options).format(Number(angka));
}

export function deformat_rupiah(angka) {
  return angka.replace(/[^0-9]/g, "");
}