import React, { useState, useEffect } from "react";
import {
    fetchSingleInstructors,
    searchProfessors,
    fetchAvgPerYear
} from "./InsightQueries";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AverageOverTimeGraph = ({ datasetId }) => {
    const [professors, setProfessors] = useState([]); // List of professors
    const [filteredProfessors, setFilteredProfessors] = useState([]); // Filtered dropdown options
    const [selectedProfessor, setSelectedProfessor] = useState("");
    const [searchText, setSearchText] = useState("");
    const [graphData, setGraphData] = useState({
        labels: [], // e.g., years as labels
        datasets: [
            {
                label: 'Average Grade',
                data: [],  // e.g., average grade for each year
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Bar color
                borderColor: 'rgba(75, 192, 192, 1)', // Border color
                borderWidth: 1,
            }
        ],
    });


    // Fetch all professors when the component loads
    useEffect(() => {
        const fetchProfessors = async () => {
            const result = await fetchSingleInstructors(datasetId);
            console.log("Query for all professors: ", result);
            setProfessors(result); // Assuming `result` contains the list of professors
            setFilteredProfessors(result); // Initially, all professors are shown
        };

        fetchProfessors();
    }, [datasetId]);

    // Handle changes in the search text to filter dropdown options
    useEffect(() => {
        if (searchText === "") {
            // If search text is cleared, reset the filtered list to show all professors
            setFilteredProfessors(professors);
        } else {
            if (searchText && datasetId) {
                const fetchMatchingProfessors = async () => {
                    const result = await searchProfessors(datasetId, searchText);
                    console.log("Query for professors matching the text: ", result);
                    setFilteredProfessors(result);
                };

                fetchMatchingProfessors();
            }
        }

    }, [searchText, professors, datasetId]);

    // Fetch graph data when a professor is selected
    useEffect(() => {
        if (selectedProfessor && datasetId) {
            const fetchGraphData = async () => {
                const result = await fetchAvgPerYear(datasetId, selectedProfessor);
                const years = result.map(d => d.year);
                const avgGrades = result.map(d => d.avgGrade);

                setGraphData({
                    labels: years,  // These are the x-axis labels (e.g., years)
                    datasets: [{
                        label: 'Average Grade',
                        data: avgGrades,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1, // Border width
                    }]
                });
            };
            fetchGraphData();
        }
    }, [selectedProfessor, datasetId]);


    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'linear',  // Make sure it's using linear scale
                position: 'bottom',
                min: 2000,       // Set minimum to 2000
                max: 2025,       // Set maximum to 2025
                ticks: {
                    stepSize: 1,
                    callback: function (value) {
                        return value.toString().replace(',', '');
                    }
                }
            },
            y: {
                min: 0,           // Set y-axis to start from 0
                max: 100,         // Set y-axis to 100 as the max
                ticks: {
                    stepSize: 10, // This ensures y-axis increments by 10
                }
            }
        },
        plugins: {
            title: {
                display: true,   // Show the title
                text: "Average Grade Over Time",  // Title text
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


    return (
        <div className="chart-block">
            <div className="dropdown-container">
                <input
                    type="text"
                    placeholder="Search or select a professor..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="professor-search"
                />
                <select
                    size={5}
                    value={selectedProfessor}
                    onChange={(e) => setSelectedProfessor(e.target.value)}
                    className="professor-dropdown"
                >
                    {filteredProfessors.map((prof) => (
                        <option key={prof} value={prof}>
                            {prof}
                        </option>
                    ))}
                </select>
            </div>

            <div className="chart-canvas-wrap">
                {graphData.datasets && graphData.datasets.length > 0 ? (
                    <Bar data={graphData} options={chartOptions} />
                ) : (
                    <p>No data available for the selected professor</p>
                )}
            </div>
        </div>
    );
};

export default AverageOverTimeGraph;



