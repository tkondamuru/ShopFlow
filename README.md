# React Native E-commerce Template

## Project Structure

- **assets/**: Store static assets like images and fonts.
- **src/**
  - **components/**: Reusable UI components.
  - **screens/**: Screens used in navigation like Login, Home, etc.
  - **services/Repository.js**: Abstraction layer for API or mock data.
  - **store/CustomerContext.js**: Context API for sharing customer state.
  - **utils/**: Utility functions.
  - **constants/**: App-wide constants.
  - **data/**: Contains JSON files for local mock data during development.

## Notes

- Customer context is shared using React's Context API.
- Toggle between mock data and real API using the `useMock` flag in Repository.js.
- Replace mock logic with your real API URLs and authentication mechanism when going to production.