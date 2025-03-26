
// تحسينات تفاعلية لقسم الإحصائيات والتوصيات
document.addEventListener('DOMContentLoaded', () => {
    // تحسين عرض نقاط الخلاصة بتأثير حركي عند الوصول إليها
    const statsSummary = document.querySelector('.stats-summary');
    if (statsSummary) {
        createIntersectionObserver(statsSummary, 'summary-visible');
    }
    
    // إضافة تأثيرات لعناصر الإحصائيات
    const summaryPoints = document.querySelectorAll('.summary-point');
    if (summaryPoints.length > 0) {
        summaryPoints.forEach((point, index) => {
            point.style.animationDelay = `${0.2 + (index * 0.2)}s`;
            
            // إضافة تأثير عند النقر
            point.addEventListener('click', function() {
                this.classList.add('point-clicked');
                setTimeout(() => {
                    this.classList.remove('point-clicked');
                }, 700);
            });
        });
    }
    
    // إضافة قيم رقمية متحركة للأرقام المهمة
    const statHighlights = document.querySelectorAll('.stat-highlight');
    if (statHighlights.length > 0) {
        statHighlights.forEach(highlight => {
            const value = highlight.textContent;
            highlight.setAttribute('data-value', value);
            
            // تطبيق تأثير عداد للأرقام
            if (!value.includes('+') && !isNaN(value.replace('%', '').replace(',', ''))) {
                const numValue = parseFloat(value.replace('%', '').replace(',', ''));
                animateNumber(highlight, 0, numValue, value.includes('%') ? '%' : '', 1500);
            }
        });
    }
});

// إنشاء مراقب للتقاطع لتنشيط العناصر عند ظهورها في الشاشة
function createIntersectionObserver(element, className) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(className);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    
    observer.observe(element);
}

// تطبيق تأثير العداد المتحرك للأرقام
function animateNumber(element, start, end, suffix = '', duration = 1000) {
    let startTime = null;
    
    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // حساب القيمة الحالية وفق منحنى حركة لطيف
        const easedProgress = easeOutQuad(progress);
        const currentValue = Math.floor(start + (end - start) * easedProgress);
        
        // تنسيق الرقم لإضافة فواصل للآلاف إذا كان كبيراً
        const formattedValue = currentValue > 999 
            ? currentValue.toLocaleString('ar-SA')
            : currentValue;
            
        element.textContent = formattedValue + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// دالة منحنى الحركة لتأثير أكثر طبيعية
function easeOutQuad(t) {
    return t * (2 - t);
}

// إضافة تأثيرات CSS إضافية لنقاط الخلاصة
document.addEventListener('DOMContentLoaded', () => {
    // إضافة الأنماط الديناميكية
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .summary-visible .summary-point {
            animation: fadeInPoint 0.5s ease forwards;
        }
        
        .point-clicked {
            animation: clickEffect 0.7s ease !important;
        }
        
        @keyframes clickEffect {
            0% { transform: scale(1); }
            30% { transform: scale(1.03); background-color: var(--primary-light); }
            100% { transform: scale(1); }
        }
        
        .stats-summary {
            position: relative;
        }
        
        .stats-summary::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 25px;
            width: 100px;
            height: 10px;
            background-color: rgba(0,0,0,0.05);
            border-radius: 50%;
            filter: blur(3px);
        }
    `;
    document.head.appendChild(styleElement);
});
