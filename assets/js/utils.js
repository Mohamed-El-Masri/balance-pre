
/**
 * وظائف مساعدة للمشروع
 */

// تنسيق الأرقام العربية مع الفواصل
function formatNumber(number) {
    if (typeof number === 'string') {
        number = parseFloat(number.replace(/,/g, ''));
    }
    
    return number.toLocaleString('ar-SA');
}

// تحويل تنسيق التاريخ الهجري للعرض
function formatHijriDate(hijriDate) {
    if (!hijriDate) return '';
    
    // التاريخ بتنسيق "1446/7/28"
    const parts = hijriDate.split('/');
    
    // أسماء الأشهر الهجرية
    const hijriMonths = [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
        'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
        'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];
    
    // استخراج السنة والشهر واليوم
    const year = parts[0];
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    // تنسيق التاريخ بالصيغة المطلوبة
    return `${day} ${hijriMonths[month - 1]} ${year}هـ`;
}

// تحويل الإحداثيات من النص إلى كائن يمكن استخدامه مع Google Maps
function parseCoordinates(coordText) {
    if (!coordText) return null;
    
    try {
        // تنسيق المثال: "24°29'33.3"N 46°55'34.2"E"
        const parts = coordText.split(' ');
        
        // تحويل خط العرض (Latitude)
        const latParts = parts[0].replace('"N', '').split(/°|'|"/);
        const latDeg = parseFloat(latParts[0]);
        const latMin = parseFloat(latParts[1]);
        const latSec = parseFloat(latParts[2]);
        const latitude = latDeg + (latMin / 60) + (latSec / 3600);
        
        // تحويل خط الطول (Longitude)
        const lngParts = parts[1].replace('"E', '').split(/°|'|"/);
        const lngDeg = parseFloat(lngParts[0]);
        const lngMin = parseFloat(lngParts[1]);
        const lngSec = parseFloat(lngParts[2]);
        const longitude = lngDeg + (lngMin / 60) + (lngSec / 3600);
        
        return { lat: latitude, lng: longitude };
    } catch (error) {
        console.error('خطأ في تحويل الإحداثيات:', error);
        return null;
    }
}

// تحميل بيانات العقارات المخزنة محليًا
function loadPropertiesFromLocalStorage() {
    const savedProperties = localStorage.getItem('properties');
    if (savedProperties) {
        try {
            return JSON.parse(savedProperties);
        } catch (error) {
            console.error('خطأ في تحميل البيانات من التخزين المحلي:', error);
        }
    }
    return null;
}

// حفظ بيانات العقارات في التخزين المحلي
function savePropertiesToLocalStorage(properties) {
    try {
        localStorage.setItem('properties', JSON.stringify(properties));
    } catch (error) {
        console.error('خطأ في حفظ البيانات في التخزين المحلي:', error);
    }
}

// إنشاء عناصر DOM ديناميكيًا
function createElement(tag, className, textContent = '') {
    const element = document.createElement(tag);
    if (className) {
        if (Array.isArray(className)) {
            element.classList.add(...className);
        } else {
            element.classList.add(className);
        }
    }
    if (textContent) {
        element.textContent = textContent;
    }
    return element;
}

// التحقق من صحة المدخلات
function validateInput(input, pattern, errorMessage) {
    if (!pattern.test(input)) {
        return { valid: false, message: errorMessage };
    }
    return { valid: true };
}

// تأخير التنفيذ (throttle) لتحسين الأداء
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = new Date().getTime();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

// تأخير التنفيذ حتى يتوقف المستخدم عن الكتابة (debounce)
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// عرض رسالة تأكيد
function showConfirmation(message, confirmBtnText = 'نعم', cancelBtnText = 'إلغاء') {
    return new Promise((resolve) => {
        const confirmOverlay = createElement('div', 'confirm-overlay');
        const confirmBox = createElement('div', 'confirm-box');
        const messageElement = createElement('p', '', message);
        const buttonContainer = createElement('div', 'button-container');
        
        const confirmButton = createElement('button', ['btn', 'btn-primary'], confirmBtnText);
        const cancelButton = createElement('button', ['btn', 'btn-secondary'], cancelBtnText);
        
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(confirmButton);
        
        confirmBox.appendChild(messageElement);
        confirmBox.appendChild(buttonContainer);
        confirmOverlay.appendChild(confirmBox);
        
        document.body.appendChild(confirmOverlay);
        
        confirmButton.addEventListener('click', () => {
            document.body.removeChild(confirmOverlay);
            resolve(true);
        });
        
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(confirmOverlay);
            resolve(false);
        });
        
        // تحريك العناصر للظهور بتأثير جذاب
        setTimeout(() => {
            confirmOverlay.style.opacity = '1';
            confirmBox.style.transform = 'translateY(0)';
        }, 10);
    });
}

// عرض إشعار للمستخدم
function showNotification(message, type = 'info', duration = 3000) {
    const notification = createElement('div', ['notification', `notification-${type}`]);
    const notificationContent = createElement('div', 'notification-content', message);
    
    const closeBtn = createElement('button', 'notification-close');
    closeBtn.innerHTML = '&times;';
    
    notification.appendChild(notificationContent);
    notification.appendChild(closeBtn);
    
    document.body.appendChild(notification);
    
    // إظهار الإشعار بتأثير متحرك
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // حدث النقر على زر الإغلاق
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // إخفاء الإشعار تلقائيًا بعد فترة
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode === document.body) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// تصدير الوظائف
window.utils = {
    formatNumber,
    formatHijriDate,
    parseCoordinates,
    loadPropertiesFromLocalStorage,
    savePropertiesToLocalStorage,
    createElement,
    validateInput,
    throttle,
    debounce,
    showConfirmation,
    showNotification
};
