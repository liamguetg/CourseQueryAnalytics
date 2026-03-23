import React from "react";

export function DepartmentCourseSelector({
                                      departmentData,
                                      setDepartmentData,
                                      courseData,
                                      setCourseData,
                                      selectedDept,
                                      setSelectedDept,
                                      selectedCourse,
                                      setSelectedCourse,
                                  }) {
    return (
        <div>
            {/* Department Dropdown */}

            <label htmlFor="deptSelect">Select Department:</label>
            <select
                value={selectedDept}
                onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setCourseData([]); // Reset course data when department changes
                }}
            >
                <option value="">Select Department</option>
                {departmentData.map(department => (
                    <option key={department} value={department}>
                        {department}
                    </option>
                ))}
            </select>

            {/* Course Dropdown (only visible if department is selected) */}
            <div>
                <label htmlFor="courseNumSelect">Select Course Number:</label>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                >
                    <option value="">Select Course</option>
                    {courseData.map(course => (
                        <option key={course} value={course}>
                            {course}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}