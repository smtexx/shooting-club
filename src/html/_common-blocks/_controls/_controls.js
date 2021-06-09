class Controls {
    
    constructor(burger, menu) {         

        this.burgerState = getComputedStyle(burger).display;
        
        window.addEventListener('resize', () => {
            let burgerCurrentState = getComputedStyle(burger).display;            
            if(this.burgerState !== burgerCurrentState) {
                this.burgerState = burgerCurrentState;
                window.location.reload();                
            }
        });

        if(this.burgerState !== 'none') {            
            this.burger = burger;
            this.menu = menu;
            this.isClosed = true;
            
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
    }

    openMenu() {
        this.burger.classList.toggle('open');
        this.menu.style.display = 'block';
        this.isClosed = false;
        document.body.style.height = '100vh';
        document.body.style.overflowY = 'hidden';
        setTimeout(() => this.menu.classList.toggle('open'), 0);
    }
    closeMenu() {
        this.burger.classList.toggle('open');
        this.menu.classList.toggle('open');
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
new Controls(
    document.getElementById('nav-burger'),
    document.getElementById('nav-menu'),
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--menuActivated'))
);
