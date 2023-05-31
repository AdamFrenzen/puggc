import os
import sys


def pugify():

    component_name = sys.argv[1]

    command_output = os.popen("ng g c " + component_name).readlines()
    file_path = command_output[-2].split(" ")[1]
    folder = os.path.split(file_path)[0]

    try:
        os.listdir(folder)
    except FileNotFoundError:
        print("ERROR loading component's path")
        return

    for file in os.listdir(folder):
        if "component.html" in file:
            with open(os.path.join(folder, file), "w") as pug:
                pug.truncate()
                pug.write("p " + component_name)

            os.rename(os.path.join(folder, file), os.path.join(folder, (file.replace(".html", ".pug"))))

        elif "component.css" in file or "component.scss" in file:
            # with open(os.path.join(folder, file), "r") as style:
            os.remove(os.path.join(folder, file))

        elif "component.ts" in file:
            with open(os.path.join(folder, file), "r+") as code:

                output = []

                for line in code.readlines():
                    if "templateUrl: " in line:
                        output.append(line.replace(".html", ".pug"))
                    else:
                        if "styleUrls:" not in line:
                            output.append(line)

                code.truncate(0)
                code.seek(0)
                code.writelines(output)

    print("Component generated and pugified")


if __name__ == '__main__':
    pugify()
