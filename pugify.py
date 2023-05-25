import os


def pugify():

    folder = input("Paste the component folder's absolute path: ")
    spec = input("Delete spec file? (y,n): ")

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

        elif spec == "y" and "component.spec.ts" in file:
            print(file, "removed")
            os.remove(os.path.join(folder, file))

        elif "component.ts" in file:
            with open(os.path.join(folder, file), "r+") as code:

                output = []

                for line in code.readlines():
                    if "templateUrl: " in line:
                        output.append(line.replace(".html", ".pug"))
                    else:
                        output.append(line)

                code.truncate(0)
                code.seek(0)
                code.writelines(output)

    print("Pugification successful")


if __name__ == '__main__':
    pugify()
