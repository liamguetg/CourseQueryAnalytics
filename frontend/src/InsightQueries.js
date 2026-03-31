import axios from "axios";
import { API_BASE } from "./config";

const BASE_URL = API_BASE + "/query";

export const fetchDepartments = async (datasetId) => {
    const query = {
        WHERE: {},
        OPTIONS: {
            COLUMNS: [
                `${datasetId}_dept`
            ],
            ORDER: `${datasetId}_dept`,
        },
        TRANSFORMATIONS: {
            GROUP: [
                `${datasetId}_dept`
            ],
            APPLY: [],
        },
    };

    console.log('Sending query:', query);  // Log query to inspect
    const response = await axios.post(BASE_URL, { query });
    return response.data.result.map((item) => item[`${datasetId}_dept`]);
};

/**
 * Fetch all courses from the given department in the dataset.
 * @param {string} datasetId - The ID of the dataset.
 * @param {string} department - The department name.
 * @returns {Promise<string[]>} - A list of course IDs.
 */
export const fetchCourses = async (datasetId, department) => {
    const query = {
        WHERE: {
            IS: {
                [`${datasetId}_dept`]: department
            }
            },
        OPTIONS: {
            COLUMNS: [`${datasetId}_id`],
            ORDER: `${datasetId}_id`,
        },
        TRANSFORMATIONS: {
            GROUP: [`${datasetId}_id`],
            APPLY: [],
        },
    };

    const response = await axios.post(BASE_URL, { query });
    return response.data.result.map((item) => item[`${datasetId}_id`]);
};

export const fetchCourseAvgData = async (datasetId, dept, courseNumber) => {
    const query = {
        WHERE: {
            AND: [
                {
                    IS: {
                        [`${datasetId}_dept`]: dept, // Filter by department
                    },
                },
                {
                    IS: {
                        [`${datasetId}_id`]: courseNumber, // Filter by course number (id)
                    },
                },
            ],
        },
        OPTIONS: {
            COLUMNS: [`${datasetId}_year`, "AvgGrade"], // Selecting year and average grade
            ORDER: `${datasetId}_year`, // Order by year
        },
        TRANSFORMATIONS: {
            GROUP: [`${datasetId}_year`], // Group by year
            APPLY: [
                {
                    AvgGrade: {
                        AVG: `${datasetId}_avg`, // Calculate the average grade
                    },
                },
            ],
        },
    };

    const response = await axios.post(BASE_URL, { query });
    return response.data.result.map((item) => ({
        year: item[`${datasetId}_year`], // Get the year
        avgGrade: item.AvgGrade, // Get the average grade
    }));
};

export const AveragePerDeptQuery = (datasetId) => {
    return {
        WHERE: {},
        OPTIONS: {
            COLUMNS: [
                `${datasetId}_dept`, // Replace with dynamic datasetId
                "AvgDept",
            ],
            ORDER: {
                dir: "DOWN",
                keys: ["AvgDept"],
            },
        },
        TRANSFORMATIONS: {
            GROUP: [`${datasetId}_dept`], // Replace with dynamic datasetId
            APPLY: [
                {
                    AvgDept: {
                        AVG: `${datasetId}_avg`, // Replace with dynamic datasetId
                    },
                },
            ],
        },
    };
};


export const fetchSingleInstructors = async (datasetId) => {
    const query = {
        WHERE: {
            NOT: {
                IS: {
                    [`${datasetId}_instructor`]: "*;*"
                }
            }
        },
        OPTIONS: {
            COLUMNS: [`${datasetId}_instructor`],
            ORDER: `${datasetId}_instructor`
        },
        TRANSFORMATIONS: {
            GROUP: [`${datasetId}_instructor`],
            APPLY: []
        }
    };

        const response = await axios.post(BASE_URL, { query });
        return response.data.result.map((item) => item[`${datasetId}_instructor`]);
};

export const searchProfessors = async (datasetId, searchText) => {
    const query = {
        WHERE: {
            AND: [
                {
                    IS: {
                        [`${datasetId}_instructor`]: `*${searchText}*`
                    }
                },
                { NOT: {
                        IS: {
                            [`${datasetId}_instructor`]: "*;*"
                        }
                    }
                    },
            ],
        },
        OPTIONS: {
            COLUMNS: [`${datasetId}_instructor`],
            ORDER: `${datasetId}_instructor`
        },
        TRANSFORMATIONS: {
            GROUP: [`${datasetId}_instructor`],
            APPLY: []
        }
    };


    const response = await axios.post(BASE_URL, { query });
    return response.data.result.map((item) => item[`${datasetId}_instructor`]);

};

export const fetchAvgPerYear = async (datasetId, professorName) => {
    const query = {
        WHERE: {
            IS: {
                [`${datasetId}_instructor`]: `${professorName}*`,
            },
        },
        OPTIONS: {
            COLUMNS: [
                `${datasetId}_year`,
                "AvgYear",
            ],
            ORDER: {
                dir: "DOWN",
                keys: [`${datasetId}_year`],
            },
        },
        TRANSFORMATIONS: {
            GROUP: [`${datasetId}_year`],
            APPLY: [
                {
                    AvgYear: {
                        AVG: `${datasetId}_avg`,
                    },
                },
            ],
        },
    };

        const response = await axios.post(BASE_URL, { query });
        return response.data.result.map((item) => ({
            year: item[`${datasetId}_year`], // Get the year
            avgGrade: item.AvgYear, // Get the average grade
        }));
};



