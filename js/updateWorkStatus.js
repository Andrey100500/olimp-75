// Константы текстовых сообщений
const STATUS_OPEN = "Звоните! Работаем";
const STATUS_CLOSED = "Отдел продаж";

// Константы рабочего времени
const WORK_TIMEZONE_OFFSET = 9;              // Чита (UTC+9)
const WORK_START_HOUR = 8;                   // 08:00
const WORK_END_HOUR = 17;                    // 17:00
const WORK_DAYS = {                          // Рабочие дни: пн-сб
    START: 1,    // понедельник
    END: 6       // суббота
};

/**
 * ОБРАБАТЫВАЕМЫЕ БЛОКИ НА САЙТЕ:
 * - #statusDot    - зеленая точка-индикатор (шапка сайта)
 * - #statusText   - текст статуса отдела продаж (шапка сайта)
 * 
 * ПАРАМЕТРЫ СМЕНЫ СТАТУСА:
 * - Часовой пояс: Чита (UTC+9)
 * - Рабочие дни:   понедельник - суббота
 * - Рабочие часы:  08:00 - 17:00
 * 
 * ПРИ ОТКРЫТО:
 * - Текст: "Звоните! Работаем" (зеленый)
 * - Точка: видима, зеленое свечение
 * 
 * ПРИ ЗАКРЫТО:
 * - Текст: "Отдел продаж" (серый)
 * - Точка: скрыта
 */

function updateWorkStatus() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    // Получаем текущее время в указанном часовом поясе
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (3600000 * WORK_TIMEZONE_OFFSET));

    const day = localTime.getDay();      // 0=вс, 1=пн, ..., 6=сб
    const hour = localTime.getHours();   // 0-23

    const isWorkingDay = (day >= WORK_DAYS.START && day <= WORK_DAYS.END);
    const isWorkingHours = (hour >= WORK_START_HOUR && hour < WORK_END_HOUR);
    const isOpen = isWorkingDay && isWorkingHours;

    if (isOpen) {
        statusText.innerText = STATUS_OPEN;
        statusText.style.color = "#2ecc71";

        // Показываем точку
        statusDot.style.display = "inline-block";
        statusDot.style.backgroundColor = "#2ecc71";
        statusDot.style.boxShadow = "0 0 8px rgba(46, 204, 113, 0.5)";
    } else {
        statusText.innerText = STATUS_CLOSED;
        statusText.style.color = "#94a3b8";

        // Скрываем точку
        statusDot.style.display = "none";
    }
}

// Запускаем при загрузке и обновляем каждые 30 секунд
document.addEventListener('DOMContentLoaded', updateWorkStatus);
setInterval(updateWorkStatus, 30000);