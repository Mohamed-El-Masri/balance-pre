document.addEventListener('DOMContentLoaded', () => {
    // تهيئة التبويبات
    initTabs();
    
    // تهيئة الإحصاءات
    initStatistics();
    
    // إنشاء المخططات البيانية
    createCharts();
});

// تهيئة التبويبات
function initTabs() {
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
                
                // تحديث المخططات البيانية عند تبديل التبويبات
                setTimeout(() => {
                    updateCharts(tabId);
                }, 100);
            }
        });
    });
}

// تهيئة البيانات الإحصائية
function initStatistics() {
    // حساب إحصائيات عامة من بيانات العقارات
    calculatePropertyStatistics();
    
    // إنشاء تأثيرات متحركة للبطاقات
    animateStatCards();
}

// حساب إحصائيات العقارات
function calculatePropertyStatistics() {
    // عدد قطع الأراضي
    document.getElementById('totalLands').textContent = propertiesData.length;
    
    // إجمالي المساحة
    const totalArea = propertiesData.reduce((sum, property) => {
        const area = parseFloat(property.property.area.replace(/,/g, ''));
        return sum + area;
    }, 0);
    
    document.getElementById('totalArea').textContent = `${totalArea.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} م²`;
    
    // متوسط المساحة
    const avgArea = totalArea / propertiesData.length;
    document.getElementById('avgArea').textContent = `${avgArea.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} م²`;
    
    // تقدير عدد الأسر المستفيدة (افتراضي: كل 50م² تكفي لأسرة واحدة)
    const estimatedBeneficiaries = Math.round(totalArea / 50);
    document.getElementById('beneficiaries').textContent = `${estimatedBeneficiaries}+`;
}

// إضافة تأثيرات متحركة للبطاقات الإحصائية
function animateStatCards() {
    const statCards = document.querySelectorAll('.stat-card');
    
    // تحريك الأرقام (عداد متزايد)
    statCards.forEach(card => {
        const statValue = card.querySelector('.stat-value');
        const targetValue = statValue.textContent;
        
        // إذا كانت القيمة رقمية بدون وحدات
        if (!isNaN(parseFloat(targetValue)) && !targetValue.includes('م²') && !targetValue.includes('+')) {
            animateCountUp(statValue, 0, parseInt(targetValue), 1500);
        }
        
        // إضافة تأثير ظهور تدريجي
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });
}

// تحريك الأرقام (عداد متزايد)
function animateCountUp(element, start, end, duration) {
    let startTime = null;
    
    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// إنشاء المخططات البيانية
function createCharts() {
    // مخطط المنشآت الصناعية
    const industrialCtx = document.getElementById('industrialChart').getContext('2d');
    window.industrialChart = new Chart(industrialCtx, {
        type: 'pie',
        data: {
            labels: ['مصانع', 'مستودعات', 'ورش', 'منشآت أخرى'],
            datasets: [{
                data: [28, 42, 15, 8],
                backgroundColor: [
                    'var(--primary-color)',
                    'var(--secondary-color)',
                    'var(--accent-color)',
                    'var(--info-color)'
                ],
                borderWidth: 1,
                borderColor: 'var(--white)'
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
                            family: 'Tajawal'
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    bodyFont: {
                        family: 'Tajawal'
                    },
                    titleFont: {
                        family: 'Tajawal'
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // مخطط السكن النموذجي
    const residentialCtx = document.getElementById('residentialChart').getContext('2d');
    window.residentialChart = new Chart(residentialCtx, {
        type: 'bar',
        data: {
            labels: ['مجمعات', 'سعة إجمالية (÷100)', 'نسبة الامتلاء (%)'],
            datasets: [{
                label: 'السكن النموذجي',
                data: [8, 9.6, 76],
                backgroundColor: [
                    'var(--primary-light)',
                    'var(--accent-color)',
                    'var(--success-color)'
                ],
                borderWidth: 1,
                borderColor: [
                    'var(--primary-color)',
                    'var(--accent-dark)',
                    'var(--success-color)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'var(--border-light)'
                    },
                    ticks: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    bodyFont: {
                        family: 'Tajawal'
                    },
                    titleFont: {
                        family: 'Tajawal'
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            const index = context.dataIndex;
                            
                            // تخصيص حسب نوع البيانات
                            if (index === 0) {
                                return `${label}: ${value} مجمع سكني`;
                            } else if (index === 1) {
                                return `${label}: ${value * 100} وحدة سكنية`;
                            } else {
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                }
            }
        }
    });

    // مخطط الفنادق
    const hotelsCtx = document.getElementById('hotelsChart').getContext('2d');
    window.hotelsChart = new Chart(hotelsCtx, {
        type: 'doughnut',
        data: {
            labels: ['عدد الفنادق', 'متوسط التقييم (من 5)', 'نسبة الإشغال (%)'],
            datasets: [{
                data: [12, 3.4, 38],
                backgroundColor: [
                    'var(--secondary-color)',
                    'var(--info-color)',
                    'var(--warning-color)'
                ],
                borderWidth: 1,
                borderColor: 'var(--white)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Tajawal'
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    bodyFont: {
                        family: 'Tajawal'
                    },
                    titleFont: {
                        family: 'Tajawal'
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const index = context.dataIndex;
                            
                            // تخصيص حسب نوع البيانات
                            if (index === 0) {
                                return `${label}: ${value} فندق`;
                            } else if (index === 1) {
                                return `${label}: ${value}/5`;
                            } else {
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                }
            }
        }
    });
    
    // إضافة نص في وسط دائرة مخطط الفنادق
    addCenterTextToDoughnut(hotelsCtx, 'إحصائيات الفنادق');
}

// إضافة نص في وسط مخطط دائري
function addCenterTextToDoughnut(ctx, text) {
    Chart.register({
        id: 'centerTextPlugin',
        beforeDraw: function(chart) {
            if (chart.config.type === 'doughnut') {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                
                ctx.restore();
                const fontSize = (height / 150).toFixed(2);
                ctx.font = `${fontSize}em Tajawal, sans-serif`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                
                const text = chart.options.centerText || '';
                const textX = width / 2;
                const textY = height / 2;
                
                ctx.fillStyle = 'var(--text-color)';
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }
    });
    
    window.hotelsChart.options.centerText = text;
}

// تحديث المخططات عند تبديل التبويبات
function updateCharts(tabId) {
    if (tabId === 'industrial' && window.industrialChart) {
        window.industrialChart.update();
    } else if (tabId === 'residential' && window.residentialChart) {
        window.residentialChart.update();
    } else if (tabId === 'hotels' && window.hotelsChart) {
        window.hotelsChart.update();
    }
}

// إضافة بيانات مقارنة بين الفنادق والسكن
function addComparativeStats() {
    // إنشاء مخطط المقارنة
    const compareCtx = document.getElementById('compareChart').getContext('2d');
    if (!compareCtx) return;
    
    new Chart(compareCtx, {
        type: 'radar',
        data: {
            labels: [
                'العائد الاستثماري',
                'مستوى الطلب',
                'سهولة الإدارة',
                'تكلفة الصيانة',
                'استقرار الإيرادات',
                'توافق مع رؤية 2030'
            ],
            datasets: [
                {
                    label: 'الاستخدام الفندقي',
                    data: [65, 38, 80, 45, 60, 50],
                    fill: true,
                    backgroundColor: 'rgba(200, 176, 154, 0.2)',
                    borderColor: 'var(--secondary-color)',
                    pointBackgroundColor: 'var(--secondary-color)',
                    pointBorderColor: 'var(--white)',
                    pointHoverBackgroundColor: 'var(--white)',
                    pointHoverBorderColor: 'var(--secondary-color)'
                },
                {
                    label: 'الاستخدام السكني',
                    data: [75, 95, 65, 65, 85, 90],
                    fill: true,
                    backgroundColor: 'rgba(58, 42, 36, 0.2)',
                    borderColor: 'var(--primary-color)',
                    pointBackgroundColor: 'var(--primary-color)',
                    pointBorderColor: 'var(--white)',
                    pointHoverBackgroundColor: 'var(--white)',
                    pointHoverBorderColor: 'var(--primary-color)'
                }
            ]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        color: 'var(--border-light)'
                    },
                    grid: {
                        color: 'var(--border-light)'
                    },
                    pointLabels: {
                        font: {
                            family: 'Tajawal'
                        }
                    },
                    ticks: {
                        backdropColor: 'transparent',
                        font: {
                            family: 'Tajawal'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                },
                tooltip: {
                    bodyFont: {
                        family: 'Tajawal'
                    },
                    titleFont: {
                        family: 'Tajawal'
                    }
                }
            }
        }
    });
}

// إضافة مؤشرات الجدوى الاقتصادية
function addEconomicIndicators() {
    const indicators = [
        {
            name: 'معدل العائد على الاستثمار',
            hotel: '6.2%',
            residential: '8.3%',
            comparison: '+ 2.1%',
            improvement: true
        },
        {
            name: 'متوسط فترة استرداد رأس المال',
            hotel: '12.5 سنة',
            residential: '9.3 سنة',
            comparison: '- 3.2 سنة',
            improvement: true
        },
        {
            name: 'معدل الإشغال المتوقع',
            hotel: '38%',
            residential: '92%',
            comparison: '+ 54%',
            improvement: true
        },
        {
            name: 'تكلفة الصيانة السنوية (% من قيمة الاستثمار)',
            hotel: '4.2%',
            residential: '2.1%',
            comparison: '- 2.1%',
            improvement: true
        }
    ];
    
    const indicatorsContainer = document.getElementById('economic-indicators');
    if (!indicatorsContainer) return;
    
    let indicatorsHTML = `
        <div class="indicators-table">
            <div class="indicators-header">
                <div class="indicator-col">المؤشر</div>
                <div class="indicator-col">فندقي</div>
                <div class="indicator-col">سكني</div>
                <div class="indicator-col">الفرق</div>
            </div>
    `;
    
    indicators.forEach(indicator => {
        indicatorsHTML += `
            <div class="indicator-row">
                <div class="indicator-col">${indicator.name}</div>
                <div class="indicator-col">${indicator.hotel}</div>
                <div class="indicator-col">${indicator.residential}</div>
                <div class="indicator-col ${indicator.improvement ? 'positive' : 'negative'}">
                    ${indicator.comparison}
                    <i class="fas fa-${indicator.improvement ? 'arrow-up' : 'arrow-down'}"></i>
                </div>
            </div>
        `;
    });
    
    indicatorsHTML += `</div>`;
    indicatorsContainer.innerHTML = indicatorsHTML;
}

// تنفيذ التحليلات الإضافية
setTimeout(() => {
    addComparativeStats();
    addEconomicIndicators();
}, 1000);