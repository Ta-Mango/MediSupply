import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package2, Truck, ShieldCheck, BarChart3, Clock, ShoppingCart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-full text-xs font-semibold mb-6 uppercase tracking-wider"
          >
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Regulatory Compliant Platform
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-serif font-light tracking-tight leading-[0.9] mb-8"
          >
            Digitalizing the <br /> <span className="italic">Pharma Supply Chain</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-neutral-500 max-w-2xl mx-auto mb-12"
          >
            A secure, real-time ecosystem connecting suppliers, pharmacies, and drivers. 
            Full visibility from batch to delivery.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/login" className="btn-primary text-lg px-8 py-4">
              Get Started
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Floating Icons */}
        <div className="absolute top-1/4 left-10 opacity-10 animate-pulse">
          <Truck size={120} />
        </div>
        <div className="absolute bottom-1/4 right-10 opacity-10 animate-pulse">
          <Truck size={120} />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-neutral-50 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="card p-8 bg-white border-none shadow-sm h-full">
            <div className="h-12 w-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Supplier Control</h3>
            <p className="text-neutral-500">Real-time inventory mapping, expiry tracking, and automated fulfillment workflows.</p>
          </div>
          <div className="card p-8 bg-white border-none shadow-sm h-full">
            <div className="h-12 w-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-6">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Client Dashboard</h3>
            <p className="text-neutral-500">Live catalog access with bulk ordering triggers and real-time shipment tracking.</p>
          </div>
          <div className="card p-8 bg-white border-none shadow-sm h-full">
            <div className="h-12 w-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-6">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Last-Mile Optimization</h3>
            <p className="text-neutral-500">Driver scheduling with route optimization and digital proof of delivery.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
