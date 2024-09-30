const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { dirname } = require('path');

class DSLConverter {
  constructor() {
    this.templates = {};
    this.businessDSL = null;
    this.loadTemplates();
    this.loadBusinessDSL();

    // TODO: not sure it is nice to keep it here. maybe should move somewhere else in setup file etc...
    this.baseUrl = 'https://admin.prod.buerokratt.ee/';
  }

  loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');
    const files = fs.readdirSync(templatesDir);

    files.forEach(file => {
      const templateName = path.parse(file).name;
      const templateContent = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
      this.templates[templateName] = templateContent;
    });
  }

  // Function to write generated testDSL to a file
  writeToFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf-8');
  };


  loadBusinessDSL() {
    const businessDSLPath = process.argv[2];
    const businessDSLPath2 = path.join(__dirname, businessDSLPath); // Adjust path if needed
    try {
      const businessDSL = yaml.load(fs.readFileSync(businessDSLPath2, 'utf-8'));
      console.log("Loaded Business DSL:", businessDSL);
      this.businessDSL = businessDSL;
    } catch (err) {
      console.error(`Error loading Business DSL from ${businessDSLPath}:`, err.message);
      process.exit(1);
    }
  }

  // Function to convert businessDSL to testDSL. Go through each method and generate a test.
  convertToTestDSL() {
    if (!this.businessDSL) {
      console.error("Business DSL not loaded.");
      return;
    }

    let testDSL = '';

    this.businessDSL.methods.forEach(method => {

      // TODO: maybe can combine with generateTest later...
      if (method.main && method.main.title) {
        testDSL += this.generateTitleTest(method.main.title);
      }

      testDSL += this.generateTest(method, false);
    });

    const footer = this.businessDSL.methods[0]
    testDSL += this.generateTest(footer, true)

    testDSL = this.cleanTestDSL(testDSL);

    return testDSL;
  }


  // Function to generate a test for a body component.
  generateTest(method, isFooter = false) {
    let testTemplate = '';
  
    // Determine the appropriate body (footer or main body)
    const body = isFooter ? method.main.footer : method.main.body;
  
    // Check if the body is valid and has components
    if (body && Array.isArray(body.components)) {
      // Iterate over each component in the body
      body.components.forEach(component => {
        const componentType = Object.keys(component)[0];
        const title = `${componentType} tests for ${this.businessDSL.description}`;
        testTemplate += `\n\n# ${title}\n\n`;
        const componentTemplate = this.templates[componentType];
  
        if (componentTemplate) {
          testTemplate += this.populateTemplate(componentTemplate, component, isFooter);
        } else {
          console.warn(`Template not found for component type: ${componentType}`);
        }
      });
    } else {
      console.warn('Invalid body structure or no components found.');
    }
  
    return testTemplate;
  }

  // Specificly
  generateTitleTest(title) {
    let titleTestTemplate = '';
    const titleData = title.components.title.args || [];

    // Get the type of component. title.components is a dictionary. Object.keys returns list of all keys. 
    //In case that title.components has one key which is 'title' should get from list first value
    let componentType = Object.keys(title.components)[0];
    let componentTemplate = this.templates[componentType];

    if (componentTemplate) {
      titleTestTemplate += this.populateTemplateWithTitle(componentTemplate, titleData);
    }

    return titleTestTemplate;
  }

  populateTemplateWithTitle(template, titleData) {
    // Extract type, value, and style from the titleData array
    const typeObj = titleData.find(item => item.type);
    const valueObj = titleData.find(item => item.value);
    const styleObj = titleData.find(item => item.style);

    
    // If any of the extracted values are undefined, set them to an empty string
    const type = typeObj ? typeObj.type : '';
    const value = valueObj ? this.toCamelCase(valueObj.value) : '';
    const style = styleObj ? styleObj.style : 'h1';



    // Replace placeholders in the title template with extracted values
    const populatedTemplate = template
      .replace(/{{\s*type\s*}}/g, type)
      .replace(/{{\s*header\s*}}/g, `translation.${value}`)
      .replace(/{{\s*style\s*}}/g, style);
    return populatedTemplate;
  }

  populateTemplate(template, component, isFooter = false) {
    let componentType
    let componentData
  
    let labelValue;
    if (isFooter) {
      // For footer, extract from args
      componentData = component.args
      componentType = componentData[0].type; // Extract the type from the first argument
      labelValue = componentData[1].value; // Assuming args is structured as before
      
    } else {
      // For body, extract from label
      componentType = Object.keys(component)[0];
      componentData = component[componentType];
      labelValue = componentData[0].label.args[1].value; // Adjust this if the structure changes
     
    }
  
    const translationData = {};
    const placeHolderMap = new Map();
  
    const matchString = 'label ' + componentType;
  
    translationData.label = labelValue;
    placeHolderMap.set(this.toCamelCase(matchString), labelValue);
  
    const translationKey = this.toCamelCase(translationData.label);
  
    // Replace placeholders in the template with the corresponding translation
    const populatedTemplate = template.replace(/{{\s*(\w+)\s*}}/g, (match, p1) => {
      if (p1 === "label" + componentType.charAt(0).toUpperCase() + componentType.slice(1)) {
        return 'translation.' + translationKey; 
      } 
      if (p1 === "name") {
        return translationKey;
      }
      return match;
    });
  
    return populatedTemplate;
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
    // On top of the file is the 'name'
    let name = `name: ${this.businessDSL.description}\n`;

    // Construct the dynamic navigation URL
    let navigateUrl = `${this.baseUrl}${this.businessDSL.resource}`;

    // Setup block with tabs for indentation
    let setupBlock = `setup:\n\t- describe: Check visibility of Page Elements\n\t  serial: true\n\t  beforeEach:\n\t  - name: Setup\n\t\t  action:\n\t\t\t  navigate: "${navigateUrl}"\n\t  - name: Fetch Translations\n\t\t\t  action:\n\t\t\t\t  getTranslations: true\n\t\t\t\t  assignVariable: translations\n`;

    // Add tests block
    let testsLabel = 'tests:\n';

    // Indent the entire testDSL block by adding a tab in front of each line
    testDSL = testDSL.replace(/^/gm, '\t');

    // Clean up 'templates:' if present in the testDSL
    testDSL = testDSL.replace(/templates:\s*/g, '');

    // Combine all parts: name, setup block, and tests
    testDSL = name + setupBlock + testsLabel + testDSL;

    return testDSL;
  }
}

const dslConverter = new DSLConverter();
const testDSL = dslConverter.convertToTestDSL();
dslConverter.writeToFile('./testDSL.yml', testDSL);
console.log(testDSL);
