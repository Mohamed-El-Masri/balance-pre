
document.addEventListener('DOMContentLoaded', () => {
    // تهيئة التبويبات
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // إزالة الحالة النشطة من جميع الأزرار واللوحات
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // تنشيط الزر الحالي
            button.classList.add('active');
            
            // تنشيط اللوحة المقابلة
            const tabId = button.dataset.tab;
            const tabPane = document.getElementById(`${tabId}-tab`);
            
            if (tabPane) {
                tabPane.classList.add('active');
                
                // إعادة تهيئة مخططات البيانات عند عرض التبويب
                const canvas = tabPane.querySelector('canvas');
                if (canvas) {
                    const chart = Chart.getChart(canvas.id);
                    if (chart) {
                        chart.update();
                    }
                }
            }
        });
    });
    
    // استعراض الإحصاءات
    function initStatistics() {
        // حساب إحصائيات من بيانات العقارات
        calculatePropertyStatistics();
        
        // إنشاء تأثيرات متحركة للبطاقات
        animateStatCards();
    }
    
    // حساب إحصائيات العقارات
    function calculatePropertyStatistics() {
        // حساب إجمالي عدد العقارات
        document.getElementById('totalLands').textContent = propertiesData.length;
        
        // حساب إجمالي المساحة
        const totalArea = propertiesData.reduce((sum, property) => {
            const area = parseFloat(property.property.area.replace(',', ''));
            return sum + area;
        }, 0);
        
        document.getElementById('totalArea').textContent = `${totalArea.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} م²`;
        
        // حساب متوسط المساحة
        const avgArea = totalArea / propertiesData.length;
        document.getElementById('avgArea').textContent = `${avgArea.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} م²`;
        
        // عدد الأسر المستفادة (تقديري)
        const estimatedBeneficiaries = Math.round(totalArea / 50); // تقدير افتراضي
        document.getElementById('beneficiaries').textContent = `${estimatedBeneficiaries}+`;
    }
    
    // إنشاء تأثيرات متحركة للبطاقات
    function animateStatCards() {
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate');
            }, index * 200);
        });
    }
    
    // بدء تشغيل الإحصاءات
    initStatistics();
});
