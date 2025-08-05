import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Phone, Menu, Zap } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "24/7 Emergency Electrician Northern Vermont | Licensed Electrical Services",
  description: "Licensed electrician serving Northern and Central Vermont. 24/7 emergency service, residential & commercial electrical work. Burlington, Montpelier, Stowe. Free quotes!",
  keywords: "electrician vermont, emergency electrician burlington vt, electrical contractor montpelier, licensed electrician stowe, 24/7 electrician vermont, residential electrician, commercial electrician",
  openGraph: {
    title: "Hutchins Electric - Licensed Vermont Electrician",
    description: "24/7 Emergency Electrical Service in Northern & Central Vermont",
    type: "website",
    locale: "en_US",
    url: "https://hutchinselectric.com",
    siteName: "Hutchins Electric",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hutchins Electric - Vermont Electrician"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "24/7 Emergency Electrician Northern Vermont",
    description: "Licensed electrical services in Burlington, Montpelier, Stowe and surrounding areas",
    images: ["/og-image.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://hutchinselectric.com",
  },
  verification: {
    google: "your-google-verification-code",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ElectricalContractor",
    "name": "Hutchins Electric",
    "image": "https://hutchinselectric.com/logo.jpg",
    "telephone": "+1-802-555-0123",
    "email": "service@hutchinselectric.com",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "VT",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 44.4759,
      "longitude": -73.2121
    },
    "url": "https://hutchinselectric.com",
    "areaServed": [
      {
        "@type": "City",
        "name": "Burlington",
        "addressRegion": "VT"
      },
      {
        "@type": "City",
        "name": "Montpelier",
        "addressRegion": "VT"
      },
      {
        "@type": "City",
        "name": "Stowe",
        "addressRegion": "VT"
      }
    ],
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [
      "https://www.facebook.com/hutchinselectric",
      "https://www.instagram.com/hutchinselectric"
    ]
  };

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        {/* Navigation */}
        <nav className="nav-electric sticky top-0 z-50" role="navigation" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-18">
              <div className="flex items-center">
                <Link 
                  href="/" 
                  className="text-2xl font-bold text-deep-navy hover:text-electric-blue transition-colors group"
                  aria-label="Hutchins Electric homepage"
                >
                  <Zap className="w-6 h-6 inline-block mr-2 text-electric-blue group-hover:animate-pulse" aria-hidden="true" />
                  Hutchins Electric
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-8">
                <Link href="/" className="nav-link" aria-current="page">
                  Home
                </Link>
                <Link href="/services" className="nav-link">
                  Services
                </Link>
                <Link href="/gallery" className="nav-link">
                  Our Work
                </Link>
                <Link href="/quote" className="nav-link">
                  Get Quote
                </Link>
                <Link href="/schedule" className="nav-link">
                  Schedule
                </Link>
                <a
                  href="tel:802-555-0123"
                  className="btn-primary inline-flex items-center px-6 py-3 text-sm font-semibold group"
                  aria-label="Call us now at 802-555-0123"
                >
                  <Phone className="h-4 w-4 mr-2 group-hover:animate-bounce" aria-hidden="true" />
                  Call Now
                </a>
              </div>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button 
                  className="nav-link p-2 rounded-lg hover:bg-electric-blue/10 transition-colors"
                  aria-label="Open mobile navigation menu"
                  aria-expanded="false"
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {children}

        {/* Footer */}
        <footer className="footer-electric py-16" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="md:col-span-1">
                <div className="flex items-center mb-4">
                  <Zap className="w-6 h-6 text-electric-blue mr-2" aria-hidden="true" />
                  <h3 className="text-xl font-bold">Hutchins Electric</h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Vermont's trusted electrical contractor, serving Northern & Central Vermont with professional, 
                  reliable service since day one. Licensed, insured, and available 24/7.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" aria-hidden="true"></div>
                    Available Now
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-6 text-white">Our Services</h3>
                <ul className="space-y-3 text-gray-300" role="list">
                  <li>
                    <Link href="/services#residential" className="hover:text-electric-blue transition-colors hover:translate-x-1 inline-block">
                      Residential Electrical
                    </Link>
                  </li>
                  <li>
                    <Link href="/services#commercial" className="hover:text-electric-blue transition-colors hover:translate-x-1 inline-block">
                      Commercial Services
                    </Link>
                  </li>
                  <li>
                    <Link href="/services#emergency" className="hover:text-electric-blue transition-colors hover:translate-x-1 inline-block">
                      Emergency Repairs
                    </Link>
                  </li>
                  <li>
                    <Link href="/services#installation" className="hover:text-electric-blue transition-colors hover:translate-x-1 inline-block">
                      New Installations
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-6 text-white">Service Areas</h3>
                <ul className="space-y-3 text-gray-300" role="list">
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-electric-blue rounded-full mr-3" aria-hidden="true"></div>
                    Burlington, VT
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-electric-blue rounded-full mr-3" aria-hidden="true"></div>
                    Montpelier, VT
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-electric-blue rounded-full mr-3" aria-hidden="true"></div>
                    Stowe, VT
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-electric-blue rounded-full mr-3" aria-hidden="true"></div>
                    All surrounding areas
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-6 text-white">Get In Touch</h3>
                <div className="space-y-4">
                  <a 
                    href="tel:802-555-0123" 
                    className="flex items-center text-gray-300 hover:text-white transition-colors group"
                    aria-label="Call us at 802-555-0123"
                  >
                    <Phone className="w-5 h-5 mr-3 text-electric-blue group-hover:animate-bounce" aria-hidden="true" />
                    802-555-0123
                  </a>
                  <a 
                    href="mailto:service@hutchinselectric.com" 
                    className="flex items-start text-gray-300 hover:text-white transition-colors group"
                    aria-label="Email us at service@hutchinselectric.com"
                  >
                    <svg className="w-5 h-5 mr-3 mt-0.5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    service@hutchinselectric.com
                  </a>
                  <div className="flex items-center text-sm text-electric-blue font-semibold">
                    <div className="w-2 h-2 bg-electric-blue rounded-full mr-2 animate-pulse" aria-hidden="true"></div>
                    Available 24/7 for Emergencies
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Hutchins Electric. All rights reserved.</p>
                <div className="flex items-center mt-4 md:mt-0 space-x-6">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2" aria-hidden="true"></div>
                    Licensed & Insured
                  </span>
                  <span>Vermont License #VT-12345</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}