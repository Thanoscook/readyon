let weekCount = 0;
let currentMonday;

function addWeek() {
    weekCount++;
    const tablesContainer = document.getElementById('tablesContainer');
    
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
            <h3>Week ${weekCount} (from ${mondayStr} to ${fridayStr})</h3>
            <table id="week${weekCount}">
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
            <div id="weekProgress${weekCount}" class="week-progress">
                <p>Week ${weekCount} Progress: 
                    <span class="weeklyMandays">0</span> Mandays | 
                    <span class="completionPercentage">0</span>% Complete |
                    <span class="remainingMandays">0</span> Mandays Remaining
                </p>
            </div>
            <button type="button" class="add-developer-btn" onclick="addDeveloperToWeek(${weekCount})">Add Developer</button>
        </div>
    `;
    
    tablesContainer.insertAdjacentHTML('beforeend', tableHtml);
    calculateEndDate();
}

function addDeveloperToWeek(week) {
    const developerRows = document.getElementById(`developerRows${week}`);
    
    let newRow = `
        <tr>
            <td><input type="text" placeholder="Developer Name"></td>
            <td><input type="number" min="0" placeholder="Days" oninput="calculateEndDate()"></td>
            <td><input type="number" min="0" max="100" placeholder="%" oninput="calculateEndDate()"></td>
            <td class="availableMandays">0</td>
            <td><button type="button" class="remove-btn" onclick="removeDeveloper(${week}, this)">Remove</button></td>
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
    const targetMandays = parseFloat(document.getElementById('targetMandays').value);
    const startDate = document.getElementById('startDate').value;

    if (!startDate || isNaN(targetMandays) || targetMandays <= 0) {
        document.getElementById('mandaysStatus').textContent = 'Please enter a valid start date and target mandays.';
        return;
    }

    let totalMandays = 0;
    let cumulativeMandays = 0;
    let endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() - endDate.getDay() + 1);

    for (let i = 1; i <= weekCount; i++) {
        const currentTable = document.getElementById(`week${i}`);
        const rows = currentTable.querySelectorAll(`#developerRows${i} tr`);
        
        let weeklyMandays = 0;

        rows.forEach(row => {
            const workingDays = parseFloat(row.querySelector('td:nth-child(2) input').value) || 0;
            const availability = parseFloat(row.querySelector('td:nth-child(3) input').value) || 0;
            const availableMandays = workingDays * (availability / 100);
            
            row.querySelector('td:nth-child(4)').textContent = availableMandays.toFixed(2);
            
            weeklyMandays += availableMandays;
        });

        cumulativeMandays += weeklyMandays;
        const completionPercentage = ((cumulativeMandays / targetMandays) * 100).toFixed(2);
        const remainingMandays = Math.max(0, targetMandays - cumulativeMandays).toFixed(2);

        document.querySelector(`#weekProgress${i} .weeklyMandays`).textContent = cumulativeMandays.toFixed(2);
        document.querySelector(`#weekProgress${i} .completionPercentage`).textContent = completionPercentage;
        document.querySelector(`#weekProgress${i} .remainingMandays`).textContent = remainingMandays;

        currentTable.querySelector('.totalMandays').textContent = weeklyMandays.toFixed(2);

        totalMandays += weeklyMandays;

        if (totalMandays >= targetMandays) {
            const mondayDate = new Date(endDate);
            const fridayDate = new Date(endDate);
            fridayDate.setDate(fridayDate.getDate() + 4);

            document.getElementById('mandaysStatus').textContent = 
                `Project will be completed between ${mondayDate.toLocaleDateString()} and ${fridayDate.toLocaleDateString()}.`;
            return;
        }

        endDate.setDate(endDate.getDate() + 7);
    }

    document.getElementById('mandaysStatus').textContent = 
        `More work to do until project completion`;
}

function copyDevelopersFromPreviousWeek() {
    if (weekCount === 1) return ` 
        <tr>
            <td><input type="text" placeholder="Developer Name"></td>
            <td><input type="number" min="0" placeholder="Days" oninput="calculateEndDate()"></td>
            <td><input type="number" min="0" max="100" placeholder="%" oninput="calculateEndDate()"></td>
            <td class="availableMandays">0</td>
            <td><button type="button" class="remove-btn" onclick="removeDeveloper(${weekCount}, this)">Remove</button></td>
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
                <td><input type="text" placeholder="Developer Name" value="${developerName}"></td>
                <td><input type="number" min="0" placeholder="Days" value="${workingDays}" oninput="calculateEndDate()"></td>
                <td><input type="number" min="0" max="100" placeholder="%" value="${availability}" oninput="calculateEndDate()"></td>
                <td class="availableMandays">0</td>
                <td><button type="button" class="remove-btn" onclick="removeDeveloper(${weekCount}, this)">Remove</button></td>
            </tr>
        `;
    });

    return copiedRows;
}

function generateExcelReport() {
    const data = [];
    let headers = ['Week', 'Developer Name', 'Working Days', 'Availability %', 'Available Mandays'];

    data.push(headers);

    for (let i = 1; i <= weekCount; i++) {
        const rows = document.querySelector(`#week${i}`).querySelectorAll('tr');
        rows.forEach(row => {
            const developerName = row.querySelector('td:nth-child(1) input').value;
            const workingDays = row.querySelector('td:nth-child(2) input').value;
            const availability = row.querySelector('td:nth-child(3) input').value;
            const availableMandays = row.querySelector('td:nth-child(4)').textContent;

            data.push([`Week ${i}`, developerName, workingDays, availability, availableMandays]);
        });
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Project Mandays');
    XLSX.writeFile(wb, 'Project_Mandays_Report.xlsx');
}
