import ResponsiveElement from '../../../../common_modules/ResponsiveElement';

const options = [
    {className: 'rs-xsmall', minWidth: 380},
    {className: 'rs-small', minWidth: 560}     
];

let tournamentCards = document.querySelectorAll('.tournament-card');

if(tournamentCards) {
    tournamentCards.forEach(
        card => new ResponsiveElement(card, options)
    );
}
