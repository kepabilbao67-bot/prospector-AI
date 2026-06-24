// ProspectorAI Background Service Worker
const API_BASE = "http://localhost:3000/api";

// Process queue every 30 seconds
chrome.alarms.create("processQueue", { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "processQueue") {
    await processNextTask();
  }
});

// Process next task in queue
async function processNextTask() {
  try {
    const res = await fetch(`${API_BASE}/queue?status=pending`);
    const data = await res.json();
    
    if (!data.tasks || data.tasks.length === 0) return;

    const task = data.tasks[0];
    const now = new Date();
    const scheduledAt = new Date(task.scheduledAt);

    // Only process if scheduled time has passed
    if (scheduledAt > now) return;

    // Check if network is active
    const networkStatus = await getNetworkStatus();
    if (!networkStatus[task.network]) return;

    // Check daily limits
    const withinLimits = await checkDailyLimits(task.network);
    if (!withinLimits) return;

    console.log(`[ProspectorAI] Processing task: ${task.type} on ${task.network}`);

    // Execute task based on type
    const payload = JSON.parse(task.payload);
    
    switch (task.type) {
      case "send_message":
        await executeInTab(task.network, "sendMessage", payload);
        break;
      case "connect":
        await executeInTab(task.network, "sendConnection", payload);
        break;
      case "visit":
        await executeInTab(task.network, "visitProfile", payload);
        break;
      case "follow":
        await executeInTab(task.network, "followUser", payload);
        break;
      case "like":
        await executeInTab(task.network, "likePost", payload);
        break;
    }

    // Track analytics
    await fetch(`${API_BASE}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        network: task.network,
        eventType: "message_sent",
        metadata: { taskId: task.id, type: task.type },
      }),
    });

  } catch (error) {
    console.error("[ProspectorAI] Error processing queue:", error);
  }
}

// Execute action in appropriate tab
async function executeInTab(network, action, payload) {
  const urlPatterns = {
    linkedin: "https://www.linkedin.com/*",
    fiverr: "https://www.fiverr.com/*",
    twitter: "https://twitter.com/*",
    instagram: "https://www.instagram.com/*",
  };

  const tabs = await chrome.tabs.query({ url: urlPatterns[network] });
  
  if (tabs.length > 0) {
    chrome.tabs.sendMessage(tabs[0].id, { action, payload });
  } else if (payload.targetUrl) {
    // Open new tab if needed
    const tab = await chrome.tabs.create({ url: payload.targetUrl, active: false });
    // Wait for page to load then execute
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { action, payload });
    }, 5000);
  }
}

// Get network activation status
function getNetworkStatus() {
  return new Promise((resolve) => {
    chrome.storage.local.get("networkStatus", (data) => {
      resolve(data.networkStatus || {
        linkedin: true,
        fiverr: true,
        twitter: true,
        instagram: false,
      });
    });
  });
}

// Check daily limits
async function checkDailyLimits(network) {
  const limits = { linkedin: 30, fiverr: 20, twitter: 50, instagram: 40, email: 100 };
  
  return new Promise((resolve) => {
    chrome.storage.local.get("dailyCounts", (data) => {
      const counts = data.dailyCounts || {};
      const today = new Date().toISOString().split("T")[0];
      
      if (!counts[today]) counts[today] = {};
      const current = counts[today][network] || 0;
      
      resolve(current < (limits[network] || 50));
    });
  });
}

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("[ProspectorAI] Extension installed successfully!");
  chrome.storage.local.set({
    networkStatus: { linkedin: true, fiverr: true, twitter: true, instagram: false },
    dailyCounts: {},
  });
});
