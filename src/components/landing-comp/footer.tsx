import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";


export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">VITF Schedule</h3>
            <p className="mb-4 text-sm">
              The comprehensive platform for faculty timetable and substitution management at VIT.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-blue-400 transition-colors hover:bg-blue-700 hover:text-white"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-blue-400 transition-colors hover:bg-blue-700 hover:text-white"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-blue-400 transition-colors hover:bg-blue-700 hover:text-white"
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-blue-400 transition-colors hover:bg-blue-700 hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400">Home</a></li>
              <li><a href="#" className="hover:text-blue-400">Features</a></li>
              <li><a href="#" className="hover:text-blue-400">How It Works</a></li>
              <li><a href="#" className="hover:text-blue-400">Testimonials</a></li>
              <li><a href="#" className="hover:text-blue-400">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400">User Guide</a></li>
              <li><a href="#" className="hover:text-blue-400">FAQs</a></li>
              <li><a href="#" className="hover:text-blue-400">Support</a></li>
              <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <Mail className="mr-2 h-5 w-5 text-blue-400" />
                <span>support@vitfschedule.edu</span>
              </li>
              <li className="flex items-start">
                <Phone className="mr-2 h-5 w-5 text-blue-400" />
                <span>+91 123 456 7890</span>
              </li>
              <li>
                <address className="not-italic">
                  VIT University,
                  <br />
                  Vellore Campus,
                  <br />
                  Tamil Nadu, India
                </address>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} VITF Schedule. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
