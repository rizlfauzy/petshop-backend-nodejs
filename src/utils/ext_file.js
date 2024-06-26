export const ext_file = (text, ...exts) => {
  return exts.some((ext) => text.endsWith(ext));
}