const { ipcRenderer } = require('electron');

// DOM Elements
const newEntryBtn = document.getElementById('newEntryBtn');
const quickAccessSection = document.getElementById('quickAccessSection');
const logsTableBody = document.getElementById('logs-table-body');
const summaryChart = document.getElementById('summaryChart');
const quickAccessSliders = document.querySelectorAll('.quick-access-slider');

// Current log state
let currentLog = {
    mentalProduct: 50,
    health: 50,
    timeEfficiency: 50,
    creativePower: 50,
    concentration: 50
};
let currentLogId = null;

// Add at the top with other state variables
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

// Initialize Chart
let chart = new Chart(summaryChart, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Overall Progress',
            data: [],
            fill: true,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    }
});

// Check for today's entry on load
async function checkTodayEntry() {
    const todayLog = await ipcRenderer.invoke('get-today-log');
    if (todayLog) {
        currentLogId = todayLog.id;
        currentLog = {
            mentalProduct: todayLog.mentalProduct,
            health: todayLog.health,
            timeEfficiency: todayLog.timeEfficiency,
            creativePower: todayLog.creativePower,
            concentration: todayLog.concentration
        };
        
        // Update slider values
        quickAccessSliders.forEach(slider => {
            const category = slider.dataset.category;
            slider.value = currentLog[category];
            const valueDisplay = slider.nextElementSibling.querySelector('.value-display');
            valueDisplay.textContent = `${currentLog[category]}%`;
        });
        
        quickAccessSection.classList.remove('hidden');
        newEntryBtn.disabled = true;
        newEntryBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// New Entry Button Handler
newEntryBtn.addEventListener('click', async () => {
    const todayLog = await ipcRenderer.invoke('get-today-log');
    if (todayLog) {
        alert('You already have an entry for today!');
        return;
    }

    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        ...currentLog,
        summary: updateSummary()
    };

    try {
        const result = await ipcRenderer.invoke('save-log', logData);
        if (result.success) {
            currentLogId = result.id;
            quickAccessSection.classList.remove('hidden');
            newEntryBtn.disabled = true;
            newEntryBtn.classList.add('opacity-50', 'cursor-not-allowed');
            await loadLogs();
        }
    } catch (error) {
        console.error('Error creating new entry:', error);
    }
});

// Quick Access Slider Handlers
let saveTimeout = null;
quickAccessSliders.forEach(slider => {
    const category = slider.dataset.category;
    const valueDisplay = slider.nextElementSibling.querySelector('.value-display');

    slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        valueDisplay.textContent = `${value}%`;
        currentLog[category] = value;

        // Clear existing timeout
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }

        // Set new timeout to update after 500ms of no input
        saveTimeout = setTimeout(async () => {
            if (!currentLogId) return;

            const logData = {
                id: currentLogId,
                ...currentLog,
                summary: updateSummary()
            };

            try {
                const result = await ipcRenderer.invoke('update-log', logData);
                if (result.success) {
                    await loadLogs();
                    slider.classList.add('saving-success');
                    setTimeout(() => {
                        slider.classList.remove('saving-success');
                    }, 500);
                }
            } catch (error) {
                console.error('Error updating log:', error);
                slider.classList.add('saving-error');
                setTimeout(() => {
                    slider.classList.remove('saving-error');
                }, 500);
            }
        }, 500);
    });
});

// Calculate and update summary
function updateSummary() {
    const values = Object.values(currentLog);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    return average.toFixed(2);
}

// Load and display logs
async function loadLogs(page = currentPage) {
    try {
        const { logs, total } = await ipcRenderer.invoke('get-logs', page);
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
        
        // Update table
        logsTableBody.innerHTML = logs.map(log => `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-2 relative group">
                    ${new Date(log.timestamp).toLocaleDateString()}
                    <button class="delete-log-btn absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity" data-id="${log.id}">
                        ✕
                    </button>
                </td>
                <td class="px-4 py-2">${log.mentalProduct}%</td>
                <td class="px-4 py-2">${log.health}%</td>
                <td class="px-4 py-2">${log.timeEfficiency}%</td>
                <td class="px-4 py-2">${log.creativePower}%</td>
                <td class="px-4 py-2">${log.concentration}%</td>
                <td class="px-4 py-2">${log.summary}%</td>
            </tr>
        `).join('');

        // Remove existing pagination if any
        const existingPagination = document.querySelector('.pagination-controls');
        if (existingPagination) {
            existingPagination.remove();
        }

        // Add pagination controls
        const paginationHtml = `
            <div class="pagination-controls flex justify-center items-center space-x-2 mt-4">
                <button 
                    class="px-3 py-1 rounded ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}"
                    ${page === 1 ? 'disabled' : ''}
                    onclick="loadLogs(${page - 1})"
                >
                    Previous
                </button>
                <span class="text-gray-600">Page ${page} of ${totalPages}</span>
                <button 
                    class="px-3 py-1 rounded ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}"
                    ${page === totalPages ? 'disabled' : ''}
                    onclick="loadLogs(${page + 1})"
                >
                    Next
                </button>
            </div>
        `;
        
        // Add pagination controls after the table
        const paginationContainer = document.createElement('div');
        paginationContainer.innerHTML = paginationHtml;
        logsTableBody.parentElement.parentElement.appendChild(paginationContainer);

        // Add delete button handlers
        document.querySelectorAll('.delete-log-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = parseInt(e.target.dataset.id);
                if (confirm('Are you sure you want to delete this entry?')) {
                    try {
                        const result = await ipcRenderer.invoke('delete-log', id);
                        if (result.success) {
                            // If we deleted today's entry, reset the UI
                            if (id === currentLogId) {
                                currentLogId = null;
                                quickAccessSection.classList.add('hidden');
                                newEntryBtn.disabled = false;
                                newEntryBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                            }
                            // If we're on a page with only one item and it's not the first page,
                            // go to the previous page after deletion
                            if (logs.length === 1 && page > 1) {
                                currentPage = page - 1;
                            } else {
                                currentPage = page;
                            }
                            await loadLogs(currentPage);
                        }
                    } catch (error) {
                        console.error('Error deleting log:', error);
                    }
                }
            });
        });

        // Update chart with all data
        const chartData = logs.map(log => ({
            date: new Date(log.timestamp).toLocaleDateString(),
            summary: log.summary
        }));

        chart.data.labels = chartData.map(d => d.date);
        chart.data.datasets[0].data = chartData.map(d => d.summary);
        chart.update();

        // Update current page
        currentPage = page;
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

// Make loadLogs available globally for the onclick handlers
window.loadLogs = loadLogs;

// Call checkTodayEntry on initial load
checkTodayEntry();
loadLogs(); 