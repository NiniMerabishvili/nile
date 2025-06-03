import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageHeroProps {
  title?: ReactNode; // Allow JSX for title (e.g. with spans)
  subtitle?: string;
  children?: ReactNode; // For buttons or other custom content
  // We can add more props for background image, visual element on right etc. later
}

export default function PageHero({
  title,
  subtitle,
  children,
}: PageHeroProps) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="bg-white dark:bg-dark-100 py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <motion.div initial="initial" animate="animate" variants={fadeIn}>
          {title && (
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-dark-300 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </motion.div>
      </div>
    </section>
  );
} 