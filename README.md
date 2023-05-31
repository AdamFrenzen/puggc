# pugify
Python script to create and modify angular components to pug instead of html.

## Script description:

A component will be created, have its css or scss file removed, and reformat html to pug.

## Setup:

Make sure python is installed on your system <br />
Download the python file, and store it anywhere on your system. 
NOTE: You will need the file’s path

  ### Create an alias and type "pugify component" in the terminal:
  
  (macOS specific instructions)

  - open terminal
  - type: nano ~/.zshrc
  text editor will open (if there is other aliases in here already, create a new line)
  - in the text editor write (replace [file_path] with proper path): 
    ```
    alias pugify="python3 [file_path]"
    ```
  - press control+x to end editing
  - press y to allow the changes
  - press enter to save and exit the text editor
  - back in the standard terminal, type the following to update the alias: 
    ```
    source ~/.zshrc
    ```
  
  NOTE: You will need to restart/create a new terminal for the alias to update.
  
## How to use
  
Call the alias followed by the component name in the terminal from the root directory

```
pugify component
```

The folder will get created and reformatted to pug. 

Creating components inside other components is still possible 

```
pugify comp1/comp2
```

  
