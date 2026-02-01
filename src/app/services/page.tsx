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
      "ARTWAY is a leading provider of art and antique show logistics, offering nationwide transportation, handling, and on-site services for exhibitions, fairs, and dealer shows. Since 1995, we have worked closely with show managers, galleries, and exhibitors to deliver reliable, cost-effective exhibition logistics that support successful and profitable events.\n\nBy consolidating dealer inventory in transit, ARTWAY provides competitive pricing while maintaining a white-glove, individualized approach on the show floor. Our services include art and antique transportation, secure packing, timely delivery, full booth setup and breakdown, and post-show logistics. Secure art storage is available and may be complimentary when ARTWAY acts as your dedicated exhibition carrier.",
  },
  {
    title: "Auction House Services",
    image: "/services/2 Auction House Services.webp",
    description:
      "ARTWAY provides professional art logistics and auction shipping services for clients buying and consigning through major auction houses across the United States. We support artwork sold via leading online auction platforms such as LiveAuctioneers, 1stDibs, Invaluable, Bidsquare, and Artsy others.\n\nOur team works directly with auction houses and sellers to manage post-sale coordination, expert packing and crating upon request, secure art storage, domestic delivery, international shipping, and final installation. Shipping quotes can be requested after winning or in advance of a sale, ensuring a seamless, white-glove experience from hammer to destination.",
  },
  {
    title: "Packing & Crating",
    image: "/services/3 Packing & Crating.webp",
    description:
      "ARTWAY provides professional art packing and custom crating using museum-grade materials and proven techniques to ensure maximum protection during transit. Our experienced specialists handle fine art, antiques, and fragile objects with exceptional care and precision.\n\nWhen needed, we design and build custom wooden crates tailored to each piece, delivering secure solutions for both domestic and international shipping. Trusted by collectors, galleries, auction houses, and institutions, ARTWAY meets the highest standards for safe, professional art transport.",
  },
  {
    title: "Nationwide Delivery & Shipping",
    image: "/services/4 Shipping.webp",
    description:
      "ARTWAY provides professional nationwide art shipping and transportation services for art and antiques, offering local, coast-to-coast, and multi-destination delivery solutions. Our U.S. shipping network serves the East Coast, Southeast, Midwest, Southwest, and California, enabling efficient and secure transport for individual artworks, dealer inventories, and entire collections.\n\nWe operate regular art shuttle routes designed to reduce shipping costs through consolidated transport, while also offering designated, time-specific, and white-glove deliveries upon request. With proven expertise in domestic art logistics, ARTWAY ensures reliable, secure, and cost-effective nationwide delivery tailored to collectors, galleries, auction houses, and institutions.",
  },
  {
    title: "Global Shipping",
    image: "/services/8 Global Shipping.webp",
    description:
      "ARTWAY provides professional art shipping services for art and antiques, offering local, coast-to-coast, and international transport. We coordinate secure delivery and receiving by air, sea, and ground through trusted carriers including UPS, FedEx, DHL, and other specialized logistics partners.\n\nOur team manages airport and seaport pickups in New York and New Jersey, and Florida international receiving at our art warehouse for dealers and galleries, paperwork preparation, and the construction of custom ISPM-15–compliant wooden export crates. ARTWAY also arranges container shipments from New York, delivering smooth, reliable door-to-door service worldwide through extensive experience in international shipping procedures.",
  },
  {
    title: "White Glove and Designer Service",
    image: "/services/5 White Glove Service.webp",
    description:
      "ARTWAY provides professional white glove art delivery, installation, and interior designer services for fine art, antiques, and high-value artwork and items requiring specialized handling. Our trained team delivers each piece to the room of choice with precision, care, and attention to aesthetic placement.\n\nServices include expert unpacking and uncrating, artwork installation and mounting, precise placement, assembly, and setup, as well as full removal of packing materials. ARTWAY also works closely with interior designers and design professionals, offering on-site coordination to ensure artworks are installed in harmony with interior layouts and client vision. Trusted by collectors, galleries, designers, and institutions, ARTWAY delivers a seamless experience from delivery through final installation.",
  },
  {
    title: "Storage",
    image: "/services/6 Storage.webp",
    description:
      "ARTWAY offers secure, climate-controlled art storage solutions designed for art, antiques, and valuable collections. We provide flexible long-term and month-to-month storage options, allowing collectors, galleries, dealers, and institutions to store artworks safely for any duration.\n\nOur storage facilities are secure, monitored, and professionally managed, ensuring optimal environmental conditions and protection. Affordable and adaptable to your needs, ARTWAY storage services deliver reliable care and peace of mind for valuable artworks and objects.",
  },
  {
    title: "Restoration",
    image: "/services/7 Restoration.webp",
    description:
      "ARTWAY works with a trusted network of experienced art and antique restoration professionals serving New York, the Tri-State area, the Northeast, and Florida. We provide expert restoration and conservation services for fine art, furniture, frames, and decorative objects, preserving authenticity and long-term value.\n\nARTWAY coordinates pickup and delivery to and from the restorer, ensuring secure transport and efficient scheduling throughout the process. Trusted by collectors, galleries, dealers, and institutions, we deliver seamless, cost-effective restoration support from initial transport to final return.",
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
              <p className="card__text" style={{ whiteSpace: "pre-line" }}>
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
