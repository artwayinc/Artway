"use client";

import { useState, useRef } from "react";

type FormState = "idle" | "sending" | "success" | "error";

type Unit = "IN" | "CM";
type WeightUnit = "LB" | "KG";

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
  return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(
    3,
    6
  )}-${limitedNumbers.slice(6)}`;
}

export default function QuoteForm() {
  const [status, setStatus] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [dimensionUnit, setDimensionUnit] = useState<Unit>("IN");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("LB");
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
      fullName: String(formData.get("fullName") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: {
        country: "US",
        number: phoneDigits,
      },
      from: String(formData.get("from") ?? "").trim(),
      to: String(formData.get("to") ?? "").trim(),
      itemDescription: String(formData.get("itemDescription") ?? "").trim(),
      dimensions: {
        h: String(formData.get("dimH") ?? "").trim(),
        w: String(formData.get("dimW") ?? "").trim(),
        d: String(formData.get("dimD") ?? "").trim(),
        unit: dimensionUnit,
      },
      weight: {
        value: String(formData.get("weight") ?? "").trim(),
        unit: weightUnit,
      },
      declaredValue: String(formData.get("declaredValue") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
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
      setDimensionUnit("IN");
      setWeightUnit("LB");
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
          <span>Full Name *</span>
          <input type="text" name="fullName" required />
        </label>
        <label className="form__field">
          <span>Company / Gallery / Institution (optional)</span>
          <input type="text" name="company" />
        </label>
        <label className="form__field">
          <span>Email Address *</span>
          <input type="email" name="email" required />
        </label>
        <label className="form__field">
          <span>Phone Number *</span>
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
          <span>From *</span>
          <input
            type="text"
            name="from"
            required
            autoComplete="off"
            data-lpignore
            data-form-type="other"
          />
        </label>
        <label className="form__field">
          <span>To *</span>
          <input
            type="text"
            name="to"
            required
            autoComplete="off"
            data-lpignore
            data-form-type="other"
          />
        </label>
        <label className="form__field form__field--full">
          <span>Item Description *</span>
          <textarea name="itemDescription" rows={4} required />
        </label>

        <div className="form__field form__field--full">
          <span>Dimensions of Each Item * (H × W × D)</span>
          <div className="form__inline">
            <input
              inputMode="decimal"
              type="text"
              name="dimH"
              placeholder="H"
              required
            />
            <input
              inputMode="decimal"
              type="text"
              name="dimW"
              placeholder="W"
              required
            />
            <input
              inputMode="decimal"
              type="text"
              name="dimD"
              placeholder="D"
              required
            />
            <select
              aria-label="Dimensions unit"
              value={dimensionUnit}
              onChange={(e) => setDimensionUnit(e.target.value as Unit)}
            >
              <option value="IN">IN</option>
              <option value="CM">CM</option>
            </select>
          </div>
        </div>

        <div className="form__field">
          <span>Weight (optional)</span>
          <div className="form__inline">
            <input
              inputMode="decimal"
              type="text"
              name="weight"
              placeholder="e.g., 25"
            />
            <select
              aria-label="Weight unit"
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
            >
              <option value="LB">LB</option>
              <option value="KG">KG</option>
            </select>
          </div>
        </div>

        <label className="form__field">
          <span>Declared Value / Insurance Value (optional)</span>
          <input
            inputMode="decimal"
            type="text"
            name="declaredValue"
            placeholder="e.g., 15000"
          />
        </label>

        <label className="form__field form__field--full">
          <span>Notes</span>
          <textarea name="notes" rows={6} />
        </label>
      </div>
      <button className="button" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Submit"}
      </button>
      {status === "success" ? (
        <p className="form__notice form__notice--success" role="status">
          Thanks! We will get back to you soon.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="form__notice form__notice--error">{errorMessage}</p>
      ) : null}
    </form>
  );
}
