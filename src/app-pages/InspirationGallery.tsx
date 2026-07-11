'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Grid3X3, LayoutGrid, Heart } from 'lucide-react';
import Image from 'next/image';
import HeroSection from '@/components/HeroSection'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function InspirationGallery() {
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [gridCols, setGridCols] = useState<2 | 3>(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/inspo-manifest.json')
      .then((r) => r.json())
      .then((data) => {
        setImages(data.images.map((name: string) => `/inspo/${name}`));
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Load favorites from localStorage
    const saved = localStorage.getItem('inspo-favorites');
    if (saved) {
      try {
        setFavorites(new Set(JSON.parse(saved)));
      } catch { /* */ }
    }
  }, []);

  const toggleFavorite = (url: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      localStorage.setItem('inspo-favorites', JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <HeroSection
        title={`Inspiration`}
        subtitle="Curated beauty for your vision"
        imageIndex={17}
      />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <h1 className="font-playfair text-3xl font-medium" style={{ color: 'var(--espresso)' }}>
          Inspiration Gallery
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--espresso-muted)' }}>
          {images.length} sacred spaces to inspire your sanctuary
        </p>
      </motion.div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setGridCols(2)}
          className="p-2 rounded-lg transition-colors"
          style={{
            background: gridCols === 2 ? 'var(--terracotta)' : 'var(--cream-dark)',
            color: gridCols === 2 ? 'white' : 'var(--espresso-muted)',
          }}
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setGridCols(3)}
          className="p-2 rounded-lg transition-colors"
          style={{
            background: gridCols === 3 ? 'var(--terracotta)' : 'var(--cream-dark)',
            color: gridCols === 3 ? 'white' : 'var(--espresso-muted)',
          }}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <span className="text-xs ml-auto" style={{ color: 'var(--espresso-muted)' }}>
          {favorites.size} favorites
        </span>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-xl animate-pulse"
              style={{ background: 'var(--cream-dark)' }}
            />
          ))}
        </div>
      ) : (
        <motion.div
          layout
          className={`grid gap-3 ${gridCols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
        >
          <AnimatePresence>
            {images.map((url, i) => (
              <motion.div
                key={url}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.02, ease: EASE }}
                className="relative group cursor-pointer aspect-[3/4] rounded-xl overflow-hidden"
                onClick={() => setSelected(url)}
              >
                <img
                  src={url}
                  alt={`Inspiration ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(url); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart
                    className="w-4 h-4"
                    style={{
                      color: favorites.has(url) ? 'var(--terracotta)' : 'var(--espresso-muted)',
                      fill: favorites.has(url) ? 'var(--terracotta)' : 'none',
                    }}
                  />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelected(null)}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              src={selected}
              alt="Inspiration"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
