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


## Hosting on AWS EC2

This project is deployed on an AWS EC2 instance (Amazon Linux) with the backend managed by PM2 and the frontend served by Nginx.

### Tools used

- **AWS EC2 (Amazon Linux):** cloud VM hosting environment
- **Node.js 18 + Yarn:** runtime and dependency management
- **PM2:** keeps the backend process alive across crashes/reboots
- **Nginx:** serves static frontend assets on port 80 and proxies API calls to backend port 4321
- **Git/GitHub:** source deployment workflow (`git clone` / `git pull`)

### Deployment flow (what was done)

1. Launch EC2 instance and configure security group rules:
    - allow SSH on port `22`
    - allow HTTP on port `80`
    - allow backend traffic on port `4321` (for direct API testing)
2. Install system dependencies and project runtime (`git`, Node 18, Yarn).
3. Clone the repository (including branch-specific deployment when needed), then install dependencies:
    - root: `yarn install`
    - frontend: `cd frontend && yarn install`
4. Build frontend static assets:
    - `cd frontend && yarn build`
5. Start backend with PM2 from the compiled output:
    - `npx tsc`
    - `pm2 start dist/App.js --name coursequery`
6. Configure Nginx to:
    - serve `frontend/build` on port `80`
    - proxy `/echo`, `/datasets`, and `/query` to `http://127.0.0.1:4321`
7. Reload Nginx and verify:
    - app loads at `http://<ec2-public-ip-or-dns>`
    - backend responds at `http://<ec2-public-ip-or-dns>:4321/echo/hello`

### Important deployment notes

- Opening the EC2 public URL without a port targets port `80`, so Nginx is required for browser access to the frontend.
- Direct backend checks must use `http://` (not `https://`) on port `4321` unless TLS termination is configured.
- The local `data/` cache folder is not included by default in a fresh clone; datasets must be uploaded again (or transferred) on the EC2 instance.


## Quick Notes:

- PM2 is a Node.js process manager.
    - It keeps your Node app running in the background.
    - Restarts it automatically if it crashes.
    - Can run multiple instances (load balancing across CPU cores).
    - Gives logs, monitoring, and startup-on-reboot support.
Think of PM2 as: “keep my Node app alive and manageable on the server.”

- Nginx is a web server + reverse proxy.
    - It listens on ports 80/443 (HTTP/HTTPS).
    - Forwards requests to your app running on an internal port (like
    localhost:3000).
    - Handles SSL certificates (HTTPS), domain routing, compression,
    caching, and static files efficiently.
Think of Nginx as: “the front door of your server that handles web traffic and passes it to your app safely.”

- yarn is a JavaScript package manager, similar to npm.
    - It installs project dependencies from package.json.
    - It runs scripts like yarn dev, yarn build, yarn test.
    - It uses a lockfile (yarn.lock) to keep installs consistent across    
    machines.
    - It can be faster and has workspace/monorepo features (especially with
    newer Yarn versions).



