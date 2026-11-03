import { isValidReading, MOODS, TAROTS } from "./data.js";

const CREAM = "#FFF9EA";
const FOREST = "#355C32";

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function text(
  ctx,
  content,
  x,
  y,
  {
    size = 30,
    color = FOREST,
    font = "Arial, sans-serif",
    weight = "",
    align = "left",
  } = {},
) {
  ctx.font = `${weight} ${size}px ${font}`.trim();
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(content, x, y);
}

function wrapText(ctx, content, x, y, maxWidth, lineHeight, options = {}) {
  const words = content.split(/\s+/);
  let line = "";
  let baseline = y;
  const lines = [];
  text(ctx, "", x, y, options);
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  for (const value of lines) {
    text(ctx, value, x, baseline, options);
    baseline += lineHeight;
  }
  return baseline;
}

function star(ctx, x, y, radius, fill = "#D7B969") {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? radius * 0.45 : radius;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function leaves(ctx, x, y, scale = 1, flip = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * flip, scale);
  ctx.strokeStyle = "#A6B779";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(70, 80, 40, 170, 120, 220);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const leafX = i * 16;
    const leafY = i * 33 + 12;
    ctx.save();
    ctx.translate(leafX, leafY);
    ctx.rotate(i % 2 ? -0.5 : 0.7);
    ctx.beginPath();
    ctx.ellipse(i % 2 ? 20 : -20, 0, 34, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? "#CBD5A7" : "#B5C78A";
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawMoli(ctx, x, y, width) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(width / 200, width / 200);
  const gradient = ctx.createRadialGradient(75, 50, 4, 100, 100, 95);
  gradient.addColorStop(0, "#C6DC80");
  gradient.addColorStop(0.55, "#9EBC52");
  gradient.addColorStop(1, "#6B943D");
  ctx.fillStyle = "#46673C18";
  ctx.beginPath();
  ctx.ellipse(100, 169, 70, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = gradient;
  for (let i = 0; i < 90; i++) {
    const angle = i * 2.39996;
    const r = 72 + Math.sin(i * 3.7) * 5;
    ctx.beginPath();
    ctx.arc(
      100 + Math.cos(angle) * r,
      96 + Math.sin(angle) * r * 0.87,
      5.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.beginPath();
  ctx.ellipse(100, 96, 74, 67, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 55; i++) {
    const a = i * 2.39996,
      r = Math.sqrt(i / 55) * 62;
    ctx.fillStyle = i % 2 ? "#D0DE8B55" : "#628B3822";
    ctx.beginPath();
    ctx.arc(
      100 + Math.cos(a) * r,
      90 + Math.sin(a) * r * 0.8,
      2.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.fillStyle = "#304B2B";
  for (const eyeX of [78, 124]) {
    ctx.beginPath();
    ctx.ellipse(eyeX, 94, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#304B2B";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(101, 101, 9, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "#E5B0A5";
  for (const cheekX of [63, 139]) {
    ctx.beginPath();
    ctx.ellipse(cheekX, 112, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

async function svgImage(svg) {
  if (!svg) return null;
  const clean = svg.includes("xmlns=")
    ? svg
    : svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  const url = URL.createObjectURL(
    new Blob([clean], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () =>
        reject(new Error("Could not prepare the illustration for your image."));
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawFallbackTarot(ctx, id, x, y, width, height) {
  const colors = {
    star: "#526B73",
    sun: "#F4D98D",
    moon: "#516476",
    lovers: "#EDC6BD",
    world: "#B2C693",
    fool: "#BFD5CC",
  };
  roundRect(ctx, x, y, width, height, 20, "#F9EDCE", "#D5B778");
  roundRect(
    ctx,
    x + 12,
    y + 12,
    width - 24,
    height - 24,
    15,
    colors[id],
    "#ECDCB5",
  );
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x + 14, y + 14, width - 28, height - 28, 13);
  ctx.clip();
  if (id === "sun") {
    ctx.fillStyle = "#FFF4BC";
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.3, 48, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      star(
        ctx,
        x + width / 2 + Math.cos(a) * 79,
        y + height * 0.3 + Math.sin(a) * 79,
        5,
        "#FFF4BC",
      );
    }
  } else if (id === "moon") {
    ctx.fillStyle = "#FFF1BD";
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.3, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors[id];
    ctx.beginPath();
    ctx.arc(x + width / 2 + 25, y + height * 0.3 - 13, 44, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === "lovers") {
    text(ctx, "♡", x + width / 2, y + height * 0.36, {
      size: 118,
      align: "center",
      color: "#C47F7B",
      font: "Georgia, serif",
    });
  } else {
    star(ctx, x + width / 2, y + height * 0.3, 58, "#F9E9A7");
  }
  for (let i = 0; i < 12; i++)
    star(
      ctx,
      x + 27 + ((i * 67) % (width - 54)),
      y + 27 + ((i * 47) % (height * 0.55)),
      i % 3 ? 3 : 5,
      "#F5E5B3",
    );
  ctx.fillStyle = "#DEE3B4";
  ctx.beginPath();
  ctx.ellipse(
    x + width / 2,
    y + height,
    width * 0.8,
    height * 0.3,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  drawMoli(ctx, x + width * 0.15, y + height * 0.56, width * 0.7);
  ctx.restore();
}

function categoryIcon(ctx, type, x, y, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = FOREST;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  if (type === "color") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#FFFFFFAA";
    ctx.beginPath();
    ctx.arc(0, 0, 18, Math.PI, Math.PI * 1.65);
    ctx.stroke();
  } else if (type === "outfit") {
    ctx.fillStyle = "#D8E3BE";
    ctx.beginPath();
    ctx.moveTo(-13, -24);
    ctx.lineTo(-30, -17);
    ctx.lineTo(-39, 11);
    ctx.lineTo(-23, 17);
    ctx.lineTo(-18, 2);
    ctx.lineTo(-18, 30);
    ctx.lineTo(18, 30);
    ctx.lineTo(18, 2);
    ctx.lineTo(23, 17);
    ctx.lineTo(39, 11);
    ctx.lineTo(30, -17);
    ctx.lineTo(13, -24);
    ctx.quadraticCurveTo(0, -9, -13, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === "food") {
    ctx.fillStyle = "#F3D4BC";
    ctx.beginPath();
    ctx.moveTo(-32, 28);
    ctx.lineTo(-32, -7);
    ctx.lineTo(21, -27);
    ctx.lineTo(32, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#FFF9EA";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-29, 4);
    ctx.lineTo(28, 7);
    ctx.stroke();
    ctx.fillStyle = "#D28F87";
    ctx.beginPath();
    ctx.ellipse(6, -29, 9, 13, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8DAF65";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(6, -39);
    ctx.lineTo(14, -45);
    ctx.stroke();
  } else {
    ctx.strokeStyle = "#739A50";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(0, 26, -9, 35);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);
      ctx.fillStyle = "#A7C56F";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-29, -7, -30, -40, -11, -29);
      ctx.bezierCurveTo(2, -45, 24, -22, 0, 0);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

/** Produce a real, self-contained story-size PNG of this exact reading. */
export async function generateFortuneImage(
  result,
  { moliSvg, tarotSvg, itemSvgs = {} } = {},
) {
  if (!isValidReading(result))
    throw new Error("This reading is incomplete. Please try a new reading.");
  const tarot = TAROTS.find((item) => item.id === result.tarot);
  const mood = MOODS.find((item) => item.id === result.mood);
  const [moliImage, tarotImage, outfitImage, foodImage, charmImage] =
    await Promise.all([
      svgImage(moliSvg),
      svgImage(tarotSvg),
      svgImage(itemSvgs.outfit),
      svgImage(itemSvgs.food),
      svgImage(itemSvgs.charm),
    ]);
  const itemImages = {
    outfit: outfitImage,
    food: foodImage,
    charm: charmImage,
  };
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image saving is not supported in this browser.");
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, 1080, 1920);
  const sunlight = ctx.createRadialGradient(890, 160, 30, 890, 160, 1100);
  sunlight.addColorStop(0, "#F9E9A755");
  sunlight.addColorStop(1, "#FFF9EA00");
  ctx.fillStyle = sunlight;
  ctx.fillRect(0, 0, 1080, 1920);
  leaves(ctx, -20, -25, 1.3);
  leaves(ctx, 1100, 1740, 1.3, -1);
  roundRect(ctx, 35, 35, 1010, 1850, 38, null, "#D9DDBD");
  star(ctx, 880, 110, 17);
  star(ctx, 198, 292, 10);
  star(ctx, 947, 795, 13);
  text(ctx, "a little magic, just for you", 540, 105, {
    size: 25,
    align: "center",
    color: "#708050",
  });
  text(ctx, "MOLI’s Lucky Day", 540, 183, {
    size: 68,
    font: "Georgia, serif",
    align: "center",
  });
  text(ctx, "Your Daily Dose of Luck & Comfort", 540, 233, {
    size: 27,
    align: "center",
    color: "#75805F",
  });
  const formattedDate = new Date(`${result.date}T12:00:00`).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );
  roundRect(ctx, 338, 269, 404, 52, 26, "#EAF0D9");
  text(ctx, formattedDate, 540, 304, { size: 24, align: "center" });
  text(ctx, "YOUR CARD FOR TODAY", 80, 371, {
    size: 22,
    color: "#81915D",
    weight: "600",
  });
  if (tarotImage) ctx.drawImage(tarotImage, 80, 400, 283, 440);
  else drawFallbackTarot(ctx, result.tarot, 80, 400, 283, 440);
  const afterName = wrapText(ctx, tarot.name, 416, 471, 560, 59, {
    size: 53,
    font: "Georgia, serif",
  });
  text(ctx, tarot.theme, 418, afterName + 6, { size: 25, color: "#8B9673" });
  const afterMessage = wrapText(
    ctx,
    tarot.message,
    418,
    afterName + 69,
    555,
    42,
    { size: 32, font: "Georgia, serif" },
  );
  wrapText(ctx, tarot.interpretation, 418, afterMessage + 24, 550, 33, {
    size: 24,
    color: "#687654",
  });
  roundRect(ctx, 70, 878, 940, 177, 29, "#EAF0D9");
  if (moliImage) ctx.drawImage(moliImage, 86, 897, 155, 144);
  else drawMoli(ctx, 82, 890, 165);
  text(ctx, "A LITTLE NOTE FROM MOLI", 266, 924, {
    size: 21,
    color: "#7C8F5D",
    weight: "600",
  });
  wrapText(ctx, mood.comfort, 266, 967, 698, 32, { size: 25 });
  const recommendations = [
    ["Lucky Color", result.color.name, "color"],
    ["Lucky Outfit", result.outfit, "outfit"],
    ["Lucky Food", result.food, "food"],
    ["Lucky Charm", result.charm, "charm"],
  ];
  recommendations.forEach(([label, value, type], index) => {
    const x = 70 + (index % 2) * 480;
    const y = 1085 + Math.floor(index / 2) * 187;
    roundRect(
      ctx,
      x,
      y,
      460,
      167,
      24,
      index === 2 ? "#F8EEDE" : "#F0F1DD",
      "#E4E4C9",
    );
    if (itemImages[type])
      ctx.drawImage(itemImages[type], x + 13, y + 42, 98, 98);
    else categoryIcon(ctx, type, x + 62, y + 91, result.color.hex);
    text(ctx, label.toUpperCase(), x + 114, y + 58, {
      size: 19,
      color: "#84926A",
      weight: "600",
    });
    wrapText(ctx, value, x + 114, y + 106, 320, 34, {
      size: 28,
      font: "Georgia, serif",
    });
  });
  roundRect(ctx, 70, 1470, 940, 151, 26, "#FAF0D7");
  text(ctx, "A SOFT REMINDER", 105, 1512, {
    size: 21,
    color: "#9E8D5B",
    weight: "600",
  });
  wrapText(ctx, result.tip, 105, 1560, 860, 36, {
    size: 29,
    font: "Georgia, serif",
  });
  text(ctx, "YOUR LUCKY ENERGY", 540, 1679, {
    size: 21,
    align: "center",
    color: "#84926A",
    weight: "600",
  });
  for (let i = 0; i < 5; i++)
    star(
      ctx,
      412 + i * 64,
      1728,
      23,
      i < result.energy ? "#D5B66D" : "#E8E5CE",
    );
  text(ctx, `${result.energy} / 5 · a little luck goes a long way`, 540, 1784, {
    size: 24,
    align: "center",
    color: "#7A8663",
  });
  text(ctx, "An independent, unofficial portfolio concept.", 540, 1830, {
    size: 18,
    align: "center",
    color: "#97A084",
  });
  text(
    ctx,
    "For entertainment & self-reflection. Your future is yours to write.",
    540,
    1858,
    { size: 17, align: "center", color: "#97A084" },
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Could not create your image. Please try again.")),
      "image/png",
    );
  });
}
