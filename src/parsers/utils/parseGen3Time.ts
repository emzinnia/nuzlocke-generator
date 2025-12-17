import { Buffer } from "buffer";

export const parseGen3Time = (buf: Buffer) => {
    // Gen 3 stores playtime as 5 bytes:
    // - hours:   u16 little-endian (bytes 0-1)
    // - minutes: u8  (byte 2)
    // - seconds: u8  (byte 3)
    // - frames:  u8  (byte 4) (1/60s; ignored for display)
    const time = Buffer.from(buf);
    const hours = time.readUInt16LE(0);
    const minutes = time.readUInt8(2);
    const seconds = time.readUInt8(3);

    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return `${hours}:${mm}:${ss}`;
};


