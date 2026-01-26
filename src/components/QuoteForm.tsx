"use client";

import { useState, useRef } from "react";

type FormState = "idle" | "sending" | "success" | "error";

// Функция для форматирования американского номера телефона: (XXX) XXX-XXXX
function formatPhoneNumber(value: string): string {
  // Удаляем все нецифровые символы
  const numbers = value.replace(/\D/g, "");
  
  // Ограничиваем до 10 цифр
  const limitedNumbers = numbers.slice(0, 10);
  
  // Форматируем в зависимости от длины
  if (limitedNumbers.length === 0) return "";
  if (limitedNumbers.length <= 3) return `(${limitedNumbers}`;
  if (limitedNumbers.length <= 6) {
    return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3)}`;
  }
  return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3, 6)}-${limitedNumbers.slice(6)}`;
}

export default function QuoteForm() {
  const [status, setStatus] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const phone = String(formData.get("phone") ?? "").trim();
    // Удаляем форматирование для отправки (только цифры)
    const phoneDigits = phone.replace(/\D/g, "");
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: {
        country: "US",
        number: phoneDigits,
      },
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Unable to send message.");
      }

      if (formRef.current) {
        formRef.current.reset();
      }
      setPhoneValue("");
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send message."
      );
    }
  }

  return (
    <form ref={formRef} className="form" onSubmit={handleSubmit}>
      <div className="form__grid">
        <label className="form__field">
          <span>Name</span>
          <input type="text" name="name" required />
        </label>
        <label className="form__field">
          <span>Email</span>
          <input type="email" name="email" required />
        </label>
        <label className="form__field">
          <span>Phone</span>
          <input
            type="tel"
            name="phone"
            value={phoneValue}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              setPhoneValue(formatted);
            }}
            placeholder="(555) 123-4567"
            required
          />
        </label>
        <label className="form__field">
          <span>Subject</span>
          <input type="text" name="subject" required />
        </label>
        <label className="form__field form__field--full">
          <span>Message</span>
          <textarea name="message" rows={6} required />
        </label>
      </div>
      <button className="button" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Submit"}
      </button>
      {status === "success" ? (
        <p className="form__notice">Thanks! We will get back to you soon.</p>
      ) : null}
      {status === "error" ? (
        <p className="form__notice form__notice--error">{errorMessage}</p>
      ) : null}
    </form>
  );
}
