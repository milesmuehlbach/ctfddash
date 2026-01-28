// Initialize Socket.IO connection
const socket = io();

async function getInfo() {
    const url = "/api/info";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const info = await response.json();
        console.log(info);
        
        const titleElement = document.querySelector("h1");
        if (titleElement && info[0]) {
            titleElement.textContent = info[0];
        }
        
        return info;
    } catch (error) {
        console.error(error.message);
    }
}

// Function to add a solve notification
function addSolveNotification(data) {
    const solveContainer = document.getElementById("solve-container");
    
    // Handle both string (legacy) and object format
    const message = typeof data === 'string' ? data : data.message;
    const firstBlood = typeof data === 'object' ? data.first_blood : false;
    const firstPlace = typeof data === 'object' ? data.first_place : false;
    const solveNumber = typeof data === 'object' ? data.solve_number : null;
    
    // Create new solve notification div
    const newSolve = document.createElement("div");
    newSolve.className = "rounded-xl bg-gray-800 p-4 shadow-xl outline outline-1 outline-gray-600 opacity-0 translate-y-4 transition-all duration-500 ease-out flex items-center justify-between gap-4";
    
    // Left side: icons and message
    const leftDiv = document.createElement("div");
    leftDiv.className = "flex items-center gap-3 flex-1";
    
    // Add first blood icon if applicable
    if (firstBlood) {
        const bloodIcon = document.createElement("img");
        bloodIcon.src = "/svg/blood-svgrepo-com.svg";
        bloodIcon.alt = "First Blood";
        bloodIcon.className = "w-6 h-6 flex-shrink-0";
        bloodIcon.style.filter = "invert(48%) sepia(79%) saturate(2476%) hue-rotate(346deg) brightness(98%) contrast(97%)";
        bloodIcon.title = "First Blood!";
        leftDiv.appendChild(bloodIcon);
    }
    
    // Add first place icon if applicable
    if (firstPlace) {
        const crownIcon = document.createElement("img");
        crownIcon.src = "/svg/crown-minimalistic-svgrepo-com.svg";
        crownIcon.alt = "First Place";
        crownIcon.className = "w-6 h-6 flex-shrink-0";
        crownIcon.style.filter = "invert(48%) sepia(79%) saturate(2476%) hue-rotate(346deg) brightness(98%) contrast(97%)";
        crownIcon.title = "Currently First Place!";
        leftDiv.appendChild(crownIcon);
    }
    
    const paragraph = document.createElement("p");
    paragraph.className = "text-gray-300 flex-1";
    paragraph.textContent = message;
    leftDiv.appendChild(paragraph);
    
    // Right side: solve number and timestamp
    const rightDiv = document.createElement("div");
    rightDiv.className = "flex flex-col items-end gap-1 flex-shrink-0";
    
    // Solve number (for debugging)
    if (solveNumber !== null) {
        const solveNumberSpan = document.createElement("span");
        solveNumberSpan.className = "text-gray-500 text-xs font-mono";
        solveNumberSpan.textContent = `#${solveNumber}`;
        rightDiv.appendChild(solveNumberSpan);
    }
    
    // Timestamp
    const timeSpan = document.createElement("span");
    timeSpan.className = "text-gray-400 text-sm font-mono tabular-nums";
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeSpan.textContent = `${hours}:${minutes}:${seconds}`;
    rightDiv.appendChild(timeSpan);
    
    newSolve.appendChild(leftDiv);
    newSolve.appendChild(rightDiv);
    solveContainer.appendChild(newSolve);
    
    // Trigger animation after a brief delay to ensure the element is rendered
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            newSolve.classList.remove("opacity-0", "translate-y-4");
            newSolve.classList.add("opacity-100", "translate-y-0");
        });
    });
}

// Socket.IO event listener for new solves
socket.on("solve", function(data) {
    addSolveNotification(data);
});

// Call getInfo when page loads
document.addEventListener("DOMContentLoaded", getInfo);