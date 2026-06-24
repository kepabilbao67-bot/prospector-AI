// ProspectorAI Popup Script

const API_BASE = "http://localhost:3000/api";

// Toggle network activation
document.querySelectorAll(".toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    const network = toggle.dataset.network;
    chrome.storage.local.get("networkStatus", (data) => {
      const status = data.networkStatus || {};
      status[network] = toggle.classList.contains("active");
      chrome.storage.local.set({ networkStatus: status });
    });
  });
});

// Extract current profile
document.getElementById("extractBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: "extractProfile" }, (response) => {
    if (response && response.success) {
      // Save to backend
      fetch(`${API_BASE}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response.data),
      }).then(() => {
        showNotification("Perfil extraído y guardado correctamente");
      });
    } else {
      showNotification("No se pudo extraer el perfil. Asegúrate de estar en un perfil válido.");
    }
  });
});

// Add to prospection queue
document.getElementById("addToQueueBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  const task = {
    type: "send_message",
    network: detectNetwork(tab.url),
    payload: { targetUrl: tab.url },
    delayMinutes: 5,
    priority: 5,
  };

  fetch(`${API_BASE}/queue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  }).then(() => {
    showNotification("Añadido a la cola de prospección");
    updateStats();
  });
});

// Open dashboard
document.getElementById("openDashboardBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:3000" });
});

// Detect network from URL
function detectNetwork(url) {
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("fiverr.com")) return "fiverr";
  if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
  if (url.includes("instagram.com")) return "instagram";
  return "other";
}

// Update stats display
async function updateStats() {
  try {
    const res = await fetch(`${API_BASE}/queue?status=all`);
    const data = await res.json();
    document.getElementById("queueSize").textContent = data.counts?.pending || 0;
  } catch (e) {
    console.log("Backend not available");
  }
}

// Show notification
function showNotification(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "ProspectorAI",
    message: message,
  });
}

// Load initial stats
updateStats();

// Load network status from storage
chrome.storage.local.get("networkStatus", (data) => {
  const status = data.networkStatus || {
    linkedin: true,
    fiverr: true,
    twitter: true,
    instagram: false,
  };
  
  document.querySelectorAll(".toggle").forEach((toggle) => {
    const network = toggle.dataset.network;
    if (status[network]) {
      toggle.classList.add("active");
    } else {
      toggle.classList.remove("active");
    }
  });
});
