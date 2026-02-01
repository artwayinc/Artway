import ThemeToggle from "@/components/ThemeToggle";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <strong>ARTWAY Fine Art Services</strong>
          <p>Reliability. Security. Expertise.</p>
        </div>
        <div className="footer__contact">
          <a href="tel:+18555278929">(855) 5-ARTWAY</a>
          <a href="tel:+17182136886">(718) 213-6886</a>
          <a href="mailto:info@artwayinc.com">info@artwayinc.com</a>
        </div>
        <div className="footer__social">
          <a
            href="https://wa.me/17182136886"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="footer__social-link"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.5 8.5 0 0 1-12.8 7.3L3 20l1.3-5.2A8.5 8.5 0 1 1 21 11.5z" />
              <path d="M8.6 9.2c.2-.5.4-.6.8-.6h.6c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.4.5c-.1.1-.1.3 0 .5.6 1.1 1.5 2 2.6 2.6.2.1.4.1.5 0l.5-.4c.2-.2.4-.2.7-.1l1.7.7c.3.1.4.3.4.5v.6c0 .4-.1.6-.6.8-.7.3-2.2.4-4.5-.8-2.3-1.2-3.8-3.7-4.1-4.5-.3-.8-.2-1.4 0-1.9z" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/artwayfas/"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="footer__social-link"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a
            href="http://www.instagram.com/artwayshipping"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="footer__social-link"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </div>
        <div className="footer__theme">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
