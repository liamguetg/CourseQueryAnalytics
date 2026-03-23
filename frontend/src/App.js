import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import {AveragePerDeptQuery, fetchCourses, fetchDepartments} from "./InsightQueries";
import BarChart from "./BarChart";
import CourseAvgGraph from "./CourseAvgGraph";
import AverageOverTimeGraph from "./AverageOverTimeGraph";

function App() {
  const [datasets, setDatasets] = useState([]);
  const [datasetId, setDatasetId] = useState("");
  const [datasetFile, setDatasetFile] = useState(null);
  const [sortMethod, setSortMethod] = useState("date");
  const [selectedDatasetToDelete, setSelectedDatasetToDelete] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sortMethodForView, setSortMethodForView] = useState("date");

  const [insightData, setInsightData] = useState(null);
  const [selectedDatasetForInsight, setSelectedDatasetForInsight] = useState("");


  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await axios.get("http://localhost:4321/datasets");
      const updatedDatasets = response.data.result.map((dataset) => ({
        ...dataset,
        timestamp: dataset.timestamp || new Date().toLocaleString(),
      }));
      setDatasets(updatedDatasets);
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
    }
  };

  const handleFileChange = (event) => {
    setDatasetFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!datasetId || !datasetFile) {
      alert("Please provide a dataset ID and select a file.");
      return;
    }
    try {
      const fileData = await datasetFile.arrayBuffer();

      await axios.put(`http://localhost:4321/dataset/${datasetId}/sections`, fileData, {
        headers: { "Content-Type": "application/octet-stream" },
      });

      alert("Dataset uploaded successfully!");
      const timestamp = new Date().toLocaleString();

      setDatasets((prevDatasets) => [
        ...prevDatasets,
        { id: datasetId, timestamp },
      ]);

      setDatasetId("");
      setDatasetFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload dataset. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!selectedDatasetToDelete) {
      alert("Please select a dataset to delete.");
      return;
    }

    if (!confirmDelete) {
      alert("Click the delete button again to confirm deletion.");
      setConfirmDelete(true);
      return;
    }

    try {
      await axios.delete(`http://localhost:4321/dataset/${selectedDatasetToDelete}`);
      alert("Dataset deleted successfully!");
      setDatasets((prevDatasets) =>
        prevDatasets.filter((dataset) => dataset.id !== selectedDatasetToDelete)
      );
      setSelectedDatasetToDelete("");
      setConfirmDelete(false);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete dataset. Please try again.");
    }
  };

  const getSortedDatasets = () => {
    return [...datasets].sort((a, b) => {
      if (sortMethod === "date") {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sortMethod === "id") {
        return a.id.localeCompare(b.id);
      }
      return 0;
    });
  };


  const fetchInsight = async (datasetId) => {
    if (!datasetId) {
      alert("Please select a dataset.");
      return;
    }

    const query = AveragePerDeptQuery(datasetId);  // Construct the query with the selected dataset ID

    try {
      const response = await axios.post("http://localhost:4321/query", { query });
      // console.log("Insight Data:", response.data.result);

      const chartData = response.data.result.map(item => ({
        department: item[`${datasetId}_dept`],  // Assuming this is the department name
        avgDept: item.AvgDept,  // Assuming this is the average value
      }));

      setInsightData(chartData);  // Set the fetched data for rendering
    } catch (error) {
      console.error("Failed to fetch insight data:", error);
      alert("Failed to fetch insight data. Please try again.");
    }
  };

  const handleDatasetSelection = (datasetId) => {
    setSelectedDatasetForInsight(datasetId);
    fetchInsight(datasetId);  // Fetch and display insight data for the selected dataset
    // fetchDepartmentData(datasetId);
  };









  return (
    <div className="App">
      <header className="navbar">
        <h1>Dataset Manager</h1>
      </header>

      <div className="card-container">
        <div className="card">
          <h2>Upload Dataset</h2>
          <input
            type="text"
            placeholder="Dataset ID"
            value={datasetId}
            onChange={(e) => setDatasetId(e.target.value)}
          />
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
        </div>

        <div className="card">
          <h2>View Datasets</h2>
          <div>
            <label>Sort by: </label>
            <select value={sortMethodForView} onChange={(e) => setSortMethodForView(e.target.value)}>
              <option value="date">Date Added</option>
              <option value="id">Dataset ID (Alphabetical)</option>
            </select>
          </div>

          <select
              value={selectedDatasetForInsight}
              onChange={(e) => handleDatasetSelection(e.target.value)}  // Update selection and fetch insights
          >
            <option value="">Select a dataset</option>
            {getSortedDatasets().map((dataset, index) => (
                <option key={index} value={dataset.id}>
                {dataset.id} ({dataset.timestamp || "No timestamp"})
              </option>
            ))}
          </select>
        </div>

        <div className="card">
          <h2>Manage Datasets</h2>
          <select
            value={selectedDatasetToDelete}
            onChange={(e) => {
              setSelectedDatasetToDelete(e.target.value);
              setConfirmDelete(false);
            }}
          >
            <option value="">Select a dataset to delete</option>
            {getSortedDatasets().map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.id} ({dataset.timestamp})
              </option>
            ))}
          </select>
          <button onClick={handleDelete}>
            {confirmDelete ? "Confirm Delete" : "Delete Dataset"}
          </button>
        </div>
      </div>

      {/* Fourth Box for Insights */}
      <div className="insight-container">
        <h2>Dataset Insights{selectedDatasetForInsight ? `: ${selectedDatasetForInsight}` : ""}</h2>


          {insightData ? (
              <>
                <BarChart data={insightData} />
                <CourseAvgGraph datasetId={selectedDatasetForInsight} />
                <AverageOverTimeGraph datasetId={selectedDatasetForInsight}/>
              </>
          ) : (
              <p>Select a dataset to view insights.</p>
          )}

      </div>
    </div>
  );
}

export default App;
