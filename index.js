#!/usr/bin/env node
const fs = require("node:fs");
const cp = require("node:child_process");
const iq = require("inquirer");

const args = process.argv.slice(2);
if (args.length) {
  iq.prompt([
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
  ]).then((answer) => puggc(answer));
} else {
  console.error("puggc ERROR: must pass a component name");
}

function puggc(answer) {
  const nggc = cp.spawnSync("ng", ["g", "c", args[0]]);

  if (String(nggc.stderr)) {
    console.error(
      "puggc ERROR: error executing ng g c - " + String(nggc.stderr)
    );
    return;
  }

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

  fs.renameSync(files.html, files.pug);
  const componentName = args[0].substring(args[0].lastIndexOf("/") + 1);
  fs.writeFileSync(files.pug, "p " + componentName + " works!");

  if (answer.style === "none") {
    fs.rmSync(files.style);
  } else {
    fs.renameSync(files.style, files.stylePref);
  }

  if (answer.spec === "remove") {
    fs.rmSync(files.spec);
  }

  const contents = String(fs.readFileSync(files.ts))
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

  fs.writeFileSync(files.ts, contents);

  console.log("\x1b[32m✓ \x1b[0mCREATED component:", path);
}
