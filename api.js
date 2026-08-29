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

function parseBirthDate(birthDate) {
  if (!birthDate || typeof birthDate !== "string") {
    throw new Error("Параметр birth_date обязателен");
  }

  const parts = birthDate.trim().split(/[.\-/]/);

  if (parts.length !== 3) {
    throw new Error("Формат birth_date должен быть ДД.ММ.ГГГГ");
  }

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error("Некорректный день");
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Некорректный месяц");
  }

  if (!Number.isInteger(year) || year < 1000 || year > 9999) {
    throw new Error("Некорректный год");
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
    birth_date: birthDate,
    day: D,
    month: M,
    year_value: Y,
    sum_value: S,

    top: Y,
    left: L,
    right: R,
    center: C,
    edge_left: edgeLeft,
    edge_right: edgeRight,

    triangle_top: Y,
    triangle_left: L,
    triangle_right: R,
    triangle_center: C,
    triangle_edge_left: edgeLeft,
    triangle_edge_right: edgeRight
  };
}

const SEGMENTS = {
  0: ["a", "b", "c", "d", "e", "f"],
  1: ["b", "c"],
  2: ["a", "b", "g", "e", "d"],
  3: ["a", "b", "g", "c", "d"],
  4: ["f", "g", "b", "c"],
  5: ["a", "f", "g", "c", "d"],
  6: ["a", "f", "g", "e", "c", "d"],
  7: ["a", "b", "c"],
  8: ["a", "b", "c", "d", "e", "f", "g"],
  9: ["a", "b", "c", "d", "f", "g"]
};

function digitSvg(digit, x, y, scale = 1, color = "#111111") {
  const active = SEGMENTS[digit] || [];

  const w = 42 * scale;
  const h = 78 * scale;
  const t = 8 * scale;

  const segments = {
    a: `<rect x="${x + t}" y="${y}" width="${w - 2 * t}" height="${t}" rx="${t / 2}" />`,
    g: `<rect x="${x + t}" y="${y + h / 2 - t / 2}" width="${w - 2 * t}" height="${t}" rx="${t / 2}" />`,
    d: `<rect x="${x + t}" y="${y + h - t}" width="${w - 2 * t}" height="${t}" rx="${t / 2}" />`,
    f: `<rect x="${x}" y="${y + t}" width="${t}" height="${h / 2 - 1.5 * t}" rx="${t / 2}" />`,
    b: `<rect x="${x + w - t}" y="${y + t}" width="${t}" height="${h / 2 - 1.5 * t}" rx="${t / 2}" />`,
    e: `<rect x="${x}" y="${y + h / 2 + t / 2}" width="${t}" height="${h / 2 - 1.5 * t}" rx="${t / 2}" />`,
    c: `<rect x="${x + w - t}" y="${y + h / 2 + t / 2}" width="${t}" height="${h / 2 - 1.5 * t}" rx="${t / 2}" />`
  };

  return `
    <g fill="${color}">
      ${active.map((name) => segments[name]).join("")}
    </g>
  `;
}

function numberSvg(value, centerX, centerY, scale = 1, color = "#111111") {
  const digits = String(value).split("");
  const digitWidth = 42 * scale;
  const gap = 10 * scale;
  const totalWidth = digits.length * digitWidth + (digits.length - 1) * gap;
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
  strokeColor = "#111111",
  textColor = strokeColor
) {
  return `
    <circle
      cx="${x}"
      cy="${y}"
      r="${radius}"
      fill="#ffffff"
      stroke="${strokeColor}"
      stroke-width="5"
    />
    ${numberSvg(value, x, y, scale, textColor)}
  `;
}

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
    <rect width="1200" height="1000" fill="#ffffff" />

    <!-- рёбра -->
    <line x1="600" y1="130" x2="180" y2="820" stroke="#d32f2f" stroke-width="8" />
    <line x1="600" y1="130" x2="1020" y2="820" stroke="#d32f2f" stroke-width="8" />

    <!-- основание -->
    <line x1="180" y1="820" x2="1020" y2="820" stroke="#111111" stroke-width="8" />

    <!-- вершины -->
    ${circleNumber(top, 600, 130, 62, 0.82, "#111111", "#111111")}
    ${circleNumber(left, 180, 820, 62, 0.82, "#111111", "#111111")}
    ${circleNumber(right, 1020, 820, 62, 0.82, "#111111", "#111111")}

    <!-- центр снизу, а не внутри -->
    ${numberSvg(center, 600, 870, 0.95, "#111111")}

    <!-- значения рёбер -->
    ${circleNumber(edge_left, 390, 475, 56, 0.72, "#d32f2f", "#d32f2f")}
    ${circleNumber(edge_right, 810, 475, 56, 0.72, "#d32f2f", "#d32f2f")}
  </svg>
  `;
}

function buildBaseUrl(req) {
  const protocol =
    req.headers["x-forwarded-proto"] ||
    (req.connection && req.connection.encrypted ? "https" : "http");

  const host = req.headers.host;
  return `${protocol}://${host}`;
}

function handler(req, res) {
  try {
    const birthDate = req.query.birth_date;

    if (!birthDate) {
      return res.status(400).json({
        error: "Передай birth_date, например: /api/calculate?birth_date=21.05.1987"
      });
    }

    const result = calculateTriangle(birthDate);
    const svg = makeSvg(result);

    if (req.query.format === "svg") {
      res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
      return res.status(200).send(svg);
    }

    const baseUrl = buildBaseUrl(req);
    const imageUrl = `${baseUrl}${req.url}${req.url.includes("?") ? "&" : "?"}format=svg`;

    return res.status(200).json({
      ...result,
      image_url: imageUrl
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Ошибка расчёта"
    });
  }
}

module.exports = handler;
