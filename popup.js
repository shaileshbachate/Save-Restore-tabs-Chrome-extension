let groupListVisible = false;
const saveTabsButton = document.getElementById('saveTabs');
const restoreTabsButton = document.getElementById('restoreTabs');
const groupList = document.getElementById('groupList');

saveTabsButton.addEventListener('click', () => {
    let groupName = prompt("Enter a name for this group of tabs");

    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        // Get the current window's tabs and extract their URLs
        let tabUrls = tabs.map((tab) => tab.url);
        // Save the group of tabs under the name groupName
        chrome.storage.local.set({[groupName]: tabUrls});
    });
    
    // also click the restore button to show the list of groups
    // if it is open already, close it and open it again to refresh the list
    setTimeout(() => {
        if (groupListVisible)
            restoreTabsButton.click();
        restoreTabsButton.click();
    }, 100); // 100ms is enough time for the saveTabs action to complete
});

restoreTabsButton.addEventListener('click', () => {
    groupListVisible = !groupListVisible;
    if (groupListVisible) {
        // groupList.style.display = 'block';
        chrome.storage.local.get(null, (items) => {
            groupList.innerHTML = '';
            for (let groupName in items) {
                let groupItem = document.createElement('div');
                groupItem.textContent = groupName;
                groupItem.addEventListener('click', () => {
                    chrome.storage.local.get([groupName], (items) => {
                        let urls = items[groupName];
                        // // Create a new window with the saved URLs
                        // chrome.windows.create({ url: urls, focused: true });

                        // Open the first URL in a new window and focus it
                        chrome.windows.create({ url: urls[0], focused: true }, function(window) {
                            // Create the remaining tabs in the new window
                            for (let i = 1; i < urls.length; i++) {
                                chrome.tabs.create({ windowId: window.id, url: urls[i], active: false });
                            }
                        });
                    });
                });
                groupItem.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    chrome.storage.local.remove(groupName, () => {
                        groupItem.remove();
                    });
                });
                groupList.appendChild(groupItem);
            }
        });
    } else {
        // groupList.style.display = 'none';
        groupList.innerHTML = '';
    }
});
