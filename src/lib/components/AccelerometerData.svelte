<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	import { Axis } from '$lib/models/accelerator-data.model';
	import { Point } from '$lib/viewmodels/Point.viewmodel';
	import { TransformUtil } from '$lib/util/transform.util';
	import { Constants } from '$lib/constants/constants';
	import { UUIDs } from '$lib/constants/ble-uuids';
	import type { AccelerometerData } from '$lib/models/accelerator-data.model';

	export let gattServer: BluetoothRemoteGATTServer;

	let wrappingDiv: HTMLDivElement;
	let context: CanvasRenderingContext2D;
	let canvasHeight: number = 500 + 2 * Constants.Padding;
	let canvasWidth: number = browser ? window.innerWidth / 4 - 2 * Constants.Padding : 200;

	let data: AccelerometerData[] = [];

	onMount(() => {
		const newCanvas = document.createElement('canvas');
		newCanvas.width = canvasWidth;
		newCanvas.height = canvasHeight;
		newCanvas.setAttribute('class', 'bg-gray-200 rounded-lg');
		wrappingDiv.appendChild(newCanvas);
		context = newCanvas.getContext('2d');
		addListeners();
	});

	function redrawData(): void {
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		const normalizedDataX = normalizeData(data, Axis.x);
		context.fillStyle = '#003f5c';
		context.strokeStyle = '#003f5c';
		drawCanvas(normalizedDataX, context);
		const normalizedDateY = normalizeData(data, Axis.y);
		context.fillStyle = '#bc5090';
		context.strokeStyle = '#bc5090';
		drawCanvas(normalizedDateY, context);
		const normalizedDataZ = normalizeData(data, Axis.z);
		context.fillStyle = '#ffa600';
		context.strokeStyle = '#ffa600';
		drawCanvas(normalizedDataZ, context);
	}

	async function addListeners(): Promise<void> {
		try {
			const accService = await gattServer.getPrimaryService(UUIDs.AccelerometerServiceUUID);
			const accConfigCharacteristisc = await accService.getCharacteristic(UUIDs.AccelerometerConfigUUID);
			await accConfigCharacteristisc.writeValue(new Uint8Array([1]));
			const accPeriodCharacteristic = await accService.getCharacteristic(UUIDs.AccelerometerPeriodUUID);
			await accPeriodCharacteristic.writeValue(new Uint8Array([Constants.Interval]));
			const accDataCharacteristic = await accService.getCharacteristic(UUIDs.AccelerometerDataUUID);
			console.log('Start Accelerometer notifications');
			accDataCharacteristic.oncharacteristicvaluechanged = onAccelerometerChanged;
			accDataCharacteristic.startNotifications();
		} catch (e) {
			console.error(e);
		}
	}

	function getAccelerometerValues(data) {
		const ax = data.getInt8(0, true);
		const ay = data.getInt8(1, true);
		const az = data.getInt8(2, true);
		return { x: ax, y: ay, z: az };
	}

	function onAccelerometerChanged(event) {
		const characteristic = event.target;
		const values = getAccelerometerValues(characteristic.value);
		data = data.slice(-9).concat(values);
		redrawData();
	}

	function normalizeData(data: AccelerometerData[], axis: Axis): number[] {
		const axisData = data.map((point) => point[axis]);
		return TransformUtil.normalizeData(axisData, -128, 127);
	}

	function drawCanvas(data: number[], context: CanvasRenderingContext2D): void {
		context.lineWidth = 3;
		drawConnectingLines(context, data);
		drawPoints(context, data);
	}

	function drawPoints(context: CanvasRenderingContext2D, data: number[]): void {
		for (let i = 0; i < data.length; i++) {
			const p1 = getPointAtIndex(data, i);
			context.beginPath();
			context.arc(p1.x, p1.y, 4, 0, 2 * Math.PI);
			context.fill();
			context.stroke();
		}
	}

	function drawConnectingLines(context: CanvasRenderingContext2D, data: number[]): void {
		for (let i = 0; i < data.length; i++) {
			if (i > 0) {
				const p1 = getPointAtIndex(data, i);
				const p0 = getPointAtIndex(data, i - 1);
				const cps = getControlPoints(p0, p1);
				context.beginPath();
				context.moveTo(p0.x, p0.y);
				context.bezierCurveTo(cps[0].x, cps[0].y, cps[1].x, cps[1].y, p1.x, p1.y);
				context.stroke();
			}
		}
	}

	function getPointAtIndex(data: number[], index: number): Point {
		const time = ((canvasWidth - 2 * Constants.Padding) / (data.length - 1)) * index + Constants.Padding;
		const value = data[index] * (canvasHeight - 2 * Constants.Padding) + Constants.Padding;
		return new Point(time, value);
	}

	function getControlPoints(startPoint: Point, endPoint: Point): Point[] {
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
</script>

<div>
	<h2 class="text-xl">Accelerometer Data</h2>
	<div class="flex flex-row gap-2" bind:this={wrappingDiv} style="height: 564px;" />
</div>
