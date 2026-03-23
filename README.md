# CourseQuery Analytics

This project is a full-stack data analytics platform built with a TypeScript/Node backend and a React frontend.
It supports end-to-end data ingestion, query processing, RESTful API integration, and interactive data visualization.

From a user perspective, you can upload course data and explore insights such as:

- average grades by department
- how a course's average changes over time
- instructor-based trends to help identify easier/harder grading patterns

The backend provides dataset lifecycle management and query execution, while the frontend delivers a dashboard for upload, filtering, and analytics charts.

## Relevant Highlights

- Designed and implemented REST API endpoints for dataset ingestion, management, and analytical querying
- Developed dynamic query objects sent from React to backend services for real-time analytics workflows
- Built a modular backend query engine with validation, filtering, aggregation, and sorting
- Implemented local persistence/caching to support reliable state across application restarts
- Applied automated testing across business logic and API layers for regression prevention and quality assurance

## Features

- Upload and persist datasets through REST endpoints
- Manage datasets (list and remove)
- Execute structured analytical queries
- Visualize query results with React + Chart.js
- Local disk caching for faster reload/startup behavior

## Tech Stack

- **Backend:** TypeScript, Node.js, Express
- **Frontend:** React, Axios, Chart.js (`react-chartjs-2`)
- **Data Processing:** JSZip, parse5 (zip + HTML parsing)
- **Testing:** Mocha, Chai, Supertest (unit/integration/API testing)
- **Engineering Practices:** schema validation, error handling, caching, modular architecture

## How It Works

1. A dataset is uploaded as a zip file to the backend.
2. The backend validates and processes the dataset into an internal format.
3. Processed data and metadata are cached on disk.
4. The frontend sends query objects to the backend.
5. Query results are returned and displayed as charts in the UI.

## Testing and Quality

- Backend behavior is validated with automated tests under `test/controller` and `test/rest`
- Query behavior is verified with fixture-based test cases in `test/resources/queries`
- API contracts (status codes + response shapes) are tested using Supertest
- Code quality is enforced with linting and formatting checks (`eslint`, `prettier`)



<img width="1438" height="406" alt="Screenshot 2026-03-23 at 1 18 59 AM" src="https://github.com/user-attachments/assets/40b0fcd6-fe5c-4c4f-bee1-8606083c095e" /><img width="1300" height="683" alt="Screenshot 2026-03-23 at 1 20 21 AM" src="https://github.com/user-attachments/assets/3ac3dcb4-2610-4c27-9cd4-f3d5fb6aeb50" />



## Configuring your environment

To start using this project, you need to get your development environment configured so that you can build and execute the code.
To do this, follow these steps; the specifics of each step will vary based on your operating system:

1. [Install git](https://git-scm.com/downloads) (v2.X). You should be able to execute `git --version` on the command line after installation is complete.

1. [Install Node LTS](https://nodejs.org/en/download/) (LTS: v18.X), which will also install NPM (you should be able to execute `node --version` and `npm --version` on the command line).

1. [Install Yarn](https://yarnpkg.com/en/docs/install) (1.22.X). You should be able to execute `yarn --version`.

1. Clone your repository by running `git clone REPO_URL` from the command line. You can get the REPO_URL by clicking on the green button on your project repository page on GitHub. Note that due to new department changes you can no longer access private git resources using https and a username and password. You will need to use either [an access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) or [SSH](https://help.github.com/en/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account).

## Run the project

Open two terminals from the repository root.

### 1) Start backend (port 4321)

```bash
yarn install
yarn start
```

### 2) Start frontend (port 3000)

```bash
cd frontend
yarn install
yarn start
```

Then open [http://localhost:3000](http://localhost:3000).
The frontend communicates with the backend at [http://localhost:4321](http://localhost:4321).

## Project commands

Once your environment is configured you need to further prepare the project's tooling and dependencies.
In the project folder:

1. `yarn install` to download the packages specified in your project's *package.json* to the *node_modules* directory.

1. `yarn build` to compile your project. This also runs formatting and lint checks.

1. `yarn test` to run the test suite.
    - To run with coverage, run `yarn cover`

1. `yarn prettier:fix` to format your project code.

1. `yarn lint:check` to see lint errors in your project code. You may be able to fix some of them using the `yarn lint:fix` command.

If you are curious, some of these commands are shortcuts defined in [package.json -> scripts](./package.json).

## Running and testing from an IDE

IntelliJ Ultimate should be automatically configured the first time you open the project (IntelliJ Ultimate is a free download through the [JetBrains student program](https://www.jetbrains.com/community/education/#students/)).
