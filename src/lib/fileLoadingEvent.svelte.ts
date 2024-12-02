export class FileLoadTracker {
	isSelected = $state(false);
	isProcessing = $state(false);
	isLoading: boolean = $derived<boolean>(this.isSelected && this.isProcessing);
	loadComplete: boolean = $derived<boolean>(this.isSelected && !this.isProcessing);

	startLoading() {
		this.isSelected = true;
		this.isProcessing = true;
	}

	reset() {
		this.isProcessing = false;
		this.isSelected = false;
	}
}

export const fileLoadTracker = new FileLoadTracker();
