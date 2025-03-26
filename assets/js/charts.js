document.addEventListener('DOMContentLoaded', () => {
    // تهيئة الرسوم البيانية عند تحميل الصفحة
    initIndustrialCharts();
    initResidentialCharts();
    initHotelCharts();
    
    // تهيئة التبويبات للإحصائيات
    initStatisticsTabs();
});

// رسوم بيانية للمنشآت الصناعية
function initIndustrialCharts() {
    // الرسم البياني الدائري للمنشآت الصناعية
    const industrialCtx = document.getElementById('industrialChart');
    if (industrialCtx) {
        const industrialChart = new Chart(industrialCtx, {
            type: 'pie',
            data: {
                labels: ['مصانع', 'مستودعات', 'ورش', 'مكاتب صناعية'],
                datasets: [{
                    data: [28, 42, 15, 8],
                    backgroundColor: [
                        'var(--primary-color)',
                        'var(--secondary-color)',
                        'var(--accent-color)',
                        'var(--info-color)'
                    ],
                    borderColor: 'var(--white)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Tajawal',
                                size: 14
                            },
                            padding: 20
                        }
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        titleFont: {
                            family: 'Tajawal'
                        },
                        bodyFont: {
                            family: 'Tajawal'
                        }
                    }
                }
            }
        });
    }
    
    // الرسم البياني الخطي لتطور المنشآت الصناعية
    const industrialTrendCtx = document.getElementById('industrialTrendChart');
    if (industrialTrendCtx) {
        const industrialTrendChart = new Chart(industrialTrendCtx, {
            type: 'line',
            data: {
                labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
                datasets: [
                    {
                        label: 'مصانع',
                        data: [18, 20, 22, 24, 26, 28],
                        borderColor: 'var(--primary-color)',
                        backgroundColor: 'transparent',
                        tension: 0.4
                    },
                    {
                        label: 'مستودعات',
                        data: [25, 28, 32, 35, 39, 42],
                        borderColor: 'var(--secondary-color)',
                        backgroundColor: 'transparent',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: 'Tajawal',
                                size: 14
                            },
                            padding: 20
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'عدد المنشآت',
                            font: {
                                family: 'Tajawal',
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'السنة',
                            font: {
                                family: 'Tajawal',
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }
}

// رسوم بيانية للسكن النموذجي
function initResidentialCharts() {
    // الرسم البياني الشريطي للسكن
    const residentialCtx = document.getElementById('residentialChart');
    if (residentialCtx) {
        const residentialChart = new Chart(residentialCtx, {
            type: 'bar',
            data: {
                labels: ['مجمع 1', 'مجمع 2', 'مجمع 3', 'مجمع 4', 'مجمع 5', 'مجمع 6', 'مجمع 7', 'مجمع 8'],
                datasets: [{
                    label: 'السعة',
                    data: [125, 150, 110, 95, 130, 120, 105, 125],
                    backgroundColor: 'var(--primary-light)',
                    borderColor: 'var(--primary-color)',
                    borderWidth: 1
                },
                {
                    label: 'الإشغال الفعلي',
                    data: [100, 120, 85, 70, 95, 90, 80, 90],
                    backgroundColor: 'var(--secondary-color)',
                    borderColor: 'var(--secondary-dark)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: 'Tajawal',
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'عدد الوحدات',
                            font: {
                                family: 'Tajawal',
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }
    
    // الرسم البياني الدائري لنسبة الإشغال
    const occupancyCtx = document.getElementById('occupancyChart');
    if (occupancyCtx) {
        const occupancyChart = new Chart(occupancyCtx, {
            type: 'doughnut',
            data: {
                labels: ['مشغول', 'متاح'],
                datasets: [{
                    data: [76, 24],
                    backgroundColor: [
                        'var(--success-color)',
                        'var(--light-bg)'
                    ],
                    borderColor: 'var(--white)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Tajawal',
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.raw + '%';
                            }
                        }
                    }
                }
            }
        });
    }
}

// رسوم بيانية للفنادق
function initHotelCharts() {
    // الرسم البياني للفنادق
    const hotelsCtx = document.getElementById('hotelsChart');
    if (hotelsCtx) {
        const hotelsChart = new Chart(hotelsCtx, {
            type: 'polarArea',
            data: {
                labels: ['5 نجوم', '4 نجوم', '3 نجوم', 'نجمتان', 'نجمة واحدة'],
                datasets: [{
                    data: [2, 3, 4, 2, 1],
                    backgroundColor: [
                        'var(--success-color)',
                        'var(--info-color)',
                        'var(--secondary-color)',
                        'var(--warning-color)',
                        'var(--danger-color)'
                    ],
                    borderColor: 'var(--white)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Tajawal',
                                size: 14
                            }
                        }
                    }
                }
            }
        });
    }
    
    // الرسم البياني لمستوى الإقبال والتقييم
    const hotelRatingCtx = document.getElementById('hotelRatingChart');
    if (hotelRatingCtx) {
        const hotelRatingChart = new Chart(hotelRatingCtx, {
            type: 'radar',
            data: {
                labels: ['جودة الخدمة', 'السعر', 'الموقع', 'المرافق', 'الراحة', 'النظافة'],
                datasets: [{
                    label: 'متوسط تقييم الفنادق',
                    data: [3.2, 3.5, 4.0, 3.1, 3.7, 3.9],
                    fill: true,
                    backgroundColor: 'rgba(200, 176, 154, 0.2)',
                    borderColor: 'var(--secondary-color)',
                    pointBackgroundColor: 'var(--secondary-dark)',
                    pointBorderColor: 'var(--white)',
                    pointHoverBackgroundColor: 'var(--white)',
                    pointHoverBorderColor: 'var(--secondary-dark)'
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
                            stepSize: 1
                        },
                        pointLabels: {
                            font: {
                                family: 'Tajawal',
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Tajawal',
                                size: 14
                            }
                        }
                    }
                }
            }
        });
    }
}

// تهيئة التبويبات للإحصائيات
function initStatisticsTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (tabBtns.length && tabPanes.length) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-tab');
                
                // إزالة الفئة النشطة من جميع الأزرار والتبويبات
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                
                // إضافة الفئة النشطة للزر والتبويب المحددين
                btn.classList.add('active');
                document.getElementById(targetId + '-tab').classList.add('active');
                
                // تحديث الرسوم البيانية للتبويب النشط
                updateChartsForTab(targetId);
            });
        });
    }
}

// تحديث الرسوم البيانية للتبويب النشط
function updateChartsForTab(tabId) {
    // تحديث حجم الرسوم البيانية بعد تغيير التبويب
    setTimeout(() => {
        if (window.Chart && window.Chart.instances) {
            Object.values(window.Chart.instances).forEach(chart => {
                chart.resize();
            });
        }
    }, 50);
}

// تصدير الدوال للاستخدام العام
window.chartFunctions = {
    initIndustrialCharts,
    initResidentialCharts,
    initHotelCharts,
    initStatisticsTabs,
    updateChartsForTab
};