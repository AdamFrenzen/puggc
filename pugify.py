import os


def pugify():

    folder = input("Paste the component folder's absolute path: ")

    try:
        os.listdir(folder)
    except FileNotFoundError:
        print("ERROR loading path")
        return

    for file in os.listdir(folder):
        if "component.html" in file:
            with open(os.path.join(folder, file), "w") as pug:
                pug.truncate()

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

                print(output)
                code.truncate(0)
                code.seek(0)
                code.writelines(output)

    print("Pugification successful")


if __name__ == '__main__':
    pugify()
