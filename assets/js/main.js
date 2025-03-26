document.addEventListener('DOMContentLoaded', () => {
    // تهيئة عناصر الصفحة
    initNavigation();
    initTabs();
    initScrollToTop();
    initProgressBar();
    initModal();
    initPropertyFilters();
    populatePropertiesGrid();
});

// تهيئة التنقل في القائمة الرئيسية
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 70,
                behavior: 'smooth'
            });
        });
    });

    // تمييز الرابط النشط عند التمرير
    window.addEventListener('scroll', highlightActiveNavLink);

    function highlightActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const currentId = section.getAttribute('id');
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // زر البحث في الهيدر
    const searchToggle = document.querySelector('.search-toggle');
    searchToggle.addEventListener('click', () => {
        alert('سيتم إضافة وظيفة البحث الشامل قريبًا');
    });
}

// تهيئة علامات التبويب في قسم الإحصائيات
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // تحديث حالة الأزرار
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // تحديث حالة التبويبات
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// تهيئة زر التمرير للأعلى
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// تهيئة شريط تقدم القراءة
function initProgressBar() {
    const progressBar = document.getElementById('readingProgressBar');
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        progressBar.style.width = scrolled + '%';
    });
}

// تهيئة المودال لعرض تفاصيل العقار
function initModal() {
    const modal = document.getElementById('property-details-modal');
    const closeBtns = document.querySelectorAll('.close-modal');
    const requestBtn = document.getElementById('request-conversion');
    
    // إغلاق المودال
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });
    
    // إغلاق المودال عند النقر خارجه
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // زر طلب تحويل الرخصة
    requestBtn.addEventListener('click', () => {
        alert('تم إرسال طلب تحويل الرخصة بنجاح!');
        modal.classList.remove('active');
    });
}

// تهيئة فلاتر قطع الأراضي
function initPropertyFilters() {
    const searchInput = document.getElementById('property-search');
    const neighborhoodFilter = document.getElementById('neighborhood-filter');
    const areaFilter = document.getElementById('area-filter');
    const loadMoreBtn = document.getElementById('load-more');
    
    // فلتر البحث النصي
    searchInput.addEventListener('input', filterProperties);
    
    // فلاتر الحي والمساحة
    neighborhoodFilter.addEventListener('change', filterProperties);
    areaFilter.addEventListener('change', filterProperties);
    
    // زر عرض المزيد
    loadMoreBtn.addEventListener('click', () => {
        const hiddenProperties = document.querySelectorAll('.property-card.hidden');
        const toShow = hiddenProperties.length > 6 ? 6 : hiddenProperties.length;
        
        for (let i = 0; i < toShow; i++) {
            hiddenProperties[i].classList.remove('hidden');
        }
        
        if (hiddenProperties.length <= 6) {
            loadMoreBtn.style.display = 'none';
        }
    });
}

// فلترة قطع الأراضي حسب المدخلات
function filterProperties() {
    const searchTerm = document.getElementById('property-search').value.toLowerCase();
    const neighborhood = document.getElementById('neighborhood-filter').value;
    const areaSize = document.getElementById('area-filter').value;
    const properties = document.querySelectorAll('.property-card');
    
    properties.forEach(property => {
        // فلتر النص
        const title = property.querySelector('.property-title').textContent.toLowerCase();
        const textMatch = title.includes(searchTerm);
        
        // فلتر الحي
        const propertyNeighborhood = property.dataset.neighborhood;
        const neighborhoodMatch = !neighborhood || propertyNeighborhood === neighborhood;
        
        // فلتر المساحة
        const propertyArea = parseFloat(property.dataset.area);
        let areaMatch = true;
        
        if (areaSize === 'small' && propertyArea >= 2500) areaMatch = false;
        else if (areaSize === 'medium' && (propertyArea < 2500 || propertyArea > 2600)) areaMatch = false;
        else if (areaSize === 'large' && propertyArea <= 2600) areaMatch = false;
        
        // تطبيق الفلاتر
        if (textMatch && neighborhoodMatch && areaMatch) {
            property.style.display = 'block';
        } else {
            property.style.display = 'none';
        }
    });
}

// إنشاء بطاقات قطع الأراضي من البيانات
function populatePropertiesGrid() {
    const container = document.getElementById('properties-container');
    if (!container) return;
    
    // مسح المحتوى الحالي
    container.innerHTML = '';
    
    // إنشاء بطاقة لكل قطعة أرض
    propertiesData.forEach(property => {
        const area = property.property.area.replace(/,/g, '');
        const propertyCard = document.createElement('div');
        propertyCard.className = 'property-card';
        propertyCard.dataset.id = property.id;
        propertyCard.dataset.neighborhood = property.property.neighborhood;
        propertyCard.dataset.area = area;
        
        // استخراج الإحداثيات
        const coordinates = parseCoordinates(property.property.coordinates);
        
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
        
        container.appendChild(propertyCard);
        
        // إضافة مستمع حدث لزر التفاصيل
        const detailsBtn = propertyCard.querySelector('.view-property');
        detailsBtn.addEventListener('click', () => {
            showPropertyDetails(property.id);
        });
        
        // تهيئة الخريطة المصغرة (سيتم تنفيذها عبر دالة initPropertyMaps في maps.js)
    });
}

// عرض تفاصيل القطعة في المودال
function showPropertyDetails(propertyId) {
    const modal = document.getElementById('property-details-modal');
    const selectedProperty = propertiesData.find(p => p.id === propertyId);
    
    if (!selectedProperty) return;
    
    // تحديث عنوان المودال
    document.getElementById('modal-title').textContent = `تفاصيل قطعة الأرض ${selectedProperty.property.plotNumber}`;
    
    // تعبئة البيانات الأساسية
    const basicInfo = document.getElementById('basic-info');
    basicInfo.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">رقم الوثيقة:</span>
            <span class="detail-value">${selectedProperty.basicData.documentNumber}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">تاريخ الوثيقة:</span>
            <span class="detail-value">${selectedProperty.basicData.documentDate}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">تاريخ الوثيقة السابقة:</span>
            <span class="detail-value">${selectedProperty.basicData.previousDocumentDate}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">المساحة:</span>
            <span class="detail-value">${selectedProperty.basicData.area} م²</span>
        </div>
    `;
    
    // تعبئة معلومات العقار
    const propertyInfo = document.getElementById('property-info');
    propertyInfo.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">رقم هوية العقار:</span>
            <span class="detail-value">${selectedProperty.property.propertyId}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">المدينة:</span>
            <span class="detail-value">${selectedProperty.property.city}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">الحي:</span>
            <span class="detail-value">${selectedProperty.property.neighborhood}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">رقم المخطط:</span>
            <span class="detail-value">${selectedProperty.property.planNumber}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">رقم القطعة:</span>
            <span class="detail-value">${selectedProperty.property.plotNumber}</span>
        </div>
        ${selectedProperty.property.block ? `
        <div class="detail-item">
            <span class="detail-label">رقم البلوك:</span>
            <span class="detail-value">${selectedProperty.property.block}</span>
        </div>
        ` : ''}
        <div class="detail-item">
            <span class="detail-label">نوع العقار:</span>
            <span class="detail-value">${selectedProperty.property.propertyType}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">الإحداثيات:</span>
            <span class="detail-value">${selectedProperty.property.coordinates}</span>
        </div>
    `;
    
    // تعبئة تحليل المنطقة المحيطة (سيتم تحديثها لاحقًا من maps.js)
    document.getElementById('nearby-analysis-data').innerHTML = `
        <p>جاري تحليل المنطقة المحيطة...</p>
    `;
    
    // عرض المودال
    modal.classList.add('active');
    
    // تهيئة خريطة المودال (سيتم تنفيذها عبر دالة initModalMap في maps.js)
}

// تحويل نص الإحداثيات إلى كائن lat, lng
function parseCoordinates(coordinatesString) {
    try {
        const latMatch = coordinatesString.match(/(\d+)°(\d+)'([\d.]+)"([NS])/);
        const lngMatch = coordinatesString.match(/(\d+)°(\d+)'([\d.]+)"([EW])/);
        
        if (latMatch && lngMatch) {
            let latDeg = parseInt(latMatch[1]);
            let latMin = parseInt(latMatch[2]);
            let latSec = parseFloat(latMatch[3]);
            let latDir = latMatch[4];
            
            let lngDeg = parseInt(lngMatch[1]);
            let lngMin = parseInt(lngMatch[2]);
            let lngSec = parseFloat(lngMatch[3]);
            let lngDir = lngMatch[4];
            
            let latitude = latDeg + latMin/60 + latSec/3600;
            if (latDir === 'S') latitude *= -1;
            
            let longitude = lngDeg + lngMin/60 + lngSec/3600;
            if (lngDir === 'W') longitude *= -1;
            
            return { lat: latitude, lng: longitude };
        }
    } catch (e) {
        console.error('خطأ في تحليل الإحداثيات:', e);
    }
    
    return null;
}
