import type { Metadata } from "next";
import Image from "next/image";
import QuoteForm from "@/components/QuoteForm";
import { getImagePath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Quote Request | Artway Fine Art Services",
  description:
    "Request a quote for fine art shipping, handling, storage, and installation services. Get competitive pricing for one-way or round-trip delivery.",
  keywords: [
    "fine art shipping quote",
    "fine art shipping services",
    "art transportation quote",
    "art logistics quote",
    "art shipping cost",
    "fine art handling quote",
    "art storage quote",
    "art moving services",
    "fine art movers",
    "white glove delivery",
    "art installation services",
  ],
  alternates: {
    canonical: "/quote-request",
  },
  openGraph: {
    title: "Quote Request | Artway Fine Art Services",
    description:
      "Request a quote for fine art shipping, handling, storage, and installation services.",
    type: "website",
  },
};

export default function QuoteRequestPage() {
  return (
    <section className="section">
      <div className="container quote">
        <div className="quote__info">
          <h1 className="section__title">Quote Request</h1>
          <p className="section__text">
            Call or email us to get a quote for one-way or round-trip delivery
            of your collection to any destination.
          </p>
          <p className="section__text">
            Please visit our Schedule to see our upcoming show list for easier
            planning.
          </p>
          <div className="quote__contact">
            <p>
              Email: <a href="mailto:info@artwayinc.com">info@artwayinc.com</a>
            </p>
            <p>
              Phone: <a href="tel:+18555278929">(855) 5-ARTWAY</a>
            </p>
            <p>
              Phone: <a href="tel:+17182136886">(718) 213-6886</a>
            </p>
          </div>
          <aside className="quote__qr quote__qr--desktop" aria-label="QR code">
            <h2 className="quote__qrTitle">Scan QR</h2>
            <p className="quote__qrText">
              Open this page on your phone or share it.
            </p>
            <div className="quote__qrImageWrap">
              <Image
                src={getImagePath("/qr.jpeg")}
                alt="Artway QR code"
                width={320}
                height={320}
                className="quote__qrImage"
                priority={false}
              />
            </div>
          </aside>
        </div>
        <div className="quote__form">
          <QuoteForm />
          <aside className="quote__qr quote__qr--mobile" aria-label="QR code">
            <h2 className="quote__qrTitle">Scan QR</h2>
            <p className="quote__qrText">
              Open this page on your phone or share it.
            </p>
            <div className="quote__qrImageWrap">
              <Image
                src={getImagePath("/qr.jpeg")}
                alt="Artway QR code"
                width={320}
                height={320}
                className="quote__qrImage"
                priority={false}
              />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
