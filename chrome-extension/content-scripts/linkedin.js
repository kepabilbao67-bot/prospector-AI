// ProspectorAI - LinkedIn Content Script
// Handles profile extraction, connection requests, and messaging on LinkedIn

console.log("[ProspectorAI] LinkedIn content script loaded");

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "extractProfile":
      const profileData = extractLinkedInProfile();
      sendResponse({ success: !!profileData, data: profileData });
      break;
    case "sendConnection":
      sendConnectionRequest(message.payload);
      sendResponse({ success: true });
      break;
    case "sendMessage":
      sendLinkedInMessage(message.payload);
      sendResponse({ success: true });
      break;
    case "visitProfile":
      // Already on the profile - just scrolling simulates a visit
      simulateHumanScroll();
      sendResponse({ success: true });
      break;
    case "followUser":
      followUser();
      sendResponse({ success: true });
      break;
  }
  return true; // Keep channel open for async
});

// Extract profile data from LinkedIn profile page
function extractLinkedInProfile() {
  try {
    const isProfilePage = window.location.href.includes("/in/");
    if (!isProfilePage) return null;

    // Wait for elements to be available
    const nameEl = document.querySelector("h1.text-heading-xlarge") || 
                   document.querySelector(".pv-text-details--left-panel h1");
    const titleEl = document.querySelector(".text-body-medium.break-words") ||
                    document.querySelector(".pv-text-details--left-panel .text-body-medium");
    const companyEl = document.querySelector("[aria-label*='Current company']") ||
                      document.querySelector(".pv-text-details--right-panel .inline-show-more-text");
    const locationEl = document.querySelector(".text-body-small.inline.t-black--light.break-words");

    const fullName = nameEl?.textContent?.trim() || "";
    const nameParts = fullName.split(" ");
    
    const profileData = {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      jobTitle: titleEl?.textContent?.trim() || "",
      company: companyEl?.textContent?.trim() || "",
      network: "linkedin",
      profileUrl: window.location.href.split("?")[0],
      networkId: window.location.href.split("/in/")[1]?.split("/")[0] || "",
    };

    console.log("[ProspectorAI] Extracted profile:", profileData);
    return profileData;
  } catch (error) {
    console.error("[ProspectorAI] Error extracting profile:", error);
    return null;
  }
}

// Send a connection request
async function sendConnectionRequest(payload) {
  try {
    // Find the Connect button
    const connectBtn = document.querySelector('button[aria-label*="Connect"]') ||
                       document.querySelector('button[aria-label*="Conectar"]');
    
    if (connectBtn) {
      await humanDelay(1000, 3000);
      connectBtn.click();

      // Wait for modal and click "Send" or add note
      await humanDelay(1500, 2500);
      
      if (payload.message) {
        // Click "Add a note" button
        const addNoteBtn = document.querySelector('button[aria-label*="Add a note"]') ||
                           document.querySelector('button[aria-label*="Añadir nota"]');
        if (addNoteBtn) {
          addNoteBtn.click();
          await humanDelay(500, 1000);
          
          // Type the message with human-like delays
          const textarea = document.querySelector('textarea[name="message"]') ||
                           document.querySelector('#custom-message');
          if (textarea) {
            await typeWithDelay(textarea, payload.message);
          }
        }
      }

      // Click Send
      await humanDelay(500, 1500);
      const sendBtn = document.querySelector('button[aria-label*="Send"]') ||
                      document.querySelector('button[aria-label*="Enviar"]');
      if (sendBtn) sendBtn.click();

      console.log("[ProspectorAI] Connection request sent!");
    }
  } catch (error) {
    console.error("[ProspectorAI] Error sending connection:", error);
  }
}

// Send a message to a connection
async function sendLinkedInMessage(payload) {
  try {
    // Click "Message" button on profile
    const messageBtn = document.querySelector('button[aria-label*="Message"]') ||
                       document.querySelector('button[aria-label*="Mensaje"]');
    
    if (messageBtn) {
      await humanDelay(1000, 2000);
      messageBtn.click();

      // Wait for message box to open
      await humanDelay(2000, 3000);

      // Find the message input
      const messageInput = document.querySelector('.msg-form__contenteditable') ||
                           document.querySelector('[role="textbox"][aria-label*="message"]');
      
      if (messageInput && payload.message) {
        await typeWithDelay(messageInput, payload.message);
        
        // Click send
        await humanDelay(500, 1500);
        const sendBtn = document.querySelector('.msg-form__send-button') ||
                        document.querySelector('button[type="submit"]');
        if (sendBtn) sendBtn.click();

        console.log("[ProspectorAI] Message sent!");
      }
    }
  } catch (error) {
    console.error("[ProspectorAI] Error sending message:", error);
  }
}

// Follow user
async function followUser() {
  try {
    const followBtn = document.querySelector('button[aria-label*="Follow"]') ||
                      document.querySelector('button[aria-label*="Seguir"]');
    if (followBtn) {
      await humanDelay(1000, 3000);
      followBtn.click();
      console.log("[ProspectorAI] User followed!");
    }
  } catch (error) {
    console.error("[ProspectorAI] Error following user:", error);
  }
}

// Simulate human scrolling behavior
async function simulateHumanScroll() {
  const totalScroll = document.body.scrollHeight;
  let currentScroll = 0;
  
  while (currentScroll < totalScroll * 0.7) {
    const scrollAmount = Math.random() * 300 + 100;
    window.scrollBy(0, scrollAmount);
    currentScroll += scrollAmount;
    await humanDelay(500, 2000);
  }
}

// Type text with human-like delays between characters
async function typeWithDelay(element, text) {
  element.focus();
  for (const char of text) {
    element.textContent += char;
    // Trigger input event for React-based UIs
    element.dispatchEvent(new Event("input", { bubbles: true }));
    await humanDelay(30, 150); // Human typing speed
  }
}

// Random delay to simulate human behavior
function humanDelay(min, max) {
  const delay = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Auto-detect when navigating to a new profile (SPA navigation)
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    if (lastUrl.includes("/in/")) {
      console.log("[ProspectorAI] New profile detected:", lastUrl);
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
