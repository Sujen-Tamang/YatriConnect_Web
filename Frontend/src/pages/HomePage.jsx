import { Link } from "react-router-dom"
import { motion } from "framer-motion"

const HomePage = () => {
  return (
    <div className="bg-brand-dark min-h-screen font-sans selection:bg-brand-primary selection:text-black">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-[10px] font-bold tracking-widest uppercase mb-8">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                New Routes Available
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                Seamless Travel <br/>
                <span className="text-brand-primary">Across Every</span> <br/>
                Mile
              </h1>
              
              <p className="text-brand-muted text-lg mb-10 max-w-lg leading-relaxed">
                Experience the future of transportation with Yatriconnect. Whether across cities or within your neighborhood, we move you better with smart technology and comfort.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/bus-booking" className="px-8 py-4 bg-brand-primary text-brand-dark font-bold rounded-xl hover:bg-[#4ed40b] transition-all shadow-[0_0_20px_rgba(89,242,13,0.3)] text-center tracking-wide active:scale-[0.98]">
                  Book Your Ride
                </Link>
                <Link to="/bus-booking" className="px-8 py-4 bg-transparent border border-brand-border text-white font-bold rounded-xl hover:border-brand-primary/50 hover:bg-brand-surface transition-all text-center tracking-wide active:scale-[0.98]">
                  View Schedules
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden border border-brand-border shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent mix-blend-overlay z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="Modern Green Bus" 
                  className="w-full h-auto object-cover opacity-90 filter contrast-125 saturate-150 rounded-3xl"
                  style={{ filter: "hue-rotate(-40deg) saturate(1.5)" }} /* Tweak image to look more neon green */
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-24 bg-brand-dark relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Our Services</h2>
            <p className="text-brand-muted text-lg">
              Tailored transportation solutions designed for modern commuters and long-distance travelers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
            
            {/* Main Service Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-brand-surface rounded-3xl p-10 border border-brand-border hover:border-brand-primary/50 transition-colors group flex flex-col items-start relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="size-14 bg-brand-dark rounded-2xl flex items-center justify-center text-brand-primary mb-8 border border-brand-primary/20 shadow-[0_0_15px_rgba(89,242,13,0.1)]">
                <span className="material-symbols-outlined text-2xl">directions_bus</span>
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-4">City-to-City</h3>
              <p className="text-brand-muted text-lg mb-10 max-w-md leading-relaxed">
                Comfortable long-distance travel connecting major urban hubs with high-frequency schedules and premium amenities. Experience travel redefined with our luxury fleet.
              </p>
              
              <div className="mt-auto">
                <Link to="/bus-booking" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-dark border border-brand-border text-brand-primary font-bold text-sm hover:border-brand-primary transition-all group-hover:bg-brand-primary/10">
                  Explore Routes <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                </Link>
              </div>
            </motion.div>

            {/* Side Cards */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-brand-surface rounded-3xl p-8 border border-brand-border hover:border-brand-primary/50 transition-colors group flex-1 flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="size-10 bg-brand-dark rounded-xl flex items-center justify-center text-brand-primary border border-brand-primary/20">
                    <span className="material-symbols-outlined text-xl">commute</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#a6ba9c] bg-brand-dark px-2 py-1 rounded border border-brand-border">Fast</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">In-City</h3>
                <p className="text-brand-muted text-sm mb-6 flex-grow">
                  Efficient daily commuting options to navigate the urban landscape seamlessly.
                </p>
                <Link to="/bus-booking" className="inline-flex items-center gap-2 text-brand-primary font-bold text-sm hover:text-white transition-colors">
                  Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-brand-surface rounded-3xl p-8 border border-brand-border hover:border-brand-primary/50 transition-colors group flex-1 flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="size-10 bg-brand-dark rounded-xl flex items-center justify-center text-brand-primary border border-brand-primary/20">
                    <span className="material-symbols-outlined text-xl">domain</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-1 rounded border border-brand-primary/30">Business</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Logistics Solutions</h3>
                <p className="text-brand-muted text-sm mb-6 flex-grow">
                  Customized logistics and corporate travel for every business need.
                </p>
                <Link to="/bus-booking" className="inline-flex items-center gap-2 text-brand-primary font-bold text-sm hover:text-white transition-colors">
                  Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </motion.div>

            </div>

          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-24 bg-brand-dark border-t border-brand-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Experience Professional Mobility</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden border border-brand-border group h-80 object-cover"
            >
              <img 
                src="https://images.unsplash.com/photo-1555529733-0e67056058ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Tech Forward" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
                style={{ filter: "hue-rotate(180deg) saturate(2)" }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Tech-Forward Fleet</h3>
                <p className="text-brand-muted text-sm">Equipped with real-time GPS, Wi-Fi, and climate control.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative rounded-3xl overflow-hidden border border-brand-border group h-80 object-cover bg-brand-surface"
            >
               <img 
                src="https://images.unsplash.com/photo-1616423640778-28d1b53229bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="App Wireframe" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">User-Friendly Booking</h3>
                <p className="text-brand-muted text-sm">Reserve seats in seconds with our intuitive mobile app.</p>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* Modern Neon CTA Section */}
      <section className="py-16 bg-brand-dark relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brand-primary rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between border border-[#4ed40b] shadow-[0_0_40px_rgba(89,242,13,0.15)] relative overflow-hidden"
          >
            {/* Subtle background pattern/glow inside the CTA */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/20 to-transparent pointer-events-none"></div>

            <div className="mb-8 md:mb-0 max-w-lg relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-[#0d140a] mb-4 tracking-tighter leading-tight">
                Ready to start your journey?
              </h2>
              <p className="text-[#1c2619] font-medium text-lg leading-relaxed mix-blend-color-burn">
                Join 50,000+ happy travelers using Yatriconnect daily for their transportation needs.
              </p>
            </div>
            
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 relative z-10">
               <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="px-6 py-4 rounded-xl bg-brand-primary border border-[#4ed40b] ring-1 ring-black/10 focus:ring-black/30 placeholder-[#1c2619]/60 text-[#0d140a] font-medium outline-none min-w-[250px] shadow-inner"
               />
               <button className="px-8 py-4 rounded-xl bg-[#0d140a] text-white font-bold hover:bg-[#1c2619] transition-all whitespace-nowrap active:scale-[0.98] shadow-xl">
                 Join Now
               </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}

export default HomePage
