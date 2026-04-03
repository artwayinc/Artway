import type { Metadata } from "next";
import Image from "next/image";
import { getCloudflareEnv, getStore } from "@/lib/db";

export const metadata: Metadata = {
  title: "Clients & Projects | Artway Fine Art Services",
  description:
    "Client reviews and selected projects for Artway Fine Art Services.",
  alternates: {
    canonical: "/clients-and-projects",
  },
};

export default async function ClientsAndProjectsPage() {
  const store = await getStore(await getCloudflareEnv());
  const reviews = await store.getReviews();
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
              Math.max(1, Math.min(5, r.rating ?? 5))
            );
            return (
              <article key={r.id} className="review">
                {r.image && (
                  <div className="review__image-wrap">
                    <Image
                      src={r.image}
                      alt=""
                      className="review__image"
                      width={400}
                      height={300}
                      sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 400px"
                    />
                  </div>
                )}
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
