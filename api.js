import sharp from 'sharp';
function parseBirthDate(value) { const raw = String(value || '').trim(); let day, month, year;
let match = raw.match(/^(\d{2}).(\d{2}).(\d{4})$/);
if (match) { [, day, month, year] = match; } else { match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
if (match) {
  [, year, month, day] = match;
}
}
if (!match) { throw new Error('Используйте формат ДД.ММ.ГГГГ'); }
const d = Number(day); const m = Number(month); const y = Number(year);
const date = new Date(Date.UTC(y, m - 1, d));
if (
  date.getUTCFullYear() !== 
  y  date.getUTCMonth() !== m - 1  
  date.getUTCDate() !== d
    ) { 
      throw new Error('Такой даты не существует');
    }
return { day: d, month: m, year: y, normalized: ${day}.${month}.${year}, }; }
const digitSum = (n) => String(Math.abs(n)) .split('') .reduce((sum, digit) => sum + Number(digit), 0);
const reduce22 = (n) => { let value = n;
while (value > 22) { value = digitSum(value); }
return value; };
function calculate(value) { const birth = parseBirthDate(value);
const top = reduce22(digitSum(birth.year)); const left = reduce22(top + birth.month); const bridge = reduce22(birth.day + birth.month + top); const right = reduce22(top + bridge); const center = reduce22(left + right);
const edge_left = reduce22(top + left); const edge_right = reduce22(top + right);
return { birth_date: birth.normalized, top, left, right, center, edge_left, edge_right, }; }
const SEGMENTS = { '0': ['a', 'b', 'c', 'd', 'e', 'f'], '1': ['b', 'c'], '2': ['a', 'b', 'g', 'e', 'd'], '3': ['a', 'b', 'g', 'c', 'd'], '4': ['f', 'g', 'b', 'c'], '5': ['a', 'f', 'g', 'c', 'd'], '6': ['a', 'f', 'g', 'e', 'c', 'd'], '7': ['a', 'b', 'c'], '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'], '9': ['a', 'b', 'c', 'd', 'f', 'g'], };
function renderDigit(digit, x, y, color = '#111') { const active = SEGMENTS[String(digit)] || [];
const w = 40; const h = 72; const t = 8; const mid = h / 2;
const parts = [];
const addRect = (name, rx, ry, rw, rh) => { if (active.includes(name)) { parts.push( <rect x="${x + rx}" y="${y + ry}" width="${rw}" height="${rh}" rx="2" ry="2" fill="${color}"/> ); } };
addRect('a', t, 0, w - 2 * t, t); addRect('d', t, h - t, w - 2 * t, t); addRect('g', t, mid - t / 2, w - 2 * t, t);
addRect('f', 0, t, t, mid - t); addRect('e', 0, mid, t, mid - t);
addRect('b', w - t, t, t, mid - t); addRect('c', w - t, mid, t, mid - t);
return parts.join(''); }
function renderNumber(value, centerX, y, color = '#111') { const text = String(value);
const digitWidth = 40; const gap = 10;
const totalWidth = text.length * digitWidth + (text.length - 1) * gap;
const startX = centerX - totalWidth / 2;
return text .split('') .map((digit, index) => renderDigit( digit, startX + index * (digitWidth + gap), y, color ) ) .join(''); }
export default async function handler(req, res) { try { if (!req.query.birth_date) { return res.status(200).send('Numerology Triangle Edges API is running'); }
const result = calculate(req.query.birth_date);

if (req.query.mode === 'triangle') {
  const svg = `
<path
d="M400 145 L115 625 L685 625 Z"
fill="none"
stroke="#111"
stroke-width="10"
stroke-linejoin="round"
/>
${renderNumber(result.top, 400, 32)}
${renderNumber(result.edge_left, 255, 310, '#c62828')} ${renderNumber(result.edge_right, 545, 310, '#c62828')}
${renderNumber(result.left, 92, 670)} ${renderNumber(result.center, 400, 670)} ${renderNumber(result.right, 708, 670)}
</svg>`.trim();
  const png = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  res.setHeader('Content-Type', 'image/png');

  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );

  return res.status(200).send(png);
}

const protocol =
  req.headers['x-forwarded-proto'] || 'https';

const cacheBuster = Date.now();

result.image_url =
  ${protocol}://${req.headers.host} +
  /api/triangle?birth_date=${encodeURIComponent(result.birth_date)} +
  &v=${cacheBuster};

res.setHeader(
  'Cache-Control',
  'no-store, no-cache, must-revalidate, proxy-revalidate'
);

res.setHeader(
  'Access-Control-Allow-Origin',
  '*'
);

return res.status(200).
json(result);
} catch (error) { return res.
  status(400)
  json({ 
    error: error.message,
  });
  }
  }
                 
   } }
