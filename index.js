#!/usr/bin/env node
const fileSystem = require("node:fs");
const childProcess = require("node:child_process");
const inquirer = require("inquirer");

class puggc {
  constructor() {
    this.args = process.argv.slice(2);
    this.execute();
  }

  async execute() {
    if (this.argError()) return;

    this.generateComponent();
    if (this.nggcError()) return;

    await this.getComponentSettings();

    this.getComponentFiles();

    this.convertHTMLToPug();
    this.manageStylesheet();
    this.manageSpec();
    this.modifyComponentTS();

    this.complete();
  }

  argError() {
    if (!this.args.length) {
      console.log("puggc ERROR: must pass a component name");
      return true;
    }
    return false;
  }

  generateComponent() {
    this.nggc = childProcess.spawnSync("ng", ["g", "c", this.args[0]]);
  }

  nggcError() {
    if (String(this.nggc.stderr)) {
      console.log(String(this.nggc.stderr).trim());
      return true;
    }
    return false;
  }

  async getComponentSettings() {
    await inquirer
      .prompt([
        {
          name: "style",
          message: "Component stylesheet file type:",
          type: "list",
          choices: [".css", ".scss", "none"],
        },
        {
          name: "spec",
          message: "Include or remove spec.ts file:",
          type: "list",
          choices: ["include", "remove"],
        },
      ])
      .then((settings) => {
        this.settings = settings;
      });
  }

  getComponentFiles() {
    // Convert nggc output to object - { fileType: filePath }
    this.files = String(this.nggc.stdout)
      .split("\n")
      .reduce((filesObj, line) => {
        if (!line.includes("CREATE")) {
          return filesObj;
        }

        const filePath = line.split(" ")[1];
        const extIndex = filePath.lastIndexOf(".");
        const ext = filePath.substring(extIndex);

        if (ext.includes("css")) {
          filesObj.style = filePath;
          filesObj.stylePref =
            filePath.substring(0, extIndex) + this.settings.style;
        }

        if (ext === ".html") {
          filesObj.html = filePath;
          filesObj.pug = filePath.substring(0, extIndex) + ".pug";
        }

        if (ext === ".ts") {
          const ext2Index = filePath.lastIndexOf(".", extIndex - 1);

          if (filePath.substring(ext2Index) === ".spec.ts") {
            filesObj.spec = filePath;
          } else {
            filesObj.ts = filePath;
          }
        }

        return filesObj;
      }, {});
  }

  convertHTMLToPug() {
    fileSystem.renameSync(this.files.html, this.files.pug);

    this.componentName = this.args[0].substring(
      this.args[0].lastIndexOf("/") + 1
    );

    fileSystem.writeFileSync(
      this.files.pug,
      "p " + this.componentName + " works!"
    );
  }

  manageStylesheet() {
    if (this.settings.style === "none") {
      fileSystem.rmSync(this.files.style);
    } else {
      fileSystem.renameSync(this.files.style, this.files.stylePref);
    }
  }

  manageSpec() {
    if (this.settings.spec === "remove") {
      fileSystem.rmSync(this.files.spec);
    }
  }

  modifyComponentTS() {
    const contents = String(fileSystem.readFileSync(this.files.ts))
      .split("\n")
      .map((line) => {
        if (line.includes("templateUrl:")) {
          return line.replace(".html", ".pug");
        }

        if (line.includes("styleUrl")) {
          if (this.settings.style === "none") {
            return undefined;
          }

          return line.replace(
            this.files.style.substring(this.files.style.lastIndexOf(".")),
            this.settings.style
          );
        }

        return line;
      })
      .filter((line) => line !== undefined)
      .join("\n");

    fileSystem.writeFileSync(this.files.ts, contents);
  }

  complete() {
    const textColor = {
      green: (text) => "\x1b[32m" + text,
      default: (text) => "\x1b[0m" + text,
      cyan: (text) => "\x1b[36m" + text,
    };

    console.log(
      textColor.green("✓"),
      textColor.default("CREATED component:"),
      textColor.cyan(this.files.ts)
    );
  }

  static start() {
    new puggc();
  }
}

puggc.start();
