export default class PhotoGallery {
    
    // imgLinks: объект {resolutions: [750, 1024], links: [['slide-1-750w.jpg', 'slide-1-1024w.jpg']]}

    constructor(imgLinks) {
        // Создание внутренних свойств из аргументов options
        this.imgLinksArray = imgLinks.links;
        this.gallery = document.querySelector('.photo-cover');
        this.mainImg = this.gallery.querySelector('.photo-cover__img');        
        this.closeBtn = this.gallery.querySelector('.photo-cover__close');
        this.nextBtn = this.gallery.querySelector('.photo-cover__next');
        this.backBtn = this.gallery.querySelector('.photo-cover__back');
        this.loader = this.gallery.querySelector('.photo-cover__loader');
        this.caption = this.gallery.querySelector('.photo-cover__caption');

        // Привязка методов к объекту
        this.openGallery = this.openGallery.bind(this);
        this.closeGallery = this.closeGallery.bind(this);        
        this.next = this.next.bind(this);
        this.back = this.back.bind(this);
        this.onImgLoad = this.onImgLoad.bind(this);
        this.onImgLoadError = this.onImgLoadError.bind(this);

        // Сбор коллекции карточек изображений
        this.cardsCollection = Array.from(document.querySelectorAll('.photo-card'));

        // Привязка методов обработки загрузки изображения
        this.mainImg.onload = this.onImgLoad;
        this.mainImg.onerror = this.onImgLoadError;
        
        // Определение оптимального разрешения устройства
        let resolution = window.devicePixelRatio * Math.max(window.innerWidth, window.innerHeight);
        for(let i = 0; i < imgLinks.resolutions.length; i++) {
            if(resolution <= imgLinks.resolutions[i] ) {
                this.resolution = i;                
                break;
            }
        }
        if(!this.hasOwnProperty('resolution')) this.resolution = imgLinks.resolutions.length - 1;            
        
        // Добавление слушателей к изображениям для открытия галереи
        this.cardsCollection.forEach(
            card => card.addEventListener('pointerdown', this.openGallery)
        ); 

        // Добавление слушателей к кнопкам закрытия, перелистывания слайдов
        this.closeBtn.addEventListener('pointerdown', this.closeGallery);     
        this.nextBtn.addEventListener('pointerdown', this.next);
        this.backBtn.addEventListener('pointerdown', this.back); 
        
        // Создание объектов keyframes
        this.keyframes = {
            zoomIn: [
                {transform: 'scale(0.6)', opacity: 0},
                {transform: 'scale(1)', opacity: 1},
            ],
            fadeIn: [
                {opacity: 0},
                {opacity: 1}
            ],
            fadeOut: [
                {opacity: 1},
                {opacity: 0}
            ],
            fadeOutIn: [                
                {opacity: 1},
                {opacity: 0},
                {opacity: 1}
            ]          
        }
    }

    // Открытие галереи при нажатии на изображение
    openGallery(event) {
        // Определить индекс изображения
        const imgIndex = this.cardsCollection.indexOf(event.currentTarget);

        // Изменить слайд
        this.changeSlide(imgIndex);

        // Открыть окно галереи        
        this.gallery.classList.add('open');
        this.gallery.animate(this.keyframes.zoomIn, {duration: 200});
        this.onScrollFunc = window.onscroll;
        this.freezeBody();        
    } 

    // Установить слайд с определенным номером
    changeSlide(index) {        
        // Проверить состяние ширмы на наличие класса ошибки и скорректировать его
        if(this.loader.classList.contains('error')) this.loader.classList.remove('error');

        // Показать лоадер
        this.showLoader();               

        // Изменить ссылку основного изображения        
        this.mainImg.src = this.imgLinksArray[index][this.resolution];

        // Взять карточку соответствующего изображения из колекции
        const nextCard = this.cardsCollection[index];

        // Изменить описание изображения
        this.caption.textContent = nextCard.querySelector('.photo-card__caption').textContent;

        // Изменить атрибуты изображения
        const cardImg = nextCard.querySelector('.photo-card__img');
        this.mainImg.setAttribute('alt', cardImg.getAttribute('alt'));
        this.mainImg.setAttribute('title', cardImg.getAttribute('title'));  
        
        // Изменить номер текущего изображения
        this.currentSlideIndex = index;
    }

    // Закрыть галерею
    closeGallery() {
        // Закрыть окно галереи
        this.gallery.animate(this.keyframes.fadeOut, {duration: 250})
            .finished.then(() => {
                this.gallery.classList.remove('open');
                this.unFreezeBody();                
            });        
    }

    // Следующий слайд
    next() {
        const nextIndex = this.currentSlideIndex + 1;
        if(nextIndex >= this.cardsCollection.length) return;
        this.changeSlide(nextIndex);
    }

    // Предыдущий слайд
    back() {
        const prevIndex = this.currentSlideIndex - 1;
        if(prevIndex < 0) return;
        this.changeSlide(prevIndex);
    }

    // Функция показывающая лоадер
    showLoader() {
        this.loaderTimeoutId = setTimeout(() => {
            this.loader.classList.add('open');
            this.loader.animate(this.keyframes.fadeIn, {duration: 200})         
        }, 500);
    }

    // Метод срабатывает при загрузке основного изображения
    onImgLoad() {
        clearTimeout(this.loaderTimeoutId);
        if(this.loader.classList.contains('open')) {
            this.loaderTimeoutId = false;
            this.loader.animate(this.keyframes.fadeOut, {duration: 200})
                .finished.then(() => {
                    this.loader.classList.remove('open');  
                });
        }
    }

    // Метод срабатывает при ошибке загрузки основного изображения
    onImgLoadError() {
        this.loader.classList.add('error');            
    }
    
    // Заморозить прокрутку страницы
    freezeBody() {
        const offsetX = window.pageXOffset;
        const offsetY = window.pageYOffset;

        window.onscroll = () => {
            window.scrollTo(offsetX, offsetY);
        }
    }

    // Возобновить прокрутку страницы
    unFreezeBody() {
        window.onscroll = null;
    }
}