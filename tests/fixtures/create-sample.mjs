import fs from 'node:fs';
import zlib from 'node:zlib';

// Creates a valid 640x360 RGBA PNG file with real visual features (a room, a hero rectangle, and contrast)
function createValidPNG(width, height) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
  }

  // Simple CRC32 implementation
  function crc32(buf) {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xEDB88320);
      }
    }
    return ~c;
  }

  // Raw image raster data: height scanlines, each line starting with filter byte 0
  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      // Draw a dark room background with warm light on the left and a hero handheld rectangle in the foreground
      const isHeroDevice = x >= 120 && x <= 340 && y >= 140 && y <= 290;
      const isScreen = x >= 160 && x <= 300 && y >= 165 && y <= 265;
      const isWarmLamp = x < 100 && y < 120;

      if (isScreen) {
        // Crisp customized display
        raw[offset++] = 40;  // R
        raw[offset++] = 160; // G
        raw[offset++] = 220; // B
        raw[offset++] = 255; // A
      } else if (isHeroDevice) {
        // Matte dark magnesium chassis
        raw[offset++] = 35;
        raw[offset++] = 37;
        raw[offset++] = 42;
        raw[offset++] = 255;
      } else if (isWarmLamp) {
        // Warm practical lamp light
        raw[offset++] = 230;
        raw[offset++] = 180;
        raw[offset++] = 110;
        raw[offset++] = 255;
      } else {
        // Ambient room gradient
        const grad = Math.min(255, Math.floor(15 + (x / width) * 25));
        raw[offset++] = grad;
        raw[offset++] = grad;
        raw[offset++] = grad + 5;
        raw[offset++] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(raw);
  const idatChunk = makeChunk('IDAT', compressed);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuffer = createValidPNG(640, 360);
fs.writeFileSync('tests/fixtures/sample-thumbnail.png', pngBuffer);
console.log('✓ Generated valid 640x360 test thumbnail PNG asset at tests/fixtures/sample-thumbnail.png (' + pngBuffer.length + ' bytes)');
