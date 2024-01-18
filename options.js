document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggle-extension');
    const refreshButton = document.getElementById('refresh-button');
    const whitelistElement = document.getElementById('whitelist');

    chrome.storage.sync.get('enabled', function(data) {
        toggleButton.checked = data.enabled !== false;
    });

    toggleButton.addEventListener('change', function() {
        chrome.storage.sync.set({ 'enabled': toggleButton.checked });
    });

    refreshButton.addEventListener('click', function() {
        chrome.tabs.reload();
    });

    displayWhitelist();

    function displayWhitelist() {
        chrome.storage.sync.get({whitelist: []}, function(data) {
            whitelistElement.innerHTML = '';
            data.whitelist.forEach(function(site, index) {
                let li = document.createElement('li');
                li.textContent = site;
                let deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', function() {
                    removeFromWhitelist(index);
                });
                li.appendChild(deleteButton);
                whitelistElement.appendChild(li);
            });
        });
    }

    function removeFromWhitelist(index) {
        chrome.storage.sync.get({whitelist: []}, function(data) {
            let whitelist = data.whitelist;
            whitelist.splice(index, 1);
            chrome.storage.sync.set({whitelist: whitelist}, displayWhitelist);
        });
    }
});
