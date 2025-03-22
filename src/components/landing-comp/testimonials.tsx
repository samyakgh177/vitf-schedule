import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    role: "Professor, Computer Science",
    content:
      "VITF Schedule has transformed how I manage my classes. The substitution process that once took hours now takes minutes. It's an essential tool for every faculty member.",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Dr. Rajesh Kumar",
    role: "HOD, Mechanical Engineering",
    content:
      "As a department head, I need to ensure smooth operations. VITF Schedule gives me complete visibility and control over faculty timetables and substitutions.",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Prof. Ananya Patel",
    role: "Assistant Professor, Electronics",
    content:
      "The real-time notifications and intuitive interface make VITF Schedule a joy to use. I can manage my schedule on the go and never miss important updates.",
    avatar: "/placeholder.svg?height=100&width=100",
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  const next = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const prev = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            What Faculty Are Saying
          </h2>
          <p className="text-lg text-gray-600">Hear from the VIT faculty members who use VITF Schedule every day.</p>
        </motion.div>

        <div className="relative mx-auto max-w-4xl overflow-hidden">
          <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-blue-200 bg-white/80 text-blue-700 backdrop-blur-sm hover:bg-blue-50"
              onClick={prev}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous</span>
            </Button>
          </div>
          <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-blue-200 bg-white/80 text-blue-700 backdrop-blur-sm hover:bg-blue-50"
              onClick={next}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next</span>
            </Button>
          </div>

          <div className="relative h-[400px] w-full">
            <AnimatePresence mode="wait">
              {testimonials.map(
                (testimonial, index) =>
                  current === index && (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="rounded-xl bg-white p-8 shadow-lg md:p-12">
                        <div className="mb-6 flex justify-center">
                          <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md">
                            <img
                              src={testimonial.avatar || "/placeholder.svg"}
                              alt={testimonial.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="relative">
                          <Quote className="absolute -left-2 -top-2 h-8 w-8 text-blue-100" />
                          <p className="mb-6 text-center text-lg text-gray-700 md:text-xl">{testimonial.content}</p>
                          <div className="text-center">
                            <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  current === index ? "w-6 bg-blue-700" : "bg-blue-200"
                }`}
                onClick={() => {
                  setAutoplay(false)
                  setCurrent(index)
                }}
              >
                <span className="sr-only">Testimonial {index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

