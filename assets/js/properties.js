document.addEventListener('DOMContentLoaded', () => {
    // تهيئة عرض قائمة العقارات
    initPropertiesList();
    
    // إضافة مستمعات الأحداث للفلترة والبحث
    setupFiltersAndSearch();
    
    // تهيئة تفاصيل العقار في النافذة المنبثقة
    setupPropertyModal();
});

// تهيئة عرض قائمة العقارات
function initPropertiesList() {
    const propertiesContainer = document.getElementById('properties-container');
    if (!propertiesContainer) return;
    
    // مسح المحتوى الحالي
    propertiesContainer.innerHTML = '';
    
    // إنشاء كروت العقارات
    propertiesData.forEach(property => {
        const propertyCard = createPropertyCard(property);
        propertiesContainer.appendChild(propertyCard);
    });
    
    // تفعيل زر عرض المزيد
    const loadMoreButton = document.getElementById('load-more');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', () => {
            // هنا يمكن إضافة منطق لتحميل المزيد من العقارات
            // حاليًا سنخفي الزر فقط لأن جميع العقارات تم تحميلها
            loadMoreButton.style.display = 'none';
            utils.showNotification('تم عرض جميع العقارات المتاحة', 'info');
        });
    }
}

// إنشاء كارت عقار
function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.dataset.id = property.id;
    card.dataset.neighborhood = property.property.neighborhood;
    card.dataset.area = property.property.area.replace(',', '');
    
    // تحويل الإحداثيات لاستخدامها في الخريطة المصغرة
    const coordinates = utils.parseCoordinates(property.property.coordinates);
    
    card.innerHTML = `
        <div class="property-map" id="map-${property.id}">
            <span class="property-badge">قطعة ${property.property.plotNumber}</span>
        </div>
        <div class="property-content">
            <h3 class="property-title">قطعة أرض رقم ${property.property.plotNumber}</h3>
            <div class="property-info">
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-map-marker-alt"></i> الحي</span>
                    <span class="info-value">${property.property.neighborhood}</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-expand-arrows-alt"></i> المساحة</span>
                    <span class="info-value">${property.property.area} م²</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-file-alt"></i> رقم الوثيقة</span>
                    <span class="info-value">${property.basicData.documentNumber}</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-calendar-alt"></i> تاريخ الوثيقة</span>
                    <span class="info-value">${utils.formatHijriDate(property.basicData.documentDate)}</span>
                </div>
            </div>
            <div class="property-actions">
                <button class="btn btn-secondary view-details" data-id="${property.id}">
                    <i class="fas fa-info-circle"></i> عرض التفاصيل
                </button>
                <button class="btn btn-primary request-conversion" data-id="${property.id}">
                    <i class="fas fa-exchange-alt"></i> طلب تحويل
                </button>
            </div>
        </div>
    `;
    
    // إضافة حدث النقر لعرض التفاصيل
    const viewDetailsBtn = card.querySelector('.view-details');
    viewDetailsBtn.addEventListener('click', () => {
        showPropertyDetails(property.id);
    });
    
    // إضافة حدث النقر لطلب التحويل
    const requestBtn = card.querySelector('.request-conversion');
    requestBtn.addEventListener('click', async () => {
        const confirmed = await utils.showConfirmation('هل أنت متأكد من رغبتك في طلب تحويل هذه القطعة؟');
        if (confirmed) {
            utils.showNotification('تم إرسال طلب تحويل الرخصة بنجاح', 'success');
        }
    });
    
    // إضافة خريطة مصغرة بعد إضافة الكارت للصفحة
    setTimeout(() => {
        if (coordinates) {
            const mapElement = document.getElementById(`map-${property.id}`);
            if (mapElement && window.google) {
                const miniMap = new google.maps.Map(mapElement, {
                    center: coordinates,
                    zoom: 17,
                    disableDefaultUI: true,
                    zoomControl: false,
                    scrollwheel: false,
                    gestureHandling: 'none',
                    mapTypeId: google.maps.MapTypeId.SATELLITE
                });
                
                new google.maps.Marker({
                    position: coordinates,
                    map: miniMap,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#3A2A24',
                        fillOpacity: 1,
                        strokeColor: '#C8B09A',
                        strokeWeight: 2,
                        scale: 8
                    }
                });
            }
        }
    }, 500);
    
    return card;
}

// إعداد الفلاتر والبحث
function setupFiltersAndSearch() {
    const searchInput = document.getElementById('property-search');
    const neighborhoodFilter = document.getElementById('neighborhood-filter');
    const areaFilter = document.getElementById('area-filter');
    
    // البحث في الوقت الفعلي
    if (searchInput) {
        searchInput.addEventListener('input', utils.debounce(filterProperties, 300));
    }
    
    // تغيير الفلاتر
    if (neighborhoodFilter) {
        neighborhoodFilter.addEventListener('change', filterProperties);
    }
    
    if (areaFilter) {
        areaFilter.addEventListener('change', filterProperties);
    }
}

// تصفية العقارات حسب الفلاتر
function filterProperties() {
    const searchInput = document.getElementById('property-search');
    const neighborhoodFilter = document.getElementById('neighborhood-filter');
    const areaFilter = document.getElementById('area-filter');
    const propertiesContainer = document.getElementById('properties-container');
    
    if (!propertiesContainer) return;
    
    const properties = propertiesContainer.querySelectorAll('.property-card');
    let visibleCount = 0;
    
    // جمع قيم الفلاتر
    const searchText = searchInput ? searchInput.value.toLowerCase() : '';
    const neighborhood = neighborhoodFilter ? neighborhoodFilter.value : '';
    const areaRange = areaFilter ? areaFilter.value : '';
    
    properties.forEach(property => {
        // البيانات من خصائص العنصر
        const propertyId = property.dataset.id;
        const propertyData = propertiesData.find(p => p.id === propertyId);
        
        if (!propertyData) return;
        
        const propertyNeighborhood = property.dataset.neighborhood;
        const propertyArea = parseFloat(property.dataset.area);
        
        // التحقق من تطابق النص
        const plotNumber = propertyData.property.plotNumber;
        const documentNumber = propertyData.basicData.documentNumber;
        const hasSearchText = searchText === '' || 
                            plotNumber.includes(searchText) || 
                            propertyNeighborhood.toLowerCase().includes(searchText) ||
                            documentNumber.toLowerCase().includes(searchText);
        
        // التحقق من تطابق الحي
        const matchesNeighborhood = neighborhood === '' || propertyNeighborhood === neighborhood;
        
        // التحقق من تطابق المساحة
        let matchesArea = true;
        if (areaRange === 'small') {
            matchesArea = propertyArea < 2500;
        } else if (areaRange === 'medium') {
            matchesArea = propertyArea >= 2500 && propertyArea <= 2600;
        } else if (areaRange === 'large') {
            matchesArea = propertyArea > 2600;
        }
        
        // عرض أو إخفاء العقار
        if (hasSearchText && matchesNeighborhood && matchesArea) {
            property.style.display = 'block';
            visibleCount++;
        } else {
            property.style.display = 'none';
        }
    });
    
    // عرض رسالة إذا لم يتم العثور على عقارات
    const noResultsMessage = document.querySelector('.no-results-message');
    
    if (visibleCount === 0) {
        if (!noResultsMessage) {
            const message = document.createElement('p');
            message.className = 'no-results-message';
            message.textContent = 'لم يتم العثور على عقارات مطابقة لمعايير البحث';
            propertiesContainer.appendChild(message);
        }
    } else {
        if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }
}

// إعداد تفاصيل العقار في النافذة المنبثقة
function setupPropertyModal() {
    const modal = document.getElementById('property-details-modal');
    if (!modal) return;
    
    // إضافة مستمعات الأحداث لإغلاق المودال
    const closeButtons = modal.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });
    
    // إغلاق المودال عند النقر خارجه
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // مستمع الأحداث لزر طلب التحويل
    const requestButton = document.getElementById('request-conversion');
    if (requestButton) {
        requestButton.addEventListener('click', async () => {
            const confirmed = await utils.showConfirmation('هل أنت متأكد من رغبتك في تقديم طلب تحويل لهذه القطعة؟');
            if (confirmed) {
                // هنا يمكن إضافة الكود لإرسال الطلب إلى الخادم
                utils.showNotification('تم إرسال طلب التحويل بنجاح', 'success');
                modal.classList.remove('active');
            }
        });
    }
}

// عرض تفاصيل العقار في المودال
function showPropertyDetails(propertyId) {
    const property = propertiesData.find(p => p.id === propertyId);
    if (!property) return;
    
    const modal = document.getElementById('property-details-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.getElementById('modal-property-details');
    
    if (!modal || !modalTitle || !modalDetails) return;
    
    // تحديث عنوان المودال
    modalTitle.textContent = `تفاصيل قطعة الأرض رقم ${property.property.plotNumber}`;
    
    // تحديث محتوى المودال
    modalDetails.innerHTML = `
        <div class="detail-group">
            <h4>بيانات القطعة الأساسية</h4>
            <div class="detail-item">
                <span class="detail-label">رقم القطعة</span>
                <span class="detail-value">${property.property.plotNumber}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">رقم المخطط</span>
                <span class="detail-value">${property.property.planNumber}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">الحي</span>
                <span class="detail-value">${property.property.neighborhood}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">المدينة</span>
                <span class="detail-value">${property.property.city}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">المساحة</span>
                <span class="detail-value">${property.property.area} م²</span>
            </div>
            ${property.property.block ? `
            <div class="detail-item">
                <span class="detail-label">البلوك</span>
                <span class="detail-value">${property.property.block}</span>
            </div>
            ` : ''}
            <div class="detail-item">
                <span class="detail-label">نوع الملكية</span>
                <span class="detail-value">${property.property.propertyType}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">الإحداثيات</span>
                <span class="detail-value">${property.property.coordinates}</span>
            </div>
        </div>
        <div class="detail-group">
            <h4>بيانات الوثائق</h4>
            <div class="detail-item">
                <span class="detail-label">رقم الوثيقة</span>
                <span class="detail-value">${property.basicData.documentNumber}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">تاريخ الوثيقة</span>
                <span class="detail-value">${utils.formatHijriDate(property.basicData.documentDate)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">تاريخ الوثيقة السابقة</span>
                <span class="detail-value">${utils.formatHijriDate(property.basicData.previousDocumentDate)}</span>
            </div>
        </div>
        <div class="detail-group">
            <h4>الإجراءات المتاحة</h4>
            <p class="conversion-note">يمكنك تقديم طلب لتحويل رخصة هذه القطعة من فندقي إلى سكني من خلال النقر على زر "طلب التحويل" أدناه.</p>
            <div class="conversion-benefits">
                <h5>فوائد التحويل</h5>
                <ul>
                    <li>تلبية الطلب المتزايد على الوحدات السكنية في المنطقة</li>
                    <li>تعزيز الاستثمار في القطاع العقاري</li>
                    <li>المساهمة في تحقيق رؤية المملكة 2030</li>
                </ul>
            </div>
        </div>
    `;
    
    // عرض المودال
    modal.classList.add('active');
    
    // إنشاء خريطة في المودال
    setTimeout(() => {
        const coordinates = utils.parseCoordinates(property.property.coordinates);
        if (coordinates && window.google) {
            const modalMap = new google.maps.Map(document.getElementById('modal-map'), {
                center: coordinates,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            
            // إضافة علامة للموقع
            new google.maps.Marker({
                position: coordinates,
                map: modalMap,
                title: `قطعة رقم ${property.property.plotNumber}`,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#3A2A24',
                    fillOpacity: 1,
                    strokeColor: '#C8B09A',
                    strokeWeight: 2,
                    scale: 10
                },
                animation: google.maps.Animation.DROP
            });
        }
    }, 300);
}