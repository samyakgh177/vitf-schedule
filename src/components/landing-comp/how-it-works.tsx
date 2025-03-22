import { motion } from "framer-motion"
import { Upload, UserCheck, CheckCircle, Bell } from "lucide-react"

const steps = [
  {
    title: "Upload Timetable",
    description: "Faculty uploads their semester timetable to the system",
    icon: Upload,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Request Substitution",
    description: "Faculty requests substitution for specific classes",
    icon: UserCheck,
    color: "bg-amber-100 text-amber-700",
  },
  {
    title: "HOD Approval",
    description: "Department head reviews and approves the request",
    icon: CheckCircle,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Notification",
    description: "System notifies all stakeholders in real-time",
    icon: Bell,
    color: "bg-purple-100 text-purple-700",
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-gray-50 py-20 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">How It Works</h2>
          <p className="text-lg text-gray-600">
            A simple, streamlined process for managing faculty timetables and substitutions.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-blue-100 md:block"></div>
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative md:flex ${index % 2 === 0 ? "md:justify-start" : "md:justify-end"}`}
              >
                <div className={`relative mx-auto md:mx-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                  <div className="relative rounded-xl bg-white p-6 shadow-md">
                    <div
                      className={`absolute left-1/2 top-0 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white ${
                        step.color.split(" ")[0]
                      }`}
                    ></div>
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${step.color}`}
                      >
                        <step.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                      <div className="h-32 w-full overflow-hidden rounded-md bg-white shadow-sm">
                        <div className="h-8 bg-blue-700"></div>
                        <div className="p-3">
                          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                          <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

