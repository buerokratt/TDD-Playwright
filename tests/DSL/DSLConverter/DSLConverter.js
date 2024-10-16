require('dotenv').config();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');


class DSLConverter {
  constructor() {
    this.templates = {};
    this.businessDSL = null;
    this.baseUrl = 'https://prod.buerokratt.ee/';
    //this.baseUrl = process.env.BASE_URL;
    this.loadTemplates();
  }

  /**
   * @description Load templates from the templates folder.
   */
  async loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');
    try {
      const files = fs.readdirSync(templatesDir);

      files.forEach(file => {
        const templateName = path.parse(file).name;
        const templateContent = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
        this.templates[templateName] = templateContent;
      });
    } catch (err) {
      console.error(`Failed to load templates from ${templatesDir}: `, err.message);
      process.exit(1);
    }
  }

  // Function to write generated testDSL to a file in the folder where business.yml is found
  writeToFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf-8');
  };

  // Recursively traverse folders to find 'BDSL' and 'business.yml'
  findBusinessYMLFolders(dir, visited = new Set()) {
    let results = [];

    try {
      const files = fs.readdirSync(dir); // Attempt to read the directory

      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.lstatSync(fullPath); // Use lstatSync to check for symbolic links

        // Check for already visited directories to prevent infinite loops
        if (visited.has(fullPath)) {
          return; // Skip if already visited
        }

        visited.add(fullPath); // Mark this directory as visited

        if (stat.isDirectory()) {
          if (file === 'BDSL') {
            const businessYmlPath = path.join(fullPath, 'business.yml');
            if (fs.existsSync(businessYmlPath)) {
              results.push(businessYmlPath);
              console.log(`Found business.yml: ${businessYmlPath}`);
            }
          }

          // Recursively search subdirectories
          results = results.concat(this.findBusinessYMLFolders(fullPath, visited));

        }

      });
    } catch (err) {
      if (err.code === 'EACCES') {
        console.warn(`Permission denied for directory: ${dir}`); // Log the permission error
      } else {
        console.error(`Error reading directory ${dir}:`, err.message); // Log any other error
      }
    }

    return results;
  }


  loadBusinessDSL(businessDSLPath) {
    try {
      const businessDSL = yaml.load(fs.readFileSync(businessDSLPath, 'utf-8'));
      console.log(`Loaded Business DSL from: ${businessDSLPath}`); // Log the loaded path
      this.businessDSL = businessDSL;
    } catch (err) {
      console.error(`\x1b[31mError loading Business DSL from ${businessDSLPath}:\x1b[0m`, err.message);
      process.exit(1);
    }
  }

  // Function to convert businessDSL to testDSL. It goes through each method in the businessDSL and generates a testDSL for each by using the templates.
  convertToTestDSL() {
    if (!this.businessDSL) return console.error('No Business DSL loaded');

    let testDSL = '';

    this.businessDSL.methods.forEach(method => {
      // method.main.title should be converted to method.main.titleTemplate
      // Also should change the name of title to header. so our businesstemplate will keep header, body, footer.
      if (method.main && method.main.title) {
        testDSL += this.generateTest(method.main.title);
      }
      if (method.main && method.main.body) {
        testDSL += this.generateTest(method.main.body);
      }
      if (method.main && method.main.footer) {
        testDSL += this.generateTest(method.main.footer);
      }
    });

    return this.cleanTestDSL(testDSL);
  }



  /**
   * Generates test templates for a given element's components.
   * 
   * @param {Object} element - The element containing a `components` array, such as header, body, or footer.
   * 
   * @returns {string} - A string containing the generated test templates for all components within the element. 
   *                     If no components or templates are found, it returns an empty string.
   * 
   * Process:
   * 1. Validation: Checks if the `element` has a valid `components` array. If not, logs a warning and returns an empty string.
   * 2. Template Generation: For each component in the array:
   *    - Extracts the component type (e.g., input, switch).
   *    - Fetches the corresponding template for that component type from `this.templates`.
   *    - Populates the template with data by calling `populateTemplate()`.
   *    - Adds a comment section describing the component tests.
   * 3. Warnings: Logs warnings if the `components` array is invalid or if a component's template is not found.
   * 4. Returns: The final test template string for all components.
   * 
   * Example:
   * const testTemplate = this.generateTest(header);
   * console.log(testTemplate);
   */
  generateTest(element) {
    if (!element || !element.components || !element.components.length) {
      console.warn('\x1b[31mInvalid body structure or no components found.\x1b[0m');
      return '';
    }
    return element.components.reduce((testTemplate, component) => {
      const componentType = Object.keys(component)[0];
      const componentTemplate = this.templates[componentType];

      if (!componentTemplate) {
        console.warn(`Template not found for component type: ${componentType}`);
        return testTemplate;
      }


      const commentDescription = `\n\n# ${componentType} component tests for ${this.businessDSL.description}\n\n`;
      return testTemplate + commentDescription + this.populateTemplate(componentTemplate, component);

    }, '');
  }



  populateTemplate(template, component) {
    const componentType = Object.keys(component)[0];
    if (componentType === 'tableTemplate') {
      return this.populateTableTemplate(template, component);
    }
    
    const componentData = component[componentType];

    // Extract label and name values using optional chaining
    const labelValue =
      componentData[0] && componentData[0].label && componentData[0].label.args && componentData[0].label.args[1]
        ? componentData[0].label.args[1].value
        : '';
  
    // Convert label and name values to camel case
    const translationKey = this.toCamelCase(labelValue);
    const capitalizedType = componentType.charAt(0).toUpperCase() + componentType.slice(1);
    const cleanedType = capitalizedType.split('Template')[0];

    // Replace placeholders in the template
    return template.replace(/{{\s*(\w+)\s*}}/g, (match, placeholder) => {
      if (placeholder === `label${cleanedType}`) {
        return `translation.${translationKey}`; // Replace with translation key
      }
      if (placeholder === "name") {
        const nameObject = componentData[1].input.args.find(arg => arg.name !== undefined);
        return nameObject ? this.toCamelCase(nameObject.name) : translationKey;
      }
      return match; // If no match, return the original placeholder
    });
  }

  populateTableTemplate(templateStr, component) {
    const tableData = component.tableTemplate;
    const template = yaml.load(templateStr);

    // Check if the table data structure is valid
    if (!tableData || !tableData.header || !Array.isArray(tableData.header.columns)) {
      console.warn('Invalid table structure');
      return JSON.stringify(template, null, 2);
    }

    const columns = tableData.header.columns;

    // Populate columns dynamically
    template.templates.components.columns = columns.map(column => {

      // Construct the column label with the value
      const columnLabel = `translation.`

      return {
        name: this.toCamelCase(column.name), // Camel case for the column name
        label: columnLabel + this.toCamelCase(column.args[1].value), // Use the constructed string directly for the label
        sortable: true
      };
    });

    // Create dynamic row structure based on columns
    template.templates.components.rows = [{
      name: 'Row',
      data: columns.map(column => ({
        [this.toCamelCase(column.name)]: "Data exists here"
      }))
    }];

    // Return final structured YAML as a string
    return yaml.dump(template);
  }


  toCamelCase(str) {
    return str
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toLowerCase() : match.toUpperCase()
      )
      .replace(/\s+/g, '');
  }

  cleanTestDSL(testDSL) {
    const name = `name: ${this.businessDSL.description}\n`;
    const navigateUrl = `${this.baseUrl}${this.businessDSL.resource}`;
    const setupBlock = `setup:\n\t- describe: Check visibility of Page Elements\n\t  serial: true\n\t  beforeEach:\n\t  - name: Setup\n\t\t  action:\n\t\t\t  navigate: "${navigateUrl}"\n\t  - name: Fetch Translations\n\t\t\t  action:\n\t\t\t\t  getTranslations: true\n\t\t\t\t  assignVariable: translations\n`;
    return name + setupBlock + 'tests:\n' + testDSL.replace(/^/gm, '\t').replace(/templates:\s*/g, '');
  }


  /**
 * Processes business.yml file(s) by loading it(them), converting it(them) to testDSL(s), and saving it(them).
 * 
 * @param {string} businessYMLPath - The path to the business.yml file.
 */
  processBusinessDSL(businessYMLPath = null) {
    const paths = businessYMLPath ? [businessYMLPath] : this.findBusinessYMLFolders(path.resolve(__dirname, '../../'));
    paths.forEach(businessYMLPath => {
      this.loadBusinessDSL(businessYMLPath);
      const testDSL = this.convertToTestDSL();
      const outputFilePath = path.join(path.dirname(businessYMLPath), 'testDSL.yml');
      this.writeToFile(outputFilePath, testDSL);
      console.log(`TestDSL written to: ${outputFilePath}`);
    });
  }
}

const dslConverter = new DSLConverter();
const specificPath = process.argv[2] || null;
dslConverter.processBusinessDSL(specificPath);
