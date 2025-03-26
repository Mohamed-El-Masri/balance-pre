
// وظائف خاصة بالخريطة
document.addEventListener('DOMContentLoaded', () => {
    // متغيرات الخريطة
    let map;
    let markers = [];
    let infoWindow;
    let searchRadius = 500;
    let activeMarker = null;
    let searchCircle = null;
    
    // تهيئة الخريطة
    window.initMap = function() {
        // مركز الخريطة (الرياض)
        const riyadh = { lat: 24.7136, lng: 46.6753 };
        
        // إنشاء خريطة جديدة
        map = new google.maps.Map(document.getElementById('map'), {
            center: riyadh,
            zoom: 12,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                mapTypeIds: ['roadmap', 'satellite', 'terrain']
            },
            fullscreenControl: true,
            streetViewControl: true,
            zoomControl: true
        });
        
        // إنشاء InfoWindow للعرض
        infoWindow = new google.maps.InfoWindow();
        
        // إضافة العقارات إلى الخريطة
        addPropertiesToMap();
        
        // تفعيل مستمع الأحداث للخريطة
        setupMapEventListeners();
        
        // تفعيل ضبط نطاق البحث
        setupRadiusControl();
        
        // تفعيل مرشحات الأماكن
        setupPlaceFilters();
    };
    
    // إضافة العقارات إلى الخريطة
    function addPropertiesToMap() {
        propertiesData.forEach(property => {
            // تحويل الإحداثيات من نص إلى أرقام
            const coords = parseCoordinates(property.property.coordinates);
            if (coords) {
                const marker = new google.maps.Marker({
                    position: coords,
                    map: map,
                    title: `قطعة أرض رقم ${property.property.plotNumber}`,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#3A2A24',
                        fillOpacity: 1,
                        strokeColor: '#C8B09A',
                        strokeWeight: 2,
                        scale: 8
                    },
                    animation: google.maps.Animation.DROP,
                    propertyId: property.id
                });
                
                marker.addListener('click', () => {
                    showPropertyInfo(property, marker);
                });
                
                markers.push(marker);
            }
        });
    }
    
    // تحويل النص إلى إحداثيات
    function parseCoordinates(coordString) {
        try {
            // تنسيق المثال: "24°29'33.3"N 46°55'34.2"E"
            const parts = coordString.split(' ');
            
            // تحويل خط العرض
            const latStr = parts[0].replace('"N', '');
            const latDeg = parseFloat(latStr.split('°')[0]);
            const latMin = parseFloat(latStr.split('°')[1].split("'")[0]);
            const latSec = parseFloat(latStr.split('°')[1].split("'")[1].replace('"', ''));
            const lat = latDeg + (latMin / 60) + (latSec / 3600);
            
            // تحويل خط الطول
            const lngStr = parts[1].replace('"E', '');
            const lngDeg = parseFloat(lngStr.split('°')[0]);
            const lngMin = parseFloat(lngStr.split('°')[1].split("'")[0]);
            const lngSec = parseFloat(lngStr.split('°')[1].split("'")[1].replace('"', ''));
            const lng = lngDeg + (lngMin / 60) + (lngSec / 3600);
            
            return { lat, lng };
        } catch (error) {
            console.error('خطأ في تحليل الإحداثيات:', coordString, error);
            return null;
        }
    }
    
    // عرض معلومات العقار
    function showPropertyInfo(property, marker) {
        // تغيير مؤشر العقار النشط
        if (activeMarker) {
            activeMarker.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#3A2A24',
                fillOpacity: 1,
                strokeColor: '#C8B09A',
                strokeWeight: 2,
                scale: 8
            });
        }
        
        marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#C8B09A',
            fillOpacity: 1,
            strokeColor: '#3A2A24',
            strokeWeight: 2,
            scale: 10
        });
        
        activeMarker = marker;
        
        // إنشاء محتوى InfoWindow
        const content = `
            <div class="info-window">
                <h3>قطعة أرض رقم ${property.property.plotNumber}</h3>
                <p>المخطط: ${property.property.planNumber}</p>
                <p>الحي: ${property.property.neighborhood}</p>
                <p>المساحة: ${property.property.area} م²</p>
                <div class="info-actions">
                    <button class="btn-info-details" data-id="${property.id}">عرض التفاصيل</button>
                </div>
            </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        
        // تفعيل زر التفاصيل
        setTimeout(() => {
            const detailsBtn = document.querySelector('.btn-info-details');
            if (detailsBtn) {
                detailsBtn.addEventListener('click', () => {
                    showPropertyDetails(property.id);
                });
            }
        }, 100);
        
        // تحديث لوحة المعلومات
        updateInfoPanel(property);
        
        // البحث عن الأماكن القريبة
        searchNearbyPlaces(marker.getPosition());
    }
    
    // تحديث لوحة المعلومات
    function updateInfoPanel(property) {
        const infoPanel = document.querySelector('.map-info-panel');
        const propertyInfo = document.getElementById('selected-property-info');
        
        propertyInfo.innerHTML = `
            <h4>قطعة أرض رقم ${property.property.plotNumber}</h4>
            <div class="property-info-details">
                <p><strong>الحي:</strong> ${property.property.neighborhood}</p>
                <p><strong>المساحة:</strong> ${property.property.area} م²</p>
                <p><strong>رقم الوثيقة:</strong> ${property.basicData.documentNumber}</p>
                <p><strong>تاريخ الوثيقة:</strong> ${property.basicData.documentDate}</p>
            </div>
        `;
        
        infoPanel.classList.add('active');
    }
    
    // البحث عن الأماكن القريبة
    function searchNearbyPlaces(location) {
        if (searchCircle) {
            searchCircle.setMap(null);
        }
        
        searchCircle = new google.maps.Circle({
            strokeColor: '#C8B09A',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#C8B09A',
            fillOpacity: 0.1,
            map: map,
            center: location,
            radius: searchRadius
        });
        
        // تهيئة خدمة البحث عن الأماكن
        const service = new google.maps.places.PlacesService(map);
        
        // البحث عن الفنادق
        service.nearbySearch({
            location: location,
            radius: searchRadius,
            type: ['lodging']
        }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                displayNearbyPlaces(results, 'فنادق');
            }
        });
        
        // البحث عن المطاعم
        service.nearbySearch({
            location: location,
            radius: searchRadius,
            type: ['restaurant']
        }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                displayNearbyPlaces(results, 'مطاعم');
            }
        });
    }
    
    // عرض الأماكن القريبة
    function displayNearbyPlaces(places, type) {
        const nearbyList = document.getElementById('nearby-list');
        
        // إضافة عنوان النوع إذا لم يكن موجودًا
        const typeHeader = document.querySelector(`#nearby-list .place-type[data-type="${type}"]`);
        if (!typeHeader && places.length > 0) {
            nearbyList.innerHTML += `
                <div class="place-type" data-type="${type}">
                    <h5>${type} (${places.length})</h5>
                    <div class="places-list" id="${type}-list"></div>
                </div>
            `;
        }
        
        // إضافة الأماكن
        const placesList = document.getElementById(`${type}-list`);
        if (placesList) {
            places.forEach(place => {
                placesList.innerHTML += `
                    <div class="place-item">
                        <div class="place-name">${place.name}</div>
                        <div class="place-rating">
                            ${place.rating ? `<span>${place.rating}</span> <i class="fas fa-star"></i>` : 'لا يوجد تقييم'}
                        </div>
                    </div>
                `;
            });
        }
    }
    
    // إعداد تحكم نطاق البحث
    function setupRadiusControl() {
        const radiusSlider = document.getElementById('radius-slider');
        const radiusValue = document.getElementById('radius-value');
        
        radiusSlider.addEventListener('input', () => {
            searchRadius = parseInt(radiusSlider.value);
            radiusValue.innerText = `${searchRadius}م`;
            
            if (activeMarker && searchCircle) {
                searchCircle.setRadius(searchRadius);
                searchNearbyPlaces(activeMarker.getPosition());
            }
        });
    }
    
    // إعداد مرشحات الأماكن
    function setupPlaceFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // إزالة الحالة النشطة من جميع الأزرار
                filterButtons.forEach(b => b.classList.remove('active'));
                
                // إضافة الحالة النشطة للزر المحدد
                btn.classList.add('active');
                
                // تصفية الأماكن حسب النوع
                const filterType = btn.dataset.type;
                filterPlaces(filterType);
            });
        });
    }
    
    // تصفية الأماكن
    function filterPlaces(type) {
        const placeTypes = document.querySelectorAll('.place-type');
        
        if (type === 'all') {
            placeTypes.forEach(placeType => {
                placeType.style.display = 'block';
            });
        } else {
            placeTypes.forEach(placeType => {
                if (placeType.dataset.type === type) {
                    placeType.style.display = 'block';
                } else {
                    placeType.style.display = 'none';
                }
            });
        }
    }
    
    // إعداد مستمعي أحداث الخريطة
    function setupMapEventListeners() {
        // إغلاق لوحة المعلومات
        const closePanel = document.querySelector('.close-panel');
        closePanel.addEventListener('click', () => {
            document.querySelector('.map-info-panel').classList.remove('active');
        });
        
        // البحث في الخريطة
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('map-search');
        
        searchBtn.addEventListener('click', () => {
            searchLocation(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchLocation(searchInput.value);
            }
        });
    }
    
    // البحث عن موقع
    function searchLocation(query) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: query + ' الرياض' }, (results, status) => {
            if (status === 'OK' && results[0]) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(15);
                
                new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    title: query,
                    icon: {
                        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                        fillColor: '#f59e0b',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#fff',
                        scale: 7
                    },
                    animation: google.maps.Animation.DROP
                });
            } else {
                alert('لم يتم العثور على الموقع');
            }
        });
    }
});
