export default class PhotoGallery {    
    
    // imgLinks: объект {resolutions: [750, 1024], links: [['slide-1-750w.jpg', 'slide-1-1024w.jpg']]}
    constructor(imgLinks) {
        // Создание внутренних свойств из аргументов options
        // Массив ссылок на изображения разного разрешения
        this.imgLinksArray = imgLinks.links;
        // Объект галлереи
        this.gallery = document.querySelector('.photo-cover');   
        // Элемент, в котором находятся все слайды, включая лоадер  
        this.galleryHolder = this.gallery.querySelector('.photo-cover__content');  
        // Кнопки управления галлереи   
        this.closeBtn = this.gallery.querySelector('.photo-cover__close');
        this.nextBtn = this.gallery.querySelector('.photo-cover__next');
        this.backBtn = this.gallery.querySelector('.photo-cover__back');
        // Объект лоадера
        this.loader = new LoaderSlide(document.getElementById('galleryLoader'));    
        // База данных для хранения слайдов, ключ - порядковый номер соответствующего элемента thumb
        this.slidesDB = new Map();    

        // Привязка делегируемых методов к текущему объекту
        this.openGallery = this.openGallery.bind(this);
        this.closeGallery = this.closeGallery.bind(this);        
        this.next = this.next.bind(this);
        this.back = this.back.bind(this);
        this.onSlideLoad = this.onSlideLoad.bind(this);        

        // Сбор коллекции карточек изображений в массив
        this.thumbsCollection = Array.from(document.querySelectorAll('.photo-card'));

        // Добавление слушателей для обработки загрузки изображений слайдов
        this.galleryHolder.addEventListener('slideloaded', this.onSlideLoad);
        
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
        this.thumbsCollection.forEach(
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
            elasticNext: [
                {transform: 'translateX(0)'},
                {transform: 'translateX(-4%)'},                
                {transform: 'translateX(0)'}
            ],
            elasticPrev: [
                {transform: 'translateX(0)'},
                {transform: 'translateX(4%)'},                
                {transform: 'translateX(0)'}
            ]        
        }

        // Создание свойства с типичной продолжительностью анимации
        this.duration = 250;

        // Добавление функциональности перелистывания галереи для мобильных устройств
        if(navigator.maxTouchPoints > 0) {
            // Привязать методы к объекту
            this.onTouchStart = this.onTouchStart.bind(this);
            this.onTouchMove = this.onTouchMove.bind(this);
            this.onTouchCancel = this.onTouchCancel.bind(this);

            // Назначить слушатели
            this.galleryHolder.addEventListener('touchstart', this.onTouchStart);
            this.galleryHolder.addEventListener('touchend', this.onTouchCancel);
            this.galleryHolder.addEventListener('touchcancel', this.onTouchCancel);

            // Задать свойство чувствительности
            this.sensivity = 150;
        }
    }

    // Открытие галереи при нажатии на изображение
    openGallery(event) {
        // Определить индекс блока с изображением
        const index = this.thumbsCollection.indexOf(event.currentTarget);

        // Проверить наличие соответствующего слайда в базе данных
        const slide = this.slidesDB.get(index);

        if(slide) {           
            // При наличии вывести слайд и зафиксировать его
            slide.showSlide();            
            this.currentSlideIndex = index;
             
        } else {
            // При отсутствии слайда, создать его
            this.createSlide(index);
        }

        // Открыть окно галереи        
        this.gallery.classList.add('open');
        this.gallery.animate(this.keyframes.zoomIn, this.duration);        
        this.freezeBody();        
    } 

    // Метод для создания слайдов, показывает лоадер во время создания слайда
    createSlide(index) {     
        // Показать лоадер        
        this.loader.setLoading();
        this.loader.showSlide();        

        // Создать новый слайд и поместить его в базу данных
        const slide = new GallerySlide(
            this.thumbsCollection[index], 
            this.imgLinksArray[index][this.resolution],
            index
        )
        this.slidesDB.set(index, slide);
        this.galleryHolder.append(slide.content);
    }

    // Метод удаления слайда, при неудачной загрузке
    removeSlide(index) {
        this.slidesDB.get(index).content.remove();
        this.slidesDB.delete(index);
    }

    // Метод обработки события загрузки слайда
    onSlideLoad(event) {
        const loadStatus = event.detail.loaded;
        const slideIndex = event.detail.index;

        // Проверить, было ли загружено изображение
        if(loadStatus) {
            // Изображение было успешно загружено, ставим новый слайд            
            this.changeSlide(slideIndex);
        } else {         
            // Изменить активный слайд
            this.currentSlideIndex = slideIndex; 
            // Ошибка загрузки изображения, меняем статус лоадера
            this.loader.setError();
            // Удаляем созданный ранее слайд
            this.removeSlide(slideIndex);
        }       
    }

    // Установить слайд с определенным номером
    changeSlide(index) {   
        // Получить новый слайд 
        const newSlide = this.slidesDB.get(index);
        
        // Получить активный слайд
        const prevSlide = this.getCurrentSlide();

        // Зафиксировать новый слайд
        this.currentSlideIndex = index;
   
        // Запустить анимацию смены слайдов
        // Появление основного слайда
        newSlide.showSlide();
        newSlide.content.animate(this.keyframes.fadeIn, this.duration);

        // Исчезновение предыдущего слайда
        prevSlide.content.animate(this.keyframes.fadeOut, this.duration) 
            .onfinish = () => prevSlide.hideSlide();
    }

    // Закрыть галерею
    closeGallery() {
        // Закрыть окно галереи
        this.gallery.animate(this.keyframes.fadeOut, this.duration)
            .onfinish = () => {
                this.gallery.classList.remove('open');
                this.unFreezeBody(); 
            };   
            
        // Скрыть активный слайд
        this.getCurrentSlide().hideSlide();
    }

    // Следующий слайд
    next() {
        // Рассчитать индекс следующего слайда
        const nextIndex = this.currentSlideIndex + 1;        

        if(nextIndex >= this.thumbsCollection.length) {
            // Если значение нового слайда вне допустимого диапазона, показать анимацию
            this.galleryHolder
                .animate(this.keyframes.elasticNext, this.duration);
        } else {
            // Иначе проверить, есть ли готовый слайд в базе данных 
            if(this.slidesDB.has(nextIndex)) {
                // При наличии слайда - показать его
                this.changeSlide(nextIndex);
            } else {
                // При отсутствии слайда, скрыть существующий слайд и создать недостающий 
                this.getCurrentSlide().hideSlide();
                this.createSlide(nextIndex);
            }
        }
    }

    // Предыдущий слайд
    back() {
        // Рассчитать индекс предыдущего слайда
        const prevIndex = this.currentSlideIndex - 1;

        if(prevIndex < 0) {
            // Если значение предыдущего слайда вне допустимого диапазона, показать анимацию
            this.galleryHolder
                .animate(this.keyframes.elasticPrev, this.duration);
        } else {
            // Иначе проверить, есть ли готовый слайд в базе данных 
            if(this.slidesDB.has(prevIndex)) {
                // При наличии слайда - показать его
                this.changeSlide(prevIndex);
            } else {
                // При отсутствии слайда, скрыть существующий слайд и создать его
                this.getCurrentSlide().hideSlide();
                this.createSlide(prevIndex);
            }
        }
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

    // Получить текущий слайд
    getCurrentSlide() {
        return  this.loader.isShown ?
                this.loader : 
                this.slidesDB.get(this.currentSlideIndex);
    }

    // Обработка событий косания на мобильных устройствах
    onTouchStart(event) {
        event.preventDefault(); 
        // Получить объект косания  
        const touchObject = event.changedTouches[0]; 
        // Зафиксировать координату точку косания и идентификатор
        this.startTouchPoint = touchObject.clientX;
        this.touchID = touchObject.identifier;       
        // Добавить слушатель для отслеживания перемещения
        this.galleryHolder.addEventListener('touchmove', this.onTouchMove);        
    }

    onTouchMove(event) {
        event.preventDefault();
        // Получить объект косания 
        const touchObject = event.changedTouches[0]; 
        // Выйти из функции если идентификатор косания изменился
        if(touchObject.identifier !== this.touchID) return;
        // Получить длинну трека
        const trackLength = touchObject.clientX - this.startTouchPoint;
        // Запустить функцию, если длинна трека выше минимальной
        if(Math.abs(trackLength) >= this.sensivity) {
            if(trackLength > 0) {
                this.back();
            } else {
                this.next();
            }
            this.onTouchCancel();
        }
    }

    onTouchCancel() {
        this.galleryHolder.removeEventListener('touchmove', this.onTouchMove);
    }
}

class Slide {
    // Функция для показа слайда
    showSlide() {
        this.content.style.transform = '';
    }
    // Функция для скрытия слайда
    hideSlide() {
        this.content.style.transform = 'translateX(-100%)';        
    }
}

class LoaderSlide extends Slide {
    constructor(loader) {
        super();
        this.content = loader;
        this.hideSlide();
        this.status = true;
    }

    showSlide() {
        super.showSlide();
        this.isShown = true;
    }

    hideSlide() {
        super.hideSlide();
        this.isShown = false;
    }

    setLoading() {
        if(!this.status) {
            this.status = true;
            this.content.classList.remove('error');
        }
    }

    setError() {
        if(this.status) {
            this.status = false;
            this.content.classList.add('error');
        }
    }
}

class GallerySlide extends Slide {
    constructor(thumb, imgLink, index) {
        super();

        // Создание свойств
        this.index = index;        

        // Привязка делегируемых методов к текущему объекту
        this.onSlideLoad = this.onSlideLoad.bind(this);
        this.onSlideLoadError = this.onSlideLoadError.bind(this);

        // Создать слайд, сохранить ссылку на него внутри объекта
        this.content = document.createElement('figure');        
        this.content.className = 'photo-cover__slide';
        this.hideSlide();

        // Создать элемент подписи под картинкой и поместить внутрь слайда
        const caption = document.createElement('figcaption');
              caption.textContent = thumb.querySelector('.photo-card__caption').textContent;
              caption.className = 'photo-cover__caption';
        this.content.append(caption);

        // Создать элемент изображения и поместить внуть слайда
        const thumpImg = thumb.querySelector('.photo-card__img');
        const img = document.createElement('img'); 
              img.onload = this.onSlideLoad; 
              img.onerror = this.onSlideLoadError;             
              img.src = imgLink;
              img.className = 'photo-cover__img';
              img.alt = thumpImg.getAttribute('alt');
              img.title = thumpImg.getAttribute('title');
        this.content.append(img);
    }    

    // Функция вызываемая при загрузке изображения
    onSlideLoad() {        
        this.content.dispatchEvent(
            this.getSlideLoadEvent(true)
        );
    }

    // Функция вызываемая при ошибке загрузки изображения
    onSlideLoadError() {
        this.content.dispatchEvent(
            this.getSlideLoadEvent(false)
        );
    }

    // Функция возврата конфигурации конструктора события загрузки слайда
    getSlideLoadEvent(loaded) {
        return new CustomEvent('slideloaded', {
            bubbles: true,
            detail: {
                loaded: loaded,
                slide: this,
                index: this.index
            }
        });
    }
}