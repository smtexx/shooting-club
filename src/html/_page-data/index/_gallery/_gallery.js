class Gallery {
    constructor(gallery, menu) {
        try {
            this.gallery = gallery;
            this.menu = menu;

            this.holder = this.gallery.querySelector('.gallery__holder')
            this.scenes = this.holder.querySelectorAll('.gallery__scene');  
            this.currentSceneNo = 0;          
            this.indicators = this.gallery.querySelectorAll('.gallery__indicator span');
            this.timing = +this.gallery.dataset.timing;            
    
            if(this.menu) {
                this.observer = new MutationObserver(record => {            
                    if(record[0].target.classList.contains('open')) {
                        this.stop();
                    } else {                        
                        this.play();
                    }
                });
                this.observer.observe(this.menu, {
                    attributes: true,
                    attributeFilter: ['class']            
                });
            }
            
            this.play();

        } catch (error) {
            console.log(error.message);
        }
    }

    play() {    
        function changeScene(gallery) {
            gallery.nextSceneNo = gallery.currentSceneNo + 1;
            if(gallery.nextSceneNo >= gallery.scenes.length) gallery.nextSceneNo = 0;
            
            gallery.scenes[gallery.currentSceneNo].style.opacity = '0';
            gallery.scenes[gallery.nextSceneNo].style.opacity = '1';

            gallery.indicators[gallery.currentSceneNo].classList.remove('active');
            gallery.indicators[gallery.nextSceneNo].classList.add('active');

            gallery.currentSceneNo = gallery.nextSceneNo;
        }  
        
        this.timerId = setInterval(() => {
            changeScene(this);
        }, this.timing);
    }

    stop() {
        clearTimeout(this.timerId);
    }   
} 

let headerGallery = document.getElementById('header-gallery'); 
if(headerGallery) {
    document.addEventListener('DOMContentLoaded', () => {
        new Gallery(
            headerGallery,
            document.getElementById('nav-menu')
        );
    });
}


