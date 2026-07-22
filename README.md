# PM Tool

PM Tool is a responsive project-portfolio dashboard built with semantic HTML, CSS, and vanilla JavaScript. It lets users review portfolio metrics, search and filter projects, create and edit project records, delete records with confirmation, and export filtered data to CSV.

## Live application

[https://amooliak.github.io/pmtool/](https://amooliak.github.io/pmtool/)

## Design

- [Application wireframes and mockups](https://www.figma.com/design/DSIj8dqGSXkKbqbbQxDWmR/Untitled?node-id=6-4)

## Features

- Dashboard, Projects, Portfolio, and Reports views
- Responsive desktop, tablet, and mobile layouts
- Search by project name, ID, or manager
- Filter projects by status
- Create and edit project records with validation
- Delete projects with confirmation
- Browser persistence using `localStorage`
- CSV export
- Empty and error states
- Keyboard-accessible navigation and modal dialog
- Visible focus states and reduced-motion support

## Run locally

No package installation is required to use the application. Either open `index.html` directly or start a local web server:

```sh
python3 -m http.server 4173
```

Then visit [http://localhost:4173](http://localhost:4173).

## Run tests

Node.js 18 or newer is required for the automated tests:

```sh
npm test
```

The tests cover project filtering, ID generation, input validation, and HTML escaping.

## Project structure

```text
pmtool/
├── index.html          Semantic application shell and project form
├── styles.css         Design tokens, components, responsive rules, accessibility
├── data.js            Sample project data
├── utils.js           Search, validation, ID generation, and sanitization
├── components.js      Reusable view and table rendering components
├── app.js             State management and user interactions
├── tests/
│   └── utils.test.cjs Essential automated tests
├── package.json       Test command and project metadata
└── README.md          Setup and technical documentation
```

## Technical decisions

### Vanilla HTML, CSS, and JavaScript

The assignment allows HTML and CSS, so the project intentionally avoids a framework and build step. Reusable UI is organized into rendering components in `components.js`, pure application utilities in `utils.js`, sample data in `data.js`, and state/event handling in `app.js`.

### Data and persistence

Sample records are represented as structured JavaScript data. User changes are stored in the browser with `localStorage`, which makes the deployed static site interactive without requiring a backend. Data is local to each browser and is not synchronized between users.

### Validation and unexpected states

The form validates required text, project-ID format and uniqueness, date order, non-negative currency values, and progress from 0–100. The application falls back to the sample dataset if saved browser data is missing or malformed, displays empty search results, and reports storage failures.

### Accessibility

The interface uses semantic landmarks, associated form labels, ARIA names where icon-only controls are used, a skip link, visible keyboard focus, status announcements, dialog semantics, Escape-to-close behavior, and a focus loop inside the modal. Color is supplemented by text labels.

### Responsive design

Cards and form fields collapse to one column at smaller widths. The sidebar is replaced by compact top navigation on mobile, while data tables remain usable through labelled horizontal scrolling.

## Deployment with GitHub Pages

1. Push these files to the root of the `pmtool` GitHub repository.
2. Open the repository on GitHub.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder.
6. Save and wait for GitHub to provide the public URL.
7. Add that URL to the **Live application** section above.

## Limitations

- Project data is saved per browser rather than in a shared database.
- The detailed savings and budget report panels are placeholders for a future release.
- Authentication and multi-user collaboration are outside the scope of this static prototype.
