'use client'

import { useEffect } from 'react'

// Cleans up service workers registered by earlier PWA-era builds.
// The old worker precached pages whose hashed chunks disappear after every
// redeploy, which left returning browsers stuck on a "page couldn't load"
// error. Unregistering here (and serving a self-destructing /sw.js) heals
// any client that still has the zombie worker.
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) return
      registrations.forEach((reg) => reg.unregister())
      if ('caches' in window) {
        caches.keys().then((names) => names.forEach((name) => caches.delete(name)))
      }
    })
  }, [])

  return null
}
