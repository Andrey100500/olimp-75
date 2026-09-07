// Модальное окно для карт (Яндекс/Google Maps) - START
/**
 * Открывает модальное окно с картой
 * @param {string} url - Ссылка на карту (Яндекс.Карты, Google Maps и т.д.)
 * 
 * Что делает:
 * 1. Создает затемненный фон во всю страницу
 * 2. В центре отображает белый блок с iframe (карта)
 * 3. Блокирует прокрутку основного сайта
 * 4. Закрытие возможно:
 *    - по кнопке "Закрыть"
 *    - по клику на затемненный фон
 * 5. При закрытии удаляет модалку и возвращает прокрутку
 */
function openMapModal(url) {
    // Создаем структуру модального окна
    const modalHtml = `
        <div id="mapModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div style="position: relative; width: 100%; max-width: 900px; height: 80vh; background: #fff; border-radius: 12px; overflow: hidden;">
                <button onclick="this.closest('#mapModal').remove(); document.body.style.overflow=''" 
                        style="position: absolute; top: 10px; right: 10px; z-index: 10; border: none; background: #E67E22; color: #fff; border-radius: 5px; padding: 5px 15px; cursor: pointer;">
                    Закрыть
                </button>
                <iframe src="${url}" width="100%" height="100%" frameborder="0" allowfullscreen="true"></iframe>
            </div>
        </div>`;

    // Добавляем в body и отключаем скролл
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';

    // Закрытие по клику на фон
    document.getElementById('mapModal').addEventListener('click', function (e) {
        if (e.target === this) {
            this.remove();
            document.body.style.overflow = '';
        }
    });
}
// Модальное окно для карт (Яндекс/Google Maps) - END