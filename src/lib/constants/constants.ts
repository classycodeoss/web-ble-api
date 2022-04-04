import { browser } from '$app/env';

export enum Constants {
  Interval = 100 / 10, // Value is in ms / 10
  Padding = 40, // Pixel value (e.g. 32 => 32px)
  PaddingSmall = 5,
  CanvasHeight = 500 + 2 * Constants.Padding,
  CanvasWidth = browser ? window.innerWidth / 4 - 2 * Constants.Padding : 200,
}
