const sharp = require("sharp");

function reduce22(num) {
  let n = Number(num);

  while (n > 22) {
    n = String(n)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  if (n === 0) return 22;
  return n;
}

function parseBirthDate(input) {
  if (!input || typeof input !== "string") return null;

  const match = input.trim().match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return { day, month, year };
}

function calculateTriangle(birthDate) {
  const parsed = parseBirthDate(birthDate);
  if (!parsed) return null;

  const { day, month, year } = parsed;

  const D = reduce22(day);
  const M = month;
  const Y = reduce22(
    String(year)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0)
  );
  const S = reduce22(D + M + Y);
  const L = reduce22(M + Y);
  const R = reduce22(Y + S);
  const C = reduce22(L + R);

  const edge_left = reduce22(Y + L);
  const edge_right = reduce22(Y + R);

  return {
    day: D,
    month: M,
    top: Y,
    left: L,
    right: R,
    center: C,
    edge_left,
    edge_right,
  };
}

function generateTriangleSvg(data) {
  const { top, left, right, center, edge_left, edge_right } = data;

  return `
<svg width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1350" fill="#F5F5F5"/>

  <!-- Triangle -->
  <line x1="540" y1="250" x2="180" y2="900" stroke="#111111" stroke-width="10" stroke-linecap="round"/>
  <line x1="540" y1="250" x2="900" y2="900" stroke="#111111" stroke-width="10" stroke-linecap="round"/>
  <line x1="180" y1="900" x2="900" y2="900" stroke="#111111" stroke-width="10" stroke-linecap="round"/>

  <!-- Top -->
  <text x="540" y="170"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="86"
        font-weight="500"
        fill="#111111">${top}</text>

  <!-- Left -->
  <text x="150" y="990"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="86"
        font-weight="500"
        fill="#111111">${left}</text>

  <!-- Right -->
  <text x="930" y="990"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="86"
        font-weight="500"
        fill="#111111">${right}</text>

  <!-- Center on bottom line -->
  <text x="540" y="990"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="86"
        font-weight="500"
        fill="#111111">${center}</text>

  <!-- Edge left -->
  <text x="355" y="595"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="72"
        font-weight="600"
        fill="#D62828">${edge_left}</text>

  <!-- Edge right -->
  <text x="725" y="595"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="72"
        font-weight="600"
        fill="#D62828">${edge_right}</text>
</svg>
`.trim();
}

module.exports = async (req, res) => {
  try {
    const { birth_date, format } = req.query;

    if (!birth_date) {
      return res.status(400).json({
        error: 'Missing required query parameter: "birth_date". Use format DD.MM.YYYY',
      });
    }

    const triangle = calculateTriangle(birth_date);

    if (!triangle) {
      return res.status(400).json({
        error: 'Invalid "birth_date". Use format DD.MM.YYYY',
      });
    }

    const svg = generateTriangleSvg(triangle);

    if (format === "svg") {
      res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
      return res.status(200).send(svg);
    }

    if (format === "png") {
      const pngBuffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();

      res.setHeader("Content-Type", "image/png");
      return res.status(200).send(pngBuffer);
    }

    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const encodedBirthDate = encodeURIComponent(birth_date);

    return res.status(200).json({
      birth_date,
      top: triangle.top,
      left: triangle.left,
      right: triangle.right,
      center: triangle.center,
      edge_left: triangle.edge_left,
      edge_right: triangle.edge_right,
      image_url: `${protocol}://${host}/api/calculate?birth_date=${encodedBirthDate}&format=png`,
    });
  } catch (error) {
    console.error("FUNCTION_INVOCATION_FAILED:", error);

    return res.status(500).json({
      error: "FUNCTION_INVOCATION_FAILED",
      details: error.message,
    });
  }
};
