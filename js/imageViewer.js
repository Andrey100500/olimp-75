/**
 * ПОЛНОЭКРАННАЯ ГАЛЕРЕЯ (LIGHTBOX) С ЭФФЕКТОМ ПРИ НАВЕДЕНИИ
 * 
 * Как использовать:
 * 1. В HTML добавить контейнер с атрибутом data-gallery-container
 * 2. Внутри разместить элементы .ui-media-wrapper с картинками .ui-map-img
 * 3. У каждой картинки заполнить атрибут alt (будет использован как заголовок)
 * 
 * Пример:
 * <div data-gallery-container>
 *   <div class="ui-media-wrapper">
 *     <img class="ui-map-img" src="img/1.webp" alt="Кухня с панорамным остеклением">
 *   </div>
 *   <div class="ui-media-wrapper">
 *     <img class="ui-map-img" src="img/2.webp" alt="Гостиная с камином">
 *   </div>
 * </div>
 * 
 * Особенности:
 * - При наведении появляется иконка лупы и изображение слегка увеличивается
 * - Автоматически ищет большие версии в папке /big/
 * - Навигация стрелками и кнопками
 * - Закрытие по ESC, клику на фон или крестик
 */

document.addEventListener('DOMContentLoaded', () => {
    // Добавляем иконку поиска ко всем оберткам
    const addSearchIcons = () => {
        document.querySelectorAll('.ui-media-wrapper').forEach(wrapper => {
            if (!wrapper.querySelector('.search-icon')) {
                const icon = document.createElement('div');
                icon.className = 'search-icon';
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="text-white" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0" />
                    <path d="M10.344 11.742q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1a6.5 6.5 0 0 1-1.398 1.4z" />
                    <path fill-rule="evenodd" d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5" />
                </svg>`;
                wrapper.appendChild(icon);
            }
        });
    };

    // Вызываем сразу и будем вызывать при динамических изменениях
    addSearchIcons();

    // Наблюдаем за появлением новых элементов
    const observer = new MutationObserver(() => {
        addSearchIcons();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Добавляем HTML структуру просмотрщика в body
    const viewerHTML = `
        <div id="imageViewer" class="viewer-container">
            <span class="close-viewer">&times;</span>
            <div class="viewer-content">
                <div class="img-wrapper position-relative d-inline-block">
                    <button class="prev-image" style="left: -60px;">&#10094;</button>
                    <img id="fullImage" src="" alt="View">
                    <button class="next-image" style="right: -60px;">&#10095;</button>
                </div>
                <div class="viewerCaption mt-2" id="viewerCaption"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', viewerHTML);

    // Получаем элементы просмотрщика
    const viewer = document.getElementById('imageViewer');
    const fullImg = document.getElementById('fullImage');
    const captionText = document.getElementById('viewerCaption');
    
    let currentGallery = [];
    let currentIndex = 0;

    const showImage = (index) => {
        if (index < 0) index = currentGallery.length - 1;
        if (index >= currentGallery.length) index = 0;
        currentIndex = index;

        const currentImg = currentGallery[currentIndex];
        const smallSrc = currentImg.src;
        const title = currentImg.alt || "Объект";
        
        const bigSrc = smallSrc.replace(/([^/]+)$/, 'big/$1');

        fullImg.classList.add('img-changing');

        const tempImg = new Image();
        tempImg.src = bigSrc;
        
        tempImg.onload = () => {
            fullImg.src = bigSrc;
            captionText.innerHTML = `<span class="fw-bold text-uppercase">${title}</span><br>
                                    <small class="opacity-75">Фото ${currentIndex + 1} из ${currentGallery.length}</small>`;
            
            fullImg.classList.remove('img-changing');
        };

        tempImg.onerror = () => {
            fullImg.src = smallSrc;
            captionText.innerHTML = `<span class="fw-bold text-uppercase">${title}</span><br>
                                    <small class="opacity-75">Фото ${currentIndex + 1} из ${currentGallery.length}</small>`;
            fullImg.classList.remove('img-changing');
        };
    };

    const openViewer = (index) => {
        showImage(index);
        viewer.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    const closeViewer = () => {
        viewer.classList.remove('show');
        setTimeout(() => {
            if (!viewer.classList.contains('show')) {
                fullImg.src = "";
            }
        }, 300);
        document.body.style.overflow = 'auto';
    };

    document.addEventListener('click', (e) => {
        const wrapper = e.target.closest('.ui-media-wrapper');
        if (!wrapper) return;

        const galleryContainer = wrapper.closest('[data-gallery-container]');
        if (!galleryContainer) return;

        currentGallery = Array.from(galleryContainer.querySelectorAll('.ui-map-img'));
        currentIndex = currentGallery.indexOf(wrapper.querySelector('img'));
        
        openViewer(currentIndex);
    });

    const navigate = (step) => {
        showImage(currentIndex + step);
    };

    document.querySelector('.next-image').onclick = (e) => { e.stopPropagation(); navigate(1); };
    document.querySelector('.prev-image').onclick = (e) => { e.stopPropagation(); navigate(-1); };
    document.querySelector('.close-viewer').onclick = closeViewer;
    viewer.onclick = (e) => { if (e.target === viewer) closeViewer(); };

    document.onkeydown = (e) => {
        if (!viewer.classList.contains('show')) return;
        if (e.key === "ArrowRight") navigate(1);
        if (e.key === "ArrowLeft") navigate(-1);
        if (e.key === "Escape") closeViewer();
    };
});