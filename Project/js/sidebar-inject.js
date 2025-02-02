(function () {
    if (document.getElementById("custom-sidebar")) {
        console.log("Sidebar already exists. Toggling visibility.");
        document.getElementById("custom-sidebar").classList.toggle("open");
        return;
    }

    // Create the sidebar container
    const sidebar = document.createElement("div");
    sidebar.id = "custom-sidebar";
    sidebar.style.position = "fixed";
    sidebar.style.top = "0";
    sidebar.style.right = "-400px"; 
    sidebar.style.width = "400px";
    sidebar.style.height = "100%";
    sidebar.style.backgroundColor = "#ffffff";
    sidebar.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
    sidebar.style.zIndex = "9999";
    sidebar.style.overflowY = "auto";
    sidebar.style.borderLeft = "1px solid #ddd";
    sidebar.style.transition = "right 0.3s ease-in-out";

    sidebar.innerHTML = `
        <div class="sidebar-content" style="padding: 20px;">
            <button id="close-sidebar" style="
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 5px 10px;
                background-color: #f44336;
                color: #fff;
                border: none;
                cursor: pointer;
                border-radius: 3px;
            ">Close</button>
            <h2>Custom Sidebar</h2>
            <p>This is your sidebar content!</p>
        </div>
    `;

    document.body.appendChild(sidebar);

    // Open the sidebar with animation
    setTimeout(() => {
        sidebar.style.right = "0px";
    }, 50);

    // Handle close button functionality
    document.getElementById("close-sidebar").addEventListener("click", () => {
        sidebar.style.right = "-400px";
        setTimeout(() => sidebar.remove(), 300);
    });
})();
