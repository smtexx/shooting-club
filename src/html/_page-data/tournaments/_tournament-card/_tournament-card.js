import ResponsiveElement from '../../../../common_modules/ResponsiveElement';

const options = [
    {className: 'rs-small', minWidth: 510}      
];

let tournamentCards = document.querySelectorAll('.tournament-card');

if(tournamentCards) {
    tournamentCards.forEach(
        card => new ResponsiveElement(card, options)
    );
}
