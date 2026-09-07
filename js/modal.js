/**
 * Скрипт для генерации динамических модальных окон
 * Управляет формами обратного звонка, расчета стоимости и других типов заявок.
 */
document.addEventListener('DOMContentLoaded', function () {

    /**
     * Создает динамическую форму на основе переданного типа
     * @param {String} triggerType - Тип окна ('callBack', 'calculate' и т.д.)
     */
    function createDynamicModal(triggerType) {
        const oldModal = document.getElementById('dynamicOrderModal');
        if (oldModal) oldModal.remove();

        // Конфигурация для разных типов модальных окон
        let displayTitle = '';
        let btnText = '';
        let payloadType = '';

        switch (triggerType) {
            case 'callBack':
                displayTitle = 'Перезвоним и ответим на вопросы';
                displayTitleSub = 'СВЯЗАТЬСЯ С НАМИ';
                displayText = 'Комментарий (необязательно)';
                btnText = 'Перезвоните мне';
                payloadType = 'Перезвоните мне';
                break;
            case 'calculate':
                displayTitle = 'Расчет стоимости по вашим параметрам';
                displayTitleSub = 'БЕСПЛАТНЫЙ РАСЧЕТ';
                displayText = 'Укажите размеры, объем или комментарий';
                btnText = 'Отправить на расчет';
                payloadType = 'Отправить на расчет';
                break;
            default:
                displayTitle = 'Заявка с сайта';
                displayTitleSub = 'Оформление';
                displayText = '';
                btnText = 'ОТПРАВИТЬ';
                payloadType = 'Заявка';
        }

        const modalHtml = `
<div class="modal fade" id="dynamicOrderModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" style="max-width: 420px;">
        <div class="modal-content" style="border-radius: 14px; border: none; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); overflow: hidden; background: #fff;">
            
            <div style="height: 4px; background: linear-gradient(90deg, #28a745 0%, #32ca46 100%);"></div>
            
            <div class="modal-header border-0 pt-4 px-4 pb-2" style="display: flex; align-items: flex-start; justify-content: space-between;">
                <div style="font-family: 'Inter', system-ui, sans-serif;">
                    <div style="text-transform: uppercase; letter-spacing: 1.5px; font-size: 0.65rem; font-weight: 700; color: #28a745; margin-bottom: 4px;">${displayTitleSub}</div>
                    <div style="font-size: 1.4rem; font-weight: 800; color: #1a1a1a; line-height: 1.2;">${displayTitle}</div>
                </div>
                <span role="button" class="btn-close" data-bs-dismiss="modal" style="font-size: 0.8rem; opacity: 0.4; transition: opacity 0.2s;"></span>
            </div>

            <div class="modal-body py-4 px-4">
                <div class="mb-4">
                    <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #999; letter-spacing: 0.5px; margin-bottom: 8px;">Как вас зовут? <span style="color: #ff4d4d;">*</span></label>
                    <div id="u_name" contenteditable="true" class="form-control" 
                         style="border: 1px solid #e1e1e1; border-radius: 12px; padding: 12px 16px; min-height: 48px; font-size: 1rem; color: #1a1a1a; transition: all 0.3s ease; box-shadow: none; cursor: text;"></div>
                </div>

                <div class="mb-4">
                    <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #999; letter-spacing: 0.5px; margin-bottom: 8px;">Номер телефона <span style="color: #ff4d4d;">*</span></label>
                    <div id="u_phone" contenteditable="true" class="form-control" 
                         style="border: 1px solid #e1e1e1; border-radius: 12px; padding: 12px 16px; min-height: 48px; font-size: 1.1rem; font-weight: 500; color: #1a1a1a; transition: all 0.3s ease; box-shadow: none; cursor: text;">+7 (___) ___-__-__</div>
                </div>

                <div class="mb-4">
                    <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #999; letter-spacing: 0.5px; margin-bottom: 8px;">${displayText}</label>
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

        // Сброс ошибок при клике/вводе
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

        // Маска телефона для contenteditable
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

        // Обработчик кнопки отправки внутри модального окна
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
            if (!isPrivacyChecked) {
                privacyBlock.style.borderColor = '#ff4d4d';
                privacyBlock.style.background = 'rgba(255, 77, 77, 0.05)';
                hasError = true;
            }

            if (hasError) return;

            const payload = {
                t: payloadType,
                o: "",
                items: "", 
                m: message,
                d: window.location.hostname,
                n: name,
                p: phone.replace('+', '')
            };

            // Вызываем глобальную отправку, передаем false (это НЕ корзина)
            if (typeof window.sendData === 'function') {
                window.sendData(payload, sendBtn, false);
            }
        });

        new bootstrap.Modal(document.getElementById('dynamicOrderModal')).show();
    }

    // Универсальный слушатель кликов по кнопкам с атрибутом data
    document.addEventListener('click', function (e) {
        const targetBtn = e.target.closest('[data="callBack"], [data="calculate"]');

        if (targetBtn) {
            e.preventDefault();
            const triggerType = targetBtn.getAttribute('data');
            createDynamicModal(triggerType);
        }
    });
});