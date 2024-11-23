// place files you want to import through the `$lib` alias in this folder.

export function readFile(file: File): Promise<String> {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = () => {
            const result: string | ArrayBuffer | null = fileReader.result;
            if (result === null) {
                reject(new Error("FileReader result is null"));
            }
            resolve(result as string);
        };
        fileReader.onerror = () => reject(new Error(`Error reading file: ${fileReader.error?.message}`));
    
        fileReader.readAsText(file); // Reads the Blob as binary data
    });
}