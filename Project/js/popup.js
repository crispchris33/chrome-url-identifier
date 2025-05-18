/**
 * popup.js
 * 
 * Handles the logic behind the popup interface of the extension. Enables users to:
 * - Toggle the main floating sidebar
 * - Perform Reddit and VirusTotal lookups
 * - Whitelist sites or base domains to exclude them from link previews
 * - Open the extension's options page
 * - Refresh the current tab
 * 
 * Features:
 * - Secure sidebar injection using `chrome.scripting.executeScript`
 * - VT link generation with Base64 URL encoding
 * - Site/domain whitelist toggling synced with `chrome.storage.sync`
 * - Prevents injection on system or restricted URLs (e.g., chrome://)
 * 
 * UI Controls:
 * - Sidebar launch button
 * - Reddit/VT quick access buttons
 * - Toggle switch for enabling/disabling link preview
 * - Two whitelist toggles (full URL and domain level)
 * 
 * Security:
 * - Only executes on user action
 * - Rejects execution on restricted Chrome URLs
 * - Respects sync storage permissions only for extension-controlled data
 * 
 * Author: crispchris33
 */


document.addEventListener("DOMContentLoaded", function () {
    // Function to Open Sidebar
    function openSidebar() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) return;

            const tab = tabs[0];

            if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("about:")) {
                alert("The sidebar cannot be opened in this tab.");
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["Project/js/sidebar-inject.js"]
            }).catch(() => {});

            // Close popup on sidebar open
            window.close();
        });
    }

    // Sidebar Button
    const sidebarButton = document.getElementById("sidebar-button");
    if (sidebarButton) sidebarButton.addEventListener("click", openSidebar);

    // Reddit Search Button - Opens Sidebar
    const redditButton = document.getElementById("reddit-search-button");
    if (redditButton) redditButton.addEventListener("click", openSidebar);

    // Refresh Button
    const refreshButton = document.getElementById("refresh-button");
    if (refreshButton) {
        refreshButton.addEventListener("click", function() {
            chrome.tabs.reload();
        });
    }

    // Options Button
    const optionsButton = document.getElementById("options-button");
    if (optionsButton) {
        optionsButton.addEventListener("click", function() {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
        });
    }

    // VT Search Button
    const vtButton = document.getElementById("virustotal-search-button");
    if (vtButton) {
        vtButton.addEventListener("click", async () => {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (!tab.url) {
                    alert("Unable to retrieve the current tab URL.");
                    return;
                }

                const virusTotalLink = generateVirusTotalLink(tab.url);
                if (virusTotalLink) {
                    chrome.tabs.create({ url: virusTotalLink });
                } else {
                    alert("Failed to generate VirusTotal link.");
                }

                window.close();
            } catch {
                alert("An error occurred. Please try again.");
            }
        });
    }

    // Toggle Switch
    const toggleButton = document.getElementById('toggle-extension');
    if (toggleButton) {
        chrome.storage.sync.get('enabled', function(data) {
            toggleButton.checked = data.enabled ?? true;
        });

        toggleButton.addEventListener('change', function() {
            chrome.storage.sync.set({ 'enabled': toggleButton.checked });
        });
    }

    // Whitelist Toggles
    const siteToggle = document.getElementById('whitelist-site-toggle');
    const domainToggle = document.getElementById('whitelist-domain-toggle');
    const currentSiteUrlElement = document.getElementById('current-site-url');
    const currentDomainElement = document.getElementById('current-domain');

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let fullUrl = tabs[0]?.url;
        if (!fullUrl) return;

        let domain = getDomainName(new URL(fullUrl).hostname);
        currentSiteUrlElement.textContent = fullUrl;
        currentDomainElement.textContent = domain;

        chrome.storage.sync.get({whitelist: []}, function(data) {
            siteToggle.checked = data.whitelist.includes(fullUrl);
            domainToggle.checked = data.whitelist.includes(domain);
        });
    });

    siteToggle?.addEventListener('change', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let fullUrl = tabs[0]?.url;
            if (fullUrl) updateWhitelist(siteToggle.checked, fullUrl);
        });
    });

    domainToggle?.addEventListener('change', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let url = new URL(tabs[0]?.url);
            let baseDomain = getDomainName(url.hostname);
            updateWhitelist(domainToggle.checked, baseDomain);
        });
    });
});

// Whitelist Logic
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

// Logic for TLDs with 2-part domain
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

// Options Button Link
document.getElementById('options-button').addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
});

// VT Search Functionality
function base64urlEncode(str) {
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function generateVirusTotalLink(pageUrl) {
    if (!pageUrl) return null;

    const encodedUrl = base64urlEncode(pageUrl.trim());
    return `https://www.virustotal.com/gui/url/${encodedUrl}/detection`;
}
