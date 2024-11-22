<script lang="ts">
import { Upload } from 'lucide-svelte';
import { toast } from 'svoast';

let filedDropZone: HTMLElement;

const doNothingOnDrag = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
};

const handleFileSelection = async (e: Event & {
    currentTarget: EventTarget & HTMLInputElement;
}) => {
    const files = e.currentTarget.files;
    if (files === null) return;
    await readFiles(files);
}

const handleFileDrag = async (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const dataTransfer = e.dataTransfer;
    if (!dataTransfer) return;

    await readFiles(dataTransfer.files)
};

const readFiles = async (files: FileList) => {
    if (files.length === 0) return;
    if (files.length > 1) {
        await launchErrorToast("Cannot upload more than one file at a time");
        return;
    }

    const file = files[0];
    if (file.type !== 'text/csv') {
        await launchErrorToast("Only csv files are supported at this moment")
        return;
    }

    console.log("file recieved");
    // basically we want to get the data and save it
}

const launchErrorToast = async (errorMessage: string) => {
    toast.error(errorMessage, {
        duration: 3000,
        closable: true
    });
};

$effect(() => {
    filedDropZone.addEventListener("dragenter", doNothingOnDrag, false);
    filedDropZone.addEventListener("dragover", doNothingOnDrag, false);
    filedDropZone.addEventListener("drop", handleFileDrag, false);
});

const allowedFiles: string[] = [".csv"];
</script>

<main class="flex justify-center items-center pt-12">
    <label for="fileUpload" class="flex flex-col items-center justify-center border-dashed border-[3px] border-gray-400 rounded-lg p-8 bg-[rgb(59,68,105)] text-white hover:opacity-95 active:border-green-500 border-opacity-100" bind:this={filedDropZone} draggable="true">
        <Upload size="32"/>
        <div class=" text-xl">
            <span class=" font-bold">Upload a file</span>
            <span>or drag and drop</span>
        </div>
        <div class="text-sm">CSV allowed</div>
    </label>

    <input class="hidden" type="file" name="fileToUpload" id="fileUpload" accept={allowedFiles.join(',')} multiple={false} onchange={handleFileSelection}>
</main>