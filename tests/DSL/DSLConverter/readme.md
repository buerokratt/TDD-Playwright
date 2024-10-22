# Business DSL -> Playwright tests

- gptPrompt.txt includes all neccessary context to generate suitable Playwright tests according to given Business DSL. 

- gptTemplatesPrompt.txt includes all neccessary templates that are needed for BDSLs.

- Before giving actual BDSL to chatGPT. Give this gptPrompt nad gptTemplatesPrompt.


# Rules for writing BDSLs
- Basic structure is: Class -> templates -> wrapperClass.
For example: 
```
card:
  templates:
    - name: card__body
```

- Before Template use **-** like **- buttonTemplate**, args declarations does not need **-** 
- **Layout_main** is the main class where the content is displayed to on the webpage. This is written in DSL as **main** on top of the file. 
- **Any parent class** inside the **layout_main** should be without **-**, but classes inside that should start as **- name: classname** as per code above.

## **TODO:**
- Renameda titleTemplate -> heading ja igalpool BDSLdes, kus seda kasutatakse.

- Renamida kõik templated vastavalt nii, et eemaldada Template sõna. nt inputTemplate -> input

- Templiidid vajavad väikest lihtsustust, eemaldades liigsed - märgid jms.