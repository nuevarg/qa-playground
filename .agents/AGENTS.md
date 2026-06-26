# Workspace-Specific Agent Rules

## Test Directory Structure Rule
All test scripts, automation code files, and automation test folders generated must be stored under the `automation` directory at the project root, structured and categorized by the testing technology being used.

### Structure Format:
- **Cypress**: `automation/cypress/`
- **Playwright**: `automation/playwright/`
- **Appium**: `automation/appium/`
- **Other Technologies**: `automation/<technology_name>/`

Do NOT place automation scripts, files, or folders in any other directories (e.g., the root directory, `apps/backend`, or `apps/frontend`) unless they are specific unit tests belonging directly to those projects.
