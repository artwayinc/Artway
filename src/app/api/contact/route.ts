import { NextResponse } from "next/server";
import { getCloudflareEnv, getStore } from "@/lib/db";

function readEnv(env: unknown, key: string): string {
  if (env && typeof env === "object") {
    const value = (env as Record<string, unknown>)[key];
    if (typeof value === "string") return value.trim();
  }
  return String(process.env[key] ?? "").trim();
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const env = await getCloudflareEnv();
  const resendApiKey = readEnv(env, "RESEND_API_KEY");
  const mailTo = readEnv(env, "MAIL_TO");
  const mailFrom = readEnv(env, "MAIL_FROM") || "ARTWAY Website <website@artwayinc.com>";

  if (!resendApiKey || !mailTo) {
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
  // Honeypot: real visitors never fill this hidden field.
  if (String(record.website ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }
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
    ? (record.artworkPhotos as string[]).slice(0, 10)
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
    const from = String(record.from ?? "").trim();
    const to = String(record.to ?? "").trim();
    const itemDescription = String(record.itemDescription ?? "").trim();
    if (!nameValue || !emailValue || !phoneNumber || !from || !to || !itemDescription) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (itemInfoMode === "manual") {
      const dimensions = (record.dimensions ?? {}) as Record<string, unknown>;
      if (!String(dimensions.h ?? "").trim() || !String(dimensions.w ?? "").trim() || !String(dimensions.d ?? "").trim()) {
        return NextResponse.json(
          { error: "Please enter the height, width, and depth." },
          { status: 400 }
        );
      }
    }
  }

  if (!isEmail(emailValue)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Добавим ссылки на фото в текст письма вместо вложений
  const photoLinksText =
    artworkPhotos.length > 0
      ? `\n\nArtwork Photos:\n${artworkPhotos.map((url, i) => `${i + 1}. ${url}`).join("\n")}`
      : "";

  // Сохраняем сообщение в БД (JSON на Vercel, D1 на Cloudflare)
  try {
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

    const emailBody = messageValue + photoLinksText;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: mailFrom,
        to: [mailTo],
        reply_to: emailValue,
        subject: subjectDetails,
        text: emailBody,
      }),
    });

    if (!resendResponse.ok) {
      const details = await resendResponse.text();
      console.error("Resend delivery error:", resendResponse.status, details);
      throw new Error("Resend rejected the email request.");
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Email delivery is temporarily unavailable." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
