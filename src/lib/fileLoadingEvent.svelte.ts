export class LoadStateTracker {
	isSelected = $state(false);
	#isProcessing = $state(false);
	#isLoading: boolean = $derived<boolean>(this.isSelected && this.#isProcessing);
	#loadComplete: boolean = $derived<boolean>(this.isSelected && !this.#isProcessing);

	constructor() {}

	get isLoading() {
		return this.#isLoading;
	}

	get loadComplete() {
		return this.#loadComplete;
	}

	startLoading() {
		this.isSelected = true;
		this.#isProcessing = true;
	}

	endLoading() {
		this.#isProcessing = false;
	}

	reset() {
		this.#isProcessing = false;
		this.isSelected = false;
	}
}

export const fileLoadTracker = new LoadStateTracker();
