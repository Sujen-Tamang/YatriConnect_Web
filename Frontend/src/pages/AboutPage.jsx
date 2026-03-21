import { motion } from "framer-motion"

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#0d140a]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#59f20d]/10 via-transparent to-transparent"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#59f20d]/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-[#59f20d]/10 border border-[#59f20d]/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#59f20d] animate-pulse"></div>
              <span className="text-[#59f20d] text-sm font-medium">Our Story</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About <span className="text-[#59f20d]">YatriConnect</span>
            </h1>
            <p className="text-xl text-[#a6ba9c] max-w-3xl mx-auto">Revolutionizing bus travel with modern technology and exceptional service.</p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Story</h2>
              <div className="space-y-4">
                <p className="text-[#a6ba9c] leading-relaxed">
                  Founded in 2025, YatriConnect emerged from a simple yet powerful idea: to make bus travel more convenient,
                  reliable, and enjoyable for everyone. Our founders experienced firsthand the challenges of traditional
                  bus booking systems and decided to create a solution that would transform the industry.
                </p>
                <p className="text-[#a6ba9c] leading-relaxed">
                  What started as a small startup has now grown into a trusted platform serving thousands of travelers
                  daily. Our commitment to innovation and customer satisfaction has made us a leader in the transportation
                  technology sector.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              <div className="bg-[#1c2619] rounded-2xl border border-[#2e3928] p-8 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <div className="size-20 bg-[#59f20d]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-[#59f20d] text-4xl">directions_bus</span>
                  </div>
                  <p className="text-white text-2xl font-bold">YatriConnect</p>
                  <p className="text-[#a6ba9c] text-sm mt-1">Connecting travelers since 2020</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[#1c2619] rounded-2xl border border-[#2e3928] shadow-[0_0_30px_rgba(89,242,13,0.1)] p-6 max-w-xs">
                <p className="text-4xl font-bold text-[#59f20d] mb-2">50K+</p>
                <p className="text-[#a6ba9c]">Happy customers who trust YatriConnect for their journeys</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Mission & Values</h2>
            <p className="text-xl text-[#a6ba9c] max-w-3xl mx-auto">
              We're driven by our commitment to revolutionize bus travel through technology and exceptional service.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "bolt",
                title: "Innovation",
                desc: "We continuously push the boundaries of technology to improve the bus travel experience, from real-time tracking to seamless booking systems."
              },
              {
                icon: "group",
                title: "Customer First",
                desc: "Every decision we make is centered around enhancing the customer experience and ensuring satisfaction at every touchpoint."
              },
              {
                icon: "verified_user",
                title: "Reliability",
                desc: "We pride ourselves on providing accurate information and dependable service that our customers can always count on."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-[#1c2619] rounded-2xl border border-[#2e3928] p-8 hover:border-[#59f20d]/30 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-[#59f20d]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#59f20d]/20 transition-colors">
                  <span className="material-symbols-outlined text-[#59f20d] text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-[#a6ba9c] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Bus Partners", icon: "directions_bus" },
              { number: "50K+", label: "Happy Customers", icon: "sentiment_satisfied" },
              { number: "100+", label: "Cities Covered", icon: "location_city" },
              { number: "99.9%", label: "Service Uptime", icon: "speed" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-[#1c2619] rounded-2xl border border-[#2e3928] p-6"
              >
                <span className="material-symbols-outlined text-[#59f20d]/60 text-3xl mb-2 block">{stat.icon}</span>
                <p className="text-3xl font-bold text-[#59f20d] mb-1">{stat.number}</p>
                <p className="text-sm text-[#a6ba9c]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#59f20d]/5 to-[#59f20d]/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center bg-[#1c2619] rounded-3xl border border-[#2e3928] p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Join Us on Our Journey</h2>
            <p className="text-xl text-[#a6ba9c] mb-8 max-w-3xl mx-auto">
              Be part of the revolution in bus travel. Experience the future of transportation with YatriConnect.
            </p>
            <a
              href="/bus-booking"
              className="inline-block bg-[#59f20d] text-[#0d140a] px-8 py-4 rounded-xl font-bold hover:bg-[#4ed40b] shadow-[0_0_20px_rgba(89,242,13,0.3)] hover:shadow-[0_0_30px_rgba(89,242,13,0.5)] transition-all duration-300 transform hover:scale-105"
            >
              Get Started Today
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage