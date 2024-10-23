# Business DSL -> Playwright tests

- gptPrompt.txt includes all neccessary context to generate suitable Playwright tests according to given Business DSL. 

- Before giving actual BDSL to chatGPT. Give this gptPrompt.


# Rules for writing BDSLs
- Basic structure is: Class -> wrapperClass.
For example: 
```
card:
  name: card__body
```

- **Layout_main** is the main class where the content is displayed to on the webpage. This is written in DSL as **main** on top of the file. 
- Only args should have **-** before. 
For example: 
``` 
args: 
    - type: button
```

# How to use business.yml files to generate Playwright tests?

- First copy and paste the business.yml file to chatGPT. 

- Then take the whole of the prompt from the root folder and copy and paste it after the .yml file.

- Add that you want visibility tests. (Functionality tests generation have not been implemented yet)