// sidebar function
function openSidebar() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length === 0) {
            console.error("No active tab found.");
            return;
        }

        const tab = tabs[0];

        // Check if the tab URL is valid for script injection
        if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("about:")) {
            console.error("Cannot inject script into this tab:", tab.url);
            alert("The sidebar cannot be opened in this tab.");
            return;
        }

        const tabId = tab.id;

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                // check if sidebar already exists
                if (document.getElementById("custom-sidebar")) {
                    console.log("Sidebar already exists. Toggling visibility.");
                    const sidebar = document.getElementById("custom-sidebar");
                    sidebar.style.display = sidebar.style.display === "none" ? "block" : "none";
                    return;
                }

                // create the sidebar
                const sidebar = document.createElement("div");
                sidebar.id = "custom-sidebar";
                sidebar.style.position = "fixed";
                sidebar.style.top = "0";
                sidebar.style.right = "0";
                sidebar.style.width = "300px";
                sidebar.style.height = "100%";
                sidebar.style.backgroundColor = "#ffffff";
                sidebar.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
                sidebar.style.zIndex = "9999";
                sidebar.style.overflowY = "auto";
                sidebar.style.borderLeft = "1px solid #ddd";

                const content = document.createElement("div");
                content.style.padding = "20px";
                content.innerHTML = `
                    <h2>Custom Sidebar</h2>
                    <p>This is your sidebar content!</p>
                `;

                const closeButton = document.createElement("button");
                closeButton.textContent = "Close";
                closeButton.style.position = "absolute";
                closeButton.style.top = "10px";
                closeButton.style.right = "10px";
                closeButton.style.padding = "5px 10px";
                closeButton.style.backgroundColor = "#f44336";
                closeButton.style.color = "#fff";
                closeButton.style.border = "none";
                closeButton.style.cursor = "pointer";
                closeButton.style.borderRadius = "3px";

                closeButton.addEventListener("click", () => {
                    sidebar.style.display = "none";
                });

                sidebar.appendChild(closeButton);
                sidebar.appendChild(content);
                document.body.appendChild(sidebar);
            }
        });

        window.close();
    });
}




document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggle-extension');

    const redditButton = document.getElementById("reddit-search-button");
    if (redditButton) {
        redditButton.addEventListener("click", openSidebar);
    }

    const sidebarButton = document.getElementById("sidebar-button");
    if (sidebarButton) {
        sidebarButton.addEventListener("click", openSidebar);
    }

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
            } catch (error) {
                console.error("Error opening VirusTotal link:", error);
                alert("An error occurred. Please try again.");
            }
        });
    }

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

        currentSiteUrlElement.textContent = fullUrl;
        currentDomainElement.textContent = domain;

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

//VT Search Functionality
function base64urlEncode(str) {
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function generateVirusTotalLink(pageUrl) {
    if (!pageUrl) {
        console.error("Please provide a valid URL.");
        return null;
    }

    const encodedUrl = base64urlEncode(pageUrl.trim());

    const virusTotalUrl = `https://www.virustotal.com/gui/url/${encodedUrl}/detection`;

    return virusTotalUrl;
}