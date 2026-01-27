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
function addSolveNotification(message) {
    const solveContainer = document.getElementById("solve-container");
    
    // Create new solve notification div
    const newSolve = document.createElement("div");
    newSolve.className = "rounded-xl bg-gray-800 p-4 shadow-xl outline outline-1 outline-gray-600 opacity-0 translate-y-4 transition-all duration-500 ease-out";
    
    const paragraph = document.createElement("p");
    paragraph.className = "text-gray-300";
    paragraph.textContent = message;
    
    newSolve.appendChild(paragraph);
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