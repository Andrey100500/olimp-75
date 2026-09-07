/**
 * Скрипт для обработки форм и отправки данных на сервер
 * Содержит универсальное ядро отправки данных.
 */
document.addEventListener('DOMContentLoaded', function () {

    /**
     * Глобальная функция для отправки данных на Google Apps Script
     * @param {Object} payload - Объект с данными для отправки
     * @param {HTMLElement} btn - Кнопка, которую нужно визуально изменить при отправке
     * @param {Boolean} isCartMode - Флаг отправки именно из корзины (cart.html)
     */
    window.sendData = function(payload, btn, isCartMode = false) {
        
        // Визуальная блокировка кнопки, чтобы пользователь не нажал дважды
        if (btn) {
            btn.style.pointerEvents = 'none'; // Отключаем клики
            btn.style.opacity = '0.7';        // Делаем кнопку бледнее
            btn.innerText = 'ОТПРАВКА...';   // Меняем текст на статус загрузки
        }

        // Выполняем POST запрос к вашему обработчику Google Script
        fetch('https://script.google.com/macros/s/AKfycbzzuqkcy35T3QJ7pM8IdtzIBA5JnRp4Tsaf7vfHAEFe2Xk5AYMx4edW4GJJMW7tGaOe/exec', {
            method: 'POST',
            mode: 'no-cors', // Режим без проверки CORS для Google Scripts
            body: JSON.stringify(payload)
        })
            .then(() => {
                // Если отправка произошла из полноценной КОРЗИНЫ (страница cart.html)
                if (isCartMode) {
                    // Очищаем саму корзину в памяти
                    if (typeof window.clearCart === 'function') {
                        window.clearCart(); 
                    } else {
                        localStorage.removeItem('myShopCart');
                    }
                    // Очищаем текстовые поля формы на странице корзины
                    if (typeof window.clearCartFormFields === 'function') {
                        window.clearCartFormFields();
                    }
                }

                // --- ОЧИСТКА ПОЛЕЙ ДЛЯ ДИНАМИЧЕСКОЙ МОДАЛКИ (в 1 клик / звонок) ---
                const nameField = document.getElementById('u_name');
                const phoneField = document.getElementById('u_phone');
                const msgField = document.getElementById('u_msg');
                const privacyCheckbox = document.getElementById('u_privacy');
                
                if (nameField) nameField.innerText = "";
                if (phoneField) phoneField.innerText = "+7 (___) ___-__-__";
                if (msgField) msgField.innerText = "";
                if (privacyCheckbox) privacyCheckbox.checked = false;

                // Закрытие текущего динамического модального окна заказа (если оно открыто)
                const currentModalEl = document.getElementById('dynamicOrderModal');
                if (currentModalEl) {
                    const currentModal = bootstrap.Modal.getInstance(currentModalEl);
                    if (currentModal) currentModal.hide();
                }

                // Открытие нового модального окна с подтверждением
                showStatusModal('Заявка принята', 'Ваша заявка принята, мы с вами свяжемся.');
                
                // Возвращаем кнопку в исходное состояние
                if (btn) {
                    btn.style.pointerEvents = 'auto';
                    btn.style.opacity = '1';
                    btn.innerText = payload.t === "Перезвонить" ? 'ЖДУ ЗВОНКА' : 'ПОДТВЕРДИТЬ ЗАКАЗ';
                }
            })
            .catch((error) => {
                console.error('Ошибка отправки:', error);
                
                // Показываем окно ошибки
                showStatusModal('Ошибка отправки', 'К сожалению, произошла ошибка. Пожалуйста, попробуйте позже или позвоните нам.');
                
                if (btn) {
                    btn.style.pointerEvents = 'auto';
                    btn.style.opacity = '1';
                    btn.innerText = 'ОШИБКА. ПОВТОРИТЬ?';
                }
            });
    };

    /**
     * Создает и показывает информационное модальное окно (Уведомление об успехе)
     */
    function showStatusModal(title, message) {
        const modalId = 'statusInfoModal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow" style="border-radius: 14px;">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="fw-bold">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body py-4 text-center">
                        <div class="mb-3" style="color: #28a745;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                            </svg>
                        </div>
                        <p class="mb-0 text-muted" style="font-size: 1.1rem;">${message}</p>
                    </div>
                    <div class="modal-footer border-0 pt-0">
                        <button type="button" class="btn btn-dark w-100 py-2" data-bs-dismiss="modal" style="border-radius: 10px;">Понятно</button>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    }
});