<script lang="ts">
	export let device: BluetoothDevice;
</script>

<div class="{device && device.gatt.connected ? 'bg-gray-300' : 'bg-red-400'} w-full rounded-md p-3">
	<h2 class="text-xl mb-2">Device Information</h2>
	<div class="flex flex-row gap-4 items-center">
		{#if device && device.gatt.connected}
			<span class="material-icons">check_circle</span>
		{:else}
			<span class="material-icons">error</span>
		{/if}
		{#if device}
			<div>
				<span>Name: {device.name}</span> <br />
				<span>ID: {device.id}</span> <br />
			</div>
		{:else}
			<div>
				<span class="text-md">
					No devices found to connect to, please click <i>connect bluetooth device</i> to search for
					devices
				</span>
			</div>
		{/if}
	</div>
</div>
