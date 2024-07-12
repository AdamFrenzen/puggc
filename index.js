#!/usr/bin/env node
const fileSystem = require("node:fs");
const childProcess = require("node:child_process");
const inquirer = require("inquirer");

const args = process.argv.slice(2);

if (!args.length) {
  console.error("puggc ERROR: must pass a component name");
  return;
}

const nggc = childProcess.spawnSync("ng", ["g", "c", args[0]]);

if (nggc.stderr) {
  console.error(String(nggc.stderr).trim());
  return;
}

inquirer
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
  .then((answer) => puggc(answer, nggc));

function puggc(answer, nggc) {
  // get component files from the ng g c output
  // nggc.stdout -> { fileType: fileName }
  const files = String(nggc.stdout)
    .split("\n")
    .reduce((obj, line) => {
      if (!line.includes("CREATE")) {
        return obj;
      }

      line = line.split(" ")[1];
      const extIndex = line.lastIndexOf(".");
      const ext = line.substring(extIndex);

      if (ext.includes("css")) {
        obj.style = line;
        obj.stylePref = line.substring(0, extIndex) + answer.style;
      }
      if (ext === ".html") {
        obj.html = line;
        obj.pug = line.substring(0, extIndex) + ".pug";
      }
      if (ext === ".ts") {
        const ext2Index = line.lastIndexOf(".", extIndex - 1);
        if (line.substring(ext2Index) === ".spec.ts") {
          obj.spec = line;
        } else {
          obj.ts = line;
        }
      }

      return obj;
    }, {});

  fileSystem.renameSync(files.html, files.pug);
  const componentName = args[0].substring(args[0].lastIndexOf("/") + 1);
  fileSystem.writeFileSync(files.pug, "p " + componentName + " works!");

  if (answer.style === "none") {
    fileSystem.rmSync(files.style);
  } else {
    fileSystem.renameSync(files.style, files.stylePref);
  }

  if (answer.spec === "remove") {
    fileSystem.rmSync(files.spec);
  }

  const contents = String(fileSystem.readFileSync(files.ts))
    .split("\n")
    .map((line) => {
      if (line.includes("templateUrl:")) {
        return line.replace(".html", ".pug");
      }

      if (line.includes("styleUrl")) {
        if (answer.style === "none") {
          return undefined;
        }

        return line.replace(
          files.style.substring(files.style.lastIndexOf(".")),
          answer.style
        );
      }

      return line;
    })
    .filter((line) => line !== undefined)
    .join("\n");

  fileSystem.writeFileSync(files.ts, contents);

  const textColor = {
    green: (text) => "\x1b[32m" + text,
    default: (text) => "\x1b[0m" + text,
    cyan: (text) => "\x1b[36m" + text,
  };

  console.log(
    textColor.green("✓"),
    textColor.default("CREATED component:"),
    textColor.cyan(files.ts)
  );
}
