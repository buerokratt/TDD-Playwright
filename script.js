require('dotenv').config(); 
const fs = require('fs')
const OpenAi = require('openai')
const yaml = require('js-yaml')
const { exec } = require('child_process');


const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
})

// Function to generate Playwright test cases
const generateTestCases = async (yamlContent) => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', 
        messages: [
            {
                role: 'system',
                content: `You are an expert in Playwright testing. Generate a complete set of Playwright test cases based on the following YAML description. Your task is to create a comprehensive set of test cases for a web application. The YAML description is provided below. Provide the output as plain JavaScript code only, with no explanations or additional context.`,
            },
            {
                role: 'user',
                content: `Generate Playwright test cases based on the following YAML description:\n\n${yamlContent}`,
            }
        ],
        max_tokens: 1500,
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating test cases:', error);
      throw error;
    }
  };



// Function to write Playwright test cases to a file
const writeTestCasesToFile = (filePath, content) => {
    // Remove Markdown code block syntax if present
    const cleanedContent = content.replace(/^```javascript\s*|\s*```$/g, '').trim();

    fs.writeFileSync(filePath, cleanedContent, 'utf-8');
  };
  
  // Load YAML file
  const loadYamlFile = (filePath) => {
    try {
      return yaml.load(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
      console.error('Error loading YAML file:', error);
      throw error;
    }
  };

  // Function to run Playwright tests
const runTests = async () => {
  exec('npx playwright test', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing tests: ${error.message}`);
      return;
    }
    console.log(`Test results:\n${stdout}`);
    if (stderr) {
      console.error(`stderr:\n${stderr}`);
    }
  });
};

  
  // File paths
  const yamlFilePath = './samples/DSL/login/landing.yml'; // Path to your YAML file
  const testFilePath = './tests/generated/playwright_testid.spec.js'; // Output file for the Playwright tests
  
  // Load YAML file
  const yamlData =  loadYamlFile(yamlFilePath);
  
  // Create a prompt from the YAML data
  const yamlContent =  yaml.dump(yamlData);
  
  // Generate test cases
  console.log('Generating test cases...');
   generateTestCases(yamlContent)
    .then((testCases) => {
      // Write test cases to file
      console.log('Writing test cases to file...');
      console.log(testCases)
      writeTestCasesToFile(testFilePath, testCases);
      console.log('Test cases generated and written to file successfully.');
      runTests();
    })
    .catch((error) => {
      console.error('Error:', error);
    });

