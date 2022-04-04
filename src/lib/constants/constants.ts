import { browser } from '$app/env';

export enum Constants {
	Interval = 100 / 10, // Value is in ms / 10
	Padding = 32, // Pixel value (e.g. 32 => 32px)
	CanvasHeight = 500 + 2 * Constants.Padding,
	CanvasWidth = browser
		? window.innerWidth > 1536
			? 1536
			: window.innerWidth > 1280
			? 1280
			: window.innerWidth > 1024
			? 1024
			: window.innerWidth > 768
			? 768
			: window.innerWidth > 640
			? 640
			: window.innerWidth - Constants.Padding
		: 200
}
