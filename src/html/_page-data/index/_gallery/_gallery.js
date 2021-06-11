class Gallery {
    constructor(gallery, menu) {
        try {
            this.gallery = gallery;
            this.menu = menu;

            this.holder = this.gallery.querySelector('.gallery__holder')
            this.scenes = this.holder.querySelectorAll('.gallery__scene');
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
        function changeScene(currentScene, nextScene) {                
            currentScene.style.opacity = '0';
            nextScene.style.opacity = '1';                                   
        }
        
        this.timetId = setInterval(() => {
            if(!('currentSceneNo' in this)) this.currentSceneNo = 0;
            
            let nextSceneNo = this.currentSceneNo + 1;
            nextSceneNo = (nextSceneNo >= this.scenes.length) ? 0 : nextSceneNo;
            changeScene(
                this.scenes[this.currentSceneNo], 
                this.scenes[nextSceneNo]
            );    

            this.indicators[this.currentSceneNo].classList.remove('active');
            this.indicators[nextSceneNo].classList.add('active');

            this.currentSceneNo = nextSceneNo;                
            
        }, this.timing);
    }

    stop() {
        clearInterval(this.timetId);
    }
    
} 

document.addEventListener('DOMContentLoaded', () => {
    new Gallery(
        document.getElementById('header-gallery'),
        document.getElementById('nav-menu')
    );
});

