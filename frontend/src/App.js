import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { AveragePerDeptQuery } from "./InsightQueries";
import BarChart from "./BarChart";
import CourseAvgGraph from "./CourseAvgGraph";
import AverageOverTimeGraph from "./AverageOverTimeGraph";
import { DATASET_ID, API_BASE } from "./config";

const QUERY_URL = `${API_BASE}/query`;

function App() {
  const [insightData, setInsightData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const query = AveragePerDeptQuery(DATASET_ID);
      try {
        const response = await axios.post(QUERY_URL, { query });
        const chartData = response.data.result.map((item) => ({
          department: item[`${DATASET_ID}_dept`],
          avgDept: item.AvgDept,
        }));
        setInsightData(chartData);
      } catch (error) {
        console.error("Failed to fetch insight data:", error);
        alert("Failed to fetch insight data. Please try again.");
      }
    };
    load();
  }, []);

  return (
    <div className="App">
      <header className="navbar">
        <h1>Dataset Manager</h1>
      </header>

      <div className="dataset-cards-section">
        <div className="card-container">
          <div className="card">
            <h2>Upload Dataset</h2>
            <input
              type="text"
              placeholder="Dataset ID"
              defaultValue=""
              disabled
            />
            <input type="file" disabled />
            <button type="button" disabled>
              Upload
            </button>
          </div>

          <div className="card">
            <h2>View Datasets</h2>
            <div>
              <label>Sort by: </label>
              <select defaultValue="date" disabled>
                <option value="date">Date Added</option>
                <option value="id">Dataset ID (Alphabetical)</option>
              </select>
            </div>

            <select defaultValue={DATASET_ID} disabled>
              <option value="">Select a dataset</option>
              <option value={DATASET_ID}>
                {DATASET_ID} (demo dataset)
              </option>
            </select>
          </div>

          <div className="card">
            <h2>Manage Datasets</h2>
            <select defaultValue="" disabled>
              <option value="">Select a dataset to delete</option>
            </select>
            <button type="button" disabled>
              Delete Dataset
            </button>
          </div>
        </div>

        <p className="demo-footer-note">Add dataset functionality Removed For Demo</p>
      </div>

      <div className="insight-container">
        <h2>Dataset Insights: {DATASET_ID}</h2>

        {insightData ? (
          <>
            <BarChart data={insightData} />
            <CourseAvgGraph datasetId={DATASET_ID} />
            <AverageOverTimeGraph datasetId={DATASET_ID} />
          </>
        ) : (
          <p>Loading insights…</p>
        )}
      </div>
    </div>
  );
}

export default App;
