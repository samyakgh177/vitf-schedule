"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, LogIn } from "lucide-react"
import { Link } from "react-router-dom";

export default function CallToAction() {
  return (
    <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-20 text-white md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Join VIT Faculty in Simplifying Timetable Management!
          </h2>
          <p className="mb-8 text-lg text-blue-100 md:text-xl">
            Experience the most efficient way to manage your academic schedule and substitutions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link to="/signup">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-blue-300 text-black hover:bg-blue-800">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-0 -z-10 h-full w-full">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f46e512_1px,transparent_1px),linear-gradient(to_bottom,#4f46e512_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>
    </section>
  )
}

