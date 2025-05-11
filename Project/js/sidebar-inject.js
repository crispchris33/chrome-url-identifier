(function () {
  const SIDEBAR_ID = "custom-sidebar";

  const existing = document.getElementById(SIDEBAR_ID);
  if (existing) {
    existing.remove();
    return;
  }

  const sidebar = document.createElement("div");
  sidebar.id = SIDEBAR_ID;
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    background-color: #fff;
    box-shadow: -2px 0 10px rgba(0,0,0,0.3);
    z-index: 2147483647;
    overflow-y: auto;
    border-left: 1px solid #ddd;
    font-family: Arial, sans-serif;
    padding: 16px;
  `;

  sidebar.innerHTML = `
    <button id="close-sidebar" style="
      position: absolute;
      top: 10px;
      right: 10px;
      background: #f44336;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      font-weight: bold;
      cursor: pointer;">✕</button>

    <div class="tab-switcher" style="margin-top: 40px; display: flex; gap: 8px;">
    <button class="tab-btn active" data-target="reddit-panel" style="
        flex: 1;
        padding: 10px;
        border-radius: 30px;
        border: none;
        font-weight: bold;
        font-size: 18px;
        background: #ff4500;
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;">
        <img src="https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png" alt="Reddit Icon" style="width: 18px; height: 18px;">
        Reddit
    </button>

    <button class="tab-btn" data-target="virustotal-panel" style="
        flex: 1;
        padding: 10px;
        border-radius: 30px;
        border: none;
        font-weight: bold;
        font-size: 18px;
        background: #e0e0e0;
        color: #333;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;">
        <span style="display: inline-flex; align-items: center;">
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 100 89">
            <path fill-rule="evenodd" d="M45.292 44.5 0 89h100V0H0l45.292 44.5zM90 80H22l35.987-35.2L22 9h68v71z"></path>
        </svg>
        </span>
        VirusTotal
    </button>
    </div>

    <div id="panels" style="margin-top: 20px;">
        <div id="reddit-panel" class="panel" style="display: block;">
            <h3 style="margin-bottom: 10px;">Reddit Page Title Search</h3>
            <p style="margin-bottom: 10px;">Select a title to search Reddit:</p>
            <div id="title-options" style="margin-bottom: 10px;"></div>
            <textarea id="search-input" placeholder="Edit or confirm title..." style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px;"></textarea>
            <button id="search-reddit" style="margin-top: 10px; width: 100%; padding: 10px; background: #ff4500; color: white; border: none; border-radius: 25px; font-weight: bold;">Search in Reddit</button>
        </div>
        <div id="virustotal-panel" class="panel" style="display: none;">
        <h3 style="margin-bottom: 10px;">VirusTotal URL or Hash Search</h3>
        <p style="margin-bottom: 10px;">Paste or modify a URL or hash below, or use one of the quick options.</p>
        
        <textarea id="vt-input" placeholder="Paste URL or hash here..." style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 10px;"></textarea>
        
        <div style="display: flex; gap: 6px; margin-bottom: 12px;">
            <button id="vt-full-url" title="Use current page URL" style="flex: 1; padding: 8px; font-size: 16px; border-radius: 25px; display: flex; align-items: center; justify-content: center; gap: 6px;">
            🌐 Full URL
            </button>
            <button id="vt-base-url" title="Use base domain only" style="flex: 1; padding: 8px; font-size: 16px; border-radius: 25px; display: flex; align-items: center; justify-content: center; gap: 6px;">
            🏠 Domain
            </button>
            <button id="vt-clear-input" title="Clear input field" style="flex: 1; padding: 8px; font-size: 16px; border-radius: 25px; display: flex; align-items: center; justify-content: center; gap: 6px;">
            ❌ Clear
            </button>
        </div>

        <div id="vt-preview-container" style="display: none; font-size: 13px; margin-bottom: 10px; transition: opacity 0.3s;">
            <strong>Preview:</strong>
            <span id="vt-preview-link" style="word-break: break-all;"></span>
            <button id="vt-copy" style="margin-left: 8px; font-size: 12px;">📋 Copy</button>
        </div>

        <button id="vt-submit" style="width: 100%; padding: 12px; font-size: 15px; font-weight: bold; background-color: #007bff; color: white; border: none; border-radius: 25px; cursor: pointer;">
            Submit to VirusTotal
        </button>
        </div>

    </div>
  `;

  document.body.appendChild(sidebar);

  // Close button
  document.getElementById("close-sidebar").addEventListener("click", () => {
    sidebar.remove();
  });

  // Tab switching
  const tabButtons = sidebar.querySelectorAll(".tab-btn");
  const panels = sidebar.querySelectorAll(".panel");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => {
        b.classList.remove("active");
        b.style.background = "#e0e0e0";
        b.style.color = "#333";
      });

      const target = btn.getAttribute("data-target");
      btn.classList.add("active");

      if (target === "reddit-panel") {
        btn.style.background = "#ff4500";
        btn.style.color = "#fff";
      } else if (target === "virustotal-panel") {
        btn.style.background = "#007bff";
        btn.style.color = "#fff";
      }

      panels.forEach(p => p.style.display = "none");
      document.getElementById(target).style.display = "block";
    });
  });

  // Title Extraction
  const titles = [];
  const pageTitle = document.title;
  if (pageTitle) titles.push({ label: "Page Title", value: pageTitle });

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle?.content) titles.push({ label: "Content Title", value: ogTitle.content });

  const h1 = document.querySelector("h1");
  if (h1?.innerText) titles.push({ label: "H1 Title", value: h1.innerText });

  const metaTitle = document.querySelector('meta[name="title"]') || document.querySelector('meta[name="description"]');
  if (metaTitle?.content) titles.push({ label: "Meta Title", value: metaTitle.content });

  const titleOptionsContainer = sidebar.querySelector("#title-options");

  titles.forEach(({ label, value }) => {
    const div = document.createElement("div");
    div.className = "title-box";
    div.textContent = `${label}: ${value}`;
    div.style.cssText = `
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 6px;
      cursor: pointer;
    `;
    div.addEventListener("click", () => {
      sidebar.querySelectorAll(".title-box").forEach(b => b.style.background = "");
      div.style.background = "rgba(0,255,0,0.15)";
      sidebar.querySelector("#search-input").value = value;
    });
    titleOptionsContainer.appendChild(div);
  });

  // Reddit Search
  sidebar.querySelector("#search-reddit").addEventListener("click", () => {
    const query = sidebar.querySelector("#search-input").value.trim();
    if (!query) return alert("Please enter a search term.");
    const redditURL = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`;
    window.open(redditURL, "_blank");
  });
  function base64urlEncode(str) {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function isValidHash(input) {
  const clean = input.trim().toLowerCase();
  return (
    /^[a-f0-9]{32}$/.test(clean) ||  // MD5
    /^[a-f0-9]{40}$/.test(clean) ||  // SHA-1
    /^[a-f0-9]{64}$/.test(clean)     // SHA-256
  );
}

const vtInput = sidebar.querySelector("#vt-input");
const vtPreviewContainer = sidebar.querySelector("#vt-preview-container");
const vtPreviewLink = sidebar.querySelector("#vt-preview-link");
const vtCopyBtn = sidebar.querySelector("#vt-copy");
const vtSubmit = sidebar.querySelector("#vt-submit");

// Autofill input on open
vtInput.value = window.location.href;
updateVTPreview();

// Preview logic
vtInput.addEventListener("input", updateVTPreview);

function updateVTPreview() {
  const input = vtInput.value.trim();
  if (!input) {
    vtPreviewContainer.style.display = "none";
    return;
  }

  let vtUrl = "";

  if (isValidHash(input)) {
    vtUrl = `https://www.virustotal.com/gui/file/${input}`;
  } else {
    const encoded = base64urlEncode(input);
    vtUrl = `https://www.virustotal.com/gui/url/${encoded}/detection`;
  }

  vtPreviewLink.textContent = vtUrl;
  vtPreviewContainer.style.opacity = "0";
  vtPreviewContainer.style.display = "block";

  setTimeout(() => {
    vtPreviewContainer.style.opacity = "1";
  }, 10);
}

// Copy button
vtCopyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(vtPreviewLink.textContent).then(() => {
    vtCopyBtn.textContent = "✅ Copied!";
    setTimeout(() => vtCopyBtn.textContent = "📋 Copy", 1200);
  });
});

// Helper buttons
sidebar.querySelector("#vt-full-url").addEventListener("click", () => {
  vtInput.value = window.location.href;
  updateVTPreview();
});
sidebar.querySelector("#vt-base-url").addEventListener("click", () => {
  try {
    const url = new URL(window.location.href);
    vtInput.value = url.hostname;
    updateVTPreview();
  } catch {}
});
sidebar.querySelector("#vt-clear-input").addEventListener("click", () => {
  vtInput.value = "";
  updateVTPreview();
});

// Submit button
vtSubmit.addEventListener("click", () => {
  const input = vtInput.value.trim();
  if (!input) return alert("Please enter a URL or hash.");

  vtSubmit.disabled = true;
  vtSubmit.textContent = "🔄 Loading...";

  let vtUrl = "";
  if (isValidHash(input)) {
    vtUrl = `https://www.virustotal.com/gui/file/${input}`;
  } else {
    const encoded = base64urlEncode(input);
    vtUrl = `https://www.virustotal.com/gui/url/${encoded}/detection`;
  }

  setTimeout(() => {
    window.open(vtUrl, "_blank");
    vtSubmit.disabled = false;
    vtSubmit.textContent = "Submit to VirusTotal";
  }, 500);
});


})();
