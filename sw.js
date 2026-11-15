// MundiCasual · service worker de avisos
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: 'MundiCasual', body: e.data ? e.data.text() : '' }; }
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    list.forEach((c) => c.postMessage({ mc: 'push', d }));
    if (list.some((c) => c.visibilityState === 'visible' && c.focused)) return; // la app ya está delante: se actualiza sola
    await self.registration.showNotification(d.title || 'MundiCasual', {
      body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || undefined, renotify: !!d.tag,
      data: { url: d.url || './' }, vibrate: [80, 40, 80],
    });
  })());
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) { if ('focus' in c) { c.postMessage({ mc: 'nav', url }); return c.focus(); } }
    return self.clients.openWindow(url);
  })());
});
