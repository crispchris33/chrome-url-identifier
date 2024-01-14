let debounceTimer;

document.body.addEventListener('mouseover', function(event) {
    let target = event.target.closest('a');
    if (target && target.href) {
        showFloatingWindow(target.href, target);
    }
});

document.body.addEventListener('mouseout', function(event) {
    if (event.target.closest('a')) {
        hideFloatingWindow();
    }
});

// Start observing DOM
observer.observe(document.body, { childList: true, subtree: true });


function showFloatingWindow(url, linkElement) {
    let floatingWindow = document.getElementById('linkHoverInfoWindow');
    if (!floatingWindow) {
        floatingWindow = document.createElement('div');
        floatingWindow.id = 'linkHoverInfoWindow';
        document.body.appendChild(floatingWindow);
    }

    let domainName = getDomainName(new URL(url).hostname);

    floatingWindow.innerHTML = `<strong>Link Text:</strong> ${linkElement.textContent}<br><strong>Link URL:</strong> ${url}<br><strong>Domain:</strong> <span class='highlighted-domain'>${domainName}</span>`;

    positionFloatingWindow(floatingWindow, linkElement);
}

function positionFloatingWindow(floatingWindow, linkElement) {
    let rect = linkElement.getBoundingClientRect();
    let topPosition = window.scrollY + rect.bottom + 10;
    let leftPosition = window.scrollX + rect.left;

    floatingWindow.style.position = 'absolute';
    floatingWindow.style.top = topPosition + 'px';
    floatingWindow.style.left = leftPosition + 'px';
    floatingWindow.style.display = 'block';
}

//dynamic loading continue to watch dom
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
    });
});

function getDomainName(hostname) {
    let parts = hostname.split('.');
    if (parts.length > 1) {
        return parts.slice(-2).join('.');
    }
    return hostname;
}

function hideFloatingWindow() {
    let floatingWindow = document.getElementById('linkHoverInfoWindow');
    if (floatingWindow) {
        floatingWindow.style.display = 'none';
    }
}
