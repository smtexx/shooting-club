import STATUS_HOLDER from "./STATUS_HOLDER";
import ModalWindow from "./ModalWindow";

export default class MessageForm {
    constructor() {        
        // Сохранить ссылки на рабочие объекты
        // Форма
        this.form = document.getElementById('messageForm');
        // Блок текстовых сообщений статуса формы
        this.statusBlock = document.getElementById('messageFormStatusBlock');  
        // Кнопка отправки формы
        this.submit = document.getElementById('messageFormSubmitButton'); 
        // Поля с содержимым, подлежащем очистке при отправке формы
        this.messageFields = [
            document.getElementById('messageFormMessage')
        ];        

        // Модальное окно
        this.modal = new ModalWindow('modalWindow');
        // Сообщения модального окна, показываемого при отправке формы
        this.modalMessages = {
            sendingError: 'К сожалению, не удалось отправить сообщение, попробуйте позже.',
            sended: 'Сообщение отправлено, благодарим Вас за обратную связь!',
            cleared: 'Поля формы очищены!',
            sending: 'Отправка сообщения...'
        };

        // Создать коллекцию объектов InputField для хранения некорректных полей
        this.wrongInputFields = new Set();

        // Добавить сушатель событий изменения статуса полей ввода
        this.handleInputStatusChange = this.handleInputStatusChange.bind(this);
        this.form.addEventListener(InputField.EVENT_TYPE, this.handleInputStatusChange);

        // Добавить слушатель очистки формы
        this.handleFormReset = this.handleFormReset.bind(this);
        this.form.addEventListener('reset', this.handleFormReset);

        // Добавить слушатель отправки формы
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.form.addEventListener('submit', this.handleFormSubmit);

        // Обернуть внутренние поля с классом input-element в InputWrapper   
        this.formFields = [...this.form.querySelectorAll('.input-wrapper')]
            .map(inputWrapperBlock => new InputWrapper(inputWrapperBlock));

        // Установить исходный статус формы
        this.updateStatus();
    }

    // Обработка события сброса формы
    handleFormReset(event) {
        // Отменить действие по умолчанию
        event.preventDefault();        
        // Обработать очистку полей
        this.formFields.forEach(inputWrapper => {            
            inputWrapper.inputField.input.value = '';
            // При очистке отслеживаемого поля, обновить статус
            if(inputWrapper.inputField.taracked) {
                inputWrapper.inputField.updateStatus();
            }
        });
        // Открыть модальное окно с сообщением
        this.modal.open(
            STATUS_HOLDER.OK,
            this.modalMessages.cleared
        );
    }
    
    // Обработка события изменения статуса полей формы
    handleInputStatusChange(event) {
        const inputField = event.detail.inputField;
        const {required, status} = inputField;        

        // Удалить поле из wrongInputFields при условиях
        if( status === STATUS_HOLDER.OK || (
            status === STATUS_HOLDER.CLEAR && !required
        )) {
            if(!this.wrongInputFields.has(inputField)) return;
            this.wrongInputFields.delete(inputField);
        } 

        // Добавить поле в wrongInputFields при условиях
        if( status === STATUS_HOLDER.ERROR || (
            status === STATUS_HOLDER.CLEAR && required
        )) {
            if(this.wrongInputFields.has(inputField)) return;
            this.wrongInputFields.add(inputField);
        }        

        // Обновить статус формы        
        this.updateStatus();
    }

    // Обработка события отправки формы
    async handleFormSubmit(event) {
        event.preventDefault();

        const address = this.form.getAttribute('action');
        const method = this.form.getAttribute('method');        
        
        try {
            // Вывести окно ожидания отправки
            this.modal.open(
                STATUS_HOLDER.LOADING,
                this.modalMessages.sending
            );

            // Искуственная задержка
            await new Promise(resolve => setTimeout(
                () => resolve(), 1500
            ))

            const response = await fetch(address, {
                method,
                body: new FormData(this.form) 
            });

            if(!response.ok) {
                throw new Error(`Message sending error, status code: ${response.status}`);
            }

            // Очистить поля с сообщениями
            this.messageFields.forEach(field => {
                field.value = '';
                field.dispatchEvent(new InputEvent('input'));
            });
    
            // Обновить модальное окно на OK
            this.modal.setStatus(STATUS_HOLDER.OK);
            this.modal.setMessage(this.modalMessages.sended);
            
        } catch (error) {
            console.log(error.message);
            
            // Обновить модальное окно на ERROR
            this.modal.setStatus(STATUS_HOLDER.ERROR);
            this.modal.setMessage(this.modalMessages.sendingError);
        }        

    }

    // Функция для проверки статуса формы
    getStatus() {        
        if(this.wrongInputFields.size === 0) {
            return STATUS_HOLDER.OK;
        }
        return STATUS_HOLDER.ERROR;
    }

    // Функция для обновления статуса формы
    updateStatus() {
        // Получить новый статус
        const newStatus = this.getStatus();
        // Вывести сообщение об ошибках в статус
        this.statusBlock.innerHTML = this.createErrorMessage();
        // Если статус не изменился - выйти из функции
        if(this.status === newStatus) return;
        
        if(newStatus === STATUS_HOLDER.OK) {
            // Разблокировать кнопку отправки
            this.submit.disabled = false;
        }

        if(newStatus === STATUS_HOLDER.ERROR) {
            // Заблокировать кнопку отправки
            this.submit.disabled = true;
        }

        this.status = newStatus;        
    }

    // Функция создания сообщения об ошибке
    createErrorMessage() {
        const wrongFields = [];
        const clearFields = [];
        let message = '';

        if(this.wrongInputFields.size === 0) return message;

        this.wrongInputFields.forEach(inputField => {
            const fieldName = inputField.input.dataset.name;

            if(inputField.status === STATUS_HOLDER.ERROR) {
                wrongFields.push(fieldName);
            } else {
                clearFields.push(fieldName);
            }            
        });

        if(wrongFields.length !== 0) {
            message = `Ошибка заполнения поля: ${wrongFields.join(', ')}`
        }

        if(clearFields.length !== 0) {
            if(message !== '') message += '<br>';
            message += `Пустые поля: ${clearFields.join(', ')}`
        }

        return message;
    }
}

class InputWrapper {    
    // Классы форматирования для текущих объектов
    static CLASS_NAMES = {
        // Поле ввода с некорректым значением
        ERROR: 'error',
        // Поле ввода с корректым значением
        OK: 'correct',
        // Обязательное поле ввода
        REQUIRED: 'required'
    };

    constructor(inputWrapper) {
        // Сохранить ссылку на inputWrapper
        this.inputWrapper = inputWrapper;

        // Извлечь регулярное выражение из атрибута data-check-template
        const regExpString = inputWrapper.dataset.checkTemplate;
        // Если шаблон для проверки был предоставлен
        if(regExpString) {
            const regExpBase = regExpString
                .match(/^\/(?<base>.+)\/(?<flags>[a-z]*)$/)
                .groups;

            this.checkTemplate = new RegExp(
                regExpBase.base, regExpBase.flags
            );
        }        

        // Добавить слушатель для inputStatusChanged
        this.handleChangeStatus = this.handleChangeStatus.bind(this);
        inputWrapper.addEventListener(
            InputField.EVENT_TYPE, this.handleChangeStatus
        );

        // Найти элемент ввода внутри inputWrapper
        const input = inputWrapper.querySelector('input, textarea');

        // Если поле для ввода обязательно, добавить соответствующий класс и свойство
        if(input.required) {
            inputWrapper.classList.add(
                InputWrapper.CLASS_NAMES.REQUIRED
            );  
        }

        // Создать элемент InputField и сохранить на него ссылку
        switch (input.name) {
            // Для телефонного поля
            case 'tel':
                this.inputField = new TelField(input);                
                break;

            // Для полей email
            case 'email':
                this.inputField = new EmailField(input);

            // Для всех прочих полей
            default:
                this.inputField = new InputField(
                    input, this.checkTemplate
                );
                break;
        }
    }

    handleChangeStatus(event) {
        this.updateStatus(event.detail.inputField.status);
    }

    updateStatus(newStatus) {        
        if(this.status === newStatus) return;
        
        switch (newStatus) {
            case STATUS_HOLDER.CLEAR:
                this.inputWrapper.classList.remove(
                    InputWrapper.CLASS_NAMES.ERROR,
                    InputWrapper.CLASS_NAMES.OK
                );
                break;

            case STATUS_HOLDER.OK:
                this.inputWrapper.classList.add(
                    InputWrapper.CLASS_NAMES.OK
                );
                this.inputWrapper.classList.remove(
                    InputWrapper.CLASS_NAMES.ERROR
                );
                break;

            case STATUS_HOLDER.ERROR:
                this.inputWrapper.classList.add(
                    InputWrapper.CLASS_NAMES.ERROR
                );
                this.inputWrapper.classList.remove(
                    InputWrapper.CLASS_NAMES.OK
                );
                break;
        }

        this.status = newStatus;
    }
}

class InputField {
    // Статические свойства для работы с классом
    // Тип собятия, отправляемого экземплярами класса
    static EVENT_TYPE = 'inputStatusChanged';
    
    constructor(input, checkTemplate) {
        // Ссылка на исходный input
        this.input = input; 

        // Добавить свойство required
        this.required = input.required ? true : false;         

        // Если передан шаблон, сохранить ссылку на него
        if(checkTemplate) {
            this.checkTemplate = checkTemplate;
        }

        // Если передано свойство checkTemplate или поле обязательно, добавить отслеживание ввода
        if(checkTemplate || input.required) {
            // Пометить поле как отслеживаемое
            this.taracked = true;
            // Добавить обработку ввода
            this.handleEdit = this.handleEdit.bind(this);
            input.addEventListener('input', this.handleEdit);
            // Активировать проверку статуса
            this.updateStatus();
        }
    }

    handleEdit() {          
        // Изменить статус поля в соответствии с новым значением        
        this.updateStatus();
    }

    defineStatus(value) {             
        if(/^\s*$/.test(value)) return STATUS_HOLDER.CLEAR; 
        if(!this.checkTemplate) return STATUS_HOLDER.OK;
        return this.checkTemplate.test(value) ? 
            STATUS_HOLDER.OK : 
            STATUS_HOLDER.ERROR;            
    }

    updateStatus() {
        const newStatus = this.defineStatus(this.input.value);
        // Если новый статус равен текущему, выйти из функции
        if(newStatus === this.status) return;
        // Иначе изменить свойство статуса
        this.status = newStatus;
        // Сгенерировать событие смены статуса
        this.input.dispatchEvent(
            new CustomEvent(InputField.EVENT_TYPE, {
                bubbles: true,
                detail: {
                    inputField: this
                }
            })
        );        
    }
}

class InputFormattedField extends InputField {
    constructor(input, {
            // Префикс, добавляемый к полю
            prefix,
            // Шаблонная строка для редактирования введенного в поле значения
            editTemplate,
            // Регулярное выражение для проверки введенного в поле значения
            checkTemplate,
            // Регулярное выражение, содержащее допустимые символы
            allowedValues
        }) {
        super(input, checkTemplate);
        // Сохранить ссылку на шаблон, используемый для форматирования поля
        this.template = editTemplate;         
        // Сохранить ссылку на регулярное выражение с допустимыми значениями
        this.allowedValues = allowedValues;

        // Добавить слушатель для изменения префикса при событиях фокуса
        if(prefix) {
            // Сохранить префикс поля
            this.prefix = prefix; 
            // Привязать методы к текущему объекту
            this.handleFocus = this.handleFocus.bind(this);
            this.handleBlur = this.handleBlur.bind(this);
            // Добавить слушатели
            input.addEventListener('focus', this.handleFocus);
            input.addEventListener('blur', this.handleBlur);
        }
    }

    // Переопределяем исходный метод
    handleEdit(event) {
        // Извлечь значение из input
        const value = event.target.value;
        // Форматировать значение и установить его в поле
        this.input.value = this.formatValue(value);
        // Запустить исходный метод родительского класса
        super.handleEdit(event);        
    }

    handleFocus(event) {
        if(event.target.value.length === 0) {
            event.target.value = this.prefix;
        }
    }

    handleBlur(event) {
        if(event.target.value.length <= this.prefix.length) {
            event.target.value = '';
            this.updateStatus();
        }
    }

    // Метод для форматирования значения по шаблону
    formatValue(value) {
        // Создать копию переданного значения
        let editableValue = value;        
        
        if(this.prefix) {
            // Если указан префикс, вернуть его при минимальном заполнении поля
            if(value.length <= this.prefix.length) return this.prefix;
            // Удалить первые символы на длинну префикса
            editableValue = editableValue.substring(this.prefix.length);            
        }        

        // Удалить из значения все недопустимые символы
        editableValue = editableValue.replace(/./g, symbol =>             
            this.allowedValues.test(symbol) ? symbol : ''
        );        
        
        // Если все символы удалены, вернуть префикс
        if(editableValue.length === 0) {
            return this.prefix;
        }
        
        // Обрезать лишние символы если они есть 
        const maxInputLength = this.template.match(/\?/g).length;        
        if(editableValue.length > maxInputLength) {
            editableValue = editableValue.substring(0, maxInputLength);
        }       
            
        // Заменить элементы шаблона значениями из editableValue
        let counter = 0;        
        return this.prefix + this.template.replace(/./g,
            symbol => {
                if(counter < editableValue.length) {                    
                    return symbol === '?' ? editableValue[counter++] : symbol;
                }
                return '';
            }
        );               
    }
}

// Специализированные поля

class TelField extends InputFormattedField {
    constructor(input) {
        super(input, {
            prefix: '+7',
            editTemplate: ' (???) ???-??-??',
            checkTemplate: /^\+7 \(\d{3}\) \d{3}(-\d{2}){2}$/,
            allowedValues: /[\d]/
        });
    }
}

class EmailField extends InputField {
    constructor(input) {
        super(
            input, 
            /^[\w-][\w.-]+[\w-]@[a-z0-9.-]+\.[a-z]{2,}$/g
        );
    }
}

