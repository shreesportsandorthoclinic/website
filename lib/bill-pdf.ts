import "server-only";

import { LOGO, POPPINS_REGULAR, POPPINS_SEMIBOLD, type FontFace } from "./bill-pdf-assets";
import { billNumber, PAYMENT_LABEL, rupees, subtotal, totalDue, type Visit } from "./billing-shared";
import { clinic } from "./content";
import { shortDate } from "./schedule";

/* The bill / receipt as an A4 PDF, for emailing to the patient. Mirrors the
   printed bill on /staff/billing/[id] — keep the two in step.

   Written by hand rather than with a PDF library: pdf-lib + fontkit added
   ~1.5 MB to the Worker bundle (more than Cloudflare's free-plan limit on
   its own). A bill only needs text, lines and one JPEG, which is a few
   dozen lines of PDF. Text is Poppins, embedded as a WinAnsi TrueType
   subset; ₹ (not in WinAnsi) is drawn from Poppins' own outline. */

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56;
const RIGHT = PAGE_W - MARGIN;
const CONTENT_W = RIGHT - MARGIN;

const INK = "0.067 0.067 0.067";
const MUTED = "0.4 0.4 0.4";
const RULE = "0.867 0.867 0.867";
const ROW_RULE = "0.933 0.933 0.933";

/* Right edges of the numeric columns; "Item" runs from the margin up to
   just before Qty. */
const COL_QTY = MARGIN + CONTENT_W * 0.56;
const COL_RATE = MARGIN + CONTENT_W * 0.78;
const COL_AMOUNT = RIGHT;
const ITEM_W = COL_QTY - MARGIN - 50;

/* ── text encoding ───────────────────────────────────────────────────── */

/** Windows-1252 bytes 0x80–0x9F; the rest of 32–255 is plain Latin-1. */
const CP1252: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86,
  0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c,
  0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95,
  0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b,
  0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
  0x2212: 0x96, // minus sign → en dash
};

/** Character codes for one run of text; anything outside WinAnsi becomes "?". */
function encode(text: string): number[] {
  return Array.from(text, (ch) => {
    const u = ch.codePointAt(0)!;
    if ((u >= 0x20 && u < 0x7f) || (u >= 0xa0 && u <= 0xff)) return u;
    return CP1252[u] ?? 0x3f;
  });
}

/** A PDF literal string, kept 7-bit by octal-escaping everything else. */
function literal(codes: number[]) {
  return codes
    .map((c) =>
      c === 0x28 || c === 0x29 || c === 0x5c
        ? `\\${String.fromCharCode(c)}`
        : c < 0x20 || c > 0x7e
          ? `\\${c.toString(8).padStart(3, "0")}`
          : String.fromCharCode(c),
    )
    .join("");
}

/* Four places: glyph scale factors (size / 1000) need them. */
const num = (n: number) => String(Math.round(n * 10000) / 10000);

type Font = { resource: "F1" | "F2"; face: FontFace };
const REGULAR: Font = { resource: "F1", face: POPPINS_REGULAR };
const BOLD: Font = { resource: "F2", face: POPPINS_SEMIBOLD };

function widthOf(text: string, font: Font, size: number) {
  let units = 0;
  for (const [i, part] of text.split("₹").entries()) {
    if (i > 0) units += font.face.rupee.advance;
    for (const code of encode(part)) units += font.face.widths[code - 32] ?? 0;
  }
  return (units * size) / 1000;
}

/** Greedy word wrap to a width; an over-long single word is left to overflow. */
function wrap(text: string, font: Font, size: number, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && widthOf(next, font, size) > width) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  return lines.length || line ? [...lines, line] : [""];
}

/* ── one page's drawing operators ────────────────────────────────────── */

class Page {
  ops: string[] = [];

  text(value: string, x: number, y: number, size: number, font = REGULAR, color = INK, spacing = 0) {
    this.ops.push(`${color} rg`);
    for (const [i, part] of value.split("₹").entries()) {
      if (i > 0) {
        const s = size / 1000;
        this.ops.push(`q ${num(s)} 0 0 ${num(s)} ${num(x)} ${num(y)} cm ${font.face.rupee.path} f Q`);
        x += font.face.rupee.advance * s;
      }
      if (!part) continue;
      this.ops.push(
        `BT /${font.resource} ${num(size)} Tf ${num(spacing)} Tc ${num(x)} ${num(y)} Td (${literal(encode(part))}) Tj ET`,
      );
      x += widthOf(part, font, size) + spacing * part.length;
    }
  }

  textRight(value: string, right: number, y: number, size: number, font = REGULAR, color = INK) {
    this.text(value, right - widthOf(value, font, size), y, size, font, color);
  }

  rule(y: number, color = RULE, thickness = 0.75) {
    this.ops.push(`${num(thickness)} w ${color} RG ${num(MARGIN)} ${num(y)} m ${num(RIGHT)} ${num(y)} l S`);
  }

  image(x: number, y: number, width: number, height: number) {
    this.ops.push(`q ${num(width)} 0 0 ${num(height)} ${num(x)} ${num(y)} cm /Im1 Do Q`);
  }
}

/* ── file assembly ───────────────────────────────────────────────────── */

type PdfObject = string | { dict: string; data: Uint8Array };

const ascii = (s: string) => new TextEncoder().encode(s);
const base64Bytes = (b64: string) => Uint8Array.from(Buffer.from(b64, "base64"));

/** UTF-16BE hex string, for document info that may hold any character. */
function textString(s: string) {
  let hex = "FEFF";
  for (let i = 0; i < s.length; i++) hex += s.charCodeAt(i).toString(16).padStart(4, "0");
  return `<${hex}>`;
}

function fontObjects(face: FontFace, tag: string, firstId: number): PdfObject[] {
  const file = base64Bytes(face.file);
  const name = `${tag}+${face.name}`;
  return [
    `<< /Type /Font /Subtype /TrueType /BaseFont /${name} /FirstChar 32 /LastChar 255 ` +
      `/Widths [${face.widths.join(" ")}] /Encoding /WinAnsiEncoding /FontDescriptor ${firstId + 1} 0 R >>`,
    `<< /Type /FontDescriptor /FontName /${name} /Flags 32 /FontBBox [${face.bbox.join(" ")}] ` +
      `/ItalicAngle 0 /Ascent ${face.ascent} /Descent ${face.descent} /CapHeight ${face.capHeight} ` +
      `/StemV 80 /FontFile2 ${firstId + 2} 0 R >>`,
    { dict: `<< /Length ${file.length} /Length1 ${file.length} >>`, data: file },
  ];
}

function assemble(pages: Page[], title: string): Uint8Array {
  /* 1 catalog · 2 page tree · 3 info · 4–6 regular · 7–9 semibold ·
     10 logo · then a page and its content stream for each page. */
  const logo = base64Bytes(LOGO.jpeg);
  const firstPage = 11;
  const objects: PdfObject[] = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [${pages.map((_, i) => `${firstPage + i * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    `<< /Title ${textString(title)} /Author ${textString(clinic.name)} /Producer ${textString(clinic.name)} >>`,
    ...fontObjects(POPPINS_REGULAR, "SHREEA", 4),
    ...fontObjects(POPPINS_SEMIBOLD, "SHREEB", 7),
    {
      dict:
        `<< /Type /XObject /Subtype /Image /Width ${LOGO.width} /Height ${LOGO.height} ` +
        `/ColorSpace /${LOGO.channels === 1 ? "DeviceGray" : "DeviceRGB"} /BitsPerComponent 8 ` +
        `/Filter /DCTDecode /Length ${logo.length} >>`,
      data: logo,
    },
  ];
  for (const [i, page] of pages.entries()) {
    const content = ascii(page.ops.join("\n"));
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
        `/Resources << /Font << /F1 4 0 R /F2 7 0 R >> /XObject << /Im1 10 0 R >> >> ` +
        `/Contents ${firstPage + i * 2 + 1} 0 R >>`,
      { dict: `<< /Length ${content.length} >>`, data: content },
    );
  }

  const chunks: Uint8Array[] = [];
  let length = 0;
  const push = (bytes: Uint8Array) => {
    chunks.push(bytes);
    length += bytes.length;
  };
  /* The binary comment marks the file as binary for transfer tools. */
  push(new Uint8Array([...ascii("%PDF-1.4\n%"), 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  const offsets: number[] = [];
  for (const [i, obj] of objects.entries()) {
    offsets.push(length);
    if (typeof obj === "string") {
      push(ascii(`${i + 1} 0 obj\n${obj}\nendobj\n`));
    } else {
      push(ascii(`${i + 1} 0 obj\n${obj.dict}\nstream\n`));
      push(obj.data);
      push(ascii(`\nendstream\nendobj\n`));
    }
  }

  const xref = length;
  push(
    ascii(
      `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
        offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("") +
        `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`,
    ),
  );

  const out = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}

/* ── the bill ────────────────────────────────────────────────────────── */

export function renderBillPdf(visit: Visit): Uint8Array {
  const paid = visit.status === "PAID";
  const pages = [new Page()];
  let page = pages[0];
  let y = PAGE_H - MARGIN;

  /* ── header ── */
  const logoH = 52;
  const logoW = (LOGO.width / LOGO.height) * logoH;
  page.image(MARGIN, y - logoH, logoW, logoH);
  const headX = MARGIN + logoW + 14;
  page.text(clinic.name, headX, y - 18, 16, BOLD);
  page.text(clinic.addressLines.join(", "), headX, y - 33, 8.5);
  page.text(`${clinic.phone} · ${clinic.email}`, headX, y - 45, 8.5);
  y -= logoH + 20;
  page.rule(y);

  /* ── title ── */
  y -= 22;
  page.text((paid ? "Bill / receipt" : "Bill — awaiting payment").toUpperCase(), MARGIN, y, 8.5, REGULAR, INK, 1.6);

  /* ── facts, two columns ── */
  const facts = [
    { term: "Bill no.", value: paid ? billNumber(visit.billNo) : "Not yet paid" },
    { term: "Date", value: shortDate(visit.date) },
    { term: "Patient", value: visit.patientName },
    { term: "Age / phone", value: [visit.patientAge, visit.patientPhone].filter(Boolean).join(" · ") || "—" },
  ];
  y -= 28;
  for (let i = 0; i < facts.length; i += 2) {
    for (const [col, fact] of facts.slice(i, i + 2).entries()) {
      const x = MARGIN + col * (CONTENT_W / 2 + 10);
      page.text(fact.term.toUpperCase(), x, y, 7.5, REGULAR, MUTED, 0.8);
      page.text(fact.value, x, y - 16, 11);
    }
    y -= 40;
  }

  /* ── line items ── */
  const tableHeader = () => {
    page.text("Item", MARGIN, y, 9.5, BOLD);
    page.textRight("Qty", COL_QTY, y, 9.5, BOLD);
    page.textRight("Rate", COL_RATE, y, 9.5, BOLD);
    page.textRight("Amount", COL_AMOUNT, y, 9.5, BOLD);
    y -= 9;
    page.rule(y, INK, 0.9);
  };
  y -= 8;
  tableHeader();

  for (const [index, line] of visit.items.entries()) {
    const nameLines = wrap(line.name, REGULAR, 10, ITEM_W);
    const rowH = 14 + nameLines.length * 13;
    /* The last row keeps room for the totals, so they never sit alone. */
    const reserve = index === visit.items.length - 1 ? 120 : 0;
    if (y - rowH < MARGIN + reserve) {
      page = new Page();
      pages.push(page);
      y = PAGE_H - MARGIN;
      tableHeader();
    }
    const baseline = y - 17;
    nameLines.forEach((part, i) => page.text(part, MARGIN, baseline - i * 13, 10));
    page.textRight(String(line.qty), COL_QTY, baseline, 10);
    page.textRight(rupees(line.price), COL_RATE, baseline, 10);
    page.textRight(rupees(line.price * line.qty), COL_AMOUNT, baseline, 10);
    y -= rowH;
    page.rule(y, ROW_RULE);
  }

  /* ── totals ── */
  y -= 20;
  page.textRight("Subtotal", COL_RATE, y, 10);
  page.textRight(rupees(subtotal(visit.items)), COL_AMOUNT, y, 10);
  if (visit.discount > 0) {
    y -= 17;
    page.textRight("Discount", COL_RATE, y, 10);
    page.textRight(`− ${rupees(visit.discount)}`, COL_AMOUNT, y, 10);
  }
  y -= 24;
  page.textRight(paid ? "Total paid" : "Total due", COL_RATE, y, 13, BOLD);
  page.textRight(rupees(totalDue(visit)), COL_AMOUNT, y, 13, BOLD);

  if (paid && visit.paymentMethod) {
    y -= 30;
    page.text(`Paid by ${PAYMENT_LABEL[visit.paymentMethod]}.`, MARGIN, y, 9.5);
  }

  y -= 34;
  page.text(`${clinic.doctor.fullName} · ${clinic.doctor.title}`, MARGIN, y, 8.5, REGULAR, MUTED);

  const title = paid ? `Receipt ${billNumber(visit.billNo)}` : `Bill — ${shortDate(visit.date)}`;
  return assemble(pages, `${title} — ${clinic.name}`);
}

/** "Receipt-B-000042.pdf", or "Bill-2026-10-27.pdf" before payment. */
export function billPdfFilename(visit: Visit) {
  return visit.status === "PAID" ? `Receipt-${billNumber(visit.billNo)}.pdf` : `Bill-${visit.date}.pdf`;
}
