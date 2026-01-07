"use client"

import React, { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

// Main LogoCarousel component - Static logo with rotating text below
function LogoCarousel() {
  const portalNames = useMemo(
    () => [
      "HR Portal",
      "DataHive",
      "Query Tracker",
      "Employee Portal",
      "Project Tracker",
      "Organisation Tools",
      "Asset Tracker Portal",
      "HRMS Portal",
    ],
    []
  )

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % portalNames.length)
    }, 2000) // rotate every 2 seconds

    return () => clearInterval(intervalId)
  }, [portalNames.length])

  return (
    <div className="flex flex-row items-center justify-center gap-6">
      {/* Static Logo Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <img 
          src="/VectorHRPortalBlack.svg" 
          alt="HR Portal" 
          className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain"
          style={{ width: '100%', height: 'auto', maxWidth: '192px', objectFit: 'contain' }}
        />
      </motion.div>
      
      {/* Rotating Text on Right Side */}
      <div className="w-64 md:w-80 lg:w-96 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={portalNames[currentIndex]}
            initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -16, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="text-xl md:text-2xl font-semibold text-neutral-900"
          >
            {portalNames[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}


export { LogoCarousel }
