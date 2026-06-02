import { Link } from 'react-router-dom';

const footerLinks = {
  Shop: [
    { label: 'Men', path: '/catalog?category=men' },
    { label: 'Women', path: '/catalog?category=women' },
    { label: 'Kids', path: '/catalog?category=kids' },
    { label: 'New Arrivals', path: '/catalog' },
    { label: 'Flash Deals', path: '/catalog?deals=true' },
  ],
  Support: [
    { label: 'Contact Us', path: '/contact' },
    { label: 'FAQs', path: '/faqs' },
    { label: 'Shipping Info', path: '/shipping' },
    { label: 'Returns', path: '/returns' },
    { label: 'Size Guide', path: '/size-guide' },
  ],
  Company: [
    { label: 'About Us', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-nav text-nav-foreground mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-extrabold tracking-tight mb-3">
              TRADE<span className="text-primary">MALL</span>
            </h3>
            <p className="text-nav-muted text-sm leading-relaxed">
              Kenya's leading online shoe store. Shop authentic sneakers and footwear from top brands. Fast delivery across Kenya. Pay with M-Pesa.
            </p>
            <div className="flex gap-3 mt-4">
              <span className="text-xs bg-nav-foreground/10 px-3 py-1.5 rounded-full">M-Pesa</span>
              <span className="text-xs bg-nav-foreground/10 px-3 py-1.5 rounded-full">Visa</span>
              <span className="text-xs bg-nav-foreground/10 px-3 py-1.5 rounded-full">PayPal</span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-nav-muted text-sm hover:text-nav-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-nav-foreground/10 mt-8 pt-6 text-center">
          <p className="text-nav-muted text-xs">
            @2026 jomanzetec
          </p>
        </div>
      </div>
    </footer>
  );
}
