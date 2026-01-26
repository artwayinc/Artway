import type { Metadata } from "next";
import Image from "next/image";
import { getImagePath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Services | Artway Fine Art Services",
  description:
    "Fine art logistics services including shipping, packing, crating, storage, white glove delivery, and restoration. Specializing in shows, exhibitions, and auction house services.",
  keywords: [
    "fine art shipping services",
    "art packing and crating",
    "art storage services",
    "white glove delivery",
    "art installation services",
    "auction house services",
    "art restoration",
    "shows and exhibitions",
    "fine art logistics",
    "art transportation services",
  ],
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services | Artway Fine Art Services",
    description:
      "Fine art logistics services including shipping, packing, crating, storage, white glove delivery, and restoration.",
    type: "website",
  },
};

const services = [
  {
    title: "Shows & Exhibitions",
    image: "/services/1 Shows & Exhibitions.webp",
    description:
      "Antique shows and exhibitions are our specialty. Since 1995 we have worked closely with show managers across the country to make your show experience as smooth and profitable as possible. We keep pricing reasonable by combining dealers stock in transit while keeping the individual approach at the show. Whether it is a simple delivery to the show or a complete set up of the booth, we will make sure it is done right. Storage is available and in some cases is free if ARTWAY is your dedicated carrier.",
  },
  {
    title: "Auction House Services",
    image: "/services/2 Auction House Services.webp",
    description:
      "ARTWAY services are fully integrated into the major auctions’ experience. Our professionals will help you handle the procedures and transportation of your purchase or a consignment. You can easily request a shipping quote from us when making the final bid or planning a private sale.",
  },
  {
    title: "Packing & Crating",
    image: "/services/3 Packing & Crating.webp",
    description:
      "An expert team of professionals use the highest quality packaging materials and techniques, while preparing items for transit utilizing extreme care and proficiency. Custom-made packing crates are constructed when needed to provide the safest shipping encasement for the most delicate items.",
  },
  {
    title: "Shipping",
    image: "/services/4 Shipping.webp",
    description:
      "ARTWAY offers local, coast-to-coast, and international shipping whether you need complete, one-way or multi-destination transit. Global destinations are reached via UPS, FedEx and DHL and other appropriate air, sea and road transportation options. Our expertise in international custom regulations facilitates smooth door-to-door service.",
  },
  {
    title: "White Glove Service",
    image: "/services/5 White Glove Service.webp",
    description:
      "Our range of services includes white glove delivery should your item require customized handling. Our professional personnel will timely deliver your perishable and valuable items inside your room of choice. White glove service by ARTWAY FAS provides skillful unpacking and uncrating, assembly, positioning, mounting or set-up and packaging material discarding.",
  },
  {
    title: "Storage",
    image: "/services/6 Storage.webp",
    description:
      "Our company provides a wide range of storing solutions, including long-term or month-to-month rental options. An affordable, secure and climate-controlled facility suitable for your needs.",
  },
  {
    title: "Restoration",
    image: "/services/7 Restoration.webp",
    description:
      "ARTWAY is affiliated with a highly experienced array of professionals for all your restoration needs. All work is artistically done within a short period of time and in a reasonably priced manner.",
  },
];

export default function ServicesPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">Services</h1>
        <div className="cards">
          {services.map((service) => (
            <article key={service.title} className="card">
              <div className="card__image-wrapper">
                <Image
                  src={getImagePath(service.image)}
                  alt={service.title}
                  width={400}
                  height={300}
                  className="card__image"
                />
              </div>
              <h2 className="card__title">{service.title}</h2>
              <p className="card__text">{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
