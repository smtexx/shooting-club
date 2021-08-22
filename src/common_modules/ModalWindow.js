import STATUS_HOLDER from "./STATUS_HOLDER";
import scrollController from "./scrollController";

export default class ModalWindow {
    static CLASS_NAMES = {
        // Окно при ошибке отправки сообщения
        ERROR: 'error',
        // Модальное окно открыто
        OPEN: 'open',
        // Идет загрузка
        LOADING: 'loading'
    };

    static animation = {
        fadeIn: [
            {opacity: 0},
            {opacity: 1}
        ],
        fadeOut: [
            {opacity: 1},
            {opacity: 0}
        ], 
        duration: 250
    } 

    constructor(modalID) {
        this.modal = document.getElementById(modalID); 
        this.message = document.getElementById('modalWindowMessage')
        this.closeButton = document.getElementById('modalWindowClose');        

        // Добавить к кнопке функциональность закрытия окна
        this.handleClose = this.handleClose.bind(this);
        this.closeButton.addEventListener('pointerdown', this.handleClose);
    }

    // Обработать закрытие окна
    handleClose() {   
        this.modal.animate(
            ModalWindow.animation.fadeOut, 
            ModalWindow.animation.duration
        ).onfinish = () => {
            this.modal.classList.remove(ModalWindow.CLASS_NAMES.OPEN);
            scrollController.unFreeze();
        }
    }

    // Открыть окно
    open(status, text) {
        if(this.status !== status) this.setStatus(status);        
        if(this.text !== text) this.setMessage(text);        

        scrollController.freeze();
        this.modal.classList.add(ModalWindow.CLASS_NAMES.OPEN);
        this.modal.animate(
            ModalWindow.animation.fadeIn,
            ModalWindow.animation.duration
        );
    }

    // Изменить статус окна
    setStatus(status) {
        switch (status) {
            // Статус ОК
            case STATUS_HOLDER.OK:
                this.modal.classList.remove(
                    ModalWindow.CLASS_NAMES.ERROR,
                    ModalWindow.CLASS_NAMES.LOADING,                    
                );
                break;
            // Статус загрузки
            case STATUS_HOLDER.LOADING:
                this.modal.classList.remove(ModalWindow.CLASS_NAMES.ERROR);
                this.modal.classList.add(ModalWindow.CLASS_NAMES.LOADING);
                break;
            // Статус ошибки
            case STATUS_HOLDER.ERROR:
                this.modal.classList.remove(ModalWindow.CLASS_NAMES.LOADING);
                this.modal.classList.add(ModalWindow.CLASS_NAMES.ERROR);
                break;            
        }
        this.status = status;
    }    

    // Обновить сообщение
    setMessage(text) {
        this.message.textContent = text;
        this.text = text
    }
}