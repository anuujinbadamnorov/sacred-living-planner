'use client';

import { useLocalStorageMigration } from '@/hooks/useLocalStorageMigration';
import { motion } from 'framer-motion';

export default function MigratePage() {
  const { migrate, migrating, result } = useLocalStorageMigration();

  const handleMigrate = async () => {
    await migrate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#F5F0E8' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-8 rounded-2xl shadow-sm"
        style={{ background: '#FFFFFF', border: '1px solid #E5DDD0' }}
      >
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#C4704B' }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="text-2xl font-playfair mb-2" style={{ color: '#2C2420' }}>
            Migrate Your Data
          </h1>
          <p className="text-sm" style={{ color: '#8B7D70' }}>
            Move your existing planner data to the cloud for sync across devices.
          </p>
        </div>

        {result ? (
          <div className="space-y-3">
            <div className="p-4 rounded-xl" style={{ background: '#F5F0E8' }}>
              <h3 className="font-medium mb-2" style={{ color: '#2C2420' }}>Migration Complete</h3>
              <div className="space-y-1 text-sm" style={{ color: '#5C4D42' }}>
                <p>✅ Habits migrated: {result.habitsMigrated}</p>
                <p>✅ Notes migrated: {result.notesMigrated}</p>
                <p>✅ Daily entries migrated: {result.entriesMigrated}</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="p-4 rounded-xl" style={{ background: '#FEF2F0' }}>
                <h3 className="font-medium mb-2" style={{ color: '#B85C3A' }}>Warnings</h3>
                <ul className="text-xs space-y-1" style={{ color: '#C4704B' }}>
                  {result.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => window.location.href = '/planner'}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: '#C4704B', color: '#FFFFFF' }}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl text-sm" style={{ background: '#F5F0E8', color: '#5C4D42' }}>
              <p className="mb-2">This will migrate:</p>
              <ul className="space-y-1 ml-4">
                <li>• Your habits and completion history</li>
                <li>• Your notes and journal entries</li>
                <li>• Your tasks and events</li>
              </ul>
              <p className="mt-3 text-xs" style={{ color: '#8B7D70' }}>
                Your local data will not be deleted. You can continue using it as a backup.
              </p>
            </div>

            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: '#C4704B', color: '#FFFFFF' }}
            >
              {migrating ? 'Migrating...' : 'Start Migration'}
            </button>

            <button
              onClick={() => window.location.href = '/planner'}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'transparent', border: '1px solid #E5DDD0', color: '#5C4D42' }}
            >
              Skip for Now
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
