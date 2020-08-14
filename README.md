This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Environment Setup

1. Install [node 12 and npm](https://nodejs.org/en/)
2. Install dependencies with `npm install`

### Running against a local API 

Run `export REACT_APP_API_ENDPOINT=http://localhost:8080/api/`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run cypress-open` and `npm run cypress-run`

[Cypress](https://www.cypress.io/) is an end-to-end UI testing tool.

Cypress tests require the [pgc-api](https://github.com/project-grand-canyon/pgc-api) and this project to be running locally.
They also require the seed data created by pgc-api's `setup-db` script. Run this project with `npm run local` to
ensure it is pointing at the local API. Do not run these if pointed at the production API, as they may change data!
The tests have a safeguard that should stop them before anything harmful is done, though, if they try to access the production site.

#### `npm run cypress-open`

Opens the cypress GUI. This is useful to manually kick off end-to-end Cypress tests and observe the UI during the test.

#### `npm run cypress-run`

Runs the tests headlessly from the command line.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
