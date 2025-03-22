import { motion } from "framer-motion"
import { Calendar, Bell, Users, Zap, MessageSquare, ClipboardCheck } from "lucide-react"

const features = [
  {
    title: "Centralized Schedule Management",
    description: "View and manage your semester timetables in one intuitive interface with calendar integration.",
    icon: Calendar,
    color: "bg-blue-100 text-blue-600",
    gradient: "from-blue-50 to-blue-100",
  },
  {
    title: "Streamlined Substitution Requests",
    description: "Request and approve substitutions with just a few clicks in our simplified workflow.",
    icon: ClipboardCheck,
    color: "bg-green-100 text-green-600",
    gradient: "from-green-50 to-green-100",
  },
  {
    title: "Faculty Communication Platform",
    description: "Connect and collaborate with colleagues through our integrated messaging system.",
    icon: MessageSquare,
    color: "bg-indigo-100 text-indigo-600",
    gradient: "from-indigo-50 to-indigo-100",
  },
  {
    title: "Instant Notifications",
    description: "Stay informed with real-time alerts for substitution requests, approvals, and messages.",
    icon: Bell,
    color: "bg-amber-100 text-amber-600",
    gradient: "from-amber-50 to-amber-100",
  },
  {
    title: "Collaborative Environment",
    description: "Work together with department members for efficient academic planning and management.",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
    gradient: "from-purple-50 to-purple-100",
  },
  {
    title: "Fast & Responsive Experience",
    description: "Enjoy a seamless experience with our optimized platform that works on any device.",
    icon: Zap,
    color: "bg-orange-100 text-orange-600",
    gradient: "from-orange-50 to-orange-100",
  },
]

export default function Features() {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <span className="h-0.5 w-6 bg-blue-600 mr-2"></span>
            <span className="text-blue-600 font-medium uppercase text-sm tracking-wider">Platform Features</span>
            <span className="h-0.5 w-6 bg-blue-600 ml-2"></span>
          </div>
          
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything You Need in One Place
          </h2>
          <p className="text-lg text-gray-600">
            Our platform brings together all the tools VIT faculty need for efficient scheduling and communication.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 group-hover:opacity-80 transition-opacity`}></div>
              
              <div className="relative p-8">
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                
                {/* Bottom accent line with animation */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:w-full"></div>
                
                {/* Subtle icon in the background */}
                <div className="absolute bottom-4 right-4 opacity-5 transform scale-150">
                  <feature.icon className="h-20 w-20" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-20 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-8 md:p-12 shadow-sm"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Why Faculty Love Our Platform</h3>
            <p className="text-gray-600">Real results that make a difference in daily academic operations</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-blue-700 mb-1">85%</div>
              <div className="text-sm text-gray-600">Reduction in scheduling conflicts</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-indigo-700 mb-1">3x</div>
              <div className="text-sm text-gray-600">Faster substitution process</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-green-700 mb-1">98%</div>
              <div className="text-sm text-gray-600">Faculty satisfaction rate</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-purple-700 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Accessible on any device</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

