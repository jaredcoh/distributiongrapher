function updateButtonColor(colorPicker) {
    const column = colorPicker.closest('td').cellIndex; // Get the column index of the color picker
    const table = colorPicker.closest('table'); // Get the table containing the color picker
    const buttons = table.querySelectorAll(`tr td:nth-child(${column + 1}) .addButton, tr td:nth-child(${column + 1}) .removeColumnButton`); // Select all buttons in the same column
    buttons.forEach(button => {
        button.style.backgroundColor = colorPicker.value;
    });
}

function addRemoveListener() {
    document.querySelectorAll('.removeColumnButton').forEach(button => button.addEventListener('click', function() {
        this.closest('table').querySelectorAll('tr').forEach(row => row.deleteCell(this.parentNode.cellIndex));
    }));
}

function addRow() {
    const inputTable = document.getElementById('dataPointInputFields');
    let html = '';

    for (let i = 0; i < inputTable.rows[0].cells.length - 1; i++) {
        html += (i == 0) ? '<td class="side-tab header"></td>' : '<td><input type="text"></td>';
    }
    inputTable.insertRow(inputTable.rows.length - 4).innerHTML = html;
    setupEventListeners();
}
function addColumn(){
    const inputTable = document.getElementById('dataPointInputFields');
    const numRows = inputTable.rows.length;
    const newRow = inputTable.rows[0];
    const newCell = newRow.insertCell(newRow.cells.length - 1);
    newCell.textContent =newRow.cells.length-3;
    newCell.classList.add('curveId');
    let color_val = `${'#' + Math.floor(Math.random()*16777215).toString(16)}`
    
    while (color_val == '#000000' || color_val.length != 7) {
        console.log(color_val)
        console.log("Attempting new color");
        color_val = `${'#' + Math.floor(Math.random()*16777215).toString(16)}` 
    }
    for (let i = 1; i < numRows; i++) {
        const newRow = inputTable.rows[i];
        let newCellinRow = newRow.insertCell(newRow.cells.length)
        switch (i) {
            case 1:
                cellContent = `<input type="color" class="color-picker" value="${color_val}"   onchange="updateButtonColor(this)">`;
                break;
            case 2:
                cellContent = '<input type="text">'; // Third row: Text input
                break;
            case numRows-1:
                newCellinRow.classList.add('removeColumn');
                cellContent = `<button style="background-color: ${color_val}" class="removeColumnButton" title="Remove Column">x</button>`
                break;
            case numRows-2:
                newCellinRow.classList.add('mean');
                cellContent = `N/A`
                break;
            case numRows-3:
                newCellinRow.classList.add('std');
                cellContent = `N/A`
                break;
            case numRows-4:
                newCellinRow.classList.add('addColumn');
                cellContent = `<button style="background-color: ${color_val}" class="addButton" onclick="addRow()">+</button>`
                break;
            default:
                cellContent = `<input type="number">`; // Other rows: Number input
                break;
        }
        newCellinRow.innerHTML = cellContent;
    }
    setupEventListeners();
}
function plotDistributions() {
    // Get table reference
    const table = document.getElementById('dataPointInputFields');

    // Arrays to store data for each curve
    const colors = [];
    const labels = [];
    const means = [];
    const stds = [];

    // Extract data from table
    for (let i = 0; i < table.rows[0].cells.length - 2; i++) {
        colors.push(table.rows[1].cells[i + 1].querySelector('input').value);
        labels.push(table.rows[2].cells[i + 1].querySelector('input').value);

        const data = [];
        let sum = 0;
        let count = 0;
        for (let j = 3; j < table.rows.length - 4; j++) { // Subtract 1 for the ignored last row
            const inputData = table.rows[j].cells[i + 1].querySelector('input').value.trim();
            if (inputData !== "") {
                const value = parseFloat(inputData);
                data.push(value);
                sum += value;
                count++;
            }
        }
        const mean = sum / count;
        means.push(mean);
        stds.push(Math.sqrt(data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count));
    }

    // Calculate mean and standard deviation for each set of data points

    let xMin, xMax;
    const minInput = document.querySelector('#xmin');
    const maxInput = document.querySelector('#xmax');
    if (minInput && maxInput && !isNaN(parseFloat(minInput.value)) && !isNaN(parseFloat(maxInput.value))) {
        xMin = parseFloat(minInput.value);
        xMax = parseFloat(maxInput.value);
    } else {
        console.log("no inputs given, switching to auto mode");
        [xMin, xMax] = calculateMinMax(means, stds);
    }

    const datasets = means.map((mean, index) => ({
        label: labels[index] || `Mean=${mean.toFixed(3)}, Std=${stds[index].toFixed(3)}`,
        data: Array.from({ length: 1000 }, (_, i) => xMin + (xMax - xMin) * i / 999).map(xi => ({ x: xi, y: gaussian(xi, mean, stds[index]) })),
        fill: false,
        borderColor: colors[index]
    }));

    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }
    const canvas = document.getElementById('myChart');
    canvas.style.backgroundColor = 'white';
    window.myChart = new Chart(canvas.getContext('2d'), {
        type: 'scatter',
        data: {
            datasets: datasets.map(dataset => ({
                ...dataset,
                showLine: true, // Set showLine to true for each dataset
                pointRadius: 0 ,
            }))
        },
        options: {
            plugins:{
                title: {
                    display: true,
                    text: document.querySelector('#title').value,
                    font:
                    {
                        size: 20,
                        weight: 'bold',
                    }
                }
            },
            scales: {
                x: {
                    min: xMin,
                    max: xMax,
                },
                y: {
                    min: document.getElementById('adjustYAxis').checked ? 0 : undefined,
                    max: document.getElementById('adjustYAxis').checked ? 1 : undefined,
                }
            }
        }
    });
    const tabContent = document.querySelector('.tab-content.active');
    tabContent.style.height = tabContent.scrollHeight + 'px';
}

function gaussian(x, mean, std) {
    return Math.exp(-0.5 * Math.pow((x - mean) / std, 2)) / (std * Math.sqrt(2 * Math.PI));
}
function calculateMinMax(means, stds) {
    return [Math.min(...means.map((mean, index) => mean - 4 * stds[index])), Math.max(...means.map((mean, index) => mean + 4 * stds[index]))];
}


function updateMean(columnIndex) {
    const table = document.getElementById("dataPointInputFields");
    let sum  =0;
    let count=0;
    for (let i = 3; i < table.rows.length - 4 ; i++) {
        const inputData = table.rows[i].cells[columnIndex].querySelector('input').value.trim();
        if (inputData !== "" && !isNaN(parseFloat(inputData))) {
            sum += parseFloat(inputData);
            count++;
        }
    }

    table.rows[table.rows.length - 3].cells[columnIndex].textContent = (sum / count).toFixed(3);
}

function updateStd(columnIndex) {
    const table = document.getElementById("dataPointInputFields");
    count=0
    let sumSquaredDiff = 0;

    for (let i = 3; i < table.rows.length - 4; i++) {
        const inputData = table.rows[i].cells[columnIndex].querySelector('input').value.trim();
        if (inputData !== "") {
            count++;
            sumSquaredDiff += Math.pow(parseFloat(inputData) - parseFloat(table.rows[table.rows.length - 3].cells[columnIndex].textContent), 2);
        }
    }
    table.rows[table.rows.length-2 ].cells[columnIndex].textContent = Math.sqrt(sumSquaredDiff / count).toFixed(3); // Update the cell for standard deviation
}

// Event listener function for input fields in a specific column
function addChangeListener(columnIndex) {
    const table = document.getElementById("dataPointInputFields");
    for (let i = 3; i < table.rows.length - 4; i++) {
        table.rows[i].cells[columnIndex].querySelector('input').addEventListener('change', function() {
            updateMean(columnIndex);
            updateStd(columnIndex);
        });
    }
}

// Call addChangeListener for each column
function setupEventListeners() {
    const numCurves = document.getElementById("dataPointInputFields").rows[0].cells.length - 2;
    for (let i = 1; i < numCurves+1; i++) {
        addChangeListener(i);
    }
    addRemoveListener()
}
document.addEventListener("DOMContentLoaded", function() {
    setupEventListeners();
});

