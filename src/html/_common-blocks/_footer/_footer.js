function currentLinkLight(object) {
    const pageUrl = location.href;
    const links = object.querySelectorAll('a[href]');
    
    links.forEach(link => {
        if(link.href === pageUrl) link.classList.add('current');
    });
}

currentLinkLight(
    document.querySelector('.footer__links')
);