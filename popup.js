document.addEventListener("DOMContentLoaded", function () {
    const passwordKey = "extensionPasswordHash";
    const allowedSitesKey = "allowedSites";
  
    let blockingEnabled = false;
  
    document.getElementById("enableButton").addEventListener("click", enableBlocking);
    document.getElementById("disableButton").addEventListener("click", disableBlocking);
    document.getElementById("allowButton").addEventListener("click", allowCurrentSite);

    

    // Load initial UI state
    chrome.storage.local.get([ "blockingEnabled", passwordKey, allowedSitesKey ], function (items) {
      blockingEnabled = items.blockingEnabled || false;
      updateUI();
      
      const allowedSites = items[allowedSitesKey] || [];
      if (allowedSites.length > 0) {
        chrome.storage.local.set({ [allowedSitesKey]: [] }); // Reset allowed sites
        alert("Allowed sites list has been reset.");
      }
  
      if (!items.hasOwnProperty(passwordKey)) {
        // First-time setup: Ask user to set password
        const newPassword = prompt("Set a new password:");
        if (newPassword) {
          const passwordHash = generatePasswordHash(newPassword);
          chrome.storage.local.set({ [passwordKey]: passwordHash });
        }
      }

      
    });

  
    function disableBlocking() {
      const passwordInput = document.getElementById("passwordInput").value;
      chrome.storage.local.get([passwordKey], function (items) {
        const storedPasswordHash = items[passwordKey];
        const enteredPasswordHash = generatePasswordHash(passwordInput);
  
        if (storedPasswordHash === enteredPasswordHash) {
          alert("Unblocking all Sites");
          blockingEnabled = false;
          chrome.storage.local.set({ blockingEnabled });
          updateUI();
        } else {
          alert("Incorrect password!");
        }
      });
    }
  
    function enableBlocking() {
      blockingEnabled = true;
      chrome.storage.local.set({ blockingEnabled });
      updateUI();
    }
  
    function allowCurrentSite() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const currentSite = new URL(tabs[0].url).hostname;
    
          // Prompt for the password before allowing the site
          const enteredPassword = prompt("Enter the password to allow this site:");
          if (enteredPassword !== null) {
            chrome.storage.local.get([passwordKey], function (items) {
              const storedPasswordHash = items[passwordKey];
              const enteredPasswordHash = generatePasswordHash(enteredPassword);
    
              if (storedPasswordHash === enteredPasswordHash) {
                chrome.storage.local.get([allowedSitesKey], function (items) {
                  const allowedSites = items[allowedSitesKey] || [];
                  if (!allowedSites.includes(currentSite)) {
                    allowedSites.push(currentSite);
                    chrome.storage.local.set({ [allowedSitesKey]: allowedSites }, function () {
                      alert("Site allowed!");
                    });
                  } else {
                    alert("Site is already allowed.");
                  }
                });
              } else {
                alert("Incorrect password.");
              }
            });
          }
        });
      }
  
    function updateUI() {
      const enableButton = document.getElementById("enableButton");
      const disableButton = document.getElementById("disableButton");
  
      if (blockingEnabled) {
        enableButton.disabled = true;
        disableButton.disabled = false;
      } else {
        enableButton.disabled = false;
        disableButton.disabled = true;
      }
    }
  
    function generatePasswordHash(password) {
      // bcrypt
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        hash = (hash << 5) - hash + password.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return hash.toString();
    }
  });
  