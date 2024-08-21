#  Playwright testing
This project is built to test GUI functionality of buerokratt chat widget

## Description:
Current project help to test Buerokratt chat Widget GUI. 
Technologies used: Playwright, NODE.js, Docker

## Project setup
* in root directory
* Build image ```docker build -t prod .```
* Run docker container ```docker run --rm my-playwright-project```

# Running tests
* run all tests ```npx playwright test```

* run tests in specific directory - e.g. ```npx playwright test ./tests/chatBox```
 
* run specific test file ```npx playwright test ./tests/chatBox/visibility.spec.js```
	
* additional flags
	```
	--debug             // debug step by step
	--ui                // inspect tests while running
	--project=chromium  // specify a browser for testing ,default: all
	--headed            // graphical representation of tests, default: headless
	```

# Writing tests:
* create new file with ```example.spec.js``` extension
 
* ```import { test, expect } from '@playwright/test'```

* action before each separate test
    ```
    test.beforeEach(async ({ page }) => {
		await page.goto('https://prod.buerokratt.ee/');
		// Additional actions here
	});
    ```
* use different locators to find elements in DOM:
[link] https://playwright.dev/docs/locators

# Configure file
Global configuration are defined in: ``````

# Reading logs

test directory tree:
``` 
.
├── chatBox
│   ├── closingMenu
│   │   ├── feedbackMenu
│   │   │   ├── functionality.spec.js
│   │   │   └── visibility.spec.js
│   │   ├── functionality.spec.js
│   │   └── visibility.spec.js
│   ├── detailsMenu
│   │   ├── functionality.spec.js
│   │   └── visibility.spec.js
│   ├── functionality.spec.js
│   └── visibility.spec.js
└── landingPage
    ├── functionality.spec.js
    └── visibility.spec.js
```

