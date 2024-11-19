## DSL vastavate elementide Playwright lokaatorid
1. Dropdown element
```
select:
       args:
           - type: dropdown
           - default: Bar Chart
           - options:
             - value: Bar Chart
             - value: Pie Chart
             - value: Line Chart
```

sellele vastav Playwright kood:
```
const dropdown = page.getByText(new RegExp(translation.barChart));
```