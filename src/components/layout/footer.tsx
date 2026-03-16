import Link from "next/link";
import { Shield } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Features", href: "/features" },
    { label: "Training Modules", href: "/features" },
    { label: "Phishing Simulation", href: "/features" },
    { label: "Risk Analytics", href: "/features" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/about" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-800/50 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent-blue" />
              </div>
              <span className="font-bold text-lg text-white">Secure<span className="text-accent-blue">Aware</span></span>
            </Link>
            <p className="text-gray-500 text-sm">
              Enterprise security awareness training platform protecting organizations against human-risk threats.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800/50 text-center">
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} SecureAware. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
