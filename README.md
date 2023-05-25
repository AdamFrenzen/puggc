# pugify
Python script to reformat angular components to pug instead of html.

## Setup:

Download the python file, and store it anywhere on your system. 
NOTE: You will need the file’s path

Two methods to run the script:

  1: type "python3 [file_path]" in the terminal
  
  2: Create an alias and type "pugify" in the terminal
  
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
  
  NOTE: You will need to restart/create a new terminal for the alias to work.
  
## How to use
  
when creating a new component

```
ng g c component; python3 [file_path]
```
or using alias
```
ng g c component; pugify
```
or call either in the terminal whenever
```
pugify
```

Once the component has been created:
  - copy the folder's path
  - paste the path into the terminal where it asks for it.

Another functionality of pugify is to delete the spec file. Answer y or n depending on whether you would like the spec file or not

The folder will get reformatted to pug.

  
