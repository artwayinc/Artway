import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Quote Request | Artway Fine Art Services",
  description:
    "Request a quote for fine art shipping, handling, storage, and installation services. Get competitive pricing for one-way or round-trip delivery.",
  keywords: [
    "fine art shipping quote",
    "art transportation quote",
    "art logistics quote",
    "art shipping cost",
    "fine art handling quote",
    "art storage quote",
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
            <p>Email: info@artwayinc.com</p>
            <p>Phone: (855) 5-ARTWAY</p>
            <p>Phone: (718) 213-6886</p>
          </div>
        </div>
        <div className="quote__form">
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}
