var URLpath = String(window.location.hostname)
var URLlist = []


chrome.storage.local.get(["blockingEnabled", "allowedSites"], function (items) {
    const blockingEnabled = items.blockingEnabled || false;
    const allowedSites = items.allowedSites || [];
  
    const currentSite = window.location.hostname;
  
    const allowedPages = ["/popup.html", "/blocked.html"];
  
    if (blockingEnabled && !allowedPages.includes(window.location.pathname) && !allowedSites.includes(currentSite)) {
      // Replace the page content with an error message
      const errorMessage = "Access to this site is blocked.";
      document.body.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100vh;"><h1>${errorMessage}</h1></div>`;
    }
  });
  

