/**
 * Just enough PNG to drop an alpha channel.
 *
 * An iOS app icon containing an alpha channel is rejected by App Store Connect
 * before a human ever sees it, and Chromium decides for itself whether to write
 * a screenshot as RGB or RGBA. Rather than add an image dependency for one byte
 * of header, this guarantees the opaque icons: inflate the image data, undo the
 * per-scanline filters, composite each pixel onto the paper colour, and deflate
 * it back out as colour type 2.
 *
 * Deliberately narrow — it handles the 8-bit non-interlaced RGB and RGBA that
 * Chromium produces, and throws on anything else rather than guessing.
 */

import { deflateSync, inflateSync } from "node:zlib";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

type Chunk = { type: string; data: Buffer };

const readChunks = (png: Buffer): Chunk[] => {
  if (!png.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error("Not a PNG.");
  }

  const chunks: Chunk[] = [];
  let offset = 8;

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    chunks.push({ type, data: png.subarray(offset + 8, offset + 8 + length) });
    offset += length + 12;
  }

  return chunks;
};

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let c = index;
  for (let bit = 0; bit < 8; bit += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

const crc32 = (buffer: Buffer) => {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type: string, data: Buffer) => {
  const head = Buffer.alloc(4);
  head.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([head, body, crc]);
};

const paeth = (a: number, b: number, c: number) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
};

/** Reverses the five PNG scanline filters in place, returning raw samples. */
const unfilter = (raw: Buffer, width: number, height: number, bpp: number) => {
  const stride = width * bpp;
  const out = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const target = out.subarray(y * stride, (y + 1) * stride);
    const previous = y > 0 ? out.subarray((y - 1) * stride, y * stride) : undefined;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bpp ? target[x - bpp] : 0;
      const up = previous ? previous[x] : 0;
      const upLeft = previous && x >= bpp ? previous[x - bpp] : 0;
      const value = line[x];

      switch (filter) {
        case 0:
          target[x] = value;
          break;
        case 1:
          target[x] = (value + left) & 0xff;
          break;
        case 2:
          target[x] = (value + up) & 0xff;
          break;
        case 3:
          target[x] = (value + ((left + up) >> 1)) & 0xff;
          break;
        case 4:
          target[x] = (value + paeth(left, up, upLeft)) & 0xff;
          break;
        default:
          throw new Error(`Unknown PNG filter ${filter} on row ${y}.`);
      }
    }
  }

  return out;
};

const parseHex = (hex: string) => {
  const clean = hex.replace("#", "");
  return [0, 2, 4].map((index) => parseInt(clean.slice(index, index + 2), 16));
};

/**
 * Returns an RGB (colour type 2) copy of an RGBA PNG, with every pixel
 * composited onto `background` so semi-transparent antialiasing along the
 * mark's edge lands on the paper rather than on black.
 */
export const flattenToOpaque = (png: Buffer, background: string) => {
  const chunks = readChunks(png);
  const header = chunks.find((entry) => entry.type === "IHDR");
  if (!header) {
    throw new Error("PNG has no IHDR.");
  }

  const width = header.data.readUInt32BE(0);
  const height = header.data.readUInt32BE(4);
  const depth = header.data[8];
  const colorType = header.data[9];
  const interlace = header.data[12];

  // Chromium drops the alpha channel itself when a screenshot came out fully
  // opaque, which is the usual outcome for the tiles that carry a ground. That
  // file is already what the stores want, so it passes straight through.
  if (depth === 8 && colorType === 2 && interlace === 0) {
    return png;
  }

  if (depth !== 8 || colorType !== 6 || interlace !== 0) {
    throw new Error(
      `Expected 8-bit RGB or RGBA, non-interlaced; got depth ${depth} type ${colorType} interlace ${interlace}.`
    );
  }

  const idat = Buffer.concat(
    chunks.filter((entry) => entry.type === "IDAT").map((entry) => entry.data)
  );
  const samples = unfilter(inflateSync(idat), width, height, 4);
  const [bgR, bgG, bgB] = parseHex(background);

  // One filter byte per row, then three samples per pixel. Filter 0 keeps the
  // encoder trivial; these are flat-colour icons, so the deflate ratio barely
  // moves with a cleverer predictor.
  const out = Buffer.alloc(height * (width * 3 + 1));

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 3 + 1);
    out[rowStart] = 0;

    for (let x = 0; x < width; x += 1) {
      const source = (y * width + x) * 4;
      const alpha = samples[source + 3] / 255;
      const target = rowStart + 1 + x * 3;

      out[target] = Math.round(samples[source] * alpha + bgR * (1 - alpha));
      out[target + 1] = Math.round(samples[source + 1] * alpha + bgG * (1 - alpha));
      out[target + 2] = Math.round(samples[source + 2] * alpha + bgB * (1 - alpha));
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;

  return Buffer.concat([
    SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(out, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
};

/** Width, height and colour type of a PNG, for asserting on a built file. */
export const readPngHeader = (png: Buffer) => {
  const header = readChunks(png).find((entry) => entry.type === "IHDR");
  if (!header) {
    throw new Error("PNG has no IHDR.");
  }
  return {
    width: header.data.readUInt32BE(0),
    height: header.data.readUInt32BE(4),
    colorType: header.data[9],
    hasAlpha: header.data[9] === 4 || header.data[9] === 6
  };
};
