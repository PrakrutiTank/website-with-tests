# Daymark

A small, responsive task-tracking website with automated browser tests and a
90% minimum coverage threshold.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

From the project folder:

```powershell
npm install
npm test
npm run dev
```

Or run the PowerShell setup script, which performs those steps in order:

```powershell
.\setup.ps1
```

To clone the repository into a new `website-with-tests` folder and run it:

```powershell
.\setup.ps1 -Clone
```

The development server opens the website at `http://localhost:4173`.

## Features

- Add, complete, delete, and clear tasks
- Filter the list by all, to-do, and completed tasks
- Responsive layout with accessible labels and status announcements
- Jest/jsdom tests with 90% minimum branch, function, line, and statement coverage
