import type { Metadata } from "next";
import { getSchedule } from "@/lib/db";

const CURRENT_YEAR = new Date().getFullYear();

export const metadata: Metadata = {
  title: "Event Schedule | Artway Fine Art Services",
  description:
    "Upcoming art fairs and event schedule for Artway Fine Art Services. Plan your fine art shipping and handling needs for major shows and exhibitions.",
  keywords: [
    "art fair schedule",
    "art exhibition schedule",
    "antique show schedule",
    "fine art event calendar",
    "art show logistics",
    "exhibition shipping",
  ],
  alternates: {
    canonical: "/schedule",
  },
  openGraph: {
    title: "Event Schedule | Artway Fine Art Services",
    description:
      "Upcoming art fairs and event schedule for Artway Fine Art Services.",
    type: "website",
  },
};

export default function SchedulePage() {
  const events = getSchedule();
  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">{CURRENT_YEAR} Event Schedule</h1>
        <div className="schedule">
          {events.map((event) => (
            <div key={event.id} className="schedule__item">
              {event.date ? (
                <p className="schedule__date">{event.date}</p>
              ) : (
                <span className="schedule__date schedule__date--empty">—</span>
              )}
              <div className="schedule__info">
                <p className="schedule__name">{event.name}</p>
                {event.location ? (
                  <p className="schedule__location">{event.location}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
