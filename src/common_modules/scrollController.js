class ScrollController {
    // Запретить прокрутку страницы
    freeze() {
        // Начальная ширина страницы с прокруткой
        const startBodyWidth = document.body.clientWidth;
        // Запретить прокрутку документа
        document.body.style.overflow = 'hidden';
        // Получить ширину полосы прокрутки
        this.scrollWidth = document.body.clientWidth - startBodyWidth;
        // Если ширина страницы изменилась
        if(this.scrollWidth !== 0) {            
            document.body.style.marginRight = `${this.scrollWidth}px`;
        }
        // Запретить прокрутку документа клафишами PDown PUp
        window.onscroll = () => false;
    }

    // Возобновить прокрутку страницы
    unFreeze() {
        // Разрешить прокрутку страницы
        document.body.style.overflow = 'auto';
        // Если был установлен отступ вместо скрола убрать его
        if(this.scrollWidth !== 0) {
            document.body.style.marginRight = null;
        }
        // Убрать обработчики скрола
        window.onscroll = null;
    }
} 

const scrollController = new ScrollController();

export default scrollController;

// class ScrollController {
//     // Запретить прокрутку страницы
//     freeze() {
//         const offsetX = window.pageXOffset;
//         const offsetY = window.pageYOffset;

//         window.onscroll = () => {
//             window.scrollTo(offsetX, offsetY);
//         }
//     }

//     // Возобновить прокрутку страницы
//     unFreeze() {
//         window.onscroll = null;
//     }
// }