import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artway Fine Art Services | Fine Art Shipping & Handling",
  description:
    "White glove fine art shipping, handling, packing, storage, and installation across the United States.",
};

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero__content">
          <p className="hero__eyebrow">Since 1995</p>
          <h1 className="hero__title">Fine Art Shipping & Handling</h1>
          <p className="hero__subtitle">
            White glove delivery, packing, storage, and installation for
            galleries, collectors, and institutions across the United States.
          </p>
          <a className="button" href="/quote-request">
            Request a Quote
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">About ARTWAY</h2>
          <p className="section__text">
            ARTWAY Fine Art Services is a full-service fine art shipping and
            handling company with extensive experience in handling all forms of
            art and antiques.
          </p>
          <p className="section__text">
            Antique shows and exhibitions are our specialty. Since 1995 we have
            worked closely with major show managements across the country to
            make our clients’ show experience as smooth and profitable as
            possible.
          </p>
          <p className="section__text">
            At ARTWAY Fine Art Services, we pride ourselves in serving a great
            number of dealers on the East Coast. We manage to keep our pricing
            reasonable by consolidating dealers’ stock in transit while keeping
            the individual approach at the show. ARTWAY FAS performs scheduled
            pick-ups, catered to your needs all along the East Coast and across
            the United States. Whether it is a simple delivery to the show or a
            complete set up of the booth, we will arrange, organize and manage
            the transfer of property and ensure the best service and safest
            delivery.
          </p>
          <p className="section__text">
            We specialize in custom packing, transporting and assembling of any
            type, designer services, white glove delivery as well as handling
            overweight and oversized items. ARTWAY FAS offers competitive prices
            and personal approach on all kinds of services. Storage is available
            and in some cases is free if ARTWAY FAS is your dedicated carrier.
          </p>
        </div>
      </section>
    </>
  );
}
