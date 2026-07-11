'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imageIndex?: number;
  children?: React.ReactNode;
  compact?: boolean;
  minHeight?: string;
}

const INSPO_IMAGES = [
  'IMG_1310.JPG', 'IMG_1312.JPG', 'IMG_1313.JPG', 'IMG_1315.JPG', 'IMG_1319.JPG',
  'IMG_1329.JPG', 'IMG_1331.JPG', 'IMG_1332.JPG', 'IMG_1336.JPG', 'IMG_1338.JPG',
  'IMG_1339.JPG', 'IMG_1340.JPG', 'IMG_1344.JPG', 'IMG_1345.JPG', 'IMG_1346.JPG',
  'IMG_1348.JPG', 'IMG_1349.JPG', 'IMG_1350.JPG', 'IMG_1353.JPG', 'IMG_1363.JPG',
  'IMG_1371.JPG', 'IMG_1372.JPG', 'IMG_1377.JPG', 'IMG_1378.JPG', 'IMG_1381.JPG',
  'IMG_1383.JPG', 'IMG_1384.JPG', 'IMG_1385.JPG', 'IMG_1386.JPG', 'IMG_1387.JPG',
  'IMG_1388.JPG', 'IMG_1389.JPG', 'IMG_1390.JPG', 'IMG_1391.JPG', 'IMG_1392.JPG',
  'IMG_1393.JPG', 'IMG_1394.JPG', 'IMG_1395.JPG', 'IMG_1396.JPG', 'IMG_1397.JPG',
  'IMG_1398.JPG', 'IMG_1399.JPG', 'IMG_1400.JPG', 'IMG_1401.JPG', 'IMG_1402.JPG',
  'IMG_1403.JPG', 'IMG_3340.JPG', 'IMG_3341.JPG', 'IMG_3342.JPG', 'IMG_3343.JPG', 'IMG_3344.JPG'
];

export default function HeroSection({
  title,
  subtitle,
  imageUrl,
  imageIndex,
  children,
  compact = false,
  minHeight = '40vh'
}: HeroSectionProps) {
  const [img, setImg] = useState<string | null>(imageUrl || null);

  useEffect(() => {
    if (imageUrl) {
      setImg(imageUrl);
    } else if (imageIndex !== undefined) {
      const idx = Math.abs(imageIndex) % INSPO_IMAGES.length;
      setImg(`/inspo/${INSPO_IMAGES[idx]}`);
    } else {
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
  }, [imageUrl, imageIndex]);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12"
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
      className="hero-section rounded-xl mb-12"
      style={{ minHeight }}
    >
      {img && (
        <img
          src={img}
          alt=""
          className="image-elegant"
          style={{ filter: 'brightness(0.85)', borderRadius: 0 }}
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
