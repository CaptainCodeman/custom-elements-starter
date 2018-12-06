# custom-elements-starter

Example Project for developing Custom Elements (with Typescript) in a way
that is suitable for publishing to npm and importing into other projects,
typically the consuming application.

This split allows you to focus on either the UI elements, which are 'dumb'
(properties down, events up) or the application where you'll typically be
working with Redux, routing and such.

## Usage

### Installation

    npm install

### Build Project

    npm run build

Running in dev mode will watch for file changes and re-build as required:

    npm run dev

### Start Development Server

Use in conjunction with `npm run dev` to have updates automatically reload:

    npm start

### Run Unit Tests

    npm test

### Regenerate Baseline Screenshots

    npm run test:regenerate

## Tests

### Unit Tests

### Integration Tests

Configure integration test paramaters in `test/integration/config.json`
