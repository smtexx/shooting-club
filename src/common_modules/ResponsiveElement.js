export default class ResponsiveElement {
    constructor(element, options) {
        // Initial data create
        this.element = element;            
        this.resize = this.resize.bind(this);

        // Element initialize
        this.init(options);
        this.resize();

        // Add observer        
        this.observer = new ResizeObserver(this.resize);
        this.observer.observe(this.element);
    }
    
    // Initialize an object, make arrays with data
    init(options) {
        this.resolutions = [];
        this.classRange = [];
        options.forEach(mediaQuery => {
            this.resolutions.push(mediaQuery.minWidth);
            this.classRange.push(mediaQuery.className);
        });
    }

    // Function accepts current element width and returns index of current active resolution or "min" if none is not active
    getIndex(currentWidth) {
        if(currentWidth < this.resolutions[0]) return 'min';

        for(let i = this.resolutions.length - 1; i >= 0; i--) {
            if(currentWidth >= this.resolutions[i]) return i;
        }
    }
    
    // Function accepts index of resolution and returns array with actual classes
    getClassNames(index) {
        let classNames = [];        

        for(let i = 0; i <= index; i++) {
            classNames.push(this.classRange[i]);
        }

        return classNames;
    }

    // Function for adding classes on element resizes
    resize() {        
        let state = this.getIndex(this.element.offsetWidth);
        
        if(!this.hasOwnProperty('state')) {
            this.state = state;
            if(state === 'min') return;
            this.element.classList.add(...this.getClassNames(state));            
        };

        if(this.state === state) return;

        let prevClassList = this.getClassNames(this.state);
        let currentClassList = this.getClassNames(state);        

        if(currentClassList.length < prevClassList.length) {
            prevClassList.forEach(className => {                
                if(!currentClassList.includes(className)) {
                    this.element.classList.remove(className);
                }
            });
        } else {
            currentClassList.forEach(className => {
                if(!prevClassList.includes(className)) {
                    this.element.classList.add(className);
                }
            });
        }

        this.state = state;
    }
}

