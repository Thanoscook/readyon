let weekCount = 0;
let currentMonday;

function addWeek() {
    weekCount++;
    const tablesContainer = document.getElementById('tablesContainer');
    console.log(new Date(document.getElementById('startDate').value))
    if (!document.getElementById('startDate') === null || isNaN(new Date(document.getElementById('startDate').value))) {
        alert('Please enter a valid start date.');
        weekCount--;
        return;
    }

    if (weekCount === 1) {
        const startDate = new Date(document.getElementById('startDate').value);
        currentMonday = new Date(startDate);
        currentMonday.setDate(currentMonday.getDate() - currentMonday.getDay() + 1);
    } else {
        currentMonday.setDate(currentMonday.getDate() + 7);
    }

    const currentFriday = new Date(currentMonday);
    currentFriday.setDate(currentFriday.getDate() + 4);

    const mondayStr = currentMonday.toLocaleDateString();
    const fridayStr = currentFriday.toLocaleDateString();

    let tableHtml = `
        <div class="week-section">
            <h3 class="text-center" style="text-decoration: underline; font-size: 1.2em">Week ${weekCount} (from ${mondayStr} to ${fridayStr})</h3>
            <table class="table table-bordered table-striped" id="week${weekCount}">
                <thead>
                    <tr>
                        <th>Developer Name</th>
                        <th>Working Days</th>
                        <th>Availability %</th>
                        <th>Available Mandays</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="developerRows${weekCount}">
                    ${copyDevelopersFromPreviousWeek()}
                </tbody>
                <tfoot>
                    <tr>
                        <th>Total Mandays</th>
                        <td colspan="4" class="totalMandays">0</td>
                    </tr>
                </tfoot>
            </table>
                <div id="weekProgress${weekCount}" class="week-progress" style="text-decoration: underline; font-size: 1.2em; display: flex; justify-content: center; align-items: center; width: 100vw; text-align: center;">
                    <p style="margin: 0;">Week ${weekCount} Progress: 
                        <span class="weeklyMandays">0</span> Mandays | 
                        <span class="completionPercentage">0</span>% Complete
                        <!-- <span class="remainingMandays">0</span> Mandays Remaining -->
                    </p>
                </div>

            <button type="button" class="btn btn-primary add-developer-btn" onclick="addDeveloperToWeek(${weekCount})">Add Developer</button>
        </div>
    `;

    tablesContainer.insertAdjacentHTML('beforeend', tableHtml);
    calculateEndDate();
}

function addDeveloperToWeek(week) {
    const developerRows = document.getElementById(`developerRows${week}`);

    let newRow = `
        <tr>
            <td><input type="text" class="form-control" placeholder="Developer Name"></td>
            <td><input type="number" class="form-control" min="0" max="5" placeholder="Days" oninput="calculateEndDate()"></td>
            <td><input type="number" class="form-control" min="0" max="100" placeholder="%" oninput="calculateEndDate()"></td>
            <td class="availableMandays">0</td>
            <td><button type="button" class="btn btn-danger btn-sm bi bi-trash" onclick="removeDeveloper(${week}, this)"></button></td>
        </tr>
    `;

    developerRows.insertAdjacentHTML('beforeend', newRow);
}

function removeDeveloper(week, button) {
    const row = button.parentElement.parentElement;
    row.remove();
    calculateEndDate();
}

function calculateEndDate() {
    console.log('Calculating end date...');
    const targetMandays = parseFloat(document.getElementById('targetMandays').value);
    const startDate = document.getElementById('startDate').value;

    // Validate the start date and target mandays before proceeding
    if (!startDate || isNaN(targetMandays) || targetMandays <= 0) {
        document.getElementById('mandaysStatus').textContent = 'Please enter a valid start date and target mandays.';
        return;
    }

    let totalMandays = 0;
    let cumulativeMandays = 0;
    let endDate = new Date(startDate);

    // Set endDate to the first Monday of the start week
    endDate.setDate(endDate.getDate() - endDate.getDay() + 1);

    for (let i = 1; i <= weekCount; i++) {
        const currentTable = document.getElementById(`week${i}`);

        // Ensure the table exists before accessing its rows
        if (!currentTable) continue;

        const rows = currentTable.querySelectorAll(`#developerRows${i} tr`);
        let weeklyMandays = 0;

        rows.forEach(row => {
            // Get and limit the working days input
            let workingDays = parseFloat(row.querySelector('td:nth-child(2) input').value) || 0;
            workingDays = Math.max(0, Math.min(workingDays, 5)); // Limit between 0 and 5

            // Get and limit the availability input
            let availability = parseFloat(row.querySelector('td:nth-child(3) input').value) || 0;
            availability = Math.max(0, Math.min(availability, 100)); // Limit between 0 and 100

            // Update the input fields if they were adjusted
            row.querySelector('td:nth-child(2) input').value = workingDays;
            row.querySelector('td:nth-child(3) input').value = availability;

            // Calculate available mandays based on validated inputs
            const availableMandays = workingDays * (availability / 100);

            row.querySelector('td:nth-child(4)').textContent = availableMandays.toFixed(2);
            weeklyMandays += availableMandays;
        });

        cumulativeMandays += weeklyMandays;
        const completionPercentage = ((cumulativeMandays / targetMandays) * 100).toFixed(2);
        const remainingMandays = Math.max(0, targetMandays - cumulativeMandays).toFixed(2);

        // Update the UI elements for each week's progress
        document.querySelector(`#weekProgress${i} .weeklyMandays`).textContent = cumulativeMandays.toFixed(2);
        document.querySelector(`#weekProgress${i} .completionPercentage`).textContent = completionPercentage;
        document.getElementById('mandaysStatus').textContent = "Mandays remaining: " + remainingMandays;
        currentTable.querySelector('.totalMandays').textContent = weeklyMandays.toFixed(2);

        totalMandays += weeklyMandays;

        // Stop further calculations if project is completed
        if (totalMandays >= targetMandays) {
            const mondayDate = new Date(endDate);
            const fridayDate = new Date(endDate);
            fridayDate.setDate(fridayDate.getDate() + 4);

            document.getElementById('mandaysStatus').textContent = `Project will be completed between ${mondayDate.toLocaleDateString()} and ${fridayDate.toLocaleDateString()}.`;
            return;
        }

        // Move to the next week
        endDate.setDate(endDate.getDate() + 7);
    }
}

function copyDevelopersFromPreviousWeek() {
    if (weekCount === 1) return ` 
        <tr>
            <td><input type="text" class="form-control" placeholder="Developer Name"></td>
            <td><input type="number" class="form-control" min="0" placeholder="Days" oninput="calculateEndDate()"></td>
            <td><input type="number" class="form-control" min="0" max="100" placeholder="%" oninput="calculateEndDate()"></td>
            <td class="availableMandays">0</td>
            <td><button type="button" class="btn btn-danger btn-sm bi bi-trash" onclick="removeDeveloper(${weekCount}, this)"></button></td>
        </tr>
    `;

    let copiedRows = '';
    const lastWeekRows = document.querySelector(`#developerRows${weekCount - 1}`).querySelectorAll('tr');

    lastWeekRows.forEach(row => {
        const developerName = row.querySelector('td:nth-child(1) input').value;
        const workingDays = row.querySelector('td:nth-child(2) input').value;
        const availability = row.querySelector('td:nth-child(3) input').value;

        copiedRows += `
            <tr>
                <td><input type="text" class="form-control" placeholder="Developer Name" value="${developerName}"></td>
                <td><input type="number" class="form-control" min="0" placeholder="Days" value="${workingDays}" oninput="calculateEndDate()"></td>
                <td><input type="number" class="form-control" min="0" max="100" placeholder="%" value="${availability}" oninput="calculateEndDate()"></td>
                <td class="availableMandays">0</td>
                <td><button type="button" class="btn btn-danger btn-sm bi bi-trash" onclick="removeDeveloper(${weekCount}, this)"></button></td>
            </tr>
        `;
    });

    return copiedRows;
}

function generateExcelReport() {
    const targetMandays = parseFloat(document.getElementById('targetMandays').value);
    const startDate = document.getElementById('startDate').value;

    if (!startDate || isNaN(targetMandays) || targetMandays <= 0) {
        alert('Please enter a valid start date and target mandays.');
        return;
    }

    const wb = XLSX.utils.book_new(); // Create a new workbook
    let summaryData = [["Week", "Start Date", "End Date", "Progress (%)", "Cumulative Mandays", "Number of Developers", "Total Available Mandays"]];
    let developerData = [["Week", "Start Date", "End Date", "Developer Name", "Developer Mandays"]];

    let totalMandays = 0;
    let cumulativeMandays = 0;
    let endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() - endDate.getDay() + 1); // Set to the first Monday of the start date

    let targetWeek = 0;
    let targetWeekStart = null;
    let targetWeekEnd = null;

    // Loop through each week and calculate the report data
    for (let i = 1; i <= weekCount; i++) {
        const currentTable = document.getElementById(`week${i}`);
        const rows = currentTable.querySelectorAll(`#developerRows${i} tr`);

        let weeklyMandays = 0;
        let developers = [];
        let developerMandays = [];

        rows.forEach(row => {
            const developerName = row.querySelector('td:nth-child(1) input').value;
            const workingDays = parseFloat(row.querySelector('td:nth-child(2) input').value) || 0;
            let availability = parseFloat(row.querySelector('td:nth-child(3) input').value) || 0;

            // Ensure availability doesn't exceed 100%
            availability = Math.min(availability, 100);

            const availableMandays = workingDays * (availability / 100);
            weeklyMandays += availableMandays;

            // Add developer details for the second report
            developerMandays.push([developerName, availableMandays.toFixed(2)]);
            developers.push(developerName);
        });

        cumulativeMandays += weeklyMandays;
        const completionPercentage = ((cumulativeMandays / targetMandays) * 100).toFixed(2);

        // Calculate the end date for the week (Friday of the week)
        const currentFriday = new Date(endDate);
        currentFriday.setDate(currentFriday.getDate() + 4); // Friday of the same week

        const weekStartStr = endDate.toLocaleDateString();
        const weekEndStr = currentFriday.toLocaleDateString();

        // Track the week where the project will be completed
        if (cumulativeMandays >= targetMandays && targetWeek === 0) {
            targetWeek = i;
            targetWeekStart = weekStartStr;
            targetWeekEnd = weekEndStr;
        }

        // Main Sheet: Add weekly progress, developer count, and available mandays
        summaryData.push([i, weekStartStr, weekEndStr, completionPercentage, cumulativeMandays.toFixed(2), developers.length, weeklyMandays.toFixed(2)]);

        // Developer Details Sheet: Add each developer's mandays for the week
        developerMandays.forEach(devMandays => {
            developerData.push([i, weekStartStr, weekEndStr, devMandays[0], devMandays[1]]);
        });

        // Move the start date to the next Monday
        endDate.setDate(endDate.getDate() + 7);
    }

    // After generating the data, append the target completion week
    summaryData.push([]);
    summaryData.push(["Target Completion Week", `Week ${targetWeek} (${targetWeekStart} - ${targetWeekEnd})`]);

    // Function to apply styles to the sheet
    function applyStyles(sheet) {
        const headerStyle = {
            font: {bold: true, sz: 14, color: {rgb: "FFFFFF"}}, // Bold white font for headers
            fill: {fgColor: {rgb: "4F81BD"}}, // Blue background for headers
            alignment: {horizontal: "center", vertical: "center"},
            border: {top: {style: "thin"}, left: {style: "thin"}, bottom: {style: "thin"}, right: {style: "thin"}}
        };

        const cellStyle = {
            alignment: {horizontal: "center", vertical: "center"},
            border: {top: {style: "thin"}, left: {style: "thin"}, bottom: {style: "thin"}, right: {style: "thin"}}
        };

        // Loop through the sheet to apply styles
        for (let row = 1; row <= sheet['!ref'].split(":")[1].slice(1); row++) {
            for (let col = 0; col < sheet['!ref'].split(":")[1].charCodeAt(0) - 64; col++) {
                const cellAddress = String.fromCharCode(65 + col) + row;
                const cell = sheet[cellAddress];

                // If the cell exists, apply the styles
                if (cell) {
                    if (row === 1) {
                        cell.s = headerStyle; // Header row
                    } else {
                        cell.s = cellStyle; // Body rows
                    }
                }
            }
        }
    }

    // Convert data to worksheets
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const developerSheet = XLSX.utils.aoa_to_sheet(developerData);

    // Apply styles to sheets
    applyStyles(summarySheet);
    applyStyles(developerSheet);

    // Append the sheets to the workbook
    XLSX.utils.book_append_sheet(wb, summarySheet, "Project Summary");
    XLSX.utils.book_append_sheet(wb, developerSheet, "Developer Mandays");

    // Write the Excel file and prompt download
    XLSX.writeFile(wb, "project_report.xlsx");
}


// Set today's date as default for the start date
window.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('startDate');
    const today = new Date().toISOString().split('T')[0]; // Format date as YYYY-MM-DD
    startDateInput.value = today;
});

document.getElementById('targetMandays').addEventListener('input', () => {
    ensureMinimumMandays();
    calculateEndDate();
});


function ensureMinimumMandays() {
    const targetMandaysInput = document.getElementById('targetMandays');
    if (targetMandaysInput.value < 1) {
        targetMandaysInput.value = 1;
    }
}
