// make funtion to clear char
export const clear_char = (str) => {
  return str.replace(/[^0-9a-zA-Z]/g, "");
};

// replace alphabet to empty string
export const clear_alphabet = (str) => {
  return str.replace(/[a-zA-Z]/g, "");
};