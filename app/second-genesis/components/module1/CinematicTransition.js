'use client';

import { motion } from 'framer-motion';

const glitchAnimation = {
    hidden: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
    visible: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.8,
            ease: "circOut"
        }
    },
    exit: {
        opacity: 0,
        scale: 1.02,
        filter: 'brightness(1.5) blur(5px)',
        transition: { duration: 0.4 }
    }
};

export default function CinematicTransition({ children }) {
    return (
        <motion.div
            variants={glitchAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full min-h-screen"
        >
            {/* Scanline Overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>

            {children}
        </motion.div>
    );
}
