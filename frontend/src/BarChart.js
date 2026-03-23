import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register necessary chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({
                      data,
                      title = "Average per department",       // Default title if not provided
                      labels = "Average",        // Default label if not provided
                      X_variable_name = "department",          // Property to be used for X-axis
                      Y_variable_name = "avgDept",          // Property to be used for Y-axis
}) {

    // console.log("Chart Data:", data);

    const chartData = {
        labels: data.map((item) => item[X_variable_name]),
        datasets: [
            {
                label: labels,
                data: data.map((item) => item[Y_variable_name]), // Ensure avgDept is used here
                backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
        ],
    };


    const chartOptions = {
        responsive: true,
        scales: {
            // x: {
            //     type: 'linear',  // Make sure it's using linear scale
            //     position: 'bottom',
            //     min: 2000,       // Set minimum to 2000
            //     max: 2025,       // Set maximum to 2025
            //     ticks: {
            //         stepSize: 1,
            //         callback: function (value) {
            //             return value.toString().replace(',', '');
            //         }
            //     }
            // },
            y: {
                beginAtZero: true,
                min: 0,           // Set y-axis to start from 0
                max: 100,         // Set y-axis to 100 as the max
                ticks: {
                    stepSize: 10, // This ensures y-axis increments by 10
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    size: 20,    // Adjust the font size as needed
                    weight: "bold",
                },
            },
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    title: (tooltipItem) => `Year: ${tooltipItem[0].label}`, // Custom tooltip to show the year
                }
            }
        }
    };

    // const options = {
    //     responsive: true,
    //     plugins: {
    //         title: {
    //             display: true,   // Show the title
    //             text: title,  // Title text
    //             font: {
    //                 size: 20,    // Adjust the font size as needed
    //                 weight: "bold",
    //             },
    //         },
    //     },
    //     scales: {
    //         y: {
    //             beginAtZero: true,
    //             min: 0,
    //             max: 100, // Adjust max if needed
    //         },
    //     },
    // };

    return (
        <div className="insight-container">
            <div className="insight-graph">
                <Bar data={chartData} options={chartOptions}/>
            </div>
        </div>
    );


}

export default BarChart;