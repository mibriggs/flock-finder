const TOTAL_UPLOAD_TIMER_LABEL = '[timing] TOTAL: file selected -> explore page visible';
let active = false;

export function startTotalUploadTimer() {
	active = true;
	console.time(TOTAL_UPLOAD_TIMER_LABEL);
}

export function endTotalUploadTimerIfActive() {
	if (active) {
		active = false;
		console.timeEnd(TOTAL_UPLOAD_TIMER_LABEL);
	}
}
