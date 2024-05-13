let means = [];
let stds = [];
let labels = [];
let curveId = 0; // Track the current curve ID

function addRemoveListener(){
    var removeButtons = document.querySelectorAll('.removeRow');
  
    // Attach click event listener to each button
    removeButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        // Get the parent row and remove it
        var row = this.parentNode.parentNode;
        row.parentNode.removeChild(row);
      });
    });
}
function addChangeListener(){
    const table = document.getElementById("copyPasteInputFields");
    const numRows = table.rows.length - 1;
    for (let i = 1; i < numRows+1; i++) {
        const inputField = table.rows[i].cells[table.rows[i].cells.length - 3].querySelector('textarea');
        inputField.addEventListener('change', function() {
            let [raw_mean, raw_std] = getMeanAndStd(parseData(inputField.value))
            updateMean(parseFloat(raw_mean), i);
            updateStd(parseFloat(raw_std), i);
        });
    }
}
function updateMean(mean, rowNum) {
    const row = document.getElementById("copyPasteInputFields").rows[rowNum];
    row.cells[row.cells.length - 2].textContent = mean.toFixed(2); // Update mean cell with mean value
}

function updateStd(stdDev, rowNum) {
    const row = document.getElementById("copyPasteInputFields").rows[rowNum];
    row.cells[row.cells.length - 1].textContent = stdDev.toFixed(2); // Update std cell with std deviation value
}


document.addEventListener('DOMContentLoaded', function() {
    // Select all remove row buttons
    addRemoveListener();
    addChangeListener();
  });


function addRow() {
    curveId++;
    document.getElementById('copyPasteInputFields').insertRow(-1).innerHTML = `
        <td><button class="removeRow">X</button></td>
        <td class="curve-id-column">${curveId}</td>
        <td><input type="color" class="color-picker" value="${'#' + Math.floor(Math.random()*16777215).toString(16)}"></td>
        <td><input type="text" class="label"></td>
        <td><textarea class="copyPasteData" rows="2" cols="50"></textarea></td>
        <td>N/A</td>
        <td>N/A</td>
    `;
    addRemoveListener();
    addChangeListener();
}
function parseData(data) {
    // Initialize an array to store the parsed data
    const parsedData = [];

    // Iterate over each potential row
    for (let potentialRow of data.split(/\r?\n/)) {
        // Split the potential row by spaces, commas, or tabs to handle different delimiters
        // Filter out empty columns
        const filteredColumns = potentialRow.split(/,|\t|\s+/).filter(col => col.trim() !== "");
        // Add the filtered columns to the parsed data array if it's not empty
        if (filteredColumns.length > 0) {
            // Trim leading and trailing spaces from each column and parse to numbers
            const trimmedColumns = filteredColumns.map(col => parseFloat(col.trim()));
            parsedData.push(trimmedColumns);
        }
    }
    return parsedData.flat();
}
function getMeanAndStd(array) {
    return [array.reduce((a, b) => a + b) / array.length,Math.sqrt(array.map(x => Math.pow(x - array.reduce((a, b) => a + b) / array.length, 2)).reduce((a, b) => a + b) / array.length)]
}

function plotDistributions() {
    means = [];
    stds = [];
    labels = [];
    document.querySelectorAll('.label').forEach((label, index) => {
        let [raw_mean, raw_std] = getMeanAndStd(parseData(document.querySelectorAll('.copyPasteData')[index].value))
        console.log(raw_mean,  raw_std)
        const mean = parseFloat(raw_mean);
        const std = parseFloat(raw_std);

        if (!isNaN(mean) && !isNaN(std)) {
            means.push(mean);
            stds.push(std);
            labels.push(label.value);
        }
    });

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
        borderColor: document.querySelectorAll('.color-picker')[index].value
    }));

    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(document.getElementById('myChart').getContext('2d'), {
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
}

function gaussian(x, mean, std) {
    return Math.exp(-0.5 * Math.pow((x - mean) / std, 2)) / (std * Math.sqrt(2 * Math.PI));
}
function calculateMinMax(means, stds) {
    return [Math.min(...means.map((mean, index) => mean - 4 * stds[index])), Math.max(...means.map((mean, index) => mean + 4 * stds[index]))];
}