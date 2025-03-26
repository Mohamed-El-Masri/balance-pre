// تعريف ألوان الرسوم البيانية
const chartColors = {
    primary: '#3A2A24',
    primaryLight: 'rgba(58, 42, 36, 0.1)',
    primaryMedium: 'rgba(58, 42, 36, 0.5)',
    primaryDark: '#2C1F1A',
    secondary: '#C8B09A',
    secondaryLight: 'rgba(200, 176, 154, 0.2)',
    secondaryMedium: 'rgba(200, 176, 154, 0.5)',
    secondaryDark: '#A68D75',
    success: '#28a745',
    successLight: 'rgba(40, 167, 69, 0.2)',
    danger: '#dc3545',
    dangerLight: 'rgba(220, 53, 69, 0.2)',
    warning: '#ffc107',
    warningLight: 'rgba(255, 193, 7, 0.2)',
    info: '#17a2b8',
    infoLight: 'rgba(23, 162, 184, 0.2)',
    white: '#ffffff',
    light: '#f8f9fa',
    dark: '#343a40',
    transparent: 'transparent'
};

// تهيئة الرسوم البيانية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('تهيئة الرسوم البيانية...');
    
    // تحميل Chart.js قبل تهيئة الرسوم البيانية
    if (typeof Chart === 'undefined') {
        console.error('Chart.js غير محمّل. جاري تحميله...');
        loadChartJsLibrary();
        return;
    }
    
    // تعريف التنسيقات الافتراضية للرسوم البيانية
    setupChartDefaults();
    
    // محاولة تهيئة الرسوم البيانية بعد التأكد من تحميل المكتبة
    setTimeout(() => {
        initAllCharts();
    }, 500);
});

// تحميل مكتبة Chart.js ديناميكيًا إذا لم تكن محملة
function loadChartJsLibrary() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
    script.onload = () => {
        console.log('تم تحميل Chart.js بنجاح');
        setupChartDefaults();
        initAllCharts();
    };
    script.onerror = () => {
        console.error('فشل تحميل Chart.js');
        showChartErrorMessage();
    };
    document.head.appendChild(script);
}

// إظهار رسائل خطأ في حاويات الرسوم البيانية
function showChartErrorMessage() {
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.innerHTML = `
            <div class="chart-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>تعذر تحميل الرسم البياني</p>
            </div>
        `;
    });
}

// إعداد التنسيقات الافتراضية للرسوم البيانية
function setupChartDefaults() {
    if (typeof Chart === 'undefined') return;
    
    // تعيين الخطوط العربية بشكل افتراضي
    Chart.defaults.font.family = 'Tajawal, Arial, sans-serif';
    
    // تعيين الألوان الافتراضية
    Chart.defaults.color = chartColors.dark;
    
    // تنسيقات رسائل عدم توفر البيانات
    if (Chart.overrides && Chart.overrides.pie && Chart.overrides.pie.plugins && Chart.overrides.pie.plugins.legend && Chart.overrides.pie.plugins.legend.labels) {
        const originalFunc = Chart.overrides.pie.plugins.legend.labels.generateLabels;
        Chart.overrides.pie.plugins.legend.labels.generateLabels = function(chart) {
            const labels = originalFunc.call(this, chart);
            
            labels.forEach(label => {
                label.fillStyle = label.strokeStyle;  // استخدام نفس لون الحدود للتعبئة
            });
            
            return labels;
        };
    }
}

// تهيئة جميع الرسوم البيانية
function initAllCharts() {
    try {
        // تهيئة الرسوم البيانية للمنشآت الصناعية
        initIndustrialCharts();
        
        // تهيئة الرسوم البيانية للسكن
        initResidentialCharts();
        
        // تهيئة الرسوم البيانية للفنادق
        initHotelCharts();
        
        console.log('تم تهيئة الرسوم البيانية بنجاح');
        
        // تهيئة التبويبات وتحديث الرسوم عند التبديل
        initializeTabs();
    } catch (error) {
        console.error('خطأ أثناء تهيئة الرسوم البيانية:', error);
        showChartErrorMessage();
    }
}

// تهيئة التبويبات وتحديث الرسوم عند التبديل
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // تحديد التبويب النشط
            const targetTabId = btn.dataset.tab;
            
            // جعل جميع الأزرار غير نشطة
            tabButtons.forEach(b => b.classList.remove('active'));
            
            // تنشيط الزر الحالي
            btn.classList.add('active');
            
            // جعل جميع التبويبات غير نشطة
            const tabPanes = document.querySelectorAll('.tab-pane');
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // تنشيط التبويب الحالي
            const activePane = document.getElementById(`${targetTabId}-tab`);
            if (activePane) activePane.classList.add('active');
            
            // تحديث الرسوم البيانية بعد التبديل (لإصلاح مشاكل العرض)
            setTimeout(() => {
                updateChartsInTab(targetTabId);
            }, 50);
        });
    });
}

// تحديث الرسوم البيانية في التبويب النشط
function updateChartsInTab(tabId) {
    const tabPane = document.getElementById(`${tabId}-tab`);
    if (!tabPane) return;
    
    const chartCanvases = tabPane.querySelectorAll('canvas');
    chartCanvases.forEach(canvas => {
        const chartId = canvas.id;
        if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
            const chart = Chart.getChart(chartId);
            
            if (chart) {
                // إعادة تعيين حجم الرسم البياني
                chart.resize();
                
                // تحديث البيانات
                chart.update();
            }
        }
    });
}

// تهيئة رسوم بيانية للمنشآت الصناعية
function initIndustrialCharts() {
    // الرسم البياني الدائري للمنشآت الصناعية
    const industrialCtx = document.getElementById('industrialChart');
    if (!industrialCtx) return;
    
    // التأكد من عدم وجود رسم بياني سابق
    if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
        const existingChart = Chart.getChart(industrialCtx);
        if (existingChart) {
            existingChart.destroy();
        }
    }
    
    new Chart(industrialCtx, {
        type: 'pie',
        data: {
            labels: ['مصانع', 'مستودعات', 'ورش', 'مكاتب صناعية'],
            datasets: [{
                data: [28, 42, 15, 8],
                backgroundColor: [
                    chartColors.primary,
                    chartColors.secondary,
                    chartColors.info,
                    chartColors.warning
                ],
                borderColor: chartColors.white,
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    bodyFont: { family: 'Tajawal' },
                    titleFont: { family: 'Tajawal' }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { 
                            family: 'Tajawal',
                            size: 14
                        },
                        padding: 20
                    }
                }
            }
        }
    });

    // الرسم البياني الخطي لتطور المنشآت الصناعية
    const trendCtx = document.getElementById('industrialTrendChart');
    if (!trendCtx) return;
    
    // التأكد من عدم وجود رسم بياني سابق
    if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
        const existingChart = Chart.getChart(trendCtx);
        if (existingChart) {
            existingChart.destroy();
        }
    }
    
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
            datasets: [
                {
                    label: 'مصانع',
                    data: [18, 20, 22, 24, 26, 28],
                    borderColor: chartColors.primary,
                    backgroundColor: chartColors.primaryLight,
                    fill: false,
                    tension: 0.3,
                    pointBackgroundColor: chartColors.primary
                },
                {
                    label: 'مستودعات',
                    data: [25, 28, 32, 35, 39, 42],
                    borderColor: chartColors.secondary,
                    backgroundColor: chartColors.secondaryLight,
                    fill: false,
                    tension: 0.3,
                    pointBackgroundColor: chartColors.secondary
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { family: 'Tajawal' }
                    }
                },
                x: {
                    ticks: {
                        font: { family: 'Tajawal' }
                    }
                }
            },
            plugins: {
                tooltip: {
                    bodyFont: { family: 'Tajawal' },
                    titleFont: { family: 'Tajawal' }
                },
                legend: {
                    labels: {
                        font: { family: 'Tajawal' }
                    }
                }
            }
        }
    });
}

// تهيئة رسوم بيانية للسكن
function initResidentialCharts() {
    // الرسم البياني الشريطي للسكن النموذجي
    const residentialCtx = document.getElementById('residentialChart');
    if (!residentialCtx) return;
    
    // التأكد من عدم وجود رسم بياني سابق
    if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
        const existingChart = Chart.getChart(residentialCtx);
        if (existingChart) {
            existingChart.destroy();
        }
    }
    
    new Chart(residentialCtx, {
        type: 'bar',
        data: {
            labels: ['مجمع 1', 'مجمع 2', 'مجمع 3', 'مجمع 4', 'مجمع 5', 'مجمع 6', 'مجمع 7', 'مجمع 8'],
            datasets: [
                {
                    label: 'السعة الكلية',
                    data: [125, 150, 110, 95, 130, 120, 105, 125],
                    backgroundColor: chartColors.primaryLight,
                    borderColor: chartColors.primary,
                    borderWidth: 1
                },
                {
                    label: 'الإشغال الفعلي',
                    data: [100, 120, 85, 70, 95, 90, 80, 90],
                    backgroundColor: chartColors.secondary,
                    borderColor: chartColors.secondaryDark,
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { family: 'Tajawal' }
                    }
                },
                x: {
                    ticks: {
                        font: { family: 'Tajawal' }
                    }
                }
            },
            plugins: {
                tooltip: {
                    bodyFont: { family: 'Tajawal' },
                    titleFont: { family: 'Tajawal' }
                },
                legend: {
                    labels: {
                        font: { family: 'Tajawal' }
                    }
                }
            }
        }
    });

    // الرسم البياني الدائري لنسبة الإشغال
    const occupancyCtx = document.getElementById('occupancyChart');
    if (!occupancyCtx) return;
    
    // التأكد من عدم وجود رسم بياني سابق
    if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
        const existingChart = Chart.getChart(occupancyCtx);
        if (existingChart) {
            existingChart.destroy();
        }
    }
    
    new Chart(occupancyCtx, {
        type: 'doughnut',
        data: {
            labels: ['مشغول', 'متاح'],
            datasets: [{
                data: [76, 24],
                backgroundColor: [
                    chartColors.success,
                    chartColors.light
                ],
                borderColor: chartColors.white,
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw + '%';
                        }
                    },
                    bodyFont: { family: 'Tajawal' },
                    titleFont: { family: 'Tajawal' }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: 'Tajawal' }
                    }
                }
            }
        }
    });
}

// تهيئة رسوم بيانية للفنادق
function initHotelCharts() {
    // الرسم البياني للفنادق حسب التصنيف
    const hotelsCtx = document.getElementById('hotelsChart');
    if (!hotelsCtx) return;
    
    // التأكد من عدم وجود رسم بياني سابق
    if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
        const existingChart = Chart.getChart(hotelsCtx);
        if (existingChart) {
            existingChart.destroy();
        }
    }
    
    new Chart(hotelsCtx, {
        type: 'polarArea',
        data: {
            labels: ['5 نجوم', '4 نجوم', '3 نجوم', 'نجمتان', 'نجمة واحدة'],
            datasets: [{
                data: [2, 3, 4, 2, 1],
                backgroundColor: [
                    chartColors.success,
                    chartColors.info,
                    chartColors.secondary,
                    chartColors.warning,
                    chartColors.danger
                ],
                borderColor: chartColors.white,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    ticks: {
                        backdropColor: 'transparent',
                        font: { family: 'Tajawal' }
                    },
                    pointLabels: {
                        font: { family: 'Tajawal' }
                    }
                }
            },
            plugins: {
                tooltip: {
                    bodyFont: { family: 'Tajawal' },
                    titleFont: { family: 'Tajawal' }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: 'Tajawal' }
                    }
                }
            }
        }
    });

    // الرسم البياني الشعاعي لمستوى الإقبال والتقييم
    const ratingCtx = document.getElementById('hotelRatingChart');
    if (!ratingCtx) return;
    
    // التأكد من عدم وجود رسم بياني سابق
    if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
        const existingChart = Chart.getChart(ratingCtx);
        if (existingChart) {
            existingChart.destroy();
        }
    }
    
    new Chart(ratingCtx, {
        type: 'radar',
        data: {
            labels: ['جودة الخدمة', 'السعر', 'الموقع', 'المرافق', 'الراحة', 'النظافة'],
            datasets: [{
                label: 'متوسط تقييم الفنادق',
                data: [3.2, 3.5, 4.0, 3.1, 3.7, 3.9],
                fill: true,
                backgroundColor: chartColors.secondaryLight,
                borderColor: chartColors.secondary,
                pointBackgroundColor: chartColors.secondaryDark,
                pointBorderColor: chartColors.white,
                pointHoverBackgroundColor: chartColors.white,
                pointHoverBorderColor: chartColors.secondaryDark
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 5,
                    ticks: {
                        stepSize: 1,
                        font: { family: 'Tajawal' }
                    },
                    pointLabels: {
                        font: { family: 'Tajawal', size: 12 }
                    }
                }
            },
            plugins: {
                tooltip: {
                    bodyFont: { family: 'Tajawal' },
                    titleFont: { family: 'Tajawal' }
                },
                legend: {
                    labels: {
                        font: { family: 'Tajawal' }
                    }
                }
            }
        }
    });
}

// استدعاء تهيئة الرسوم البيانية عند تحميل الصفحة
window.addEventListener('load', function() {
    // إعادة محاولة تهيئة الرسوم البيانية بعد تحميل كامل للصفحة
    setTimeout(() => {
        console.log('إعادة تهيئة الرسوم البيانية بعد تحميل الصفحة...');
        initAllCharts();
    }, 1000);
});