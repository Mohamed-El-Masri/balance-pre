// متغيرات عامة
let mainMap;
let markers = [];
let propertyMarkers = [];
let infoWindows = [];
let searchCircle;
let radiusInMeters = 500;
let currentInfoWindow = null;
let mapInfoPanel;
let placeService;
let selectedPropertyData = null;

// تهيئة الخريطة الرئيسية
function initMap() {
    // التحقق من وجود عنصر الخريطة
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // تهيئة الباني
    mapInfoPanel = document.querySelector('.map-info-panel');
    
    // إنشاء الخريطة مع الإعدادات الأولية
    mainMap = new google.maps.Map(mapContainer, {
        center: { lat: 24.4928, lng: 46.9072 }, // إحداثيات الرياض التقريبية
        zoom: 12,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_LEFT
        },
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: 'cooperative',
        styles: [
            {
                featureType: 'administrative',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#444444' }]
            },
            {
                featureType: 'landscape',
                elementType: 'all',
                stylers: [{ color: '#f2f2f2' }]
            },
            {
                featureType: 'poi',
                elementType: 'all',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });
    
    // إضافة خدمة الأماكن
    placeService = new google.maps.places.PlacesService(mainMap);
    
    // إضافة علامات قطع الأراضي
    addPropertyMarkers();
    
    // تهيئة عناصر التحكم في الخريطة
    initMapControls();
    
    // تهيئة خرائط بطاقات العقارات
    initPropertyMaps();
}

// إضافة علامات قطع الأراضي على الخريطة
function addPropertyMarkers() {
    if (!mainMap || !propertiesData) return;
    
    // مسح العلامات الحالية
    clearMarkers(propertyMarkers);
    propertyMarkers = [];
    
    // إضافة علامة لكل قطعة
    const bounds = new google.maps.LatLngBounds();
    
    propertiesData.forEach(property => {
        // تحليل الإحداثيات
        const coordinates = parseCoordinates(property.property.coordinates);
        
        if (coordinates) {
            const position = new google.maps.LatLng(coordinates.lat, coordinates.lng);
            bounds.extend(position);
            
            // إنشاء العلامة
            const marker = new google.maps.Marker({
                position: position,
                map: mainMap,
                title: `قطعة ${property.property.plotNumber}`,
                animation: google.maps.Animation.DROP,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#3A2A24',
                    fillOpacity: 0.9,
                    strokeColor: '#C8B09A',
                    strokeWeight: 2
                }
            });
            
            // إضافة نافذة معلومات
            const infoContent = `
                <div class="info-window">
                    <h3>قطعة رقم ${property.property.plotNumber}</h3>
                    <p><strong>المساحة:</strong> ${property.property.area} م²</p>
                    <p><strong>الحي:</strong> ${property.property.neighborhood}</p>
                    <div class="info-actions">
                        <button class="btn-info-details" data-id="${property.id}">عرض التفاصيل</button>
                    </div>
                </div>
            `;
            
            const infoWindow = new google.maps.InfoWindow({
                content: infoContent,
                maxWidth: 250
            });
            
            // إضافة مستمعات الأحداث
            marker.addListener('click', () => {
                // إغلاق النافذة النشطة
                if (currentInfoWindow) currentInfoWindow.close();
                
                // فتح النافذة الجديدة
                infoWindow.open({
                    anchor: marker,
                    map: mainMap
                });
                currentInfoWindow = infoWindow;
                
                // عرض معلومات العقار في اللوحة الجانبية
                showPropertyInfo(property);
                
                // البحث عن الأماكن القريبة
                searchNearbyPlaces(coordinates);
            });
            
            // مستمع للنقر على زر التفاصيل في نافذة المعلومات
            google.maps.event.addListener(infoWindow, 'domready', () => {
                const detailsBtn = document.querySelector('.btn-info-details');
                if (detailsBtn) {
                    detailsBtn.addEventListener('click', () => {
                        // عرض تفاصيل العقار في المودال
                        showPropertyDetails(detailsBtn.dataset.id);
                    });
                }
            });
            
            // إضافة العلامة للمصفوفة
            propertyMarkers.push(marker);
        }
    });
    
    // ضبط حدود الخريطة لإظهار جميع العلامات
    mainMap.fitBounds(bounds);
}

// عرض معلومات العقار في اللوحة الجانبية
function showPropertyInfo(property) {
    selectedPropertyData = property;
    const infoElement = document.getElementById('selected-property-info');
    
    if (infoElement) {
        infoElement.innerHTML = `
            <h4>قطعة أرض ${property.property.plotNumber}</h4>
            <div class="property-info-details">
                <p><strong>الحي:</strong> ${property.property.neighborhood}</p>
                <p><strong>المساحة:</strong> ${property.property.area} م²</p>
                <p><strong>رقم المخطط:</strong> ${property.property.planNumber}</p>
                <p><strong>رقم الوثيقة:</strong> ${property.basicData.documentNumber}</p>
                <p><strong>تاريخ الوثيقة:</strong> ${property.basicData.documentDate}</p>
                <button class="btn btn-primary btn-sm mt-2" id="show-property-details">عرض كافة التفاصيل</button>
            </div>
        `;
        
        // إضافة مستمع لزر التفاصيل
        const detailsBtn = document.getElementById('show-property-details');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', () => {
                showPropertyDetails(property.id);
            });
        }
    }
    
    // عرض لوحة المعلومات
    mapInfoPanel.classList.add('active');
}

// البحث عن الأماكن القريبة
function searchNearbyPlaces(coordinates) {
    // التحقق من وجود إحداثيات صالحة
    if (!coordinates || !placeService) return;
    
    // إزالة العلامات السابقة
    clearMarkers(markers);
    markers = [];
    
    // تحديث نص المكان القريب
    document.getElementById('nearby-list').innerHTML = `
        <div class="loading-places">
            <p>جاري البحث عن الأماكن القريبة...</p>
        </div>
    `;
    
    // تحديد دائرة البحث
    if (searchCircle) searchCircle.setMap(null);
    
    searchCircle = new google.maps.Circle({
        center: coordinates,
        radius: radiusInMeters,
        strokeColor: 'var(--secondary-color)',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: 'var(--primary-light)',
        fillOpacity: 0.35,
        map: mainMap
    });
    
    // طلب بحث الأماكن القريبة
    const request = {
        location: coordinates,
        radius: radiusInMeters,
        type: ['establishment']
    };
    
    placeService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // تصنيف النتائج
            const categorizedPlaces = {
                hotels: [],
                restaurants: [],
                stores: [],
                industries: [],
                others: []
            };
            
            results.forEach(place => {
                if (place.types.includes('lodging')) {
                    categorizedPlaces.hotels.push(place);
                } else if (place.types.includes('restaurant') || place.types.includes('food')) {
                    categorizedPlaces.restaurants.push(place);
                } else if (place.types.includes('store') || place.types.includes('shopping_mall')) {
                    categorizedPlaces.stores.push(place);
                } else if (place.types.includes('factory') || place.types.includes('industrial')) {
                    categorizedPlaces.industries.push(place);
                } else {
                    categorizedPlaces.others.push(place);
                }
                
                // إضافة علامة للمكان
                addPlaceMarker(place);
            });
            
            // عرض الأماكن القريبة
            displayNearbyPlaces(categorizedPlaces);
        } else {
            document.getElementById('nearby-list').innerHTML = `
                <div class="no-places">
                    <p>لم يتم العثور على أماكن قريبة</p>
                </div>
            `;
        }
    });
}

// إضافة علامة لمكان قريب
function addPlaceMarker(place) {
    let icon = {
        url: place.icon,
        size: new google.maps.Size(25, 25),
        scaledSize: new google.maps.Size(25, 25),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(12.5, 12.5)
    };
    
    // إنشاء العلامة
    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: mainMap,
        title: place.name,
        icon: icon,
        animation: google.maps.Animation.DROP,
        opacity: 0.8
    });
    
    // إضافة نافذة معلومات
    const infoContent = `
        <div class="info-window">
            <h3>${place.name}</h3>
            ${place.vicinity ? `<p>${place.vicinity}</p>` : ''}
            ${place.rating ? `<p><strong>التقييم:</strong> ${place.rating} ⭐</p>` : ''}
        </div>
    `;
    
    const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
        maxWidth: 200
    });
    
    // إضافة مستمع للنقر
    marker.addListener('click', () => {
        // إغلاق النافذة النشطة
        if (currentInfoWindow) currentInfoWindow.close();
        
        // فتح النافذة الجديدة
        infoWindow.open({
            anchor: marker,
            map: mainMap
        });
        currentInfoWindow = infoWindow;
    });
    
    // إضافة العلامة للمصفوفة
    markers.push(marker);
}

// عرض الأماكن القريبة في اللوحة الجانبية
function displayNearbyPlaces(categorizedPlaces) {
    const nearbyList = document.getElementById('nearby-list');
    nearbyList.innerHTML = '';
    
    // إنشاء قسم للفنادق
    if (categorizedPlaces.hotels.length > 0) {
        let hotelsHtml = `
            <div class="place-type">
                <h5><i class="fas fa-hotel"></i> فنادق</h5>
                <div class="places-list">
        `;
        
        categorizedPlaces.hotels.forEach(hotel => {
            hotelsHtml += `
                <div class="place-item">
                    <span>${hotel.name}</span>
                    ${hotel.rating ? `<span class="place-rating">${hotel.rating} <i class="fas fa-star"></i></span>` : ''}
                </div>
            `;
        });
        
        hotelsHtml += `</div></div>`;
        nearbyList.innerHTML += hotelsHtml;
    }
    
    // إنشاء قسم للمطاعم
    if (categorizedPlaces.restaurants.length > 0) {
        let restaurantsHtml = `
            <div class="place-type">
                <h5><i class="fas fa-utensils"></i> مطاعم</h5>
                <div class="places-list">
        `;
        
        categorizedPlaces.restaurants.forEach(restaurant => {
            restaurantsHtml += `
                <div class="place-item">
                    <span>${restaurant.name}</span>
                    ${restaurant.rating ? `<span class="place-rating">${restaurant.rating} <i class="fas fa-star"></i></span>` : ''}
                </div>
            `;
        });
        
        restaurantsHtml += `</div></div>`;
        nearbyList.innerHTML += restaurantsHtml;
    }
    
    // إنشاء قسم للمتاجر
    if (categorizedPlaces.stores.length > 0) {
        let storesHtml = `
            <div class="place-type">
                <h5><i class="fas fa-store"></i> متاجر</h5>
                <div class="places-list">
        `;
        
        categorizedPlaces.stores.forEach(store => {
            storesHtml += `
                <div class="place-item">
                    <span>${store.name}</span>
                    ${store.rating ? `<span class="place-rating">${store.rating} <i class="fas fa-star"></i></span>` : ''}
                </div>
            `;
        });
        
        storesHtml += `</div></div>`;
        nearbyList.innerHTML += storesHtml;
    }
    
    // إنشاء قسم للمصانع
    if (categorizedPlaces.industries.length > 0) {
        let industriesHtml = `
            <div class="place-type">
                <h5><i class="fas fa-industry"></i> منشآت صناعية</h5>
                <div class="places-list">
        `;
        
        categorizedPlaces.industries.forEach(industry => {
            industriesHtml += `
                <div class="place-item">
                    <span>${industry.name}</span>
                    ${industry.rating ? `<span class="place-rating">${industry.rating} <i class="fas fa-star"></i></span>` : ''}
                </div>
            `;
        });
        
        industriesHtml += `</div></div>`;
        nearbyList.innerHTML += industriesHtml;
    }
    
    // إنشاء قسم للأماكن الأخرى
    if (categorizedPlaces.others.length > 0) {
        let othersHtml = `
            <div class="place-type">
                <h5><i class="fas fa-map-marker-alt"></i> أماكن أخرى</h5>
                <div class="places-list">
        `;
        
        categorizedPlaces.others.forEach(other => {
            othersHtml += `
                <div class="place-item">
                    <span>${other.name}</span>
                    ${other.rating ? `<span class="place-rating">${other.rating} <i class="fas fa-star"></i></span>` : ''}
                </div>
            `;
        });
        
        othersHtml += `</div></div>`;
        nearbyList.innerHTML += othersHtml;
    }
    
    // إذا لم يتم العثور على أي أماكن
    if (Object.values(categorizedPlaces).every(arr => arr.length === 0)) {
        nearbyList.innerHTML = `
            <div class="no-places">
                <p>لم يتم العثور على أماكن قريبة في نطاق ${radiusInMeters} متر</p>
                <button class="btn btn-secondary btn-sm mt-3" id="increase-radius">زيادة نطاق البحث</button>
            </div>
        `;
        
        const increaseRadiusBtn = document.getElementById('increase-radius');
        if (increaseRadiusBtn) {
            increaseRadiusBtn.addEventListener('click', () => {
                radiusInMeters += 500;
                document.getElementById('radius-value').textContent = `${radiusInMeters}م`;
                document.getElementById('radius-slider').value = radiusInMeters;
                searchNearbyPlaces(selectedPropertyData ? parseCoordinates(selectedPropertyData.property.coordinates) : null);
            });
        }
    }
}

// تهيئة عناصر التحكم في الخريطة
function initMapControls() {
    // تهيئة شريط تمرير نطاق البحث
    const radiusSlider = document.getElementById('radius-slider');
    const radiusValue = document.getElementById('radius-value');
    
    if (radiusSlider) {
        radiusSlider.addEventListener('input', () => {
            radiusInMeters = parseInt(radiusSlider.value);
            radiusValue.textContent = `${radiusInMeters}م`;
            
            // تحديث نطاق البحث إذا كان هناك عقار محدد
            if (selectedPropertyData) {
                const coordinates = parseCoordinates(selectedPropertyData.property.coordinates);
                if (coordinates) {
                    searchNearbyPlaces(coordinates);
                }
            }
        });
    }
    
    // تهيئة أزرار فلترة الأماكن
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // إزالة الحالة النشطة من جميع الأزرار
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // إضافة الحالة النشطة للزر المحدد
            btn.classList.add('active');
            
            // تطبيق الفلتر على الخريطة
            const filterType = btn.dataset.type;
            filterMapMarkers(filterType);
        });
    });
    
    // تهيئة زر البحث
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('map-search');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            searchLocation(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchLocation(searchInput.value);
            }
        });
    }
    
    // تهيئة زر إغلاق لوحة المعلومات
    const closePanelBtn = document.querySelector('.close-panel');
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', () => {
            mapInfoPanel.classList.remove('active');
        });
    }
}

// البحث عن موقع
function searchLocation(query) {
    if (!query || !mainMap) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: query }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
            mainMap.setCenter(results[0].geometry.location);
            mainMap.setZoom(15);
            
            // إضافة علامة للموقع المبحوث عنه
            const searchMarker = new google.maps.Marker({
                position: results[0].geometry.location,
                map: mainMap,
                animation: google.maps.Animation.DROP,
                title: query,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: 'var(--accent-color)',
                    fillOpacity: 0.9,
                    strokeColor: 'var(--white)',
                    strokeWeight: 2
                }
            });
            
            // إضافة نافذة معلومات
            const infoContent = `
                <div class="info-window">
                    <h3>${query}</h3>
                    <p>${results[0].formatted_address}</p>
                </div>
            `;
            
            const infoWindow = new google.maps.InfoWindow({
                content: infoContent,
                maxWidth: 250
            });
            
            searchMarker.addListener('click', () => {
                if (currentInfoWindow) currentInfoWindow.close();
                infoWindow.open({
                    anchor: searchMarker,
                    map: mainMap
                });
                currentInfoWindow = infoWindow;
            });
            
            // فتح نافذة المعلومات تلقائيًا
            infoWindow.open({
                anchor: searchMarker,
                map: mainMap
            });
            currentInfoWindow = infoWindow;
        } else {
            alert('لم يتم العثور على الموقع. يرجى المحاولة بعبارات بحث أخرى.');
        }
    });
}

// فلترة علامات الخريطة
function filterMapMarkers(filterType) {
    markers.forEach(marker => {
        if (filterType === 'all') {
            marker.setVisible(true);
        } else {
            // تحديد نوع المكان من العنوان
            const title = marker.getTitle() || '';
            let showMarker = false;
            
            switch(filterType) {
                case 'hotel':
                    showMarker = title.includes('فندق') || 
                                title.includes('نزل') || 
                                title.includes('شقق فندقية');
                    break;
                case 'industry':
                    showMarker = title.includes('مصنع') || 
                                title.includes('منشأة') || 
                                title.includes('ورشة') || 
                                title.includes('مستودع');
                    break;
                case 'store':
                    showMarker = title.includes('محل') || 
                                title.includes('متجر') || 
                                title.includes('سوق') || 
                                title.includes('مركز');
                    break;
                case 'restaurant':
                    showMarker = title.includes('مطعم') || 
                                title.includes('مقهى') || 
                                title.includes('كافيه') || 
                                title.includes('كافتيريا');
                    break;
            }
            
            marker.setVisible(showMarker);
        }
    });
}

// تهيئة خرائط بطاقات العقارات
function initPropertyMaps() {
    propertiesData.forEach(property => {
        const mapContainer = document.getElementById(`map-${property.id}`);
        if (!mapContainer) return;
        
        const coordinates = parseCoordinates(property.property.coordinates);
        if (!coordinates) return;
        
        // إنشاء خريطة مصغرة
        const propertyMap = new google.maps.Map(mapContainer, {
            center: coordinates,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            clickableIcons: false,
            draggable: false,
            scrollwheel: false
        });
        
        // إضافة علامة للعقار
        new google.maps.Marker({
            position: coordinates,
            map: propertyMap,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: 'var(--primary-color)',
                fillOpacity: 1,
                strokeColor: 'var(--white)',
                strokeWeight: 2
            }
        });
    });
}

// تهيئة خريطة التفاصيل في المودال
function initModalMap(propertyId) {
    const property = propertiesData.find(p => p.id === propertyId);
    if (!property) return;
    
    const coordinates = parseCoordinates(property.property.coordinates);
    if (!coordinates) return;
    
    const modalMap = new google.maps.Map(document.getElementById('modal-map'), {
        center: coordinates,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        zoomControl: true,
        streetViewControl: true
    });
    
    // إضافة علامة للعقار
    const marker = new google.maps.Marker({
        position: coordinates,
        map: modalMap,
        animation: google.maps.Animation.DROP,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: 'var(--primary-color)',
            fillOpacity: 0.9,
            strokeColor: 'var(--secondary-color)',
            strokeWeight: 2
        }
    });
    
    // تحليل المنطقة المحيطة
    updateNearbyAnalysis(coordinates, property);
}

// تحديث تحليل المنطقة المحيطة
function updateNearbyAnalysis(coordinates, property) {
    const analysisContainer = document.getElementById('nearby-analysis-data');
    if (!analysisContainer) return;
    
    analysisContainer.innerHTML = `
        <div class="loading-analysis">
            <p>جاري تحليل المنطقة المحيطة...</p>
        </div>
    `;
    
    // بدء تحليل المنطقة المحيطة
    setTimeout(() => {
        // هذا محاكاة لتحليل حقيقي - في تطبيق واقعي، سيتم استبداله بطلبات API حقيقية
        const analysis = analyzeSurroundingArea(coordinates);
        
        analysisContainer.innerHTML = `
            <div class="analysis-results">
                <div class="analysis-item">
                    <h5><i class="fas fa-hotel"></i> المنشآت الفندقية القريبة</h5>
                    <div class="analysis-detail">
                        <span class="detail-label">العدد</span>
                        <span class="detail-value">${analysis.hotels.count}</span>
                    </div>
                    <div class="analysis-detail">
                        <span class="detail-label">متوسط الإشغال</span>
                        <span class="detail-value">${analysis.hotels.occupancy}%</span>
                    </div>
                    <div class="analysis-detail">
                        <span class="detail-label">متوسط التقييم</span>
                        <span class="detail-value">${analysis.hotels.rating}/5</span>
                    </div>
                    <div class="analysis-recommendation ${analysis.hotels.recommendConversion ? 'positive' : 'negative'}">
                        <i class="fas ${analysis.hotels.recommendConversion ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        <span>${analysis.hotels.recommendConversion ? 'مناسب للتحويل' : 'غير مناسب للتحويل'}</span>
                    </div>
                </div>
                
                <div class="analysis-item">
                    <h5><i class="fas fa-industry"></i> المنشآت الصناعية القريبة</h5>
                    <div class="analysis-detail">
                        <span class="detail-label">العدد</span>
                        <span class="detail-value">${analysis.industry.count}</span>
                    </div>
                    <div class="analysis-detail">
                        <span class="detail-label">عدد العمال المقدر</span>
                        <span class="detail-value">${analysis.industry.workers}</span>
                    </div>
                    <div class="analysis-recommendation ${analysis.industry.needForHousing ? 'positive' : 'negative'}">
                        <i class="fas ${analysis.industry.needForHousing ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        <span>${analysis.industry.needForHousing ? 'حاجة عالية للسكن' : 'حاجة منخفضة للسكن'}</span>
                    </div>
                </div>
                
                <div class="analysis-summary">
                    <h5><i class="fas fa-chart-line"></i> ملخص التحليل</h5>
                    <div class="summary-score">
                        <span class="score-label">نسبة ملاءمة التحويل</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${analysis.conversionScore}%;"></div>
                        </div>
                        <span class="score-value">${analysis.conversionScore}%</span>
                    </div>
                    <p class="summary-text">${analysis.summaryText}</p>
                </div>
            </div>
        `;
    }, 1500);
}

// دالة لتحليل المنطقة المحيطة (بيانات تجريبية)
function analyzeSurroundingArea(coordinates) {
    // في تطبيق حقيقي، سيتم استبدال هذا بتحليل فعلي باستخدام بيانات حقيقية
    return {
        hotels: {
            count: Math.floor(Math.random() * 5) + 2,
            occupancy: Math.floor(Math.random() * 30) + 30,
            rating: (Math.random() * 2 + 2).toFixed(1),
            recommendConversion: true
        },
        industry: {
            count: Math.floor(Math.random() * 10) + 15,
            workers: Math.floor(Math.random() * 500) + 500,
            needForHousing: true
        },
        conversionScore: Math.floor(Math.random() * 20) + 75,
        summaryText: "بناءً على تحليل المنطقة المحيطة، يوصى بتحويل هذه القطعة من فندقي إلى سكني نظرًا للحاجة العالية للسكن المحيطة بالمنشآت الصناعية والطلب المنخفض على الفنادق في المنطقة."
    };
}

// مسح العلامات الحالية
function clearMarkers(markersArray) {
    if (markersArray) {
        markersArray.forEach(marker => {
            marker.setMap(null);
        });
    }
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

// تصدير الدوال للاستخدام العام
window.mapFunctions = {
    initMap,
    addPropertyMarkers,
    showPropertyDetails: function(propertyId) {
        // عرض تفاصيل القطعة في المودال
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
        
        // عرض المودال
        modal.classList.add('active');
        
        // تهيئة خريطة المودال
        setTimeout(() => {
            initModalMap(propertyId);
        }, 300);
    }
};