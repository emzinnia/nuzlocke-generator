import { Buffer } from "buffer";

// Used by Gen 1 and 2
export const parseTime = (buf: Buffer) => {
    const time = Buffer.from(buf);
    const hours = time[0x01] + time[0x00];
    const minutes = time[0x02] + time[0x03];
    const minutesFormatted = minutes === 0 ? "00" : minutes;

    return `${hours}:${minutesFormatted}`;
};
