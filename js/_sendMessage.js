/**
 * Скрипт для обработки форм и отправки данных на сервер
 * Поддерживает создание динамических модальных окон для заказов и обратных звонков.
 */
document.addEventListener('DOMContentLoaded', function () {

    /**
     * Глобальная функция для отправки данных на Google Apps Script
     * @param {Object} payload - Объект с данными для отправки
     * @param {HTMLElement} btn - Кнопка, которую нужно визуально изменить при отправке
     */
    window.sendData = function(payload, btn) {
        
        // --- ПРОВЕРКА ТЕЛЕФОНА НА СТРАНИЦЕ КОРЗИНЫ ---
        const cartPhoneInput = document.getElementById('order-phone');
        if (cartPhoneInput) {
            const phoneValue = cartPhoneInput.value;
            // Проверка: номер должен быть полностью заполнен (18 символов: +7 (999) 999-99-99)
            if (phoneValue.length < 18 || phoneValue.includes('_')) {
                cartPhoneInput.style.border = '1px solid #ff4d4d';
                cartPhoneInput.focus();
                return; // Прерываем отправку, если номер некорректен
            } else {
                cartPhoneInput.style.border = 'none';
            }
        }

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
                // --- ОЧИСТКА ДЛЯ ДИНАМИЧЕСКОЙ МОДАЛКИ ---
                const nameField = document.getElementById('u_name');
                const phoneField = document.getElementById('u_phone');
                const msgField = document.getElementById('u_msg');
                const privacyCheckbox = document.getElementById('u_privacy');
                
                if (nameField) nameField.innerText = "";
                if (phoneField) phoneField.innerText = "+7 (___) ___-__-__";
                if (msgField) msgField.innerText = "";
                if (privacyCheckbox) privacyCheckbox.checked = false;

                // --- ОЧИСТКА ДЛЯ СТРАНИЦЫ КОРЗИНЫ (cart.html) ---
                const cartNameInput = document.getElementById('order-name');
                const cartCommentInput = document.getElementById('order-comment');

                if (cartNameInput) cartNameInput.value = "";
                if (cartPhoneInput) cartPhoneInput.value = "";
                if (cartCommentInput) cartCommentInput.value = "";

                // Очищаем саму корзину в памяти и localStorage
                if (typeof window.clearCart === 'function') {
                    window.clearCart(); 
                } else {
                    localStorage.removeItem('myShopCart');
                }

                // Закрытие текущего модального окна заказа (если оно открыто)
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
     * Использует стандартные классы Bootstrap 5
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

    /* --- ЛОГИКА МАСКИ ДЛЯ СТРАНИЦЫ КОРЗИНЫ (cart.html) --- */
    const cartPhoneInput = document.getElementById('order-phone');

    if (cartPhoneInput) {
        // Устанавливаем начальное значение, если поле пустое
        if (cartPhoneInput.value === "") {
            cartPhoneInput.value = "+7 (___) ___-__-__";
        }

        cartPhoneInput.addEventListener('input', function (e) {
            let matrix = "+7 (___) ___-__-__",
                i = 0,
                def = matrix.replace(/\D/g, ""),
                val = this.value.replace(/\D/g, "");

            if (def.length >= val.length) val = def;

            this.value = matrix.replace(/./g, function (a) {
                return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a;
            });
        });

        // Запрещаем удаление префикса +7
        cartPhoneInput.addEventListener('keydown', function (e) {
            if (e.keyCode === 8 && this.value.length <= 4) {
                e.preventDefault();
            }
        });

        // При фокусе на поле, если оно пустое, ставим маску
        cartPhoneInput.addEventListener('focus', function () {
            if (this.value === "") {
                this.value = "+7 (___) ___-__-__";
            }
        });
    }

    /**
     * Создает динамическую форму заказа товара или обратного звонка
     */
    function createDynamicModal(triggerType, productValue) {
        const oldModal = document.getElementById('dynamicOrderModal');
        if (oldModal) oldModal.remove();

        const isCallBack = triggerType === 'callBack';
        const displayTitle = isCallBack ? 'Обратный звонок' : `Заказ: <span style="color: #28a745;">${productValue}</span>`;
        const btnText = isCallBack ? 'ЖДУ ЗВОНКА' : 'ПОДТВЕРДИТЬ ЗАКАЗ';

        const modalHtml = `
<div class="modal fade" id="dynamicOrderModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" style="max-width: 420px;">
        <div class="modal-content" style="border-radius: 14px; border: none; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); overflow: hidden; background: #fff;">
            
            <div style="height: 4px; background: linear-gradient(90deg, #28a745 0%, #32ca46 100%);"></div>
            
            <div class="modal-header border-0 pt-4 px-4 pb-2" style="display: flex; align-items: flex-start; justify-content: space-between;">
                <div style="font-family: 'Inter', system-ui, sans-serif;">
                    <div style="text-transform: uppercase; letter-spacing: 1.5px; font-size: 0.65rem; font-weight: 700; color: #28a745; margin-bottom: 4px;">Оформление</div>
                    <div style="font-size: 1.4rem; font-weight: 800; color: #1a1a1a; line-height: 1.2;">${displayTitle}</div>
                </div>
                <span role="button" class="btn-close" data-bs-dismiss="modal" style="font-size: 0.8rem; opacity: 0.4; transition: opacity 0.2s;"></span>
            </div>

            <div class="modal-body py-4 px-4">
                <div class="mb-4">
                    <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #999; letter-spacing: 0.5px; margin-bottom: 8px; text-transform: uppercase;">Как вас зовут? <span style="color: #ff4d4d;">*</span></label>
                    <div id="u_name" contenteditable="true" class="form-control" 
                         style="border: 1px solid #e1e1e1; border-radius: 12px; padding: 12px 16px; min-height: 48px; font-size: 1rem; color: #1a1a1a; transition: all 0.3s ease; box-shadow: none; cursor: text;"></div>
                </div>

                <div class="mb-4">
                    <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #999; letter-spacing: 0.5px; margin-bottom: 8px; text-transform: uppercase;">Контактный номер <span style="color: #ff4d4d;">*</span></label>
                    <div id="u_phone" contenteditable="true" class="form-control" 
                         style="border: 1px solid #e1e1e1; border-radius: 12px; padding: 12px 16px; min-height: 48px; font-size: 1.1rem; font-weight: 500; color: #1a1a1a; transition: all 0.3s ease; box-shadow: none; cursor: text;">+7 (___) ___-__-__</div>
                </div>

                <div class="mb-4">
                    <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #999; letter-spacing: 0.5px; margin-bottom: 8px; text-transform: uppercase;">Дополнительные детали</label>
                    <div id="u_msg" contenteditable="true" class="form-control" 
                         style="border: 1px solid #e1e1e1; border-radius: 12px; padding: 12px 16px; min-height: 80px; font-size: 0.95rem; color: #1a1a1a; transition: all 0.3s ease; box-shadow: none; cursor: text;"></div>
                </div>

                <div id="u_privacy_block" class="mb-4 d-flex align-items-start" style="gap: 10px; padding: 6px; border: 1px solid transparent; border-radius: 10px; transition: all 0.3s ease;">
                    <input type="checkbox" id="u_privacy" style="width: 18px; height: 18px; accent-color: #28a745; cursor: pointer; margin-top: 2px;">
                    <label for="u_privacy" style="font-size: 0.75rem; color: #666; line-height: 1.4; cursor: pointer; user-select: none; font-family: 'Inter', system-ui, sans-serif;">
                        Я согласен на обработку <a href="https://olimp-75.ru/privacy" target="_blank" style="color: #28a745; text-decoration: none; font-weight: 600; transition: opacity 0.2s;">персональных данных</a> <span style="color: #ff4d4d;">*</span>
                    </label>
                </div>

                <div id="u_send" role="button" class="text-center w-100 py-3 mt-2 fw-bold" 
                     style="background: #1a1a1a; color: #fff; border-radius: 12px; font-size: 0.9rem; letter-spacing: 1px; text-transform: uppercase; transition: all 0.2s; cursor: pointer; user-select: none;">
                    ${btnText}
                </div>

                <div style="font-size: 0.65rem; color: #a3a3a3; text-align: center; margin-top: 18px; line-height: 1.4; font-weight: 400;">
                    Все цены на сайте носят информационный характер и не являются публичной офертой.
                </div>
            </div>
        </div>
    </div>
</div>`;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const phoneField = document.getElementById('u_phone');
        const nameField = document.getElementById('u_name');
        const msgField = document.getElementById('u_msg');
        const sendBtn = document.getElementById('u_send');
        const privacyCheckbox = document.getElementById('u_privacy');
        const privacyBlock = document.getElementById('u_privacy_block');

        // Сброс красных границ ошибок при взаимодействии с элементами
        [nameField, phoneField].forEach(el => {
            el.addEventListener('click', () => { el.style.border = '1px solid #e1e1e1'; });
            el.addEventListener('input', () => { el.style.border = '1px solid #e1e1e1'; });
        });
        
        privacyCheckbox.addEventListener('change', function() {
            if (this.checked) {
                privacyBlock.style.borderColor = 'transparent';
                privacyBlock.style.background = 'transparent';
            }
        });

        phoneField.addEventListener('input', function () {
            let matrix = "+7 (___) ___-__-__", i = 0, def = matrix.replace(/\D/g, ""), val = this.innerText.replace(/\D/g, "");
            if (def.length >= val.length) val = def;
            this.innerText = matrix.replace(/./g, function (a) {
                return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a;
            });
            const range = document.createRange(); const sel = window.getSelection();
            range.selectNodeContents(this); range.collapse(false);
            sel.removeAllRanges(); sel.addRange(range);
        });

        phoneField.addEventListener('keydown', function (e) { if (e.keyCode === 8 && this.innerText.length <= 4) e.preventDefault(); });

        sendBtn.addEventListener('click', function () {
            const phone = phoneField.innerText;
            const name = nameField.innerText;
            const message = msgField.innerText;
            const isPrivacyChecked = privacyCheckbox.checked;

            let hasError = false;
            
            if (name.trim().length < 2) {
                nameField.style.border = '1px solid #ff4d4d';
                hasError = true;
            }
            if (phone.length < 18 || phone.includes('_')) {
                phoneField.style.border = '1px solid #ff4d4d';
                hasError = true;
            }
            // Проверка чекбокса согласия ПД
            if (!isPrivacyChecked) {
                privacyBlock.style.borderColor = '#ff4d4d';
                privacyBlock.style.background = 'rgba(255, 77, 77, 0.05)';
                hasError = true;
            }

            if (hasError) return;

            const payload = {
                t: isCallBack ? "Перезвонить" : "Заказ",
                o: isCallBack ? "" : productValue,
                items: "", 
                m: message,
                d: window.location.hostname,
                n: name,
                p: phone.replace('+', '')
            };

            window.sendData(payload, sendBtn);
        });

        new bootstrap.Modal(document.getElementById('dynamicOrderModal')).show();
    }

    document.addEventListener('click', function (e) {
        const productBtn = e.target.closest('.btn-premium-action');
        const callBackBtn = e.target.closest('[data=\"callBack\"]');

        if (productBtn) {
            e.preventDefault();
            createDynamicModal('order', productBtn.getAttribute('data-product'));
        } else if (callBackBtn) {
            e.preventDefault();
            createDynamicModal('callBack', null);
        }
    });
});