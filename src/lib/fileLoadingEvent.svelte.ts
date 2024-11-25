export class FileLoadingEvent {
	isFileSelected = $state(false);
	isFileLoading = $state(false);
	shouldShowLoadingScreen: boolean = $derived<boolean>(this.isFileLoading && this.isFileSelected);

	reset() {
		this.isFileLoading = false;
		this.isFileSelected = false;
	}
}

export const fileLoadingEvent = new FileLoadingEvent();
