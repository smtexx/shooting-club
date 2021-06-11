class Controls {
    
    constructor(burger, menu) {     
        
        this.burger = burger;
        this.burgerState = getComputedStyle(burger).display;
        this.svg = burger.querySelector('svg');
        this.menu = menu;
        this.isClosed = true;

        window.addEventListener('resize', () => {
            let currentBurgerState = getComputedStyle(burger).display; 
            if(this.burgerState !== currentBurgerState) {
                if(currentBurgerState === 'none') {
                    this.menu.classList.remove('open');
                    this.svg.classList.remove('open');
                    this.menu.style.display = '';
                    this.isClosed = true;
                } 
                this.burgerState = currentBurgerState;
            }           
        });            
        
        this.burger.addEventListener('pointerdown', () => {
            if(this.isClosed) {
                this.openMenu();
            } else {
                this.closeMenu();
            }
        });

        this.menu.addEventListener('pointerdown', event => {
            if(event.target.matches('#nav-menu > li')) {
                this.closeMenu();
            }
        })         
    }

    openMenu() {
        this.svg.classList.toggle('open');
        this.menu.style.display = 'block';
        this.isClosed = false;
        document.body.style.height = '100vh';
        document.body.style.overflowY = 'hidden';
        setTimeout(() => this.menu.classList.add('open'), 0);
    }
    closeMenu() {
        this.svg.classList.remove('open');
        this.menu.classList.remove('open');
        this.isClosed = true;   
        document.body.style.height = 'auto';
        document.body.style.overflowY = 'auto';     
        setTimeout(
            () => this.menu.style.display = 'none', 
            parseFloat(getComputedStyle(this.menu).transitionDuration) * 1000
        );
    }
}

// Controls initiation
document.addEventListener('DOMContentLoaded', () => {
    new Controls(
        document.getElementById('nav-burger'),
        document.getElementById('nav-menu')   
    );    
});
