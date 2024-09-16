
# Playwright Test Case Generator using OpenAI and YAML:
Prerequisites
1. Node.js
2. Playwright: Install by running:
```
npm install @playwright/test
```
3. OpenAI Node.js SDK: Install via:
```
npm install openai
```
4. YAML Parser: Install via:
```
npm install js-yaml
```
5. dotenv: Install via:
```
npm install dotenv
```

## Usage
* Go to samples folder

* Run the script:
```
node script.js
```

### TODO:
Automation Features
Batch Processing: To handle multiple YAML files at once, the script processes all YAML files from the samples/DSL/ folder and creates corresponding Playwright test files.

Error Handling: Errors are logged in error_log.txt for easy troubleshooting.

Version Control: Once tests are generated, they are automatically committed and pushed to the repository.