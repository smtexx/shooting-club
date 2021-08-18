import ResponsiveElement from '../../../../common_modules/ResponsiveElement';
import MessageForm from '../../../../common_modules/MessageForm';

// Респонсивные элементы
const options = [
    {className: 'rs-wide', minWidth: 540}      
];

const contactsFields = document.querySelectorAll('.message-form__inputs');

if(contactsFields) {
    contactsFields.forEach(
        element => new ResponsiveElement(element, options)
    );
}

// Скрипт для обработки формы
if(document.getElementById('messageForm')) {
    new MessageForm();
}
