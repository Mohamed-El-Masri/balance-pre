
// ملف التطبيق الرئيسي - يقوم بتنسيق وتهيئة جميع وظائف المشروع

document.addEventListener('DOMContentLoaded', () => {
    console.log('تم تحميل التطبيق بنجاح');
    
    // تهيئة البيانات والإحصائيات
    initializeDataSummary();
    
    // تهيئة قائمة العقارات
    populatePropertiesList();
    
    // إضافة مستمعات الأحداث العامة
    initEventListeners();
    
    // تهيئة عناصر UI إضافية
    initAnimations();
});

// تهيئة ملخص البيانات والإحصائيات
function initializeDataSummary() {
    if (!window.propertiesData) {
        console.error('بيانات العقارات غير متاحة!');
        return;
    }
    
    // حساب الإحصائيات الأساسية
    const totalLands = propertiesData.length;
    let totalArea = 0;
    
    propertiesData.forEach(property => {
        const area = parseFloat(property.property.area.replace(/,/g, ''));
        if (!isNaN(area)) {
            totalArea += area;
        }
    });
    
    const avgArea = totalArea / totalLands;
    const beneficiaries = Math.round(totalArea / 50); // تقدير تقريبي
    
    // تحديث عناصر الإحصائيات في الصفحة
    document.getElementById('totalLands').textContent = totalLands;
    document.getElementById('totalArea').textContent = totalArea.toLocaleString('ar-SA') + ' م²';
    document.getElementById('avgArea').textContent = avgArea.toLocaleString('ar-SA', { maximumFractionDigits: 2 }) + ' م²';
    document.getElementById('beneficiaries').textContent = beneficiaries.toLocaleString('ar-SA') + '+';
}

// إنشاء قائمة العقارات
function populatePropertiesList() {
    const propertiesContainer = document.getElementById('properties-container');
    if (!propertiesContainer || !window.propertiesData) return;
    
    // مسح المحتوى الحالي
    propertiesContainer.innerHTML = '';
    
    // عرض أول 6 عقارات فقط في البداية
    const initialDisplay = 6;
    let displayedCount = 0;
    
    propertiesData.forEach((property, index) => {
        const areaValue = property.property.area.replace(/,/g, '');
        const propertyCard = document.createElement('div');
        
        propertyCard.className = `property-card${index >= initialDisplay ? ' hidden' : ''}`;
        propertyCard.dataset.id = property.id;
        propertyCard.dataset.neighborhood = property.property.neighborhood;
        propertyCard.dataset.area = areaValue;
        
        propertyCard.innerHTML = `
            <div class="property-map" id="map-${property.id}"></div>
            <span class="property-badge">قطعة ${property.property.plotNumber}</span>
            <div class="property-content">
                <h3 class="property-title">قطعة أرض ${property.property.plotNumber}</h3>
                <div class="property-info">
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-map-marker-alt"></i> الحي:</span>
                        <span class="info-value">${property.property.neighborhood}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-expand"></i> المساحة:</span>
                        <span class="info-value">${property.property.area} م²</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-file-alt"></i> رقم الوثيقة:</span>
                        <span class="info-value">${property.basicData.documentNumber}</span>
                    </div>
                </div>
                <div class="property-actions">
                    <button class="btn btn-primary view-property" data-id="${property.id}">عرض التفاصيل</button>
                </div>
            </div>
        `;
        
        propertiesContainer.appendChild(propertyCard);
        
        // إضافة مستمع حدث لزر التفاصيل
        const detailsBtn = propertyCard.querySelector('.view-property');
        detailsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showPropertyDetails(property.id);
        });
        
        displayedCount = index < initialDisplay ? displayedCount + 1 : displayedCount;
    });
    
    // التحقق إذا كان زر "عرض المزيد" مطلوبًا
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        if (propertiesData.length > initialDisplay) {
            loadMoreBtn.style.display = 'inline-block';
            
            // إضافة مستمع حدث لزر "عرض المزيد"
            loadMoreBtn.addEventListener('click', () => {
                const hiddenProperties = document.querySelectorAll('.property-card.hidden');
                const toShow = Math.min(hiddenProperties.length, 6);
                
                for (let i = 0; i < toShow; i++) {
                    hiddenProperties[i].classList.remove('hidden');
                }
                
                if (toShow >= hiddenProperties.length) {
                    loadMoreBtn.style.display = 'none';
                }
            });
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

// عرض تفاصيل العقار
function showPropertyDetails(propertyId) {
    if (window.mapFunctions && typeof window.mapFunctions.showPropertyDetails === 'function') {
        window.mapFunctions.showPropertyDetails(propertyId);
    } else {
        console.error('وظيفة عرض تفاصيل العقار غير متاحة!');
    }
}

// إضافة مستمعات الأحداث العامة
function initEventListeners() {
    // مستمعات الأحداث للبحث والفلاتر
    const searchInput = document.getElementById('property-search');
    const neighborhoodFilter = document.getElementById('neighborhood-filter');
    const areaFilter = document.getElementById('area-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterProperties);
    }
    
    if (neighborhoodFilter) {
        neighborhoodFilter.addEventListener('change', filterProperties);
    }
    
    if (areaFilter) {
        areaFilter.addEventListener('change', filterProperties);
    }

    // مستمع الحدث للتمرير لأعلى
    const scrollTopButton = document.getElementById('scrollToTop');
    if (scrollTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopButton.classList.add('show');
            } else {
                scrollTopButton.classList.remove('show');
            }
        });
        
        scrollTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // مستمع الحدث لشريط التقدم في القراءة
    const progressBar = document.getElementById('readingProgressBar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
            const scrollDone = window.scrollY;
            const scrollPercent = (scrollDone / scrollTotal) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        });
    }

    // مستمعات أحداث التنقل السلس
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // تعديل للهيدر الثابت
                    behavior: 'smooth'
                });
            }
        });
    });
}

// فلترة العقارات
function filterProperties() {
    const searchTerm = document.getElementById('property-search')?.value.toLowerCase() || '';
    const neighborhood = document.getElementById('neighborhood-filter')?.value || '';
    const areaFilter = document.getElementById('area-filter')?.value || '';
    
    const propertyCards = document.querySelectorAll('.property-card');
    let visibleCount = 0;
    
    propertyCards.forEach(card => {
        // فلتر البحث
        const title = card.querySelector('.property-title').textContent.toLowerCase();
        const searchMatch = title.includes(searchTerm) || searchTerm === '';
        
        // فلتر الحي
        const cardNeighborhood = card.dataset.neighborhood;
        const neighborhoodMatch = neighborhood === '' || cardNeighborhood === neighborhood;
        
        // فلتر المساحة
        const cardArea = parseFloat(card.dataset.area);
        let areaMatch = true;
        
        if (areaFilter === 'small' && cardArea >= 2500) {
            areaMatch = false;
        } else if (areaFilter === 'medium' && (cardArea < 2500 || cardArea > 2600)) {
            areaMatch = false;
        } else if (areaFilter === 'large' && cardArea <= 2600) {
            areaMatch = false;
        }
        
        // تطبيق جميع الفلاتر
        const isVisible = searchMatch && neighborhoodMatch && areaMatch;
        
        // تحديث حالة عرض البطاقة
        card.style.display = isVisible ? 'block' : 'none';
        card.classList.remove('hidden');
        
        if (isVisible) {
            visibleCount++;
        }
    });
    
    // تحديث زر "عرض المزيد" بناءً على نتائج الفلترة
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
    
    // عرض رسالة إذا لم يتم العثور على نتائج
    const propertiesContainer = document.getElementById('properties-container');
    if (visibleCount === 0 && propertiesContainer) {
        if (!document.querySelector('.no-results-message')) {
            const noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>لم يتم العثور على نتائج مطابقة للبحث</p>
                    <button class="btn btn-secondary reset-filters">إعادة ضبط الفلاتر</button>
                </div>
            `;
            propertiesContainer.appendChild(noResultsMsg);
            
            document.querySelector('.reset-filters').addEventListener('click', resetFilters);
        }
    } else {
        const noResultsMsg = document.querySelector('.no-results-message');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
}

// إعادة ضبط الفلاتر
function resetFilters() {
    const searchInput = document.getElementById('property-search');
    const neighborhoodFilter = document.getElementById('neighborhood-filter');
    const areaFilter = document.getElementById('area-filter');
    
    if (searchInput) searchInput.value = '';
    if (neighborhoodFilter) neighborhoodFilter.value = '';
    if (areaFilter) areaFilter.value = '';
    
    filterProperties();
}

// إضافة تأثيرات وحركات للعناصر
function initAnimations() {
    // تأثير ظهور العناصر عند التمرير
    const elementsToAnimate = document.querySelectorAll('.stat-card, .chart-container, .property-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}
