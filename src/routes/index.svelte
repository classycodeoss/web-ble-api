<script lang="ts">
	import { onMount } from 'svelte';

	let isAvailable: boolean = false;
	let isLoading: boolean;
	let bluetoothDevices: BluetoothDevice[];

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

	async function getBluetoothDevices(): Promise<void> {
		isLoading = true;
		try {
			console.log('looking for bluetooth devices...');
			bluetoothDevices = await navigator.bluetooth.getDevices();
			console.log('Bluetooth devices found: ', bluetoothDevices);
			return Promise.resolve();
		} catch (e) {
			console.error(e);
			bluetoothDevices = [];
			return Promise.reject();
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container mx-auto">
	<h1 class="text-3xl mt-4 mb-2">Web Bluetooth API</h1>
	<button
		on:click={enableBluetooth}
		class="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700"
	>
		Enable Bluetooth API
	</button>
	<button
		on:click={getBluetoothDevices}
		class="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700"
	>
		Search Bluetooth Devices
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
				<a class="text-blue-200 underline" rel="external" href="https://chromestatus.com/feature/5264933985976320">guide</a>
				, to enable bluetooth (only available for Chrome)
			</span>
		</div>
	{/if}

	{#if bluetoothDevices && bluetoothDevices.length > 0}
		{#each bluetoothDevices as device}
			<div>
				<span>{device.id}</span>
				<span>{device.name}</span>
				<span>{device.gatt}</span>
			</div>
		{/each}
	{:else if bluetoothDevices}
		<div>
			<span>No Bluetooth devices found</span>
		</div>
	{:else}
		<div>
			<span>Search for bluetooth devices to see a list of devices available</span>
		</div>
	{/if}
</div>
