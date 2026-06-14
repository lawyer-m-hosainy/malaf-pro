import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 192, 512];
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#1D9E75"/>
  <text x="50" y="65"
        text-anchor="middle"
        font-size="50"
        fill="white"
        font-family="Arial">م</text>
</svg>`;

const dir = 'public/icons';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

for (const size of sizes) {
  await sharp(Buffer.from(svgIcon))
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
  console.log(`Generated ${size}x${size}`);
}
