// Empty service worker to satisfy legacy registrations and prevent 404s
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
