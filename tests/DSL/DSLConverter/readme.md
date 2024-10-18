# DSLConverter Readme
- DSLConverter on WIP, mis peaks tegema äri DSList templiitide baasil testDSLi. 

- Väga algses faasis, põhimõtteliselt praegu lihtsalt loeb templiidid sisse äriDSLi baasil ja annab tagasi testDSLi, kuhu {{ }} sulgude sisse tõlkevariatsioonid


# How to run
- Move into DSLConverter directory
- run ```node DSLConverter.js BusinessDSL.yml```


- **Tohutu abi .yml filede lugemisel on js-yaml package'ist, mis sätib .yml faili sisu arraysse ning lihtsustab lugemist**


## **TODO:**
- Lisada input_button template
- Pealkirjad testDSL-dele - DONE

- Kõik äriDSLid peavad vastama ühele formaadile, muidu läheb programm katki. Formaati saab muuta ning on läbirääkimise asi. 

- Templiidid ühele formaadile vastama ei pea kuid peavad olema võimalikult universaalsed.

- Iga lehekülje ülemises osas on lehe pealkiri. Header ja Footer peab olema handletud eraldi, sest need on üle lehekülgede väga erinevad.

- Praegune implementatsioon on proovina ehitatud selle baasil, et templatel on üks placeholder, mille formaat on 'label' + XXX

- See aga ei tööta kõigiga kuivõrd osadel on rohkem placeholdereid, osadel on staatilised placeholderid, mis on üle pagede samad (vt nt mainHeader.yml, ükski placeholder tegelikult ei olene kontekstis ning võib kohe translation.XXX formaadis)

- Muutmisel äriDSList testDSLiks peaks sisestama sinna ka beforeach (et ta läheks kuhugi URLI ja laeks sisse translationi jne) - DONE

- Täpsemate testDSLide jaoks oleks vaja tõesti osadele asjadele parentclassi. Test nii ehitab korralikult chatgpt abil  Playwrighti testi: 

```
 name: Check Visibility of Animation Duration Input
        action:
          assertVisible: "input[name='widgetProactiveSeconds']"
```

ehk äkki inputi nimi on sama, mis eelneva labeli oma? 

```
	- name: label_input
	  - components: 
	      parent: input
	      children: Label + Input
	      - name: Label
	        type: Label
	        props:
	          label: "translation.widgetProactiveSeconds"
	          
	      # This input is next to the label    
	      - name: Input
	        type: Input
	        props:
	          input: "input"
```

proovime praegu ka sibling_of, et saada inputile täpsema locator

- Kui programmi jooksutada rekursiivselt läbi kõikide directoryte, peaks ta lugema sisse ka selle, kas tegu on visibility või functionalityga, et saada aru, mis pealkiri panna


### **Praegune output BusinessDSL.ymli näitel**

- See vajab endale testide kirjeldusi, mida saab genereerida teenuse abil. 
- See vajab täpseid ning universaalseid templiite, mille järgi saab testDSLi ehitada.
- Juhul, kui näiteks on kindlasti vaja locateda klassiga, tuleb kirjeldada äriDSLIs parentclassi.

**OUTPUT DSLINA**

```
- name: label_input
  - components: 
      parent: input
      children: Label + Input
      - name: Label
        type: Label
        props:
          label: "translation.widgetProactiveSeconds"
          
      - name: Input
        type: Input
        props:
          input: "input"
          
        
- name: label_switch
  - components: 
      parent: switch
      children: Label + Switch
      - name: Label
        type: Label
        props:
          label: " translation.widgetBubbleMessageText"
          
      - name: Switch
        type: Switch
        props:
          switch: "button.switch__button"
          
        
- name: label_input
  - components: 
      parent: input
      children: Label + Input
      - name: Label
        type: Label
        props:
          label: "translation.widgetBubbleMessageSeconds"
          
      - name: Input
        type: Input
        props:
          input: "input"
          
        
- name: label_input
  - components: 
      parent: input
      children: Label + Input
      - name: Label
        type: Label
        props:
          label: "translation.widgetBubbleMessageText"
          
      - name: Input
        type: Input
        props:
          input: "input"
          
        
- name: label_colorpicker
  - components: 
      parent: input
      children: Label + ColorPicker + Button
      - name: Label
        type: Label
        props:
          label: "translation.widgetColor"
          
      - name: ColorPicker
        type: Input
        props:
          input: "input"
          readonly: true
      
      - name: Button
        type: Button
        props:
          icon: true
          # Indicates it's next to the ColorPicker in the DOM structure
          adjacent_to: ColorPicker- name: label_dropdown
  - components: 
      parent: select
      children: Label + Dropdown
      - name: Label
        type: Label
        props:
          label: "translation.widgetAnimation"
          
      - name: Dropdown
        type: Input
        props:
          trigger_class: "select__trigger"
          expanded: false

```

**OUTPUT PLAYWRIGHT CODE'INA, MIS CHAT ANNAB SELLE BAASIL**

**Lisainput on: Give me playwright visibility tests based on this, the translation.XXX use composite literals so take that into account.**

```
const { test, expect } = require('@playwright/test');
const translations = require('../path/to/translations'); // Import your translations file

test.describe('UI Visibility Tests', () => {

  test('Check visibility of label and input field for widgetProactiveSeconds', async ({ page }) => {
    const labelSelector = `.your-class-before-${translations['translation.widgetProactiveSeconds']}`;
    const inputSelector = 'input';

    // Check label visibility
    await expect(page.locator(labelSelector)).toBeVisible();

    // Check input field visibility
    await expect(page.locator(inputSelector)).toBeVisible();
  });

  test('Check visibility of label and switch for widgetBubbleMessageText', async ({ page }) => {
    const labelSelector = `.your-class-before-${translations['translation.widgetBubbleMessageText']}`;
    const switchSelector = 'button.switch__button';

    // Check label visibility
    await expect(page.locator(labelSelector)).toBeVisible();

    // Check switch button visibility
    await expect(page.locator(switchSelector)).toBeVisible();
  });

  test('Check visibility of label and input field for widgetBubbleMessageSeconds', async ({ page }) => {
    const labelSelector = `.your-class-before-${translations['translation.widgetBubbleMessageSeconds']}`;
    const inputSelector = 'input';

    // Check label visibility
    await expect(page.locator(labelSelector)).toBeVisible();

    // Check input field visibility
    await expect(page.locator(inputSelector)).toBeVisible();
  });

  test('Check visibility of label, color picker, and button for widgetColor', async ({ page }) => {
    const labelSelector = `.your-class-before-${translations['translation.widgetColor']}`;
    const colorPickerSelector = 'input[readonly="true"]';
    const buttonSelector = '.your-button-selector';

    // Check label visibility
    await expect(page.locator(labelSelector)).toBeVisible();

    // Check color picker visibility
    await expect(page.locator(colorPickerSelector)).toBeVisible();

    // Check button visibility
    await expect(page.locator(buttonSelector)).toBeVisible();
  });

  test('Check visibility of label and dropdown for widgetAnimation', async ({ page }) => {
    const labelSelector = `.your-class-before-${translations['translation.widgetAnimation']}`;
    const dropdownTriggerSelector = '.select__trigger';

    // Check label visibility
    await expect(page.locator(labelSelector)).toBeVisible();

    // Check dropdown trigger visibility
    await expect(page.locator(dropdownTriggerSelector)).toBeVisible();
  });

});

```