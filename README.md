#  Playwright testing
This project is built to test GUI functionality of buerokratt chat widget

## Description:
Current project help to test Buerokratt chat Widget GUI.  
Technologies used: Playwright, NODE.js, Docker

## Project setup
* in root directory
* Build image ```docker-compose up -d```
* Run docker CLI interactively ```docker-compose exec playwright bash```
* Run tests
* To see report ```npx playwright show-report --host 0.0.0.0```	
	
	when done...
* Exit docker CLI ```exit``` or ```CTRL + D```
* Stop and remove container ```docker-compose down```


# Running tests
* run all tests - ```npx playwright test```

* run tests in specific directory - ```npx playwright test ./tests/chatBox```
 
* run specific test file - ```npx playwright test ./tests/chatBox/visibility.spec.js```
	
* additional flags
	```
	--debug             // debug step by step
	--ui                // inspect tests while running
	--project=chromium  // specify a browser for testing | default: all
	--headed            // graphical representation of tests | default: headless
    --workers=3         // amount of workers to run tests
	```  
[Official documentation for running and debugging tests](https://playwright.dev/docs/running-tests)  
Tests result will be opened automatically in the browser and localhost address will be displayed in the terminal 

# Writing tests:
NB! Writng tests should be done outside the container.
The container has to be rebuilt after.

* create new file with ```example.spec.js``` extension
 
* ```import { test, expect } from '@playwright/test'```

* action before each separate test
    ```
    test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Additional actions here
	});
    ```  
[Official documentation - Before and after hooks](https://playwright.dev/docs/test-parameterize#before-and-after-hooks)  
* Use different locators to find elements in DOM:  
Universal locator in Playwright is a method - .locator()  
for other useful follow this link: [locators](https://playwright.dev/docs/locators)

[Official documentation for writing tests](https://playwright.dev/docs/writing-tests)

### Generating tests:
NB! Test generation should be done outside the container
Test can be generated using:
```
npx playwright codegen https://prod.buerokratt.ee/
```

[Playwright inspector](https://playwright.dev/docs/codegen#generate-tests-with-the-playwright-inspector)  
point - click - copy - paste

[Official documentation - Generating tests](https://playwright.dev/docs/codegen-intro)

# Configure file
All configurations can be optionally defined, once, per test, run as flags (e.g. timeout : 30000ms,)
    
Global configuration are defined in: ```playwright.config.js``` and apply to every test run.  
* Global timeout is set for 30 seconds.  
* Failed tests will be retried once.  
* Failed tests will retain a video, a screenshot and a trace.

# Reading logs
* In container the test result will be diplayed ```http://0.0.0.0:9323```
* Outside the container tests result will be opened automatically in the browser and localhost address will be displayed in the terminal.

NB! All tests are saved (including video, screenshot and trace) in the local directories until next batch of tests:
* ```/playwright-report```  
* ```/test-results```

# Test directory tree:
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

