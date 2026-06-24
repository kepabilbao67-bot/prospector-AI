// ProspectorAI - Fiverr Content Script
// Handles buyer extraction, messaging, and proposal automation on Fiverr

console.log("[ProspectorAI] Fiverr content script loaded");

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "extractProfile":
      const profileData = extractFiverrProfile();
      sendResponse({ success: !!profileData, data: profileData });
      break;
    case "sendMessage":
      sendFiverrMessage(message.payload);
      sendResponse({ success: true });
      break;
    case "extractBuyerRequests":
      const requests = extractBuyerRequests();
      sendResponse({ success: true, data: requests });
      break;
  }
  return true;
});

// Extract profile/buyer data from Fiverr
function extractFiverrProfile() {
  try {
    const url = window.location.href;
    
    // Seller profile page
    if (url.includes("/sellers/") || url.includes("fiverr.com/")) {
      const nameEl = document.querySelector(".seller-card .username") ||
                     document.querySelector("h1") ||
                     document.querySelector(".seller-overview .username");
      const titleEl = document.querySelector(".seller-card .one-liner") ||
                      document.querySelector(".seller-overview .one-liner");
      const locationEl = document.querySelector(".seller-card .location") ||
                         document.querySelector(".seller-overview .country");

      const username = nameEl?.textContent?.trim() || "";
      
      return {
        firstName: username,
        lastName: "",
        jobTitle: titleEl?.textContent?.trim() || "Fiverr Seller",
        company: "Fiverr",
        network: "fiverr",
        profileUrl: url.split("?")[0],
        networkId: username,
        notes: `Location: ${locationEl?.textContent?.trim() || "Unknown"}`,
      };
    }

    // Buyer request / project page
    if (url.includes("/buyers/") || url.includes("/projects/")) {
      const titleEl = document.querySelector(".brief-title") ||
                      document.querySelector("h1");
      const buyerEl = document.querySelector(".buyer-name") ||
                      document.querySelector(".username");

      return {
        firstName: buyerEl?.textContent?.trim() || "Buyer",
        lastName: "",
        jobTitle: "Buyer",
        company: titleEl?.textContent?.trim() || "Fiverr Project",
        network: "fiverr",
        profileUrl: url.split("?")[0],
        notes: `Project: ${titleEl?.textContent?.trim() || ""}`,
      };
    }

    return null;
  } catch (error) {
    console.error("[ProspectorAI] Error extracting Fiverr profile:", error);
    return null;
  }
}

// Send a message on Fiverr
async function sendFiverrMessage(payload) {
  try {
    // Find message/contact button
    const contactBtn = document.querySelector('a[href*="contact"]') ||
                       document.querySelector('button[class*="contact"]') ||
                       document.querySelector(".seller-card .contact-seller");
    
    if (contactBtn) {
      await humanDelay(1000, 2000);
      contactBtn.click();

      // Wait for message form
      await humanDelay(2000, 3000);

      const textarea = document.querySelector('textarea') ||
                       document.querySelector('[contenteditable="true"]');
      
      if (textarea && payload.message) {
        await typeWithDelay(textarea, payload.message);
        
        await humanDelay(500, 1500);
        const sendBtn = document.querySelector('button[type="submit"]') ||
                        document.querySelector('.submit-button');
        if (sendBtn) sendBtn.click();

        console.log("[ProspectorAI] Fiverr message sent!");
      }
    }
  } catch (error) {
    console.error("[ProspectorAI] Error sending Fiverr message:", error);
  }
}

// Extract buyer requests from the buyer requests page
function extractBuyerRequests() {
  try {
    const requests = [];
    const requestCards = document.querySelectorAll('.brief-card, .request-card, [class*="buyer-request"]');
    
    requestCards.forEach((card) => {
      const title = card.querySelector('.brief-title, h3, .title')?.textContent?.trim();
      const description = card.querySelector('.brief-description, .description, p')?.textContent?.trim();
      const budget = card.querySelector('.budget, .price, [class*="budget"]')?.textContent?.trim();
      const deadline = card.querySelector('.deadline, .delivery, [class*="deadline"]')?.textContent?.trim();
      
      if (title) {
        requests.push({
          title,
          description: description?.slice(0, 200) || "",
          budget: budget || "Not specified",
          deadline: deadline || "Not specified",
          url: card.querySelector('a')?.href || window.location.href,
        });
      }
    });

    console.log(`[ProspectorAI] Extracted ${requests.length} buyer requests`);
    return requests;
  } catch (error) {
    console.error("[ProspectorAI] Error extracting buyer requests:", error);
    return [];
  }
}

// Type text with human-like delays
async function typeWithDelay(element, text) {
  element.focus();
  
  if (element.tagName === "TEXTAREA" || element.tagName === "INPUT") {
    // Standard form elements
    for (const char of text) {
      element.value += char;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      await humanDelay(30, 120);
    }
  } else {
    // ContentEditable elements
    for (const char of text) {
      element.textContent += char;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      await humanDelay(30, 120);
    }
  }
}

// Random delay for human-like behavior
function humanDelay(min, max) {
  const delay = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Monitor for new buyer requests (when on buyer requests page)
if (window.location.href.includes("buyer_requests") || window.location.href.includes("briefs")) {
  console.log("[ProspectorAI] Monitoring buyer requests page...");
  
  // Check for new requests periodically
  setInterval(() => {
    const requests = extractBuyerRequests();
    if (requests.length > 0) {
      chrome.storage.local.get("lastRequestCount", (data) => {
        if (requests.length > (data.lastRequestCount || 0)) {
          chrome.runtime.sendMessage({
            type: "newBuyerRequests",
            count: requests.length - (data.lastRequestCount || 0),
          });
        }
        chrome.storage.local.set({ lastRequestCount: requests.length });
      });
    }
  }, 30000); // Check every 30 seconds
}
