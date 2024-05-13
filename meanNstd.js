let means = [];
let stds = [];
let labels = [];
let curveId = 0; // Track the current curve ID

function addRemoveListener(){
  
    // Attach click event listener to each button
    document.querySelectorAll('.removeRowCell').forEach(function(button) {
      button.addEventListener('click', function() {
        // Get the parent row and remove it
        var row = this.parentNode;
        row.parentNode.removeChild(row);
      });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Select all remove row buttons
    addRemoveListener();
  });

function addRow() {
    curveId++;
    document.getElementById('meanNstdInputFields').insertRow(-1).innerHTML = `
        <td class="removeRowCell"><button>X</button></td>
        <td class="curve-id-column">${curveId}</td>
        <td><input type="color" class="color-picker" value="${'#' + Math.floor(Math.random()*16777215).toString(16)}"></td>
        <td><input type="text" class="label"></td>
        <td><input type="number" class="mean"></td>
        <td><input type="number" class="std"></td>
    `;
    addRemoveListener();
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