document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggle-extension');
    const refreshButton = document.getElementById('refresh-button');
    const whitelistTableBody = document.getElementById('whitelist');

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

    chrome.storage.onChanged.addListener(function(changes, areaName) {
        if (areaName === 'sync' && changes.whitelist) {
            displayWhitelist();
        }
    });

    function displayWhitelist() {
        chrome.storage.sync.get({whitelist: []}, function(data) {
            const whitelistElement = document.getElementById('whitelist');
            whitelistElement.innerHTML = '';
            data.whitelist.forEach(function(site, index) {
                let row = document.createElement('tr');
    
                // URL column
                let urlCell = document.createElement('td');
                urlCell.textContent = site;
                urlCell.className = 'url-column';
                row.appendChild(urlCell);
    
                // Actions column
                let actionsCell = document.createElement('td');
                actionsCell.className = 'actions-column';
                let deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'btn btn-danger btn-sm';
                deleteButton.addEventListener('click', function() {
                    removeFromWhitelist(index);
                });
                actionsCell.appendChild(deleteButton);
                row.appendChild(actionsCell);
    
                whitelistElement.appendChild(row);
            });
        });
    }

    function removeFromWhitelist(index) {
        chrome.storage.sync.get({whitelist: []}, function(data) {
            let whitelist = data.whitelist;
            whitelist.splice(index, 1);
            chrome.storage.sync.set({whitelist: whitelist});
        });
    }
});
