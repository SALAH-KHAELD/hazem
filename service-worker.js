// هذا كود Service Worker بسيط. لتفعيل العمل بدون إنترنت (PWA).

// قم بزيادة رقم الإصدار عند كل تغيير في قائمة الملفات المخبأة (Caching)
const CACHE_NAME = 'elzoz-v6'; // تم تحديث الإصدار
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/data.json',
    '/manifest.json',
    '/img/alien.gif', // إضافة صورة شاشة التحميل
    
    // === الأصول الهامة للـ Offline ===
    // صور السلايدر وأيقونات التطبيق
    'img/elzoz1.jpg',
    'img/elzoz2.jpg',
    'img/elzozo3.jpg',
    'img/default-profile.png',
    'img/icon-192.png',
    'img/icon-512.png',
    
    // خطوط الأيقونات الخارجية (لضمان ظهور الأيقونات Offline)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css' 
    // ملاحظة: لم يتم تضمين الفيديو login_bg_video.mp4 هنا لتجنب زيادة حجم التخزين المؤقت، يمكن إضافته إذا لزم الأمر.
];

// **********************************************
// 1. INSTALLATION: تخزين جميع الملفات الأساسية
// **********************************************
self.addEventListener('install', (event) => {
    // wait until: يضمن أن عملية التخزين تتم بالكامل قبل تثبيت العامل
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and added all necessary files');
                // إضافة جميع الملفات المذكورة أعلاه إلى التخزين المؤقت
                return cache.addAll(urlsToCache);
            })
    );
    // لتفعيل العامل فوراً بدلاً من انتظار تحديث الصفحة
    self.skipWaiting(); 
});

// **********************************************
// 2. FETCH: استراتيجية Cache-First (التصفح دون اتصال)
// **********************************************
self.addEventListener('fetch', (event) => {
    // استراتيجية Cache-First: ابحث في الكاش أولاً، وإلا اجلب من الشبكة
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // إذا وجد الرد في الكاش، قم بإرجاعه
                return response || fetch(event.request);
            })
    );
});

// **********************************************
// 3. ACTIVATE: حذف الكاشات القديمة
// **********************************************
self.addEventListener('activate', (event) => {
    // لائحة الكاشات المسموح بها (فقط الإصدار الحالي)
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // حذف الكاش الذي لم يعد موجوداً في القائمة المسموح بها
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // للمطالبة فوراً بالتحكم في العملاء دون انتظار إعادة تحميل الصفحة
    self.clients.claim();
});


// **********************************************
// 4. PUSH: استقبال الإشعارات
// **********************************************
self.addEventListener('push', (event) => {
    // تحليل بيانات الإشعار المرسلة من الخادم
    const payload = event.data ? event.data.json() : { 
        title: 'تحديث جديد من ELZOZ', 
        body: 'تم إضافة مذكرات جديدة! تفقدها الآن.',
        tag: 'new-content'
    };

    const options = {
        body: payload.body,
        icon: 'img/icon-192.png',
        badge: 'img/icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            url: payload.url || '/' // الرابط الذي سيتم فتحه عند الضغط على الإشعار
        }
    };

    // عرض الإشعار للمستخدم
    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

// التعامل مع النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data.url || '/';
    
    // فتح رابط الإشعار في نافذة جديدة أو موجودة
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});