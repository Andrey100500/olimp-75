/* НАЗВАНИЕ: Система управления корзиной «Олимп» (v6.2 - Отправка заказа)
   ОПИСАНИЕ: Управляет корзиной. Синхронизирует виджет, модальное окно и отдельную страницу корзины.
   Добавлена функция отправки заказа через sendData().
*/
document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');
    const cartWidget = document.querySelector('.cart-widget');
    const modalEl = document.getElementById('cartModal');
    const orderForm = document.getElementById('order-form');

    // Загрузка корзины из памяти
    let cart = JSON.parse(localStorage.getItem('myShopCart')) || [];

    /**
     * Функция очистки корзины (глобальная для доступа из sendData)
     */
    window.clearCart = function() {
        cart = [];
        updateCartWidget();
    };

    /**
     * Глобальная функция очистки полей формы корзины после успешной отправки
     */
    window.clearCartFormFields = function() {
        const cartNameInput = document.getElementById('order-name');
        const cartPhoneInput = document.getElementById('order-phone');
        const cartCommentInput = document.getElementById('order-comment');

        if (cartNameInput) cartNameInput.value = "";
        if (cartPhoneInput) cartPhoneInput.value = "+7 (___) ___-__-__";
        if (cartCommentInput) cartCommentInput.value = "";
    };

    /**
     * Функция отправки формы заказа
     */
    window.submitOrderForm = function(event) {
        if (event) event.preventDefault();

        // Проверяем, есть ли товары в корзине
        if (cart.length === 0) {
            alert('Корзина пуста. Добавьте товары для оформления заказа.');
            return false;
        }

        // Собираем данные из формы
        const nameInput = document.getElementById('order-name');
        const phoneInput = document.getElementById('order-phone');
        const commentInput = document.getElementById('order-comment');

        if (!nameInput || !phoneInput) {
            alert('Ошибка: не найдены поля формы');
            return false;
        }

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const comment = commentInput ? commentInput.value.trim() : '';

        // Валидация имени
        if (name.length < 2) {
            alert('Введите имя');
            nameInput.focus();
            return false;
        }

        // Валидация маски телефона корзины
        if (phone.length < 18 || phone.includes('_')) {
            phoneInput.style.border = '1px solid #ff4d4d';
            phoneInput.focus();
            return false;
        } else {
            phoneInput.style.border = 'none';
        }

        // Формируем список товаров для поля items
        const itemsList = cart.map(item => {
            const price = parseFloat(item.price) || 0;
            return `${item.name} — ${item.quantity} шт. ${price > 0 ? '(' + price.toLocaleString() + ' ₽/шт)' : ''}`;
        }).join('\n');

        // Общая стоимость для информации
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * item.quantity), 0);
        const totalInfo = `Всего товаров: ${totalItems}, на сумму: ${totalPrice > 0 ? totalPrice.toLocaleString() + ' ₽' : 'По запросу'}`;

        // Формируем payload
        const payload = {
            t: "Заказ с сайта",
            o: "Корзина", 
            items: itemsList + '\n\n' + totalInfo,
            m: comment || 'Без комментариев',
            d: window.location.hostname,
            n: name,
            p: phone.replace(/\D/g, '')
        };

        // Блокируем кнопку отправки
        const submitBtn = orderForm ? orderForm.querySelector('button[type="submit"]') : null;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Отправка...';
        }

        // Отправляем данные
        window.sendData(payload, submitBtn, true); // Передаем true, так как это отправка КОРЗИНЫ

        return false;
    };

    /**
     * СИНХРОНИЗАЦИЯ КНОПОК
     */

    const updateButtonStates = () => {
        const products = document.querySelectorAll('.product-item');
        products.forEach(product => {
            const id = product.getAttribute('data-id');
            const btn = product.querySelector('.btn-cart');
            if (!btn) return;

            const isInCart = cart.some(item => item.id === id);

            if (isInCart) {
                btn.innerText = 'В корзине';
                
                // Дизайн "В корзине": меняем блеклую серую рамку на яркую акцентную (например, success/зеленую или primary/синюю)
                btn.classList.remove('btn-outline-secondary');
                btn.classList.add('btn-outline-success'); // Можно заменить на btn-outline-primary / warning под ваш бренд
                
            } else {
                btn.innerText = 'В корзину';
                
                // Возвращаем исходный нейтральный дизайн
                btn.classList.remove('btn-outline-success');
                btn.classList.add('btn-outline-secondary');
            }
        });
    };









    /**
     * РЕНДЕР ОТДЕЛЬНОЙ СТРАНИЦЫ КОРЗИНЫ (cart.html)
     */
    const renderFullCartPage = () => {
        const tableBody = document.getElementById('cart-page-body');
        const totalCount = document.getElementById('cart-total-count');
        const totalSumEl = document.getElementById('cart-page-total');
        const subtotalEl = document.getElementById('cart-subtotal');

        if (!tableBody) return;

        if (cart.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-muted small text-uppercase fw-bold">Ваша корзина пуста</td></tr>';
            if (totalCount) totalCount.innerText = '0';
            if (subtotalEl) subtotalEl.innerText = '0 ₽';
            if (totalSumEl) totalSumEl.innerText = '0 ₽';
            return;
        }

        let totalSum = 0;
        let totalItems = 0;

        tableBody.innerHTML = cart.map((item, index) => {
            const itemPrice = parseFloat(item.price) || 0;
            const itemTotal = itemPrice * item.quantity;
            totalSum += itemTotal;
            totalItems += item.quantity;

            return `
                <tr>
                    <td class="ps-4 py-4">
                        <div class="fw-bold text-dark">${item.name}</div>
                        <div class="small text-muted" style="font-size: 11px;">КАТЕГОРИЯ: ${item.categoryTag ? item.categoryTag.toUpperCase() : 'ТОВАР'}</div>
                    </td>
                    <td>${itemPrice > 0 ? itemPrice.toLocaleString() + ' ₽' : '—'}</td>
                    <td>
                        <div class="d-flex align-items-center justify-content-center gap-2">
                            <button class="btn btn-sm btn-light border py-0 px-2" onclick="changeQuantity(${index}, -1)">-</button>
                            <span class="fw-bold px-1">${item.quantity}</span>
                            <button class="btn btn-sm btn-light border py-0 px-2" onclick="changeQuantity(${index}, 1)">+</button>
                        </div>
                    </td>
                    <td class="fw-bold">${itemTotal > 0 ? itemTotal.toLocaleString() + ' ₽' : 'По запросу'}</td>
                    <td class="pe-4 text-end">
                        <button class="btn btn-link text-danger p-0" onclick="removeFromCart(${index})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                            </svg>
                        </button>
                    </td>
                </tr>`;
        }).join('');

        if (totalCount) totalCount.innerText = totalItems;
        if (subtotalEl) subtotalEl.innerText = totalSum > 0 ? totalSum.toLocaleString() + ' ₽' : '0 ₽';
        if (totalSumEl) totalSumEl.innerText = totalSum > 0 ? totalSum.toLocaleString() + ' ₽' : 'По запросу';
    };

    /**
     * ОБНОВЛЕНИЕ ВИДЖЕТА И ХРАНИЛИЩА
     */
    const updateCartWidget = () => {
        const countElement = document.getElementById('cart-count');
        const totalElement = document.getElementById('cart-total');

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * item.quantity), 0);

        if (countElement) countElement.innerText = totalItems;

        if (totalElement) {
            totalElement.innerText = totalPrice > 0 ? `${totalPrice.toLocaleString()} ₽` : '0 ₽';
        }

        localStorage.setItem('myShopCart', JSON.stringify(cart));
        updateButtonStates();
        renderFullCartPage();
    };

    /**
     * РЕНДЕР МОДАЛЬНОГО ОКНА С КОРЗИНОЙ
     */
    const renderCartModal = () => {
        const tableBody = document.getElementById('cart-table-body');
        const modalTotal = document.getElementById('cart-modal-total');
        let totalSum = 0;

        if (!tableBody) return;

        if (cart.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted small fw-bold">Корзина пуста</td></tr>';
            if (modalTotal) modalTotal.innerText = '0 ₽';
            return;
        }

        tableBody.innerHTML = cart.map((item, index) => {
            const itemPrice = parseFloat(item.price) || 0;
            const itemTotal = itemPrice * item.quantity;
            totalSum += itemTotal;

            return `
                <tr>
                    <td><a href="${item.categoryTag ? item.categoryTag + '.html' : '#'}" class="text-decoration-none text-dark fw-medium">${item.name}</a></td>
                    <td>${itemPrice > 0 ? itemPrice.toLocaleString() + ' ₽' : '—'}</td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="changeQuantity(${index}, -1)">-</button>
                            <span class="fw-bold">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="changeQuantity(${index}, 1)">+</button>
                        </div>
                    </td>
                    <td class="fw-bold text-nowrap">${itemTotal > 0 ? itemTotal.toLocaleString() + ' ₽' : 'По запросу'}</td>
                    <td class="text-end">
                        <button class="btn btn-sm text-danger border-0" onclick="removeFromCart(${index})">✕</button>
                    </td>
                </tr>`;
        }).join('');

        if (modalTotal) {
            modalTotal.innerText = totalSum > 0 ? `${totalSum.toLocaleString()} ₽` : 'По запросу';
        }
    };

    /**
     * ЛОГИКА НАЖАТИЯ НА КНОПКУ ТОВАРА
     */
    const handleCartAction = async (productId, productName, categoryTag) => {
        const isInCart = cart.some(item => item.id === productId);

        if (isInCart) {
            if (document.getElementById('cart-page-body')) return;

            if (modalEl) {
                const instance = bootstrap.Modal.getOrCreateInstance(modalEl);
                renderCartModal();
                instance.show();
            }
            return;
        }

        try {
            const response = await fetch('dataBase/products.json');
            const data = await response.json();
            const dbProduct = data.products.find(p => p.id === productId);

            if (dbProduct) {
                cart.push({
                    id: dbProduct.id,
                    name: dbProduct.name,
                    price: parseFloat(dbProduct.price) || 0,
                    quantity: 1,
                    categoryTag: categoryTag
                });
                updateCartWidget();
                renderCartModal();
            }
        } catch (e) {
            console.error("Ошибка при получении данных:", e);
        }
    };

    if (productsContainer) {
        productsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-cart');
            if (!btn) return;
            e.preventDefault();

            const productItem = btn.closest('.product-item');
            const id = productItem.getAttribute('data-id');
            const name = productItem.querySelector('.brand-title')?.innerText.trim() || 'Товар';
            const categoryTag = window.location.pathname.split('/').pop().replace('.html', '');

            handleCartAction(id, name, categoryTag);
        });
    }

    window.changeQuantity = (index, delta) => {
        if (!cart[index]) return;
        cart[index].quantity += delta;
        if (cart[index].quantity < 1) cart.splice(index, 1);
        updateCartWidget();
        renderCartModal();
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartWidget();
        renderCartModal();
    };

    if (cartWidget && modalEl) {
        cartWidget.addEventListener('click', () => {
            renderCartModal();
            bootstrap.Modal.getOrCreateInstance(modalEl).show();
        });
    }

    if (orderForm) {
        orderForm.addEventListener('submit', window.submitOrderForm);
    }

    /* МАСКА ТЕЛЕФОНА ДЛЯ СТРАНИЦЫ КОРЗИНЫ */
    const cartPhoneInput = document.getElementById('order-phone');

    if (cartPhoneInput) {
        if (cartPhoneInput.value === "") {
            cartPhoneInput.value = "+7 (___) ___-__-__";
        }

        cartPhoneInput.addEventListener('input', function () {
            let matrix = "+7 (___) ___-__-__",
                i = 0,
                def = matrix.replace(/\D/g, ""),
                val = this.value.replace(/\D/g, "");

            if (def.length >= val.length) val = def;

            this.value = matrix.replace(/./g, function (a) {
                return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a;
            });
        });

        cartPhoneInput.addEventListener('keydown', function (e) {
            if (e.keyCode === 8 && this.value.length <= 4) {
                e.preventDefault();
            }
        });

        cartPhoneInput.addEventListener('focus', function () {
            if (this.value === "") {
                this.value = "+7 (___) ___-__-__";
            }
        });
    }

    updateCartWidget();
});