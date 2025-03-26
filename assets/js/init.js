// ملف التهيئة - يقوم بتحميل وتنسيق كافة ملفات JavaScript الأخرى

document.addEventListener('DOMContentLoaded', () => {
    console.log('بدء تهيئة المشروع...');
    
    // ضمان تحميل ملف البيانات
    ensureDataLoaded()
        .then(() => {
            // تهيئة مكونات التطبيق
            initializeComponents();
            
            // تحميل ملف المشروع الرئيسي بعد التأكد من جاهزية جميع المكونات
            loadScript('./assets/js/app.js');
            
            // إزالة شاشة التحميل بعد اكتمال التهيئة
            hideLoadingScreen();
        })
        .catch(error => {
            console.error('حدث خطأ أثناء تهيئة المشروع:', error);
            
            // عرض رسالة خطأ للمستخدم
            showErrorMessage('عذراً، حدث خطأ أثناء تحميل التطبيق. يرجى تحديث الصفحة أو المحاولة لاحقاً.');
        });
});

// التأكد من تحميل ملف البيانات
function ensureDataLoaded() {
    return new Promise((resolve, reject) => {
        if (window.propertiesData) {
            resolve();
            return;
        }
        
        // محاولة تحميل ملف البيانات
        loadScript('./assets/js/data.js')
            .then(() => {
                // التحقق مرة أخرى بعد محاولة التحميل
                if (window.propertiesData) {
                    resolve();
                } else {
                    reject(new Error('تعذر تحميل بيانات العقارات'));
                }
            })
            .catch(reject);
    });
}

// تهيئة مكونات التطبيق
function initializeComponents() {
    // تحميل ملف الخرائط إذا كانت الخريطة موجودة
    if (document.getElementById('map') || document.querySelectorAll('[id^="map-"]').length) {
        loadScript('./assets/js/maps.js');
    }
    
    // تحميل ملف الرسوم البيانية إذا كانت الرسوم البيانية موجودة
    if (document.querySelectorAll('canvas[id$="Chart"]').length) {
        loadScript('./assets/js/charts.js');
    }
}

// تحميل ملف JavaScript بشكل ديناميكي
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`فشل تحميل الملف: ${src}`));
        
        document.head.appendChild(script);
    });
}

// إخفاء شاشة التحميل
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// عرض رسالة خطأ للمستخدم
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-container">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button onclick="location.reload()">إعادة تحميل الصفحة</button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
}
