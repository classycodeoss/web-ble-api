<script lang="ts">
  import { onMount } from 'svelte';
  import BluetoothAvailableIndicator from '$lib/components/BluetoothAvailableIndicator.svelte';
  import DeviceInformation from '$lib/components/DeviceInformation.svelte';
  import AccelerometerData from '$lib/components/AccelerometerData.svelte';

  let isAvailable: boolean = false;
  let deviceServer: BluetoothRemoteGATTServer;
  let connectedDevice: BluetoothDevice;

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
      });
      deviceServer = await device.gatt.connect();
      connectedDevice = deviceServer.device;
      return Promise.resolve();
    } catch (e) {
      console.error(e);
      return Promise.reject();
    }
  }
</script>

<div class="container mx-auto px-4 sm:px-0">
  <h1 class="text-3xl mt-4 mb-4">Web Bluetooth API</h1>

  <button on:click={requestBluetoothDevices} disabled={!isAvailable} class="btn btn-primary">
    Connect Bluetooth Device
  </button>

  <BluetoothAvailableIndicator {isAvailable} />

  {#if isAvailable}
    <DeviceInformation device={connectedDevice} />
  {/if}

  {#if deviceServer}
    <AccelerometerData gattServer={deviceServer} />
  {/if}
</div>
