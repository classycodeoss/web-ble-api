<script lang="ts">
	import { onMount } from 'svelte';

	let isAvailable: boolean = false;
	let isLoading: boolean;
	let availableBluetoothDevices: BluetoothDevice[];
	let requestedBluetoothDevice: BluetoothDevice;

	onMount(() => {
		enableBluetooth();
		getAccessibleBluetoothDevices();
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
		isLoading = true;
		try {
			console.log('Requesting Bluetooth Devices');
			requestedBluetoothDevice = await navigator.bluetooth.requestDevice({
				optionalServices: ["battery_service", "device_information"],
				acceptAllDevices: true
			});
			console.log('Found bluetooth device: ', requestedBluetoothDevice);
			return Promise.resolve();
		} catch (e) {
			console.error(e);
			requestedBluetoothDevice = undefined;
			return Promise.reject();
		} finally {
			isLoading = false;
		}
	}

	async function getAccessibleBluetoothDevices(): Promise<void> {
		isLoading = true;
		try {
			console.log('looking for bluetooth devices...');
			availableBluetoothDevices = await navigator.bluetooth.getDevices();
			console.log('Bluetooth devices found: ', availableBluetoothDevices);
			return Promise.resolve();
		} catch (e) {
			console.error(e);
			availableBluetoothDevices = [];
			return Promise.reject();
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container mx-auto">
	<h1 class="text-3xl mt-4 mb-2">Web Bluetooth API</h1>
	<button on:click={enableBluetooth} class="btn btn-secondary"> Enable Bluetooth API </button>
	<button on:click={getAccessibleBluetoothDevices} class="btn btn-secondary">
		Search Bluetooth Devices
	</button>
	<button on:click={requestBluetoothDevices} class="btn btn-primary">
		Request Bluetooth Device
	</button>

	{#if isAvailable}
		<div class="bg-green-400 text-white my-4 p-3 rounded-md flex flex-row items-center gap-2">
			<span class="material-icons"> check_circle </span>
			<span>Bluetooth is available</span>
		</div>
	{:else}
		<div class="bg-red-400 text-white my-4 p-3 rounded-md">
			<div class="flex flex-row items-center gap-2">
				<span class="material-icons"> error </span>
				<span>Bluetooth is not available</span><br />
			</div>
			<span class="ml-8">
				Check out this
				<a
					class="text-blue-200 underline"
					rel="external"
					href="https://chromestatus.com/feature/5264933985976320">guide</a
				>
				, to enable bluetooth (only available for Chrome, Edge or Opera)
			</span>
		</div>
	{/if}

	{#if availableBluetoothDevices && availableBluetoothDevices.length > 0}
		{#each availableBluetoothDevices as device}
			<div>
				<span>{device.id}</span>
				<span>{device.name}</span>
				<span>{device.gatt}</span>
			</div>
		{/each}
	{:else if availableBluetoothDevices}
		<div>
			<span class="text-xl">No Available Bluetooth devices found</span> <br>
			<span class="text-slate-700">Previously connected devices would show up here, if there are any.</span>
		</div>
	{:else}
		<div>
			<span>Search for bluetooth devices to see a list of devices available</span>
		</div>
	{/if}
</div>
