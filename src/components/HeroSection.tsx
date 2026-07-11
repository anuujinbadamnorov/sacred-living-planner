'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  children?: React.ReactNode;
  compact?: boolean;
}

export default function HeroSection({ title, subtitle, imageUrl, children, compact = false }: HeroSectionProps) {
  const [img, setImg] = useState<string | null>(imageUrl || null);

  useEffect(() => {
    if (!imageUrl) {
      // Pick a random inspo image
      fetch('/inspo-manifest.json')
        .then((r) => r.json())
        .then((data) => {
          const images = data.images || [];
          if (images.length > 0) {
            const random = images[Math.floor(Math.random() * images.length)];
            setImg(`/inspo/${random}`);
          }
        })
        .catch(() => {});
    }
  }, [imageUrl]);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <h1 className="font-display text-4xl md:text-5xl font-light" style={{ color: 'var(--espresso)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-lg" style={{ color: 'var(--espresso-muted)' }}>
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="hero-section rounded-2xl mb-12"
      style={{ minHeight: '40vh' }}
    >
      {img && (
        <img
          src={img}
          alt=""
          className="image-elegant"
          style={{ filter: 'brightness(0.85)' }}
        />
      )}
      <div className="hero-overlay" />
      <div className="hero-content">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl md:text-6xl font-light"
          style={{ color: 'var(--espresso)' }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 text-lg md:text-xl"
            style={{ color: 'var(--espresso-light)' }}
          >
            {subtitle}
          </motion.p>
        )}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
