import Link from 'next/link'
import { Zap, Home, Building, AlertCircle, Car, Lightbulb, Shield, Clock } from 'lucide-react'

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Electrical Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional electrical services for residential and commercial properties throughout Northern and Central Vermont. 
            Licensed, insured, and available 24/7 for emergencies.
          </p>
        </div>

        {/* Residential Services */}
        <section id="residential" className="mb-16">
          <div className="flex items-center mb-8">
            <Home className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Residential Services</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Zap className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Panel Upgrades</h3>
              <p className="text-gray-600 mb-4">
                Upgrade your electrical panel to handle modern power demands. We install 200A and 400A services.
              </p>
              <p className="text-blue-600 font-medium">$800 - $2,500</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Lightbulb className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Lighting Installation</h3>
              <p className="text-gray-600 mb-4">
                Indoor and outdoor lighting installation including recessed lights, chandeliers, and landscape lighting.
              </p>
              <p className="text-blue-600 font-medium">$200 - $500 per fixture</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Car className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">EV Charger Installation</h3>
              <p className="text-gray-600 mb-4">
                Level 2 EV charger installation with dedicated 240V circuit. Compatible with all electric vehicles.
              </p>
              <p className="text-blue-600 font-medium">$500 - $1,500</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Zap className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Outlet & Switch Installation</h3>
              <p className="text-gray-600 mb-4">
                Add new outlets, USB outlets, GFCI protection, and smart switches throughout your home.
              </p>
              <p className="text-blue-600 font-medium">$150 - $300 per outlet</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Shield className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Whole Home Rewiring</h3>
              <p className="text-gray-600 mb-4">
                Complete electrical system replacement for older homes. Bring your home up to modern safety standards.
              </p>
              <p className="text-blue-600 font-medium">$3,000 - $8,000</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Clock className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Electrical Inspections</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive home electrical safety inspections for buyers, sellers, or peace of mind.
              </p>
              <p className="text-blue-600 font-medium">$200 - $400</p>
            </div>
          </div>
        </section>

        {/* Commercial Services */}
        <section id="commercial" className="mb-16">
          <div className="flex items-center mb-8">
            <Building className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Commercial Services</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Building className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Office Electrical Systems</h3>
              <p className="text-gray-600 mb-4">
                Complete electrical installation and maintenance for office buildings, including data centers.
              </p>
              <p className="text-blue-600 font-medium">Quote on request</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Lightbulb className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Commercial Lighting</h3>
              <p className="text-gray-600 mb-4">
                Energy-efficient LED retrofits, parking lot lighting, and emergency lighting systems.
              </p>
              <p className="text-blue-600 font-medium">$500 - $5,000+</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Shield className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Code Compliance</h3>
              <p className="text-gray-600 mb-4">
                Ensure your business meets all electrical codes and safety requirements. Includes documentation.
              </p>
              <p className="text-blue-600 font-medium">$1,000 - $5,000</p>
            </div>
          </div>
        </section>

        {/* Emergency Services */}
        <section id="emergency" className="mb-16">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8">
            <div className="flex items-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">24/7 Emergency Services</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Emergency Situations We Handle:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Power outages affecting your property
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Electrical fire prevention and response
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Sparking outlets or switches
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Burning electrical smell
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Circuit breaker issues
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Storm damage repairs
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Need Emergency Help?</h3>
                <p className="text-gray-600 mb-6">
                  Our emergency electricians are available 24/7 throughout Northern and Central Vermont. 
                  We&apos;ll arrive quickly to ensure your safety.
                </p>
                <a
                  href="tel:802-555-0123"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call 802-555-0123 Now
                </a>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Average response time: 30-45 minutes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Get a free quote for your electrical project or schedule service today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Free Quote
            </Link>
            <Link
              href="/schedule"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule Service
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function Phone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}