export class TransformUtil {
	private static getMinimum(data: number[]): number {
		let min = Number.MAX_VALUE;
		for (const number of data) {
			if (number < min) {
				min = number;
			}
		}
		return min;
	}

	private static getMaximum(data: number[]): number {
		let max = Number.MIN_VALUE;
		for (const number of data) {
			if (number > max) {
				max = number;
			}
		}
		return max;
	}

	static normalizeData(data: number[], minValue?: number, maxValue?: number): number[] {
    const min = minValue ? minValue : this.getMinimum(data);
    const max = maxValue ? maxValue : this.getMaximum(data);
		for (let i = 0; i < data.length; i++) {
			const norm = 1 - ((data[i] - min) / (max - min));
      data[i] = norm;
		}
		return data;
	}
}
