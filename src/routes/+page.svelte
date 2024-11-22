<script lang="ts">
	import { readFile } from '$lib';
	import { EBirdEntry } from '$lib/eBirdEntry';
    import { Upload } from 'lucide-svelte';
    import { toast } from 'svoast';
    
    let filedDropZone: HTMLElement;
    let birds: EBirdEntry[] = $state([]);
    let count: number[] = $state([]);
    
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

        await readFile(file)
        .then(fileText => {
            const fileRows = fileText.split('\n');
            fileRows.forEach((row, indx) => {
                if (indx > 0 && row !== '') {
                    const rowArray = row.split(',')
                    
                    const birdIndex: number = birds.findIndex((birdEntry) => birdEntry.commonName === rowArray[1]);
                    if (birdIndex !== -1) { // currently grouping all same birds together to reduce data a bit lol
                        count[birdIndex] = count[birdIndex] + 1
                    }
                    else {
                        const birdData: EBirdEntry = new EBirdEntry(rowArray[0], rowArray[1], parseInt(rowArray[4]), rowArray[5], 
                        rowArray[7], rowArray[8], parseFloat(rowArray[9]), parseFloat(rowArray[10]));
                        count.push(1);
                        birds.push(birdData);
                    }
                }
            });
            const indices: number[] = count.map((_, index) => index).sort((a, b) => count[b] - count[a]);
            count = indices.map(index => count[index]);
            birds = indices.map(index => birds[index]);
        })
        .catch(error => console.error(error));
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

<main class="flex flex-col justify-center items-center p-8 gap-3">
    <div class="flex flex-wrap gap-4">
        {#each birds as bird, indx}
            <div class="bg-gray-200 rounded-md p-2">
                <div>Name: {bird.commonName}</div>
                <div>Seen: {count[indx]} time(s)</div>
            </div>
        {/each}
    </div>

    <label for="fileUpload" class="my-8 flex flex-col items-center justify-center border-dashed border-[3px] border-gray-400 rounded-lg p-8 bg-gray-100 text-gray-600 hover:opacity-70 active:border-green-500 cursor-pointer select-none" bind:this={filedDropZone} draggable="false">
        <Upload size="32"/>
        <div class=" text-xl">
            <span class=" font-bold">Upload a file</span>
            <span>or drag and drop</span>
        </div>
        <div class="text-sm">CSV allowed</div>
    </label>
    <input class="hidden" type="file" name="fileToUpload" id="fileUpload" accept={allowedFiles.join(',')} multiple={false} onchange={handleFileSelection}>
</main>