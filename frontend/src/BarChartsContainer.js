// import React, { useState, useEffect } from "react";
// import DepartmentAverageChart from "./DepartmentAverageChart";
// import CourseAverageChart from "./CourseAvgGraph";
//
// function BarChartsContainer({ datasetId }) {
//     const [selectedDepartment, setSelectedDepartment] = useState("");
//
//     return (
//         <div>
//             <div>
//                 {/* Department Averages Chart */}
//                 <DepartmentAverageChart datasetId={datasetId} />
//             </div>
//
//             <div>
//                 {/* Course Average Chart (only rendered when a department is selected) */}
//                 <CourseAverageChart datasetId={datasetId} selectedDepartment={selectedDepartment} />
//             </div>
//         </div>
//     );
// }
//
// export default BarChartsContainer;