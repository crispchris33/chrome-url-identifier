let debounceTimer;
let whitelist = [];

// Initiate whitelist cache
chrome.storage.sync.get({whitelist: []}, function(data) {
    if (chrome.runtime.lastError) {
        console.error("Error retrieving whitelist:", chrome.runtime.lastError);
        return;
    }
    whitelist = data.whitelist;
});

chrome.storage.sync.get('enabled', function(data) {
    if (chrome.runtime.lastError) {
        console.error("Error retrieving 'enabled' status:", chrome.runtime.lastError);
        return;
    }
    if (data.enabled !== false) {
        document.body.addEventListener('mouseover', handleMouseOver);
        document.body.addEventListener('mouseout', handleMouseOut);
    }
});

function handleMouseOver(event) {
    let target = event.target.closest('a');
    if (target && target.href) {
        let domain = getDomainName(new URL(target.href).hostname);
        if (!whitelist.includes(domain)) {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            debounceTimer = setTimeout(() => showFloatingWindow(target.href, target), 100);
        }
    }
}

function handleMouseOut(event) {
    if (event.target.closest('a')) {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        hideFloatingWindow();
    }
}

//dynamic loading continue to watch dom
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {});
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

    // Clear the existing content
    floatingWindow.textContent = '';

    // Create and append the 'Link Text:' label
    let linkTextLabel = document.createElement('strong');
    linkTextLabel.textContent = 'Link Text: ';
    floatingWindow.appendChild(linkTextLabel);

    // Create and append the link text
    let linkText = document.createTextNode(linkElement.textContent);
    floatingWindow.appendChild(linkText);

    floatingWindow.appendChild(document.createElement('br'));

    // Create and append the 'Link URL:' label
    let linkUrlLabel = document.createElement('strong');
    linkUrlLabel.textContent = 'Link URL: ';
    floatingWindow.appendChild(linkUrlLabel);

    // Create and append the URL text
    let urlText = document.createTextNode(url);
    floatingWindow.appendChild(urlText);

    floatingWindow.appendChild(document.createElement('br'));

    // Create and append the 'Domain:' label
    let domainLabel = document.createElement('strong');
    domainLabel.textContent = 'Domain: ';
    floatingWindow.appendChild(domainLabel);

    // Create and append the domain name text
    let domainText = document.createTextNode(domainName);

    // Append a span with class 'highlighted-domain' for styling if needed
    let domainSpan = document.createElement('span');
    domainSpan.className = 'highlighted-domain';
    domainSpan.appendChild(domainText);
    floatingWindow.appendChild(domainSpan);

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

//checks if known 2 part domain and generates domain detail
function getDomainName(hostname) {
    const twoPartTlds = [
        'co.uk', 'com.au', 'com.br', 'co.jp', 'co.nz', 'co.za', 
        'com.sg', 'co.in', 'co.il', 'com.mx', 'com.tw', 'com.hk', 
        'co.kr', 'ne.jp', 'net.au', 'org.uk', 'ac.uk', 'gov.uk', 
        'edu.au', 'or.jp'
    ];

    let parts = hostname.split('.');
    if (parts.length > 2) {
        let lastTwoParts = parts.slice(-2).join('.');
        if (twoPartTlds.includes(lastTwoParts)) {
            return parts.slice(-3).join('.');
        }
    }
    return parts.slice(-2).join('.');
}

function hideFloatingWindow() {
    let floatingWindow = document.getElementById('linkHoverInfoWindow');
    if (floatingWindow) {
        floatingWindow.style.display = 'none';
    }
}

//listener for changes to whitelist
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
        if (key === 'whitelist' && namespace === 'sync') {
            whitelist = changes[key].newValue;
        }
    }
});