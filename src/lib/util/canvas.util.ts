import { Constants } from '$lib/constants/constants';
import { Point } from '$lib/viewmodels/Point.viewmodel';
import type { NormalizedData } from '$lib/models/normalized-data.model';

export class CanvasUtil {
  static drawCanvas(data: NormalizedData, context: CanvasRenderingContext2D): void {
    context.lineWidth = 3;
    this.drawConnectingLines(context, data.values);
    this.drawPoints(context, data.values);
    this.drawAxes(context, data.minValue, data.maxValue);
  }

  private static drawAxes(
    context: CanvasRenderingContext2D,
    minValue: number,
    maxValue: number
  ): void {
    const origin = new Point(Constants.Padding, Constants.CanvasHeight - Constants.Padding);
    const topY = new Point(Constants.Padding, Constants.Padding);
    const rightX = new Point(
      Constants.CanvasWidth - Constants.Padding,
      Constants.CanvasHeight - Constants.Padding
    );
    context.strokeStyle = '#000000';
    context.fillStyle = '#000000';
    context.font = '14px sans-serif';
    context.lineWidth = 2;
    context.lineCap = 'round';

    context.beginPath();
    // Y-Axis
    context.moveTo(origin.x, origin.y);
    context.lineTo(topY.x, topY.y);
    context.fillText(minValue.toFixed(1), origin.x - Constants.Padding + 5, origin.y);

    // X-Axis
    context.moveTo(origin.x, origin.y);
    context.lineTo(rightX.x, rightX.y);
    context.stroke();
    context.fillText(maxValue.toFixed(1), topY.x - Constants.Padding + 5, topY.y);
  }

  private static drawPoints(context: CanvasRenderingContext2D, data: number[]): void {
    for (let i = 0; i < data.length; i++) {
      const p1 = this.getPointAtIndex(data, i);
      context.beginPath();
      context.arc(p1.x, p1.y, 4, 0, 2 * Math.PI);
      context.fill();
      context.stroke();
    }
  }

  private static drawConnectingLines(context: CanvasRenderingContext2D, data: number[]): void {
    for (let i = 0; i < data.length; i++) {
      if (i > 0) {
        const p1 = this.getPointAtIndex(data, i);
        const p0 = this.getPointAtIndex(data, i - 1);
        const cps = this.getControlPoints(p0, p1);
        context.beginPath();
        context.moveTo(p0.x, p0.y);
        context.bezierCurveTo(cps[0].x, cps[0].y, cps[1].x, cps[1].y, p1.x, p1.y);
        context.stroke();
      }
    }
  }

  private static getPointAtIndex(data: number[], index: number): Point {
    const time =
      ((Constants.CanvasWidth - 2 * Constants.Padding) / (data.length - 1)) * index +
      Constants.Padding;
    const value =
      data[index] * (Constants.CanvasHeight - 2 * Constants.Padding) + Constants.Padding;
    return new Point(time, value);
  }

  private static getControlPoints(startPoint: Point, endPoint: Point): Point[] {
    const isStartPointHigher = startPoint.y > endPoint.y;
    let diff = (endPoint.y - startPoint.y) / 10;
    if (isStartPointHigher) {
      diff = (startPoint.y - endPoint.y) / 10;
    }
    const cpx1 = new Point(
      startPoint.x + 10,
      isStartPointHigher ? startPoint.y + diff : startPoint.y - diff
    );
    const cpx2 = new Point(
      endPoint.x - 10,
      isStartPointHigher ? endPoint.y - diff : endPoint.y + diff
    );
    return [cpx1, cpx2];
  }
}
