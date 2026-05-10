import * as fs from "fs";
import * as process from "process";

console.log(`
        This function is for interal use only.
        Don't use it if you don't know what you're doing!
        Press Ctrl + C to exit.
`);

type FileRenameMapper = (filepath: string) => string;

const onFileReadFunction: FileRenameMapper = (filepath) => {
    return `${filepath}-scarf.png`;
};

const targetDir = process.argv[2]
    ? process.argv[2]
    : "./src/assets/icons/scarf/";
const __onFileRead__: FileRenameMapper = onFileReadFunction;

function readFiles(dirname: string, onFileRead: FileRenameMapper = __onFileRead__) {
    fs.readdir(dirname, (err, filenames) => {
        if (err) throw err;
        filenames.forEach((filename) => {
            const __path__ = dirname + filename;
            fs.readFile(__path__, "utf-8", (err, _) => {
                if (err) throw err;
                const pathStart = filename.split(".")[0];
                if (pathStart === "") throw err;
                fs.rename(
                    __path__,
                    onFileRead(dirname + pathStart),
                    (err) => {
                        if (err) throw err;
                        console.log(
                            `Renamed ${filename} to ${onFileRead(dirname + pathStart)}`,
                        );
                    },
                );
            });
        });
    });
}

setTimeout(() => readFiles(targetDir), 3000);
