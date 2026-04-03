import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { addMessage } from "@/lib/db";

export const runtime = "nodejs";

const { SMTP_USER, SMTP_PASS, MAIL_TO } = process.env;

export async function POST(request: Request) {
  if (!SMTP_USER || !SMTP_PASS || !MAIL_TO) {
    return NextResponse.json(
      { error: "Email configuration is missing." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { name, email, phone, subject, message } = body as Record<
    string,
    unknown
  >;

  const phoneCountry =
    typeof phone === "object" && phone !== null
      ? String((phone as Record<string, unknown>).country ?? "").trim()
      : "US";
  const phoneNumber =
    typeof phone === "object" && phone !== null
      ? String((phone as Record<string, unknown>).number ?? "").trim()
      : String(phone ?? "").trim();

  const nameValue = String(name ?? "").trim();
  const emailValue = String(email ?? "").trim();
  const subjectValue = String(subject ?? "").trim();
  const messageValue = String(message ?? "").trim();

  if (
    !nameValue ||
    !emailValue ||
    !phoneNumber ||
    !subjectValue ||
    !messageValue
  ) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 },
    );
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

  const text = [
    `Name: ${nameValue}`,
    `Email: ${emailValue}`,
    `Phone: +${phoneCountry} ${phoneNumber}`.trim(),
    `Subject: ${subjectValue}`,
    "",
    messageValue,
  ].join("\n");

  // Сохраняем сообщение в БД
  try {
    addMessage({
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
    await transporter.sendMail({
      from: `"Artway Website" <${SMTP_USER}>`,
      to: MAIL_TO,
      replyTo: emailValue,
      subject: `Quote Request: ${subjectValue}`,
      text,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    // Возвращаем успех, так как сообщение уже сохранено в БД
  }

  return NextResponse.json({ ok: true });
}
