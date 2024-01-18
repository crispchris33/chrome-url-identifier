//popup functionality - enable button, refresh button

document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggle-extension');

    chrome.storage.sync.get('enabled', function(data) {
        if (data && typeof data.enabled !== 'undefined') {
            toggleButton.checked = data.enabled;
        } else {
            toggleButton.checked = true;
        }
    });

    toggleButton.addEventListener('change', function() {
        chrome.storage.sync.set({ 'enabled': toggleButton.checked });
    });

    const siteToggle = document.getElementById('whitelist-site-toggle');
    const domainToggle = document.getElementById('whitelist-domain-toggle');
    const currentSiteUrlElement = document.getElementById('current-site-url');
    const currentDomainElement = document.getElementById('current-domain');

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let fullUrl = tabs[0].url;
        let domain = getDomainName(new URL(fullUrl).hostname);

        currentSiteUrlElement.textContent = 'URL: ' + fullUrl;
        currentDomainElement.textContent = 'Domain: ' + domain;

        chrome.storage.sync.get({whitelist: []}, function(data) {
            siteToggle.checked = data.whitelist.includes(fullUrl);
            domainToggle.checked = data.whitelist.includes(domain);
        });
    });

    siteToggle.addEventListener('change', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let fullUrl = tabs[0].url;
            updateWhitelist(siteToggle.checked, fullUrl);
        });
    });

    domainToggle.addEventListener('change', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let url = new URL(tabs[0].url);
            let baseDomain = getDomainName(url.hostname);
            updateWhitelist(domainToggle.checked, baseDomain);
        });
    });

    document.addEventListener('DOMContentLoaded', function() {
        var optionsButton = document.getElementById('options-button');
        if (optionsButton) {
            optionsButton.addEventListener('click', function() {
                if (chrome.runtime.openOptionsPage) {
                    chrome.runtime.openOptionsPage();
                } else {
                    window.open(chrome.runtime.getURL('options.html'));
                }
            });
        }
    });

});

document.getElementById('refresh-button').addEventListener('click', function() {
    chrome.tabs.reload();
});

function updateWhitelist(enabled, domain) {
    chrome.storage.sync.get({whitelist: []}, function(data) {
        let whitelist = data.whitelist;
        let index = whitelist.indexOf(domain);

        if (enabled && index === -1) {
            whitelist.push(domain);
        } else if (!enabled && index !== -1) {
            whitelist.splice(index, 1);
        }

        chrome.storage.sync.set({whitelist: whitelist});
    });
}

//logic for tlds with 2 part domain
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

//options button link
document.getElementById('options-button').addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
});
