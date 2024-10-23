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

