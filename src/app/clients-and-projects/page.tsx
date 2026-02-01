import type { Metadata } from "next";
import { getReviews } from "@/lib/db";

export const metadata: Metadata = {
  title: "Clients & Projects | Artway Fine Art Services",
  description:
    "Client reviews and selected projects for Artway Fine Art Services.",
  alternates: {
    canonical: "/clients-and-projects",
  },
};

export default function ClientsAndProjectsPage() {
  const reviews = getReviews();
  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">Clients & Projects</h1>
        <p className="section__text">
          We’re building this page over time. In the meantime, if you’d like to
          share feedback, please reach out — we’d love to hear from you.
        </p>

        <div className="clients__grid" aria-label="Client reviews">
          {reviews.map((r) => {
            const stars = "★★★★★".slice(
              0,
              Math.max(1, Math.min(5, r.rating ?? 5)),
            );
            return (
              <article key={r.id} className="review">
                <div
                  className="review__stars"
                  aria-label={`${r.rating ?? 5} out of 5 stars`}
                >
                  {stars}
                </div>
                <h2 className="review__title">{r.title}</h2>
                <p className="review__text">{r.text}</p>
                <p className="review__author">
                  — {r.author}{" "}
                  <span className="review__meta">
                    {r.role}
                    {r.role && r.location ? ", " : ""}
                    {r.location}
                  </span>
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
