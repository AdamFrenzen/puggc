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
        if (line.substring(line.lastIndexOf(".", extIndex - 1)) === ".spec") {
          obj.spec = line;
        } else {
          obj.ts = line;
        }
      }

      return obj;
    }, {});

  const output = String(nggc.stdout).split("\n")[0].split(" ")[1];
  const path = output.substring(0, output.lastIndexOf("/"));
  const name = path.split("/").at(-1);

  const style = fs
    .readdirSync(path)
    .map((file) => file.substring(file.lastIndexOf(".")))
    .find((ext) => ext.includes("css"));

  const file = (extension) => {
    return path + "/" + name + ".component" + extension;
  };

  fs.renameSync(file(".html"), file(".pug"));
  fs.writeFileSync(file(".pug"), "p " + name + " works!");

  if (answer.style === "none") {
    fs.rmSync(file(style));
  } else {
    fs.renameSync(file(style), file("." + answer.style));
  }

  if (answer.spec === "remove") {
    fs.rmSync(file(".spec.ts"));
  }

  const contents = String(fs.readFileSync(file(".ts")))
    .split("\n")
    .map((line) => {
      if (line.includes("templateUrl:")) {
        return line.replace(".html", ".pug");
      }

      if (line.includes("styleUrl:")) {
        if (answer.style === "none") {
          return undefined;
        }

        return line.replace(style, answer.style);
      }

      return line;
    })
    .filter((line) => line !== undefined)
    .join("\n");

  fs.writeFileSync(file(".ts"), contents);

  console.log("\x1b[32m✓ \x1b[0mCREATED component:", path);
}
