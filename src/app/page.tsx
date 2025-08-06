import Link from 'next/link'
import { Phone, Clock, MapPin, Shield, Zap, Award, Users, Star } from 'lucide-react'

export default function Home() {
  return (
    <main id="main-content">
      {/* Hero Section */}
      <section className="hero-electric py-20 sm:py-32" role="banner" aria-label="Main hero section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hero-content text-center animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-8 animate-float">
              <Zap className="w-4 h-4 mr-2 text-yellow-300" aria-hidden="true" />
              Vermont&apos;s Most Trusted Electrician
            </div>
            <h1 className="mb-6">
              24/7 Emergency Electrician
              <span className="block mt-2">Northern & Central Vermont</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto mb-12 leading-relaxed">
              Licensed master electrician serving Burlington, Montpelier, Stowe, and surrounding areas. 
              Professional residential & commercial electrical services with transparent, fair pricing and guaranteed satisfaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/quote"
                className="btn-primary inline-flex items-center text-lg px-8 py-4 group"
                aria-label="Get your free electrical service quote"
              >
                <Award className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                Get Free Quote
              </Link>
              <Link
                href="/schedule"
                className="btn-secondary inline-flex items-center text-lg px-8 py-4 text-white border-white hover:text-blue-600"
                aria-label="Schedule electrical service appointment"
              >
                <Clock className="w-5 h-5 mr-2" aria-hidden="true" />
                Schedule Service
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80">
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 mr-1 text-yellow-300" aria-hidden="true" />
                4.9/5 Customer Rating
              </div>
              <div className="flex items-center text-sm">
                <Shield className="w-4 h-4 mr-1 text-green-300" aria-hidden="true" />
                Licensed & Insured
              </div>
              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-1 text-blue-300" aria-hidden="true" />
                500+ Happy Customers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" role="region" aria-label="Key features and benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
              Why Choose Hutchins Electric?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional electrical services backed by years of experience and a commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="service-icon mx-auto group-hover:animate-pulse" role="img" aria-label="24/7 Emergency Service">
                <Clock className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Emergency Service</h3>
              <p className="text-gray-600 leading-relaxed">Available round the clock for electrical emergencies. No job too big or small - we&apos;re here when you need us most.</p>
            </div>
            
            <div className="text-center group">
              <div className="service-icon mx-auto group-hover:animate-pulse" role="img" aria-label="Licensed and Insured">
                <Shield className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3">Licensed & Insured</h3>
              <p className="text-gray-600 leading-relaxed">Fully licensed Vermont master electrician with comprehensive insurance coverage for your complete peace of mind.</p>
            </div>
            
            <div className="text-center group">
              <div className="service-icon mx-auto group-hover:animate-pulse" role="img" aria-label="Serving Vermont">
                <MapPin className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3">Serving All Vermont</h3>
              <p className="text-gray-600 leading-relaxed">Burlington, Montpelier, Stowe, and surrounding areas. Local expertise with a deep understanding of Vermont homes and businesses.</p>
            </div>
            
            <div className="text-center group">
              <div className="service-icon mx-auto group-hover:animate-pulse" role="img" aria-label="Quick Response">
                <Zap className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning-Fast Response</h3>
              <p className="text-gray-600 leading-relaxed">Quick response times for all service calls. Professional diagnosis and same-day repairs whenever possible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30" role="region" aria-label="Electrical services offered">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Complete Electrical Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From simple repairs to complex installations, we handle all your electrical needs with precision and care
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="electric-card group">
              <div className="service-icon mb-6 mx-auto w-16 h-16" role="img" aria-label="Residential Services">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18m-9 9l9-9-9-9" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Residential Services</h3>
              <ul className="space-y-3 text-gray-600" role="list">
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Panel upgrades & replacements
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Outlet & switch installation
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Lighting installation & repair
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Whole home rewiring
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  EV charger installation
                </li>
              </ul>
            </div>
            
            <div className="electric-card group">
              <div className="service-icon mb-6 mx-auto w-16 h-16" role="img" aria-label="Commercial Services">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Commercial Services</h3>
              <ul className="space-y-3 text-gray-600" role="list">
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Office electrical systems
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Retail store lighting
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Restaurant electrical work
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Code compliance updates
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Emergency lighting systems
                </li>
              </ul>
            </div>
            
            <div className="electric-card group">
              <div className="service-icon mb-6 mx-auto w-16 h-16" role="img" aria-label="Emergency Services">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.7.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Emergency Services</h3>
              <ul className="space-y-3 text-gray-600" role="list">
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Power outage diagnosis
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Electrical fire prevention
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Circuit breaker issues
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Sparking outlet repair
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  24/7 emergency response
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-electric py-20" role="region" aria-label="Contact call-to-action">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="hero-content animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Power Up Your Property?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Don&apos;t wait for electrical problems to get worse. Get expert help today with transparent pricing, 
              professional service, and guaranteed satisfaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/quote"
                className="btn-primary inline-flex items-center text-lg px-8 py-4 bg-white text-electric-blue hover:bg-gray-100 group"
                aria-label="Get your free electrical service quote now"
              >
                <Award className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                Get Free Quote Now
              </Link>
              <a
                href="tel:802-555-0123"
                className="btn-secondary inline-flex items-center text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-electric-blue group"
                aria-label="Call us now at 802-555-0123 for immediate service"
              >
                <Phone className="mr-2 h-5 w-5 group-hover:animate-bounce" aria-hidden="true" />
                Call 802-555-0123
              </a>
            </div>
            
            {/* Urgency indicators */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/90 text-sm">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-yellow-300" aria-hidden="true" />
                Same-day service available
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-300" aria-hidden="true" />
                100% satisfaction guarantee
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-blue-300" aria-hidden="true" />
                Free phone consultations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50" role="region" aria-label="Service coverage areas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Proudly Serving Northern & Central Vermont
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Local expertise you can trust. We know Vermont communities and their unique electrical needs.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              'Burlington', 'Montpelier', 'Stowe', 'Waterbury',
              'Essex Junction', 'Barre', 'Morrisville', 'St. Albans',
              'Colchester', 'Williston', 'South Burlington', 'Shelburne'
            ].map((city, index) => (
              <div 
                key={city}
                className="electric-card text-center py-6 px-4 group cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <MapPin className="w-6 h-6 text-electric-blue mx-auto mb-2 group-hover:animate-bounce" aria-hidden="true" />
                <h3 className="font-semibold text-gray-800 group-hover:text-electric-blue transition-colors">
                  {city}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Full Service Area</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-6">
              Don&apos;t see your area listed? <span className="text-electric-blue font-semibold">We travel!</span>
            </p>
            <Link
              href="/quote"
              className="btn-secondary inline-flex items-center px-6 py-3"
              aria-label="Contact us for service in your area"
            >
              <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
              Check Service Availability
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}