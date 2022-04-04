<script lang="ts">
	import { UUIDs } from '$lib/constants/ble-uuids';
	import { Constants } from '$lib/constants/constants';
	import { CanvasUtil } from '$lib/util/canvas.util';
	import { TransformUtil } from '$lib/util/transform.util';
	import type { TemperatureData } from '$lib/models/temperature-data.model';

	import { onMount } from 'svelte';

	export let gattServer: BluetoothRemoteGATTServer;

	let wrappingDiv: HTMLDivElement;
	let context: CanvasRenderingContext2D;

	let minValue: number;
	let maxValue: number;

	let data: TemperatureData[] = [];

	onMount(() => {
		const newCanvas = document.createElement('canvas');
		newCanvas.width = Constants.CanvasWidth;
		newCanvas.height = Constants.CanvasHeight;
		newCanvas.setAttribute('class', 'bg-gray-200 rounded-lg');
		wrappingDiv.appendChild(newCanvas);
		context = newCanvas.getContext('2d');
		redrawCanvas();
		addListeners();
	});

	function redrawCanvas(): void {
		context.clearRect(0, 0, Constants.CanvasWidth, Constants.CanvasHeight);
		const ambientData = data.map((tempData) => tempData.ambient);

		const ambientDataNormalized = TransformUtil.normalizeData(ambientData);
		if (ambientDataNormalized.minValue < minValue || !minValue) {
			minValue = ambientDataNormalized.minValue;
		}
		if (ambientDataNormalized.maxValue > maxValue || !maxValue) {
			maxValue = ambientDataNormalized.maxValue;
		}
		context.fillStyle = '#003f5c';
		context.strokeStyle = '#003f5c';
		console.log(
			ambientDataNormalized.values,
			ambientDataNormalized.minValue,
			minValue,
			ambientDataNormalized.maxValue,
			maxValue
		);
		CanvasUtil.drawCanvas(ambientDataNormalized.values, context, minValue, maxValue);

		// const targetData = data.map(tempData => tempData.target);
		// const normalizedTargetData = TransformUtil.normalizeData(targetData, 0, 410);
		// context.fillStyle = '#bc5090';
		// context.strokeStyle = '#bc5090';
		// CanvasUtil.drawCanvas(normalizedTargetData, context);
	}

	async function addListeners(): Promise<void> {
		try {
			const tempService = await gattServer.getPrimaryService(UUIDs.TemperatureServiceUUID);
			const tempConfigCharacteristisc = await tempService.getCharacteristic(
				UUIDs.TemperatureConfigUUID
			);
			await tempConfigCharacteristisc.writeValue(new Uint8Array([1]));
			const tempDataCharacteristic = await tempService.getCharacteristic(UUIDs.TemperatureDataUUID);
			console.log('Start Temperature notifications');
			tempDataCharacteristic.oncharacteristicvaluechanged = onTemperatureChanged;
			tempDataCharacteristic.startNotifications();
		} catch (e) {
			console.error(e);
		}
	}

	function onTemperatureChanged(event: any): void {
		const value = event.target.value as DataView;
		const temperatures = getTemperatureValues(value);
		data = data.slice(-9).concat(temperatures);
		redrawCanvas();
	}

	function getTemperatureValues(rawBuffer: DataView): TemperatureData {
		const ambientTemp = rawBuffer.getUint16(2, true) / 128;
		const objectTemp = rawBuffer.getUint16(0, true);
		return {
			ambient: ambientTemp,
			target: getObjectTemperature(objectTemp, ambientTemp)
		};
	}

	function getObjectTemperature(rawObjectTemperature: number, ambientTemp: number): number {
		const objectTemp = rawObjectTemperature * 0.00000015625;
		const dieTemp = ambientTemp + 273.15;
		const S0 = 5.593e-14; // Calibration factor
		const a1 = 1.75e-3;
		const a2 = -1.678e-5;
		const b0 = -2.94e-5;
		const b1 = -5.7e-7;
		const b2 = 4.63e-9;
		const c2 = 13.4;
		const refTemp = 298.15;
		const S = S0 * (1 + a1 * (dieTemp - refTemp) + a2 * Math.pow(dieTemp - refTemp, 2));
		const Vos = b0 + b1 * (dieTemp - refTemp) + b2 * Math.pow(dieTemp - refTemp, 2);
		const fObj = objectTemp - Vos + c2 * Math.pow(objectTemp - Vos, 2);
		const tObj = Math.pow(Math.pow(dieTemp, 4) + fObj / S, 0.25);
		return tObj - 273.15;
	}
</script>

<div>
	<h2 class="text-xl mb-2">Temperature Data</h2>
	<div bind:this={wrappingDiv} style="height: 564px;" />
</div>
