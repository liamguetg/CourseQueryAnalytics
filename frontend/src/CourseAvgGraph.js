import React, { useState, useEffect } from 'react';
import { fetchDepartments, fetchCourses, fetchCourseAvgData } from './InsightQueries';


import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register necessary chart elements for a Bar Chart
ChartJS.register(
    CategoryScale,    // Handles categorical scales (for X axis, usually)
    LinearScale,      // Handles linear scales (for Y axis)
    BarElement,       // Handles the bars in the bar chart
    Title,            // Handles the title of the chart
    Tooltip,          // Handles the tooltip that appears on hover
    Legend            // Handles the chart legend
);

const CourseAvgGraph = ({ datasetId }) => {
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [departmentData, setDepartmentData] = useState([]);
    const [courseData, setCourseData] = useState([]);
    const [courseAvgData, setCourseAvgData] = useState({
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

    useEffect(() => {
        console.log("useEffect triggered for fetching departments with datasetId:", datasetId);
        const fetchDeptData = async () => {
            if (!datasetId) {
                console.log("No datasetId selected yet.");
                return; // Exit early if datasetId is not set
            }
            try {
                const departments = await fetchDepartments(datasetId);
                console.log("Fetched departments:", departments); // Debugging
                setDepartmentData(departments);
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };

        fetchDeptData();
    }, [datasetId]);

    const fetchCourseData = async (dept) => {
        console.log("fetchCourseData triggered for fetching courses with datasetId:", datasetId);
        if (!datasetId || !dept) {
            console.log("No datasetId selected yet.");
            return; // Exit early if datasetId is not set
        }
        try {
            const courses = await fetchCourses(datasetId, dept);
            setCourseData(courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleCourseSelection = async (course) => {
        setSelectedCourse(course);
        if (selectedDept && course) {
            try {
                const data = await fetchCourseAvgData(datasetId, selectedDept, course);
                // Assuming data is returned in the format of an array of { year, avgGrade }
                const years = data.map(d => d.year);
                const avgGrades = data.map(d => d.avgGrade);

                setCourseAvgData({
                    labels: years,  // These are the x-axis labels (e.g., years)
                    datasets: [{
                        label: 'Average Grade',
                        data: avgGrades, // These are the bar heights (y-axis)
                        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Color for bars
                        borderColor: 'rgba(75, 192, 192, 1)', // Border color for bars
                        borderWidth: 1, // Border width
                    }]
                });
            } catch (error) {
                console.error('Error fetching course average data:', error);
            }
        }
    };




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
            {/* Dropdown container */}
            <div className="dropdown-container-course-avg">
                {/* Department dropdown */}
                <div>
                    <label htmlFor="deptSelect" className="insight-dropdown-label">
                        Select Department:
                    </label>
                    <select
                        id="deptSelect"
                        className="insight-dropdown"
                        value={selectedDept}
                        onChange={(e) => {
                            const dept = e.target.value;
                            setSelectedDept(dept);
                            setCourseData([]); // Reset courses when department changes
                            setSelectedCourse(''); // Reset selected course
                            fetchCourseData(dept);
                        }}
                    >
                        <option value="">Select Department</option>
                        {departmentData.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Course dropdown */}
                <div>
                    <label htmlFor="courseNumSelect" className="insight-dropdown-label">
                        Select Course Number:
                    </label>
                    <select
                        id="courseNumSelect"
                        className="insight-dropdown"
                        value={selectedCourse}
                        onChange={(e) => handleCourseSelection(e.target.value)}
                    >
                        <option value="">Select Course</option>
                        {courseData.map((course) => (
                            <option key={course} value={course}>
                                {course}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="chart-canvas-wrap">
                <Bar data={courseAvgData} options={chartOptions}/>
            </div>
        </div>
    );

};

export default CourseAvgGraph;