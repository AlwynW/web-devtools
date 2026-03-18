// ASCII 0-255 with names for reference
const ASCII_NAMES = {
  0: "NUL (null)",
  1: "SOH (start of heading)",
  2: "STX (start of text)",
  3: "ETX (end of text)",
  4: "EOT (end of transmission)",
  5: "ENQ (enquiry)",
  6: "ACK (acknowledge)",
  7: "BEL (bell)",
  8: "BS (backspace)",
  9: "TAB (horizontal tab)",
  10: "LF (line feed)",
  11: "VT (vertical tab)",
  12: "FF (form feed)",
  13: "CR (carriage return)",
  14: "SO (shift out)",
  15: "SI (shift in)",
  16: "DLE (data link escape)",
  17: "DC1 (device control 1)",
  18: "DC2 (device control 2)",
  19: "DC3 (device control 3)",
  20: "DC4 (device control 4)",
  21: "NAK (negative acknowledge)",
  22: "SYN (synchronous idle)",
  23: "ETB (end of trans. block)",
  24: "CAN (cancel)",
  25: "EM (end of medium)",
  26: "SUB (substitute)",
  27: "ESC (escape)",
  28: "FS (file separator)",
  29: "GS (group separator)",
  30: "RS (record separator)",
  31: "US (unit separator)",
  32: "space",
  127: "DEL (delete)",
};

export const ASCII_CHARS = Array.from({ length: 256 }, (_, i) => {
  const char = i <= 32 || i === 127 ? "" : String.fromCharCode(i);
  return {
    code: i,
    hex: i.toString(16).toUpperCase().padStart(2, "0"),
    char: char || (ASCII_NAMES[i] ? "—" : "?"),
    name: ASCII_NAMES[i] || (i >= 33 && i <= 126 ? `"${String.fromCharCode(i)}"` : `U+${i.toString(16).toUpperCase().padStart(4, "0")}`),
  };
});
