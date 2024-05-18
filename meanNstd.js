let means = [];
let stds = [];
let labels = [];
let curveId = 0; // Track the current curve ID

function updateButtonColor(colorPicker) {
    const button = colorPicker.parentElement.parentElement.querySelector('.removeColumnButton');
    if (button) {
        button.style.backgroundColor = colorPicker.value;
    } else {
        console.error('Button not found');
    }
}
function addRemoveListener(){
    
    // Attach click event listener to each button
    document.querySelectorAll('.removeColumnButton').forEach(function(button) {
      button.addEventListener('click', function() {
        // Get the parent row and remove it
        console.log("AAA")
        var row = this.parentNode.parentNode;
        row.parentNode.removeChild(row);
      });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Select all remove row buttons
    addRemoveListener();
    console.log("AAAB")
  });

function addRow() {
    let color_val = `${'#' + Math.floor(Math.random()*16777215).toString(16)}`
    console.log("AAAC")
    while (color_val == '#000000' || color_val.length != 7) {
        console.log(color_val)
        console.log("Attempting new color");
        color_val = `${'#' + Math.floor(Math.random()*16777215).toString(16)}` 
    }
    curveId++;
    table = document.getElementById('meanNstdInputFields') 
    table.insertRow(table.rows.length - 2).innerHTML = `
        <td class="addColumn"><button title="Remove Row" class="removeColumnButton" style="background-color: ${color_val}">x</button></td>
        <td class="curve-id-column">${table.rows.length-4}</td>
        <td><input type="color" class="color-picker" value="${color_val}" onchange="updateButtonColor(this)"></td>
        <td><input type="text" class="label"></td>
        <td><input type="number" class="mean"></td>
        <td><input type="number" class="std"></td>
    `;
    addRemoveListener();
    console.log("AAAD")
}


function plotDistributions() {

    means = [];
    stds = [];
    labels = [];

    document.querySelectorAll('.label').forEach((label, index) => {
        const mean = parseFloat(document.querySelectorAll('.mean')[index].value);
        const std = parseFloat(document.querySelectorAll('.std')[index].value);

        if (!isNaN(mean) && !isNaN(std)) {
            means.push(mean);
            stds.push(std);
            labels.push(label.value);
        }
    });

    if (means.length === 0) {
        alert("Please enter valid mean and std values.");
        return;
    }

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