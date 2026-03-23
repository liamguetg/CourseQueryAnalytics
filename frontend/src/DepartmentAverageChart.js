import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { fetchDepartments } from "./InsightQueries";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DepartmentAverageChart({ datasetId }) {
    const [departmentAverages, setDepartmentAverages] = useState([]);

    useEffect(() => {
        if (datasetId) {
            fetchDepartments(datasetId)
                .then((data) => setDepartmentAverages(data))
                .catch((error) => console.error("Failed to fetch department averages:", error));
        }
    }, [datasetId]);

    const departmentChartData = {
        labels: departmentAverages.map((item) => item.department),
        datasets: [
            {
                label: "Average per Department",
                data: departmentAverages.map((item) => item.avgDept),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Average per Department",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div>
            <h3>Department Averages</h3>
            <Bar data={departmentChartData} options={chartOptions} />
        </div>
    );
}

export default DepartmentAverageChart;