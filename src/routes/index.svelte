<script lang="ts">
	import { onMount } from 'svelte';
	import BluetoothAvailableIndicator from '$lib/components/BluetoothAvailableIndicator.svelte';
	import DeviceInformation from '$lib/components/DeviceInformation.svelte';
	import AccelerometerData from '$lib/components/AccelerometerData.svelte';

	let isAvailable: boolean = false;
	let availableBluetoothDevices: BluetoothDevice[];
	let deviceServer: BluetoothRemoteGATTServer;

	let connectedDevice: BluetoothDevice;

	const accelerometerServiceUUID = 'f000aa10-0451-4000-b000-000000000000';

	onMount(() => {
		enableBluetooth();
	});

	async function enableBluetooth(): Promise<void> {
		try {
			isAvailable = await navigator.bluetooth.getAvailability();
			console.log('Bluetooth is enabled: ', isAvailable);
			return Promise.resolve();
		} catch (e) {
			console.error(e);
			isAvailable = false;
			return Promise.reject();
		}
	}

	async function requestBluetoothDevices(): Promise<void> {
		try {
			console.log('Requesting Bluetooth Devices');
			const device = await navigator.bluetooth.requestDevice({
				filters: [{ namePrefix: 'TI' }],
				optionalServices: ['battery_service', 'device_information', accelerometerServiceUUID]
			});
			deviceServer = await device.gatt.connect();
			connectedDevice = deviceServer.device;
			return Promise.resolve();
		} catch (e) {
			console.error(e);
			return Promise.reject();
		}
	}

	async function getAccessibleBluetoothDevices(): Promise<void> {
		try {
			availableBluetoothDevices = await navigator.bluetooth.getDevices();
			if (availableBluetoothDevices.length >= 1 && availableBluetoothDevices[0]) {
				deviceServer = await availableBluetoothDevices[0].gatt.connect();
				if (deviceServer.device) {
					connectedDevice = deviceServer.device;
					await connectedDevice.watchAdvertisements();
					const logFunction = (event: Event) => {
						console.error(event);
						connectedDevice = undefined;
					};
					connectedDevice.ongattserverdisconnected = logFunction;
				}
			}
			return Promise.resolve();
		} catch (e) {
			console.error(e);
			availableBluetoothDevices = [];
			return Promise.reject();
		}
	}
</script>

<div class="container mx-auto px-4 sm:px-0">
	<h1 class="text-3xl mt-4 mb-4">Web Bluetooth API</h1>

	<div class="flex flex-row gap-3 mb-2">
		<button on:click={getAccessibleBluetoothDevices} class="btn btn-secondary">
			Search Bluetooth Devices
		</button>
		<button on:click={requestBluetoothDevices} class="btn btn-primary">
			Request Bluetooth Device
		</button>
	</div>

	<BluetoothAvailableIndicator {isAvailable} />

	<DeviceInformation device={connectedDevice} />

	{#if deviceServer}
		<AccelerometerData gattServer={deviceServer} />
	{/if}
</div>
