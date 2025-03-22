import Hero from "@/components/landing-comp/hero"
import Features from "@/components/landing-comp/features"
import HowItWorks from "@/components/landing-comp/how-it-works"
import Testimonials from "@/components/landing-comp/testimonials"
import CallToAction from "@/components/landing-comp/call-to-action"
import Footer from "@/components/landing-comp/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
      <Footer />
    </main>
  )
}

