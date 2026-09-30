import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const screenshotsDir = path.resolve('docs/screenshots');

const files = [
  'study-session',
  'dashboard-analytics',
  'decks-catalog',
];

for (const name of files) {
  const svgPath = path.join(screenshotsDir, `${name}.svg`);
  const pngPath = path.join(screenshotsDir, `${name}.png`);

  if (!fs.existsSync(svgPath)) {
    console.error(`SVG not found: ${svgPath}`);
    continue;
  }

  const svg = fs.readFileSync(svgPath, 'utf8');
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200, // crisp high-res 1200px width PNG
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`Saved PNG: ${pngPath} (${pngBuffer.length} bytes)`);
}
