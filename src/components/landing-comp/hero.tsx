import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, LogIn, MessageSquare, UserPlus } from "lucide-react"
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      {/* Gradient background with subtle pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-blue-50"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f620_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute -left-16 top-1/4 h-64 w-64 rounded-full bg-blue-200 opacity-20 blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
          className="absolute right-1/4 top-3/4 h-80 w-80 rounded-full bg-indigo-300 opacity-20 blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 0.5, x: 0 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 5 }}
          className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-blue-400 opacity-10 blur-3xl"
        />
      </div>
      
      <div className="container relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
            {/* Left side content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-800"
              >
                <span className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  VITF Schedule Platform
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">
                  Simplify
                </span>
                Faculty Scheduling & Communication
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-lg text-gray-600 md:text-xl"
              >
                A comprehensive platform designed for VIT faculty to manage timetables, 
                arrange substitutions, and communicate efficiently—all in one place.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm">
                    <LogIn className="mr-2 h-4 w-4" /> Log in
                  </Button>
                </Link>
              </motion.div>
              
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-8 grid grid-cols-3 gap-4 pt-4"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">20+</div>
                  <div className="text-sm text-gray-500">Departments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">3000+</div>
                  <div className="text-sm text-gray-500">Faculty Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">98%</div>
                  <div className="text-sm text-gray-500">Satisfaction</div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right side image and features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl">
                {/* Dashboard mockup */}
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-indigo-50 p-6">
                  <div className="h-full w-full rounded-lg bg-white shadow-lg overflow-hidden border border-gray-100">
                    <div className="h-8 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center px-4">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 rounded-full bg-red-400"></div>
                        <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                        <div className="h-2 w-2 rounded-full bg-green-400"></div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="h-6 w-1/3 rounded bg-gray-100 mb-4"></div>
                      <div className="grid grid-cols-7 gap-1 mb-4">
                        {Array(7).fill(0).map((_, i) => (
                          <div key={i} className="aspect-square rounded bg-blue-50 p-1 text-center">
                            <div className="text-[8px] text-blue-800 font-medium">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {Array(3).fill(0).map((_, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <div className="h-8 w-20 rounded bg-blue-100"></div>
                            <div className="h-8 flex-1 rounded bg-gray-50 border border-gray-100"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Feature cards */}
                <div className="absolute -right-4 -bottom-4 flex flex-col space-y-2 max-w-[180px]">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-white rounded-lg shadow-md p-3 border border-gray-100"
                  >
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium">Schedule Manager</span>
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="bg-white rounded-lg shadow-md p-3 border border-gray-100"
                  >
                    <div className="flex items-center text-sm">
                      <UserPlus className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">Substitution System</span>
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="bg-white rounded-lg shadow-md p-3 border border-gray-100"
                  >
                    <div className="flex items-center text-sm">
                      <MessageSquare className="h-4 w-4 mr-2 text-indigo-600" />
                      <span className="font-medium">Faculty Messaging</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

