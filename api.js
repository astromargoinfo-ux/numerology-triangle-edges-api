const sharp = require("sharp");

/* =========================
   МАТЕМАТИКА
========================= */

function sumDigits(value) {
  return String(Math.abs(Number(value)))
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);
}

function reduce22(value) {
  let result = Number(value);

  while (result > 22) {
    result = sumDigits(result);
  }

  return result;
}

function parseBirthDate(value) {
  if (!value || typeof value !== "string") {
    throw new Error("birth_date is required");
  }

  let day;
  let month;
  let year;

  const input = value.trim();

  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(input)) {
    [day, month, year] = input.split(".").map(Number);
  } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(input)) {
    [day, month, year] = input.split("-").map(Number);
  } else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(input)) {
    [year, month, day] = input.split("-").map(Number);
  } else {
    throw new Error("Invalid birth_date format. Use DD.MM.YYYY");
  }

  if (
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 1000 ||
    year > 9999
  ) {
    throw new Error("Invalid birth_date");
  }

  return { day, month, year };
}

function calculateTriangle(birthDate) {
  const { day, month, year } = parseBirthDate(birthDate);

  const D = reduce22(day);
  const M = month;
  const Y = reduce22(sumDigits(year));

  const S = reduce22(D + M + Y);

  const L = reduce22(M + Y);
  const R = reduce22(Y + S);
  const C = reduce22(L + R);

  const edgeLeft = reduce22(Y + L);
  const edgeRight = reduce22(Y + R);

  return {
    day: D,
    month: M,
    year: Y,
    sum: S,

    top: Y,
    left: L,
    right: R,
    center: C,

    edge_left: edgeLeft,
    edge_right: edgeRight
  };
}

/* =========================
   ВЕКТОРНЫЕ ЦИФРЫ
========================= */

const SEGMENTS = {
  0: ["a", "b", "c", "d", "e", "f"],
  1: ["b", "c"],
  2: ["a", "b", "g", "e", "d"],
  3: ["a", "b", "c", "d", "g"],
  4: ["f", "g", "b", "c"],
  5: ["a", "f", "g", "c", "d"],
  6: ["a", "f", "e", "d", "c", "g"],
  7: ["a", "b", "c"],
  8: ["a", "b", "c", "d", "e", "f", "g"],
  9: ["a", "b", "c", "d", "f", "g"]
};

function digitSvg(
  digit,
  x,
  y,
  scale = 1,
  color = "#111111"
) {
  const active = SEGMENTS[digit] || [];

  const w = 42 * scale;
  const h = 78 * scale;
  const t = 8 * scale;

  const segments = {
    a: `<rect x="${x + t}" y="${y}"
      width="${w - 2 * t}" height="${t}"
      rx="${t / 2}"/>`,

    g: `<rect x="${x + t}"
      y="${y + h / 2 - t / 2}"
      width="${w - 2 * t}" height="${t}"
      rx="${t / 2}"/>`,

    d: `<rect x="${x + t}"
      y="${y + h - t}"
      width="${w - 2 * t}" height="${t}"
      rx="${t / 2}"/>`,

    f: `<rect x="${x}"
      y="${y + t}"
      width="${t}"
      height="${h / 2 - 1.5 * t}"
      rx="${t / 2}"/>`,

    b: `<rect x="${x + w - t}"
      y="${y + t}"
      width="${t}"
      height="${h / 2 - 1.5 * t}"
      rx="${t / 2}"/>`,

    e: `<rect x="${x}"
      y="${y + h / 2 + t / 2}"
      width="${t}"
      height="${h / 2 - 1.5 * t}"
      rx="${t / 2}"/>`,

    c: `<rect x="${x + w - t}"
      y="${y + h / 2 + t / 2}"
      width="${t}"
      height="${h / 2 - 1.5 * t}"
      rx="${t / 2}"/>`
  };

  return `
    <g fill="${color}">
      ${active.map((name) => segments[name]).join("")}
    </g>
  `;
}

function numberSvg(
  value,
  centerX,
  centerY,
  scale = 1,
  color = "#111111"
) {
  const digits = String(value).split("");

  const digitWidth = 42 * scale;
  const gap = 10 * scale;

  const totalWidth =
    digits.length * digitWidth +
    (digits.length - 1) * gap;

  const startX = centerX - totalWidth / 2;
  const startY = centerY - (78 * scale) / 2;

  return digits
    .map((digit, index) =>
      digitSvg(
        Number(digit),
        startX + index * (digitWidth + gap),
        startY,
        scale,
        color
      )
    )
    .join("");
}

function circleNumber(
  value,
  x,
  y,
  radius = 62,
  scale = 0.82,
  circleColor = "#111111",
  numberColor = "#111111"
) {
  return `
    <circle
      cx="${x}"
      cy="${y}"
      r="${radius}"
      fill="#ffffff"
      stroke="${circleColor}"
      stroke-width="5"
    />

    ${numberSvg(
      value,
      x,
      y,
      scale,
      numberColor
    )}
  `;
}

/* =========================
   КАРТИНКА
========================= */

function makeSvg(values) {
  const {
    top,
    left,
    right,
    center,
    edge_left,
    edge_right
  } = values;

  return `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1200"
    height="1000"
    viewBox="0 0 1200 1000"
  >

    <rect
      width="1200"
      height="1000"
      fill="#ffffff"
    />

    <!-- Треугольник -->

    <line
      x1="600"
      y1="130"
      x2="180"
      y2="820"
      stroke="#111111"
      stroke-width="8"
    />

    <line
      x1="600"
      y1="130"
      x2="1020"
      y2="820"
      stroke="#111111"
      stroke-width="8"
    />

    <line
      x1="180"
      y1="820"
      x2="1020"
      y2="820"
      stroke="#111111"
      stroke-width="8"
    />

    <!-- Основные значения -->

    ${circleNumber(
      top,
      600,
      130,
      62,
      0.82
    )}

    ${circleNumber(
      left,
      180,
      820,
      62,
      0.82
    )}

    ${circleNumber(
      right,
      1020,
      820,
      62,
      0.82
    )}

    ${circleNumber(
      center,
      600,
      820,
      62,
      0.82
    )}

    <!-- Красные рёбра -->

    ${circleNumber(
      edge_left,
      390,
      475,
      56,
      0.72,
      "#d32f2f",
      "#d32f2f"
    )}

    ${circleNumber(
      edge_right,
      810,
      475,
      56,
      0.72,
      "#d32f2f",
      "#d32f2f"
    )}

  </svg>
  `;
}

/* =========================
   API
========================= */

module.exports = async function handler(req, res) {
  try {
    const birthDate = req.query.birth_date;
    const format = req.query.format;

    if (!birthDate) {
      return res.status(400).json({
        ok: false,
        error: "birth_date is required"
      });
    }

    const values = calculateTriangle(birthDate);
    const svg = makeSvg(values);

    /* SVG */

    if (format === "svg") {
      res.setHeader(
        "Content-Type",
        "image/svg+xml; charset=utf-8"
      );

      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );

      return res.status(200).send(svg);
    }

    /* PNG для SendPulse */

    if (format === "png") {
      const pngBuffer = await sharp(
        Buffer.from(svg)
      )
        .png()
        .toBuffer();

      res.setHeader(
        "Content-Type",
        "image/png"
      );

      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );

      res.setHeader(
        "Pragma",
        "no-cache"
      );

      res.setHeader(
        "Expires",
        "0"
      );

      return res.status(200).send(
        pngBuffer
      );
    }

    /* JSON */

    const protocol =
      req.headers["x-forwarded-proto"] ||
      "https";

    const host =
      req.headers["x-forwarded-host"] ||
      req.headers.host;

    const version = Date.now();

    const imageUrl =
      `${protocol}://${host}` +
      `/api/calculate?birth_date=` +
      `${encodeURIComponent(birthDate)}` +
      `&format=png` +
      `&v=${version}`;

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    return res.status(200).json({
      ok: true,

      top: values.top,
      left: values.left,
      right: values.right,
      center: values.center,

      edge_left: values.edge_left,
      edge_right: values.edge_right,

      image_url: imageUrl,

      triangle_top: values.top,
      triangle_left: values.left,
      triangle_right: values.right,
      triangle_center: values.center,

      triangle_edge_left:
        values.edge_left,

      triangle_edge_right:
        values.edge_right,

      triangle_image: imageUrl
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error:
        error.message ||
        "Internal Server Error"
    });
  }
};
