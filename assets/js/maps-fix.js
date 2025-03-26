// حل مشاكل تهيئة الخرائط وظهور العلامات
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من تحميل Google Maps API
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.error('لم يتم تحميل Google Maps API بشكل صحيح!');
        loadGoogleMapsScript();
        return;
    }

    // تهيئة الخرائط بعد تأكيد تحميل الصفحة والـ API
    setTimeout(() => {
        // تهيئة الخرائط المصغرة للعقارات
        initializePropertyMiniMaps();

        // تأكد من أن خريطة المودال تعمل
        setupModalMapInitialization();
    }, 500);

    // التحقق من وجود الخريطة الرئيسية وتهيئتها
    const mainMapElement = document.getElementById('map');
    if (mainMapElement && typeof google.maps.Map === 'function') {
        setTimeout(() => {
            initializeMainMap();
        }, 300);
    }
});

// تحميل Google Maps API إذا لم يتم تحميله
function loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDw6thoxZITqFU-HsZMnUu6p5hy3xc-gv0&libraries=places&callback=initMapsAfterLoad";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    // إضافة دالة callback عالمية
    window.initMapsAfterLoad = function() {
        // تهيئة خرائط العقارات
        initializePropertyMiniMaps();
        
        // تهيئة الخريطة الرئيسية إذا كانت موجودة
        const mainMapElement = document.getElementById('map');
        if (mainMapElement) {
            initializeMainMap();
        }
    };
}

// تهيئة الخرائط المصغرة لبطاقات العقارات
function initializePropertyMiniMaps() {
    const propertyMapContainers = document.querySelectorAll('[id^="map-"]');
    
    if (propertyMapContainers.length > 0) {
        console.log(`تم العثور على ${propertyMapContainers.length} خريطة مصغرة للعقارات`);
        
        propertyMapContainers.forEach(mapContainer => {
            // استخراج رقم العقار من ID
            const propertyId = mapContainer.id.replace('map-', '');
            if (!propertyId) return;
            
            const propertyData = propertiesData.find(p => p.id === propertyId);
            if (!propertyData) return;
            
            // تحويل الإحداثيات
            const coordinates = parsePropertyCoordinates(propertyData.property.coordinates);
            if (!coordinates) return;
            
            try {
                // إنشاء خريطة مصغرة
                const miniMap = new google.maps.Map(mapContainer, {
                    center: coordinates,
                    zoom: 16,
                    disableDefaultUI: true,
                    draggable: false,
                    scrollwheel: false,
                    mapTypeId: google.maps.MapTypeId.SATELLITE
                });
                
                // إضافة علامة مميزة
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
                
                console.log(`تم تهيئة خريطة للعقار ${propertyId} بنجاح`);
            } catch (error) {
                console.error(`خطأ في تهيئة خريطة العقار ${propertyId}:`, error);
            }
        });
    } else {
        console.log('لم يتم العثور على خرائط مصغرة للعقارات');
    }
}

// تهيئة الخريطة الرئيسية
function initializeMainMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    console.log('تهيئة الخريطة الرئيسية...');
    
    try {
        // مركز الخريطة (الرياض)
        const riyadhCoords = { lat: 24.7136, lng: 46.6753 };
        
        // إنشاء الخريطة
        const mainMap = new google.maps.Map(mapElement, {
            center: riyadhCoords,
            zoom: 10,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            },
            zoomControl: true,
            streetViewControl: false
        });
        
        // إضافة علامات العقارات إلى الخريطة
        addPropertyMarkersToMap(mainMap);
        
        // تهيئة مستمعات الأحداث للخريطة
        setupMapControls(mainMap);
        
        console.log('تم تهيئة الخريطة الرئيسية بنجاح');
    } catch (error) {
        console.error('خطأ في تهيئة الخريطة الرئيسية:', error);
        
        // إظهار رسالة خطأ للمستخدم
        mapElement.innerHTML = `
            <div class="map-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>حدث خطأ أثناء تحميل الخريطة</p>
                <button onclick="location.reload()">إعادة المحاولة</button>
            </div>
        `;
        mapElement.style.display = 'flex';
        mapElement.style.justifyContent = 'center';
        mapElement.style.alignItems = 'center';
        mapElement.style.textAlign = 'center';
        mapElement.style.padding = '2rem';
    }
}

// إضافة علامات العقارات إلى الخريطة الرئيسية
function addPropertyMarkersToMap(map) {
    if (!propertiesData || !propertiesData.length) {
        console.error('بيانات العقارات غير متوفرة');
        return;
    }
    
    const bounds = new google.maps.LatLngBounds();
    const markers = [];
    let infoWindow = new google.maps.InfoWindow();
    
    propertiesData.forEach(property => {
        // تحويل الإحداثيات
        const coordinates = parsePropertyCoordinates(property.property.coordinates);
        if (!coordinates) return;
        
        bounds.extend(coordinates);
        
        // إنشاء العلامة
        const marker = new google.maps.Marker({
            position: coordinates,
            map: map,
            title: `قطعة أرض رقم ${property.property.plotNumber}`,
            animation: google.maps.Animation.DROP,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#3A2A24',
                fillOpacity: 0.9,
                strokeColor: '#C8B09A',
                strokeWeight: 2,
                scale: 8
            }
        });
        
        // محتوى نافذة المعلومات
        const infoContent = `
            <div class="info-window">
                <h3>قطعة أرض رقم ${property.property.plotNumber}</h3>
                <p><strong>الحي:</strong> ${property.property.neighborhood}</p>
                <p><strong>المساحة:</strong> ${property.property.area} م²</p>
                <button class="btn-info-details" data-id="${property.id}">عرض التفاصيل</button>
            </div>
        `;
        
        // إضافة مستمع للنقر
        marker.addListener('click', () => {
            infoWindow.close();
            infoWindow.setContent(infoContent);
            infoWindow.open(map, marker);
            
            // إضافة مستمع لزر التفاصيل بعد فتح النافذة
            google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
                document.querySelector('.btn-info-details').addEventListener('click', function() {
                    const propertyId = this.getAttribute('data-id');
                    showPropertyDetailsModal(propertyId);
                });
            });
        });
        
        markers.push(marker);
    });
    
    // ضبط الخريطة لتشمل جميع العلامات
    map.fitBounds(bounds);
    
    // تخزين العلامات للوصول إليها لاحقًا
    map.propertyMarkers = markers;
}

// إعداد مستمعات الأحداث للخريطة الرئيسية
function setupMapControls(map) {
    // التحكم في نطاق البحث
    const radiusSlider = document.getElementById('radius-slider');
    const radiusValue = document.getElementById('radius-value');
    
    if (radiusSlider && radiusValue) {
        radiusSlider.addEventListener('input', () => {
            const radius = parseInt(radiusSlider.value);
            radiusValue.textContent = radius + 'م';
            
            // تحديث دائرة البحث إذا كانت موجودة
            if (map.searchCircle) {
                map.searchCircle.setRadius(radius);
            }
        });
    }
    
    // زر البحث في الخريطة
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('map-search');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            searchOnMap(map, searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchOnMap(map, searchInput.value);
            }
        });
    }
    
    // أزرار الفلاتر
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // إزالة الحالة النشطة من جميع الأزرار
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // تطبيق الفلتر
            const filterType = btn.dataset.type;
            filterMapMarkers(map, filterType);
        });
    });
}

// البحث في الخريطة
function searchOnMap(map, query) {
    if (!query || !map) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: query + ' الرياض', region: 'sa' }, (results, status) => {
        if (status === 'OK' && results[0]) {
            // الانتقال إلى الموقع المطلوب
            map.setCenter(results[0].geometry.location);
            map.setZoom(15);
            
            // إضافة علامة للموقع المبحوث عنه
            const marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                animation: google.maps.Animation.DROP,
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }
            });
            
            // إضافة نافذة معلومات
            const infoWindow = new google.maps.InfoWindow({
                content: `<div><strong>${query}</strong><p>${results[0].formatted_address}</p></div>`
            });
            
            infoWindow.open(map, marker);
            
            // البحث عن الأماكن القريبة إذا تم تحديد نطاق
            const radius = parseInt(document.getElementById('radius-slider')?.value || 500);
            searchNearbyPlaces(map, results[0].geometry.location, radius);
        } else {
            alert('لم يتم العثور على نتائج للبحث');
        }
    });
}

// البحث عن الأماكن القريبة
function searchNearbyPlaces(map, location, radius) {
    // إزالة دائرة البحث السابقة إن وجدت
    if (map.searchCircle) {
        map.searchCircle.setMap(null);
    }
    
    // إنشاء دائرة بحث جديدة
    map.searchCircle = new google.maps.Circle({
        strokeColor: '#C8B09A',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#C8B09A',
        fillOpacity: 0.1,
        map: map,
        center: location,
        radius: radius
    });
    
    // إذا كانت خدمة البحث عن الأماكن متاحة
    if (google.maps.places && google.maps.places.PlacesService) {
        const service = new google.maps.places.PlacesService(map);
        
        // بحث عن الفنادق
        service.nearbySearch({
            location: location,
            radius: radius,
            type: ['lodging']
        }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                displayNearbyPlaces(results, 'فنادق');
            }
        });
        
        // بحث عن المنشآت الصناعية (محاكاة)
        setTimeout(() => {
            // هذه بيانات تجريبية لأن Google لا يوفر مباشرة بحث عن منشآت صناعية
            const mockResults = [
                {
                    name: "مصنع الرياض للمنتجات الصناعية",
                    vicinity: "المنطقة الصناعية، الرياض",
                    rating: 3.8,
                    types: ["factory"]
                },
                {
                    name: "مجمع المصانع الصناعية",
                    vicinity: "المصفاة، الرياض",
                    rating: 4.1,
                    types: ["factory"]
                },
                {
                    name: "مستودعات البضائع المركزية",
                    vicinity: "المنطقة الصناعية الثانية، الرياض",
                    rating: 3.5,
                    types: ["storage"]
                }
            ];
            
            displayNearbyPlaces(mockResults, 'منشآت صناعية');
        }, 500);
    }
}

// عرض الأماكن القريبة في قائمة
function displayNearbyPlaces(places, type) {
    const nearbyList = document.getElementById('nearby-list');
    if (!nearbyList) return;
    
    // إنشاء عنوان القسم للنوع
    const typeHeader = document.createElement('div');
    typeHeader.className = 'place-type';
    typeHeader.innerHTML = `<h5>${type} (${places.length})</h5>`;
    
    // إنشاء قائمة الأماكن
    const placesList = document.createElement('div');
    placesList.className = 'places-list';
    
    // إضافة الأماكن إلى القائمة
    places.forEach(place => {
        const placeItem = document.createElement('div');
        placeItem.className = 'place-item';
        placeItem.innerHTML = `
            <span>${place.name}</span>
            ${place.rating ? `<span class="place-rating">${place.rating} <i class="fas fa-star"></i></span>` : ''}
        `;
        placesList.appendChild(placeItem);
    });
    
    typeHeader.appendChild(placesList);
    
    // إضافة القسم إلى القائمة الرئيسية
    nearbyList.appendChild(typeHeader);
    
    // إظهار لوحة المعلومات
    document.querySelector('.map-info-panel')?.classList.add('active');
}

// فلترة علامات الخريطة
function filterMapMarkers(map, filterType) {
    // في تطبيق واقعي، ستحتاج لتصنيف العلامات وتطبيق الفلتر
    console.log(`تم تطبيق فلتر ${filterType} على الخريطة`);
}

// إعداد تهيئة خريطة المودال
function setupModalMapInitialization() {
    const modal = document.getElementById('property-details-modal');
    if (!modal) return;
    
    modal.addEventListener('transitionend', () => {
        if (modal.classList.contains('active')) {
            const modalMap = document.getElementById('modal-map');
            if (modalMap) {
                const propertyId = modalMap.dataset.propertyId;
                if (propertyId) {
                    initializeModalMap(propertyId);
                }
            }
        }
    });
}

// تهيئة خريطة المودال
function initializeModalMap(propertyId) {
    const modalMapElement = document.getElementById('modal-map');
    if (!modalMapElement) return;
    
    const property = propertiesData.find(p => p.id === propertyId);
    if (!property) return;
    
    const coordinates = parsePropertyCoordinates(property.property.coordinates);
    if (!coordinates) return;
    
    try {
        // إنشاء الخريطة
        const modalMap = new google.maps.Map(modalMapElement, {
            center: coordinates,
            zoom: 16,
            mapTypeControl: true,
            zoomControl: true,
            streetViewControl: true
        });
        
        // إضافة علامة للعقار
        new google.maps.Marker({
            position: coordinates,
            map: modalMap,
            animation: google.maps.Animation.DROP,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#3A2A24',
                fillOpacity: 0.9,
                strokeColor: '#C8B09A',
                strokeWeight: 2,
                scale: 10
            }
        });
        
        console.log(`تم تهيئة خريطة المودال للعقار ${propertyId} بنجاح`);
    } catch (error) {
        console.error(`خطأ في تهيئة خريطة المودال للعقار ${propertyId}:`, error);
        modalMapElement.innerHTML = '<div class="map-error">تعذر تحميل الخريطة</div>';
    }
}

// عرض تفاصيل العقار في المودال
function showPropertyDetailsModal(propertyId) {
    const modal = document.getElementById('property-details-modal');
    const modalTitle = document.getElementById('modal-title');
    const basicInfo = document.getElementById('basic-info');
    const propertyInfo = document.getElementById('property-info');
    const modalMap = document.getElementById('modal-map');
    
    if (!modal || !modalTitle || !basicInfo || !propertyInfo || !modalMap) {
        console.error('عناصر المودال غير متوفرة');
        return;
    }
    
    const property = propertiesData.find(p => p.id === propertyId);
    if (!property) {
        console.error(`العقار رقم ${propertyId} غير موجود`);
        return;
    }
    
    // تحديث عنوان المودال
    modalTitle.textContent = `تفاصيل قطعة الأرض رقم ${property.property.plotNumber}`;
    
    // تحديث البيانات الأساسية
    basicInfo.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">رقم الوثيقة:</span>
            <span class="detail-value">${property.basicData.documentNumber}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">تاريخ الوثيقة:</span>
            <span class="detail-value">${property.basicData.documentDate}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">تاريخ الوثيقة السابقة:</span>
            <span class="detail-value">${property.basicData.previousDocumentDate}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">المساحة:</span>
            <span class="detail-value">${property.basicData.area} م²</span>
        </div>
    `;
    
    // تحديث معلومات العقار
    propertyInfo.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">رقم هوية العقار:</span>
            <span class="detail-value">${property.property.propertyId}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">المدينة:</span>
            <span class="detail-value">${property.property.city}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">الحي:</span>
            <span class="detail-value">${property.property.neighborhood}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">رقم المخطط:</span>
            <span class="detail-value">${property.property.planNumber}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">رقم القطعة:</span>
            <span class="detail-value">${property.property.plotNumber}</span>
        </div>
        ${property.property.block ? `
        <div class="detail-item">
            <span class="detail-label">رقم البلوك:</span>
            <span class="detail-value">${property.property.block}</span>
        </div>
        ` : ''}
        <div class="detail-item">
            <span class="detail-label">نوع العقار:</span>
            <span class="detail-value">${property.property.propertyType}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">الإحداثيات:</span>
            <span class="detail-value">${property.property.coordinates}</span>
        </div>
    `;
    
    // تحديث الخريطة
    modalMap.dataset.propertyId = propertyId;
    modalMap.innerHTML = '<div class="loading-map">جاري تحميل الخريطة...</div>';
    
    // فتح المودال
    modal.classList.add('active');
}

// تحويل نص الإحداثيات إلى كائن إحداثيات جغرافية
function parsePropertyCoordinates(coordString) {
    try {
        // تنسيق المثال: "24°29'33.3"N 46°55'34.2"E"
        const latRegex = /(\d+)°(\d+)'([\d.]+)"([NS])/;
        const lngRegex = /(\d+)°(\d+)'([\d.]+)"([EW])/;
        
        const latMatch = coordString.match(latRegex);
        const lngMatch = coordString.match(lngRegex);
        
        if (!latMatch || !lngMatch) return null;
        
        // تحويل خط العرض
        const latDeg = parseInt(latMatch[1]);
        const latMin = parseInt(latMatch[2]);
        const latSec = parseFloat(latMatch[3]);
        const latDir = latMatch[4];
        
        // تحويل خط الطول
        const lngDeg = parseInt(lngMatch[1]);
        const lngMin = parseInt(lngMatch[2]);
        const lngSec = parseFloat(lngMatch[3]);
        const lngDir = lngMatch[4];
        
        let lat = latDeg + latMin/60 + latSec/3600;
        if (latDir === 'S') lat = -lat;
        
        let lng = lngDeg + lngMin/60 + lngSec/3600;
        if (lngDir === 'W') lng = -lng;
        
        return { lat, lng };
    } catch (error) {
        console.error('خطأ في تحويل الإحداثيات:', error);
        return null;
    }
}

// عند تحميل الصفحة، قم بتهيئة الخرائط
window.addEventListener('load', () => {
    // بدء تهيئة الخرائط بعد تأكد تحميل الصفحة
    setTimeout(() => {
        initializePropertyMiniMaps();
    }, 1000);
});
