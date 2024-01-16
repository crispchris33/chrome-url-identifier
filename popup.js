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
});

document.getElementById('refresh-button').addEventListener('click', function() {
    chrome.tabs.reload();
});