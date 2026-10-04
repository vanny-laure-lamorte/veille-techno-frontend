# Kanban board

Kanban board management application developed with **Angular 21** as part of the **Master 1 Development program at La Plateforme**.

## Table of Contents

* [About the project](#about-the-project)
* [Technologies](#technologies)
* [Prerequisites](#prerequisites)
* [Versions and Maintenance](#versions-and-maintenance)
* [Installation](#installation)
* [Development server](#development-server)
* [Project structure](#project-structure)
* [Features](#features)
* [Code scaffolding](#code-scaffolding)
* [Building](#building)
* [Running unit tests](#running-unit-tests)
* [Running end-to-end tests](#running-end-to-end-tests)
* [Code quality](#code-quality)
* [Technology watch](#technology-watch)
* [Additional resources](#additional-resources)

## About the project

Kanban board is an application built with Angular. The project aims to explore Angular ecosystem and its latest features.

## Technologies

The main technologies used in this project are:

* **Angular**
* **TypeScript**
* **HTML / CSS**
* **Angular CLI**
* **Vitest** for unit testing
* **Node.js** as the JavaScript runtime environment
* **npm** for package management

## Prerequisites

Before running the project, make sure you have the following installed:

* [Node.js](https://nodejs.org/)
* npm
* Angular CLI

## Versions and Maintenance

To check the versions of the main technologies and tools used in the project, you can run the following commands:

```bash
node --version
npm --version
ng version
```

Versions below are the versions currently installed in the project workspace, resolved from `package-lock.json`.

Versions below are the versions currently installed in the project workspace, resolved from `package-lock.json`, plus the runtime versions used by the local development environment.

| Component                 | Project version | Where it comes from                                                                   | Maintenance note                                                                                            |
| ------------------------- | --------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Node.js (local workspace) | `24.21.0`       | Local development environment                                                         | Node.js 24 is an LTS line. Keep the local Node.js major version aligned with CI and Docker when applicable. |
| npm (local workspace)     | `11.19.0`       | Bundled with local Node.js                                                            | Use `npm ci` in CI to install exactly the versions defined by the lockfile.                                 |
| Angular                   | `21.2.25`       | Runtime dependencies (`@angular/core`, `common`, `compiler`, `forms`, `router`, etc.) | Keep Angular packages on the same major/minor line and update compatible patch versions together.           |
| Angular CLI               | `21.2.24`       | Development tooling (`@angular/cli`)                                                  | Keep the CLI major/minor aligned with the Angular application.                                              |
| Angular CDK               | `21.2.14`       | Runtime dependency (`@angular/cdk`)                                                   | Keep CDK aligned with the Angular Material version and update compatible patches together.                  |
| Angular Material          | `21.2.14`       | Runtime dependency (`@angular/material`)                                              | Keep Angular Material and CDK on the same version line.                                                     |
| TypeScript                | `5.9.3`         | Development dependency                                                                | Keep TypeScript compatible with the installed Angular version before upgrading.                             |
| RxJS                      | `7.8.2`         | Runtime dependency                                                                    | Keep RxJS compatible with the Angular version and test reactive behavior after upgrades.                    |
| Vitest                    | `4.1.11`        | Development dependency                                                                | Run the unit test suite after upgrades and verify Angular/Vitest compatibility.                             |
| HTML / CSS                | HTML5 / CSS3+   | Web platform standards                                                                | No project package version; behavior depends on browser support and the application's tooling.              |

## Installation

Clone the repository and install the project dependencies:

```bash
git clone https://github.com/vanny-laure-lamorte/veille-techno-frontend.git
cd vtb
npm install
```

## Development server

1. To start a local development server, run:

```bash
ng serve
```

2. Open your browser and navigate to: http://localhost:4200/

3. The application will automatically reload whenever you modify any of the source files.

## Project structure

The main project structure is organized as follows:

```text
src/
├── app/
│   ├── components/
│   ├── services/
│   ├── models/
│   └── ...
├── assets/
├── styles.css
└── main.ts
```

## Features

The application is designed to provide Kanban board management features such as:

* Create and manage boards
* Create, edit and delete tasks
* Organize tasks into columns
* Move tasks between columns
* Manage task information
* Responsive user interface

## Code scaffolding

Angular CLI includes powerful code scaffolding tools.

To generate a new component:

```bash
ng generate component component-name
```

You can also generate other Angular elements such as services, directives or pipes. For a complete list of available schematics:

```bash
ng generate --help
```

## Building

To build the project, run:

```bash
ng build
```

This compiles the application and stores the build artifacts in the `dist/` directory. The production build optimizes the application for performance and speed.

## Running unit tests

To execute unit tests using the [Vitest](https://vitest.dev/) test runner:

```bash
ng test
```

Unit tests should cover the main application logic, components and services.

## Running end-to-end tests

For end-to-end testing, run:

```bash
ng e2e
```

Angular CLI does not provide an end-to-end testing framework by default. A framework such as Playwright or Cypress can be added depending on the project's requirements.

## Code quality

Before committing changes, it is recommended to check the project's code quality.

This project uses **angular-eslint 21**, which is compatible with **Angular 21**. If Angular ESLint is not already installed, run:

```bash
ng add angular-eslint@21
```

Then, you can check the project's code quality with:

```bash
ng lint
```

If a formatter is configured for the project, you can also run:

```bash
npm run format
```

## Technology watch

This project is also used as a **technology watch on the Angular ecosystem**.

The following topics can be explored and documented during the development of the project:

* Angular 21 and its new features
* Standalone components
* Signals
* Reactive state management
* Control flow syntax (`@if`, `@for`, `@switch`)
* Dependency injection
* Angular Router
* Forms
* HTTP client and API communication
* Angular animations
* Performance optimization
* Server-Side Rendering (SSR)
* Testing with Vitest
* Angular CLI and its developer tooling
* Accessibility
* Angular security best practices

Each important technology or discovery can be documented in a dedicated section or in the project's documentation.

## Additional resources

For more information about Angular and Angular CLI:

* [Angular Documentation](https://angular.dev/)
* [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
* [Angular GitHub Repository](https://github.com/angular/angular)
* [Vitest Documentation](https://vitest.dev/)