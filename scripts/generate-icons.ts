import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePngBuffer(width: number, height: number, isMaskable: boolean = false): Buffer {
  // RGBA buffer with filter byte 0 at start of each scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep winter twilight gradient background
      const gradFactor = y / height;
      let r = Math.round(15 + gradFactor * 25);
      let g = Math.round(23 + gradFactor * 40);
      let b = Math.round(42 + gradFactor * 80);
      let a = 255;

      if (!isMaskable && dist > radius) {
        // Soft rounded corner / circle mask for regular icons
        const edge = dist - radius;
        if (edge > 2) {
          a = 0;
          r = 0;
          g = 0;
          b = 0;
        } else {
          a = Math.round(255 * (1 - edge / 2));
        }
      }

      // Draw stylized golden snowplough blade and snowflake in center
      // Snowplough blade: trapezoid near bottom
      const bladeTop = cy + height * 0.08;
      const bladeBottom = cy + height * 0.32;
      const bladeHalfWidth = width * (0.28 + (y - bladeTop) * 0.001);
      
      if (y >= bladeTop && y <= bladeBottom && Math.abs(dx) <= bladeHalfWidth) {
        // Vibrant holiday orange/gold plow
        r = 245;
        g = 158;
        b = 11;
        // Hazard stripe accent
        if ((x + y) % Math.round(width * 0.07) < Math.round(width * 0.035)) {
          r = 217;
          g = 119;
          b = 6;
        }
      }

      // Snowflake icon in center upper area
      const snowflakeCy = cy - height * 0.12;
      const sdy = y - snowflakeCy;
      const sDist = Math.sqrt(dx * dx + sdy * sdy);
      const sRadius = width * 0.22;

      if (sDist < sRadius) {
        const angle = Math.atan2(sdy, dx);
        const mod6 = Math.abs((((angle * 6) / Math.PI) % 2) - 1);
        const onArm = mod6 < 0.18;
        const onRing = Math.abs(sDist - sRadius * 0.5) < width * 0.02;

        if (onArm || onRing) {
          // Frosty glowing cyan-white
          r = 224;
          g = 242;
          b = 254;
        }
      }

      // Festive Pine tree silhouette in background
      const treeTop = cy - height * 0.30;
      const treeBottom = cy + height * 0.06;
      if (y >= treeTop && y <= treeBottom) {
        const treeWidth = (y - treeTop) / (treeBottom - treeTop) * (width * 0.26);
        if (Math.abs(dx) <= treeWidth) {
          // Forest pine green
          r = Math.min(255, r + 15);
          g = Math.min(255, g + 80);
          b = Math.min(255, b + 45);
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // Color type 6 (RGBA)
  ihdr[10] = 0; // Compression deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace none
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate PNGs
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePngBuffer(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePngBuffer(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePngBuffer(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePngBuffer(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePngBuffer(64, 64, false));

// 2. Generate SVG icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="plow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)" />
  <circle cx="256" cy="256" r="230" fill="none" stroke="#38bdf8" stroke-opacity="0.15" stroke-width="4" />
  
  <!-- Pine Tree -->
  <polygon points="256,90 290,160 270,160 305,230 207,230 242,160 222,160" fill="#059669" />
  <rect x="248" y="230" width="16" height="30" fill="#78350f" />
  
  <!-- Glowing Snowflake -->
  <g stroke="#e0f2fe" stroke-width="8" stroke-linecap="round" filter="url(#glow)">
    <line x1="256" y1="130" x2="256" y2="250" />
    <line x1="204" y1="160" x2="308" y2="220" />
    <line x1="204" y1="220" x2="308" y2="160" />
  </g>
  
  <!-- Snowdrifts -->
  <path d="M 30 380 Q 140 340 256 360 Q 370 380 482 350 L 482 482 L 30 482 Z" fill="#94a3b8" opacity="0.3" />
  <path d="M 30 405 Q 160 370 256 390 Q 350 410 482 375 L 482 482 L 30 482 Z" fill="#f8fafc" />

  <!-- Snow Plough Blade -->
  <path d="M 120 370 L 392 370 L 372 430 L 140 430 Z" fill="url(#plow)" stroke="#b45309" stroke-width="5" />
  <line x1="160" y1="375" x2="150" y2="425" stroke="#78350f" stroke-width="4" />
  <line x1="256" y1="375" x2="256" y2="425" stroke="#78350f" stroke-width="4" />
  <line x1="352" y1="375" x2="362" y2="425" stroke="#78350f" stroke-width="4" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);
console.log('PWA icon assets generated successfully in /public');
