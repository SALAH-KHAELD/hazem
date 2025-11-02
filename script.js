// **********************************************
// 0. تهيئة المتغيرات والثوابت
// **********************************************
let sectionsData = []; 
let isLoggedIn = false; // متغير لتتبع حالة تسجيل الدخول
const COMPLETED_KEY = 'completedSections';
const THEME_KEY = 'themeMode';
const ACCENT_COLOR_KEY = 'accentColor';
const RATING_KEY = 'userRating';
const HASH_PREFIX = '#section_';
const AUTH_USER_KEY = 'currentUser';

const INITIAL_ACCENT_COLOR = '#00e676'; // الأخضر النيون الافتراضي الجديد
const COLOR_OPTIONS = {
    '#00e676': 'النيون (افتراضي)',
    '#7c4dff': 'البنفسجي',
    '#007bff': 'الأزرق',
    '#ff4081': 'الوردي',
    '#ff9800': 'البرتقالي'
};

// العناصر الأساسية
const body = document.body;
const refreshLoader = document.getElementById('refreshLoader');
const mainContainer = document.getElementById('mainContainer');

// الواجهات وعناصرها
const homePage = document.getElementById('homePage');
const loginPage = document.getElementById('loginPage');
const profilePage = document.getElementById('profilePage');
const aboutPage = document.getElementById('aboutPage');
const contentDisplay = document.getElementById('contentDisplay');

// عناصر صفحة الرئيسية
const grid = document.getElementById('buttonsGrid');
const searchBox = document.getElementById('searchBox');
const initialLoader = document.getElementById('initialLoader');

// عناصر التعليقات والتقييم
const starRating = document.getElementById('starRating');
const commentsSlider = document.getElementById('commentsSlider');
const postCommentBtn = document.getElementById('postCommentBtn');
const commentTextarea = document.getElementById('commentText');
const authPrompt = document.getElementById('authPrompt');

// عناصر شريط المهام
const navHome = document.getElementById('navHome');
const navLogin = document.getElementById('navLogin');
const navProfile = document.getElementById('navProfile');
const taskbarLinks = document.querySelectorAll('.taskbar-nav .nav-link');

// عناصر عرض المحتوى
const displayTitle = document.getElementById('displayTitle');
const displayMemoContent = document.getElementById('displayMemoContent');
const displayVideos = document.getElementById('displayVideos');
const displayQuizzes = document.getElementById('displayQuizzes'); 
const displayDownloads = document.getElementById('displayDownloads'); 
const markCompleteBtn = document.getElementById('markCompleteBtn'); 
const backToGridBtn = document.getElementById('backToGrid');

// عناصر التسجيل/الدخول
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const studentLoginBtn = document.getElementById('studentLoginBtn');
const studentRegisterBtn = document.getElementById('studentRegisterBtn');
const showLoginFormBtn = document.getElementById('showLoginForm');
const showRegisterFormBtn = document.getElementById('showRegisterForm');
const regProfilePicInput = document.getElementById('regProfilePic');
const picLabelText = document.getElementById('picLabelText');
const loginVideoBg = document.getElementById('loginVideoBg');

// عناصر الملف الشخصي
const profileNameDisplay = document.getElementById('profileNameDisplay');
const profileEmailDisplay = document.getElementById('profileEmailDisplay');
const profilePhoneDisplay = document.getElementById('profilePhoneDisplay');
const profilePicDisplay = document.getElementById('profilePicDisplay');
const logoutBtn = document.getElementById('logoutBtn');

// عناصر الإعدادات
const settingsModal = document.getElementById('settingsModal');
const modeToggleBtn = document.getElementById('modeToggle');
const openSettingsModalBtn = document.getElementById('openSettingsModal');
const closeSettingsModalBtn = document.getElementById('closeSettingsModal');
const colorPickerList = document.getElementById('colorPickerList');


// **********************************************
// 1. وظائف الأدوات المساعدة (Utils)
// **********************************************

function showToast(message) {
    const toast = document.getElementById('snackbar');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast show';
    setTimeout(function(){ toast.className = toast.className.replace('show', ''); }, 5000);
}

// تحميل/حفظ حالة الإنجاز
function getCompletedSections() {
    return JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');
}
function saveCompletedSections(completedSections) {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedSections));
}

// تحديث الثيم
function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
}
function setTheme(mode) {
    if (mode === 'light') {
        body.classList.add('light-mode');
        modeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        body.classList.remove('light-mode');
        modeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
    localStorage.setItem(THEME_KEY, mode);
}

// تحديث اللون الأساسي (Accent Color)
function getAccentColor() {
    return localStorage.getItem(ACCENT_COLOR_KEY) || INITIAL_ACCENT_COLOR;
}
function setAccentColor(color) {
    document.documentElement.style.setProperty('--accent-primary', color);
    localStorage.setItem(ACCENT_COLOR_KEY, color);
    // تحديث لون الثيم في الـ manifest
    if ('setThemeColor' in document) {
        document.setThemeColor(color);
    }
}
function initColorPicker() {
    colorPickerList.innerHTML = '';
    const savedColor = getAccentColor();

    for (const color in COLOR_OPTIONS) {
        const item = document.createElement('div');
        item.className = 'color-picker-item';
        item.style.backgroundColor = color;
        item.title = COLOR_OPTIONS[color];
        item.dataset.color = color;

        if (color === savedColor) {
            item.classList.add('active');
        }

        item.addEventListener('click', () => {
            document.querySelectorAll('.color-picker-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            setAccentColor(color);
            showToast(`تم تغيير اللون إلى: ${COLOR_OPTIONS[color]}`);
        });

        colorPickerList.appendChild(item);
    }
}

// **********************************************
// 2. منطق شاشة التحميل الأولية والتحولات
// **********************************************

function hideRefreshLoader() {
    refreshLoader.classList.add('hidden');
    // بعد الاختفاء، تأكد من إخفاء العنصر تماماً
    setTimeout(() => {
        refreshLoader.style.display = 'none';
        mainContainer.style.display = 'block';
    }, 500); 
}

// وظيفة التبديل بين الواجهات (بما في ذلك التحولات الجديدة)
function switchView(targetId) {
    const views = [homePage, loginPage, profilePage, aboutPage, contentDisplay];
    
    // إخفاء جميع الواجهات أولاً
    views.forEach(view => {
        view.style.display = 'none';
    });

    // تحديث الروابط في شريط المهام
    taskbarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').replace('#', '') === targetId.replace('Page', '').replace('Display', '') ||
            (targetId === 'homePage' && link.getAttribute('href') === '#home') ||
            (targetId === 'loginPage' && link.getAttribute('href') === '#login') ||
            (targetId === 'aboutPage' && link.getAttribute('href') === '#about')) {
            link.classList.add('active');
        }
    });

    // عرض الواجهة المطلوبة
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.style.display = 'block';
    }

    // التعامل مع الهيدر والفيديو
    if (targetId === 'loginPage') {
        body.classList.add('full-screen-mode');
        // بدء تشغيل الفيديو
        if(loginVideoBg) loginVideoBg.play();
    } else {
        body.classList.remove('full-screen-mode');
        // إيقاف الفيديو
        if(loginVideoBg) loginVideoBg.pause();
    }

    // إغلاق أي modal مفتوح
    settingsModal.classList.remove('show');
}


// **********************************************
// 3. منطق جلب وعرض البيانات (Sections)
// **********************************************

async function fetchData() {
    initialLoader.style.display = 'block';
    try {
        const response = await fetch('data.json'); // اسم الملف الثابت
        if (!response.ok) throw new Error('Failed to load sections data.');
        sectionsData = await response.json();
        renderSections(sectionsData);
        hideRefreshLoader(); // إخفاء شاشة التحميل بعد الانتهاء
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('errorState').style.display = 'block';
        hideRefreshLoader(); 
    } finally {
        initialLoader.style.display = 'none';
    }
}

function renderSections(data) {
    grid.innerHTML = '';
    const completed = getCompletedSections();

    if (data.length === 0) {
        document.getElementById('noResultsMessage').style.display = 'block';
        return;
    } else {
        document.getElementById('noResultsMessage').style.display = 'none';
    }

    data.forEach(section => {
        const isCompleted = completed.includes(section.id);
        const btn = document.createElement('a');
        btn.href = `#section_${section.id}`;
        btn.className = `btn ${isCompleted ? 'completed' : ''}`;
        btn.innerHTML = `
            <div class="title">${section.title}</div>
            <div class="sub">${section.content.substring(0, 50)}...</div>
        `;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // استخدام View Transition API إذا كان متاحاً
            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    displayContent(section.id);
                    window.location.hash = `section_${section.id}`;
                });
            } else {
                displayContent(section.id);
                window.location.hash = `section_${section.id}`;
            }
        });
        grid.appendChild(btn);
    });
}

function filterSections() {
    const term = searchBox.value.toLowerCase().trim();
    const message = document.getElementById('noResultsMessage');
    const displayTerm = document.getElementById('searchTermDisplay');

    if (term.length < 2 && term.length > 0) return; // لا تبحث عن أقل من حرفين

    const filtered = sectionsData.filter(section => 
        section.title.toLowerCase().includes(term) ||
        section.content.toLowerCase().includes(term)
    );

    renderSections(filtered);

    if (filtered.length === 0 && term.length > 0) {
        message.style.display = 'block';
        displayTerm.textContent = term;
    } else {
        message.style.display = 'none';
    }
}

function displayContent(sectionId) {
    const section = sectionsData.find(s => s.id === sectionId);
    if (!section) return;

    // إظهار واجهة المحتوى وإخفاء الرئيسية
    switchView('contentDisplay');

    // تحديث زر "تم الانتهاء"
    const completed = getCompletedSections();
    const isCompleted = completed.includes(sectionId);
    markCompleteBtn.dataset.sectionId = sectionId;
    markCompleteBtn.classList.toggle('completed', isCompleted);
    markCompleteBtn.innerHTML = isCompleted 
        ? '<i class="fas fa-check-circle"></i> تم الانتهاء' 
        : '<i class="far fa-check-circle"></i> تم الانتهاء من هذا القسم';

    displayTitle.textContent = section.title;
    displayMemoContent.innerHTML = parseMarkdown(section.content);
    
    // عرض الفيديوهات
    displayVideos.innerHTML = section.videos.map(v => `
        <div class="video-responsive">
            <iframe src="${v.embedUrl}" allowfullscreen title="${v.title}"></iframe>
        </div>
    `).join('');

    // عرض الاختبارات
    displayQuizzes.innerHTML = section.quizzes.map(q => `
        <a href="${q.url}" target="_blank" rel="noopener noreferrer" class="quiz-link-btn icon-btn">
            <i class="fas fa-edit"></i> ${q.name}
        </a>
    `).join('');

    // عرض التحميلات
    displayDownloads.innerHTML = section.downloads.map(d => `
        <a href="${d.url}" target="_blank" rel="noopener noreferrer" class="download-link-btn icon-btn">
            <i class="fas fa-download"></i> ${d.name}
        </a>
    `).join('');
}

function parseMarkdown(text) {
    // تحويل الأسطر الجديدة إلى <p>
    let html = text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    // تحويل *نص* إلى <strong>نص</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // تحويل المقتبسات
    html = html.replace(/>\s*(.*?)<br>/g, '<blockquote>$1</blockquote><br>');
    // تحويل القوائم البسيطة
    html = html.replace(/- (.*?)<br>/g, '<li>$1</li>');
    if (html.includes('<li>')) {
        html = '<ul>' + html.replace(/<li>(.*?)<\/li>/g, '<li>$1</li>') + '</ul>';
        // إزالة أي <p> أو <br> غير مرغوب فيه حول الـ <ul>
        html = html.replace(/<p><ul>/g, '<ul>').replace(/<\/ul><\/p>/g, '</ul>');
    }
    return html;
}

function goBackToGrid() {
    // استخدام View Transition API إذا كان متاحاً
    if (document.startViewTransition) {
        document.startViewTransition(() => {
            switchView('homePage');
            window.location.hash = `#home`;
        });
    } else {
        switchView('homePage');
        window.location.hash = `#home`;
    }
    searchBox.value = '';
    renderSections(sectionsData);
}

// **********************************************
// 4. منطق إنجاز الأقسام
// **********************************************
function toggleCompleteSection() {
    const sectionId = markCompleteBtn.dataset.sectionId;
    let completed = getCompletedSections();
    const isCompleted = completed.includes(sectionId);

    if (isCompleted) {
        completed = completed.filter(id => id !== sectionId);
        showToast(`تم إزالة القسم "${sectionsData.find(s=>s.id===sectionId)?.title}" من قائمة المنجز.`);
    } else {
        completed.push(sectionId);
        showToast(`ممتاز! تم إنجاز القسم "${sectionsData.find(s=>s.id===sectionId)?.title}".`);
    }

    saveCompletedSections(completed);
    // تحديث شكل الزر والواجهة الرئيسية
    markCompleteBtn.classList.toggle('completed', !isCompleted);
    markCompleteBtn.innerHTML = !isCompleted 
        ? '<i class="fas fa-check-circle"></i> تم الانتهاء' 
        : '<i class="far fa-check-circle"></i> تم الانتهاء من هذا القسم';
    
    // تحديث عرض الأقسام على الصفحة الرئيسية
    renderSections(sectionsData); 
}

// **********************************************
// 5. منطق الملاحة (Routing)
// **********************************************
function handleHashChange() {
    const hash = window.location.hash;
    const cleanHash = hash.replace('#', '');
    const isSection = hash.startsWith(HASH_PREFIX);

    if (isSection) {
        const sectionId = cleanHash.replace('section_', '');
        displayContent(sectionId);
    } else if (cleanHash === 'login') {
        switchView('loginPage');
    } else if (cleanHash === 'profile') {
        if (!isLoggedIn) {
            window.location.hash = '#login';
            showToast('الرجاء تسجيل الدخول أولاً.');
        } else {
            switchView('profilePage');
            loadProfileData();
        }
    } else if (cleanHash === 'about') {
        switchView('aboutPage');
    } else {
        // الافتراضي هو الصفحة الرئيسية
        switchView('homePage');
        renderSections(sectionsData);
    }
}

// **********************************************
// 6. منطق التقييم والتعليقات (Rating & Comments)
// **********************************************

// وظيفة عرض التعليقات (نموذجية)
function displayComments() {
    // في التطبيق الحقيقي، سيتم جلب هذه البيانات من قاعدة بيانات
    const sampleComments = [
        { name: "فاطمة أحمد", text: "شرح ممتاز جداً ومبسط، المذكرات كافية ووافية.", date: "منذ 4 أيام", pic: "img/avatar1.png" },
        { name: "علياء محمد", text: "أفضل منصة تعليمية للمرحلة الثانوية على الإطلاق! ألوان هادئة وتصميم مريح.", date: "منذ أسبوع", pic: "img/avatar2.png" },
        { name: "يوسف خالد (المشرف)", text: "شكراً لك يوسف، نسعى للأفضل دائماً.", date: "منذ 3 أسابيع", pic: "img/elzoz1.jpg", admin: true },
        { name: "خالد محمود", text: "نتمنى إضافة المزيد من الفيديوهات التوضيحية لبعض النقاط الصعبة.", date: "قبل شهر", pic: "img/avatar3.png" },
    ];

    commentsSlider.innerHTML = sampleComments.map(comment => `
        <div class="comment-card ${comment.admin ? 'admin-view' : ''}">
            <div class="comment-header">
                <img src="${comment.pic || 'img/default-profile.png'}" alt="صورة المستخدم">
                <strong>${comment.name} ${comment.admin ? '(المشرف)' : ''}</strong>
                <span>${comment.date}</span>
            </div>
            <div class="comment-body">
                <p>${comment.text}</p>
            </div>
        </div>
    `).join('');
}

// تشغيل سلايدر التعليقات
function initCommentsSlider() {
    // وظيفة بسيطة لتحريك السلايدر تلقائياً
    setInterval(() => {
        const slider = commentsSlider;
        if (!slider) return;
        
        const cardWidth = slider.querySelector('.comment-card')?.offsetWidth || 0;
        const scrollAmount = slider.scrollLeft + cardWidth + 15; // 15 هي قيمة الـ gap
        
        if (scrollAmount >= (slider.scrollWidth - slider.clientWidth)) {
            // العودة إلى البداية
            slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            slider.scrollTo({ left: scrollAmount, behavior: 'smooth' });
        }

    }, 5000); // تحريك كل 5 ثوانٍ
}


function handleStarRating(event) {
    if (event.target.classList.contains('star')) {
        const value = event.target.dataset.value;
        const stars = Array.from(starRating.querySelectorAll('.star'));
        
        stars.forEach(star => {
            star.classList.remove('active');
            if (parseInt(star.dataset.value) <= parseInt(value)) {
                star.classList.add('active');
            }
        });

        localStorage.setItem(RATING_KEY, value);
        showToast(`شكراً لك! تم تقييم المنصة بـ ${value} نجوم.`);
    }
}

function loadSavedRating() {
    const savedRating = localStorage.getItem(RATING_KEY);
    if (savedRating) {
        const stars = Array.from(starRating.querySelectorAll('.star'));
        stars.forEach(star => {
            if (parseInt(star.dataset.value) <= parseInt(savedRating)) {
                star.classList.add('active');
            }
        });
    }
}

function handlePostComment() {
    if (!isLoggedIn) {
        showToast('الرجاء تسجيل الدخول لنشر تعليق.');
        window.location.hash = '#login';
        return;
    }
    const text = commentTextarea.value.trim();
    if (text.length < 5) {
        showToast('يجب أن يكون التعليق أكثر من 5 أحرف.');
        return;
    }
    
    // ** منطق إرسال التعليق (نموذجي) **
    // في التطبيق الحقيقي، يتم إرسال هذا إلى الخادم.
    console.log("Comment to be posted:", text);
    commentTextarea.value = '';
    showToast('تم نشر تعليقك بنجاح! سيظهر بعد موافقة المشرف.');
}


// **********************************************
// 7. منطق المصادقة والملف الشخصي (Auth & Profile)
// **********************************************

function checkAuthStatus() {
    const user = localStorage.getItem(AUTH_USER_KEY);
    isLoggedIn = !!user;
    updateAuthUI();
}

function updateAuthUI() {
    if (isLoggedIn) {
        navLogin.style.display = 'none';
        navProfile.style.display = 'block';
        postCommentBtn.disabled = false;
        authPrompt.style.display = 'none';
    } else {
        navLogin.style.display = 'flex'; // show
        navProfile.style.display = 'none';
        postCommentBtn.disabled = true;
        authPrompt.style.display = 'block';
    }
}

function handleLogin() {
    const email = document.getElementById('studentEmail').value;
    const password = document.getElementById('studentPassword').value;

    if (!email || !password) {
        showToast('الرجاء إدخال البريد وكلمة السر.');
        return;
    }

    // منطق مصادقة وهمي
    if (email === 'test@elzoz.com' && password === '123456') {
        const mockUser = { name: 'المستخدم التجريبي', email: email, phone: '010XXXXXXXX', pic: 'img/elzozo3.jpg' };
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
        isLoggedIn = true;
        updateAuthUI();
        window.location.hash = '#home';
        showToast(`أهلاً بك يا ${mockUser.name}!`);
    } else {
        showToast('خطأ: البريد أو كلمة السر غير صحيحة.');
    }
}

function handleRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value;
    const file = regProfilePicInput.files[0];

    if (!name || !email || !password || !phone) {
        showToast('الرجاء تعبئة جميع الحقول المطلوبة.');
        return;
    }

    // هنا يجب أن يتم رفع الصورة إلى خادم وتخزين بيانات المستخدم.
    const mockUser = { name, email, phone, pic: file ? URL.createObjectURL(file) : 'img/default-profile.png' };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
    isLoggedIn = true;
    updateAuthUI();
    window.location.hash = '#home';
    showToast(`تم إنشاء حسابك بنجاح! مرحباً بك يا ${name}.`);
}

function loadProfileData() {
    const user = JSON.parse(localStorage.getItem(AUTH_USER_KEY));
    if (user) {
        profileNameDisplay.textContent = user.name;
        profileEmailDisplay.textContent = user.email;
        profilePhoneDisplay.textContent = user.phone || 'لم يسجل رقم هاتف';
        profilePicDisplay.src = user.pic || 'img/default-profile.png';
        
        // عرض نسبة التقدم (مثال: عدد الأقسام المنجزة / العدد الكلي)
        const completedCount = getCompletedSections().length;
        const totalCount = sectionsData.length;
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        document.getElementById('progressPercentage').textContent = `${progress}%`;
    }
}

function handleLogout() {
    localStorage.removeItem(AUTH_USER_KEY);
    isLoggedIn = false;
    updateAuthUI();
    window.location.hash = '#home';
    showToast('تم تسجيل الخروج بنجاح.');
}

// **********************************************
// 8. منطق السلايدر (Header Image Slider)
// **********************************************
const slides = document.querySelectorAll('.brand .slide');
let currentSlide = 0;

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}


// **********************************************
// 9. منطق الزر العائم (Floating Button)
// **********************************************
const floatingButton = document.getElementById('floatingButton');

function handleFloatingButton() {
    if (window.scrollY > 300) {
        floatingButton.style.display = 'flex';
    } else {
        floatingButton.style.display = 'none';
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


// **********************************************
// 10. إعداد وتثبيت التطبيق (PWA)
// **********************************************

let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    // منع ظهور النافذة الافتراضية
    e.preventDefault();
    deferredPrompt = e;
    // إظهار زر التثبيت المخصص
    installBtn.style.display = 'flex';
});

function handleInstallClick() {
    // إخفاء زرنا
    installBtn.style.display = 'none';
    // إظهار النافذة الافتراضية
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
    }
}


// **********************************************
// 11. تهيئة وبدء التطبيق (Initialization)
// **********************************************

function initializeApp() {
    // 1. تحميل الثيم واللون أولاً
    setTheme(getTheme());
    setAccentColor(getAccentColor());
    initColorPicker();
    checkAuthStatus(); // تحقق من حالة تسجيل الدخول

    // 2. ربط الـ Listeners الأساسية
    if(modeToggleBtn) modeToggleBtn.addEventListener('click', () => setTheme(body.classList.contains('light-mode') ? 'dark' : 'light'));
    if(markCompleteBtn) markCompleteBtn.addEventListener('click', toggleCompleteSection);
    if(openSettingsModalBtn) openSettingsModalBtn.addEventListener('click', () => settingsModal.classList.add('show'));
    if(closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', () => settingsModal.classList.remove('show'));
    if(installBtn) installBtn.addEventListener('click', handleInstallClick);
    
    // 3. ربط التقييم والتعليقات
    if(starRating) starRating.addEventListener('click', handleStarRating);
    if(postCommentBtn) postCommentBtn.addEventListener('click', handlePostComment);
    loadSavedRating();
    displayComments();
    initCommentsSlider(); // تشغيل سلايدر التعليقات

    // 4. ربط منطق المصادقة
    if(studentLoginBtn) studentLoginBtn.addEventListener('click', handleLogin);
    if(studentRegisterBtn) studentRegisterBtn.addEventListener('click', handleRegister);
    if(logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // تبديل نماذج الدخول/التسجيل
    if(showRegisterFormBtn) showRegisterFormBtn.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
    if(showLoginFormBtn) showLoginFormBtn.addEventListener('click', () => {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });
    // عرض اسم ملف الصورة المختار
    if(regProfilePicInput) regProfilePicInput.addEventListener('change', () => {
        picLabelText.textContent = regProfilePicInput.files[0] ? regProfilePicInput.files[0].name : 'اختر صورة الملف الشخصي';
    });


    // 5. بدء تحميل البيانات (JSON)
    fetchData();
       
    // 6. ربط البحث بفلترة الأقسام (Full-Text Search)
    if(searchBox) searchBox.addEventListener('keyup', filterSections); 

    // 7. ربط زر الرجوع لصفحة الأقسام
    if(backToGridBtn) backToGridBtn.addEventListener('click', goBackToGrid);

    // 8. تشغيل السلايدر (Slideshow)
    if (slides.length > 0) {
        slides[0].classList.add('active'); 
        setInterval(nextSlide, 3000);
    }

    // 9. منطق الملاحة (الروابط/#)
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // لتشغيل الواجهة الافتراضية عند التحميل الأولي
    
    // 10. ربط الزر العائم (Floating Button)
    window.addEventListener('scroll', handleFloatingButton);
    if(floatingButton) floatingButton.addEventListener('click', scrollToTop);
    handleFloatingButton(); 
    
    // 11. تسجيل PWA Service Worker (للتشغيل بدون إنترنت)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js').then(reg => {
                console.log('Service worker registered: ', reg.scope);
            }).catch(error => {
                console.log('Service worker registration failed: ', error);
            });
        });
    }
}

// البدء
document.addEventListener('DOMContentLoaded', initializeApp);