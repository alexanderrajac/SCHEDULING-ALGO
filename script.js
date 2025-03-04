let processes = []; // Store processes in an array
let runningProcess = null; // Currently running process
let time = 0; // System time

// Add a new process
document.getElementById('inputForm').addEventListener('submit', function (e) {
    e.preventDefault();

    let processId = document.getElementById('processId').value.trim();
    let arrivalTime = parseInt(document.getElementById('arrivalTime').value);
    let burstTime = parseInt(document.getElementById('burstTime').value);

    if (processId && arrivalTime >= 0 && burstTime > 0) {
        // Add the process to the process list
        processes.push({ id: processId, arrivalTime, burstTime, remainingTime: burstTime });

        // Update the process table
        updateProcessTable();

        // Clear the form inputs
        document.getElementById('processId').value = '';
        document.getElementById('arrivalTime').value = '';
        document.getElementById('burstTime').value = '';
    } else {
        alert('Please enter valid values.');
    }
});

// Update process table
function updateProcessTable() {
    let tbody = document.querySelector('#processTable tbody');
    tbody.innerHTML = ''; // Clear existing table rows

    processes.forEach(process => {
        let row = `<tr>
                    <td>${process.id}</td>
                    <td>${process.arrivalTime}</td>
                    <td>${process.burstTime}</td>
                </tr>`;
        tbody.innerHTML += row;
    });
}

// Simulate Preemptive Scheduling
function simulateScheduling() {
    if (processes.length === 0) {
        alert('No processes to schedule.');
        return;
    }

    let resultDiv = document.getElementById('result');
    let resultHtml = '<h3>Preemptive Scheduling Results:</h3>';
    resultHtml += '<table><tr><th>Process ID</th><th>Start Time</th><th>Completion Time</th><th>Waiting Time</th><th>Turnaround Time</th></tr>';

    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let completedProcesses = 0;
    
    // Sort the processes by arrival time (so we can simulate the system over time)
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    let ganttTimeline = document.getElementById('ganttTimeline');
    ganttTimeline.innerHTML = ''; // Clear previous gantt chart
    
    while (completedProcesses < processes.length) {
        // Filter processes that have arrived (i.e., their arrival time <= current time)
        let readyProcesses = processes.filter(p => p.arrivalTime <= time && p.remainingTime > 0);

        if (readyProcesses.length > 0) {
            // Sort ready processes by burst time (smallest burst time first, preemptive)
            readyProcesses.sort((a, b) => a.remainingTime - b.remainingTime);

            // Get the process with the smallest burst time
            let currentProcess = readyProcesses[0];

            // If the process is different, preempt the current process and update the timeline
            if (runningProcess && runningProcess.id !== currentProcess.id) {
                // Add gantt chart block for previous process
                let ganttBlock = document.createElement('div');
                ganttBlock.classList.add('gantt-block');
                ganttBlock.style.left = `${runningProcess.startTime * 20}px`; // Scale time
                ganttBlock.style.width = `${(time - runningProcess.startTime) * 20}px`;
                ganttBlock.innerText = runningProcess.id;
                ganttTimeline.appendChild(ganttBlock);

                // Reduce the remaining time of the running process
                runningProcess.remainingTime -= (time - runningProcess.startTime);
            }

            // Set the current process as the running process
            runningProcess = currentProcess;
            runningProcess.startTime = time;

            // Execute the current process for one unit of time
            runningProcess.remainingTime -= 1;

            // If the process has finished, update statistics
            if (runningProcess.remainingTime === 0) {
                completedProcesses++;

                // Calculate waiting time and turnaround time
                let completionTime = time + 1;
                let waitingTime = completionTime - runningProcess.arrivalTime - runningProcess.burstTime;
                let turnaroundTime = completionTime - runningProcess.arrivalTime;

                totalWaitingTime += waitingTime;
                totalTurnaroundTime += turnaroundTime;

                resultHtml += `<tr>
                                <td>${runningProcess.id}</td>
                                <td>${runningProcess.startTime}</td>
                                <td>${completionTime}</td>
                                <td>${waitingTime}</td>
                                <td>${turnaroundTime}</td>
                            </tr>`;
            }
        }

        // Increment time by 1 unit (simulate next time unit)
        time++;
    }

    resultHtml += '</table>';

    // Calculate averages
    let avgWaitingTime = totalWaitingTime / processes.length;
    let avgTurnaroundTime = totalTurnaroundTime / processes.length;

    resultHtml += `<p><strong>Average Waiting Time:</strong> ${avgWaitingTime.toFixed(2)}</p>`;
    resultHtml += `<p><strong>Average Turnaround Time:</strong> ${avgTurnaroundTime.toFixed(2)}</p>`;

    resultDiv.innerHTML = resultHtml;
}

// Reset the simulation
function resetProcesses() {
    processes = [];
    runningProcess = null;
    time = 0;
    updateProcessTable();
    document.getElementById('result').innerHTML = '';
}
