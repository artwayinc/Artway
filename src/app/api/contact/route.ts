import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { getCloudflareEnv, getStore } from "@/lib/db";

export const runtime = "nodejs";

const { SMTP_USER, SMTP_PASS, MAIL_TO } = process.env;

export async function POST(request: Request) {
  if (!SMTP_USER || !SMTP_PASS || !MAIL_TO) {
    return NextResponse.json(
      { error: "Email configuration is missing." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const isLegacy =
    typeof record.subject === "string" && typeof record.message === "string";

  const phoneRaw = record.phone;

  const phoneCountry =
    typeof phoneRaw === "object" && phoneRaw !== null
      ? String((phoneRaw as Record<string, unknown>).country ?? "").trim()
      : "US";
  const phoneNumber =
    typeof phoneRaw === "object" && phoneRaw !== null
      ? String((phoneRaw as Record<string, unknown>).number ?? "").trim()
      : String(phoneRaw ?? "").trim();

  const emailValue = String(record.email ?? "").trim();

  const nameValue = isLegacy
    ? String(record.name ?? "").trim()
    : String(record.fullName ?? "").trim();

  const subjectValue = isLegacy
    ? String(record.subject ?? "").trim()
    : "Quote Request";

  const itemInfoMode = String(record.itemInfoMode ?? "manual").trim();
  const artworkPhotos = Array.isArray(record.artworkPhotos)
    ? (record.artworkPhotos as string[])
    : [];

  const messageValue = (() => {
    if (isLegacy) return String(record.message ?? "").trim();

    const company = String(record.company ?? "").trim();
    const from = String(record.from ?? "").trim();
    const to = String(record.to ?? "").trim();
    const itemDescription = String(record.itemDescription ?? "").trim();
    const notes = String(record.notes ?? "").trim();

    const lines: string[] = [];
    lines.push("Quote Request");
    lines.push("");
    lines.push(`Full Name: ${nameValue}`);
    if (company) lines.push(`Company / Gallery / Institution: ${company}`);
    lines.push(`Email: ${emailValue}`);
    lines.push(`Phone: +${phoneCountry} ${phoneNumber}`.trim());
    lines.push("");
    if (from || to) {
      if (from) lines.push(`From: ${from}`);
      if (to) lines.push(`To: ${to}`);
      lines.push("");
    }
    lines.push(`Item Description: ${itemDescription}`);

    if (itemInfoMode === "link") {
      const artworkLink = String(record.artworkLink ?? "").trim();
      if (artworkLink) lines.push(`Artwork Link: ${artworkLink}`);
      if (artworkPhotos.length > 0) {
        lines.push(`Artwork photos: ${artworkPhotos.length} attached to email (not stored).`);
      }
    } else {
      // Ручной ввод размеров
      const declaredValue = String(record.declaredValue ?? "").trim();

      const dimensions = (record.dimensions ?? {}) as Record<string, unknown>;
      const dimH = String(dimensions.h ?? "").trim();
      const dimW = String(dimensions.w ?? "").trim();
      const dimD = String(dimensions.d ?? "").trim();
      const dimUnit = String(dimensions.unit ?? "").trim();

      const weight = (record.weight ?? {}) as Record<string, unknown>;
      const weightValue = String(weight.value ?? "").trim();
      const weightUnit = String(weight.unit ?? "").trim();

      lines.push(
        `Dimensions (H × W × D): ${dimH} × ${dimW} × ${dimD} ${dimUnit}`.trim()
      );
      if (weightValue) lines.push(`Weight: ${weightValue} ${weightUnit}`.trim());
      if (declaredValue)
        lines.push(`Declared Value / Insurance Value: ${declaredValue}`);
    }

    if (notes) {
      lines.push("");
      lines.push("Notes:");
      lines.push(notes);
    }
    return lines.join("\n").trim();
  })();

  if (isLegacy) {
    if (
      !nameValue ||
      !emailValue ||
      !phoneNumber ||
      !subjectValue ||
      !messageValue
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }
  } else {
    if (!nameValue || !emailValue) {
      return NextResponse.json(
        { error: "Full Name and Email Address are required." },
        { status: 400 }
      );
    }
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  // Вложения: фотографии предмета искусства (файлы из public/quote-uploads)
  const attachments: { filename: string; content: Buffer }[] = [];
  const publicDir = path.join(process.cwd(), "public");
  for (let i = 0; i < artworkPhotos.length; i++) {
    const urlPath = artworkPhotos[i].replace(/^\//, "");
    const filePath = path.join(publicDir, urlPath);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath);
        attachments.push({
          filename: `artwork-photo-${i + 1}.webp`,
          content,
        });
      } catch (err) {
        console.error("Error reading attachment:", filePath, err);
      }
    }
  }

  // Сохраняем сообщение в БД (JSON на Vercel, D1 на Cloudflare)
  try {
    const env = await getCloudflareEnv();
    const store = await getStore(env);
    await store.addMessage({
      name: nameValue,
      email: emailValue,
      phone: phoneNumber,
      phoneCountry,
      subject: subjectValue,
      message: messageValue,
    });
  } catch (error) {
    console.error("Error saving message to DB:", error);
    // Продолжаем отправку письма даже если сохранение в БД не удалось
  }

  // Отправляем письмо
  try {
    const subjectDetails = !isLegacy
      ? (() => {
          const from = String(record.from ?? "").trim();
          const to = String(record.to ?? "").trim();
          const extra =
            from || to ? ` (${from}${from && to ? " → " : ""}${to})` : "";
          return `Quote Request${extra}: ${nameValue}`.trim();
        })()
      : `Quote Request: ${subjectValue}`;
    await transporter.sendMail({
      from: `"Artway Website" <${SMTP_USER}>`,
      to: MAIL_TO,
      replyTo: emailValue,
      subject: subjectDetails,
      text: messageValue,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    // После отправки удаляем загруженные фото с диска (только в почте, в Messages не храним)
    for (let i = 0; i < artworkPhotos.length; i++) {
      const urlPath = artworkPhotos[i].replace(/^\//, "");
      const filePath = path.join(process.cwd(), "public", urlPath);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Error deleting attachment after send:", filePath, err);
      }
    }
  } catch (error) {
    console.error("Error sending email:", error);
    // Возвращаем успех, так как сообщение уже сохранено в БД
  }

  return NextResponse.json({ ok: true });
}
