export const generateUUIDv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const generateUUIDv1 = () => {
  const time = Date.now() * 10000 + 122192928000000000;
  const timeHex = time.toString(16).padStart(16, "0");
  const timeLow = timeHex.slice(8, 16);
  const timeMid = timeHex.slice(4, 8);
  const timeHi = "1" + timeHex.slice(1, 4);
  const clockSeq = (Math.floor(Math.random() * 16384) | 0x8000).toString(16);
  const node = Math.floor(Math.random() * 281474976710656)
    .toString(16)
    .padStart(12, "0");
  return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`;
};

export const generateUUIDv7 = () => {
  const ts = Date.now().toString(16).padStart(12, "0");
  const randA = Math.floor(Math.random() * 4096)
    .toString(16)
    .padStart(3, "0");
  const varRand = (8 + Math.floor(Math.random() * 4)).toString(16);
  const randB1 = Math.floor(Math.random() * 4096)
    .toString(16)
    .padStart(3, "0");
  const randB2 = Math.floor(Math.random() * 281474976710656)
    .toString(16)
    .padStart(12, "0");
  return `${ts.slice(0, 8)}-${ts.slice(8, 12)}-7${randA}-${varRand}${randB1}-${randB2}`;
};
