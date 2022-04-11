<script lang="ts">
  import { UUIDs } from '$lib/constants/ble-uuids';
  import { SwitchState } from '$lib/models/switch-state.enum';
  import type { TemperatureData } from '$lib/models/temperature-data.model';

  import { onMount } from 'svelte';

  export let gattServer: BluetoothRemoteGATTServer;

  let switchValue: SwitchState;
  let timer: NodeJS.Timer;

  let temperature: TemperatureData;
  let tempDataCharacteristic: BluetoothRemoteGATTCharacteristic;

  onMount(() => {
    addListeners();
  });

  async function addListeners(): Promise<void> {
    try {
      const tempService = await gattServer.getPrimaryService(UUIDs.TemperatureServiceUUID);
      const tempConfigCharacteristisc = await tempService.getCharacteristic(
        UUIDs.TemperatureConfigUUID
      );
      await tempConfigCharacteristisc.writeValue(new Uint8Array([1]));
      tempDataCharacteristic = await tempService.getCharacteristic(UUIDs.TemperatureDataUUID);

      const simpleKeyService = await gattServer.getPrimaryService(UUIDs.SimpleKeyServiceUUID);
      const characteristic = await simpleKeyService.getCharacteristic(
        UUIDs.SimpleKeyCharacteristicUUID
      );
      characteristic.oncharacteristicvaluechanged = onKeyEvent;
      characteristic.startNotifications();
    } catch (e) {
      console.error(e);
    }
  }

  async function onKeyEvent(event: any): Promise<void> {
    const value = event.target.value.getInt8(0);
    switchValue = value;
    if (switchValue === SwitchState.ON_OFF || switchValue === SwitchState.ON_ON) {
      if (!timer) {
        timer = setInterval(async () => {
          switchValue =
            switchValue === SwitchState.ON_OFF ? SwitchState.TOGGLE : SwitchState.ON_OFF;
          const tempEvent = await tempDataCharacteristic.readValue();
          temperature = getTemperatureValues(tempEvent);
        }, 300);
      }
    } else {
      clearInterval(timer);
      timer = undefined;
    }
    return Promise.resolve();
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

<div class="my-4 flex-1">
  <h2 class="text-xl mb-2">Temperature Data</h2>
  <div
    class="bg-gray-200 rounded-lg flex flex-col justify-center items-center relative"
    style="height: 564px;"
  >
    <!-- <span class="absolute top-4 right-12">State:</span> -->
    <div
      class="absolute top-6 right-6 rounded-full h-6 w-6 bg-red-500"
      class:bg-green-500={switchValue === SwitchState.ON_OFF}
      class:bg-green-700={switchValue === SwitchState.TOGGLE}
    />
    <h3 class="text-3xl">Temperature Values</h3>
    {#if temperature}
      <h3 class="mt-4 text-7xl flex items-center gap-2">
        <span class="text-3xl text-center">Ambient: </span>{temperature.ambient.toFixed(1)}
      </h3>
      <h3 class="mt-4 text-7xl flex items-center gap-2">
        <span class="text-3xl text-center">Target: </span>{temperature.target.toFixed(1)}
      </h3>
      {#if switchValue === SwitchState.OFF_OFF}
        <div class="absolute top-2 flex flex-row gap-2 justify-center align-center text-center">
          <span class="material-icons flex items-center justify-center">warning</span>
          <span class="text-lg text-center 2xl:w-80 xl:w-60 w-48">
            to constantly read temperature values the button needs to be pressed
          </span>
        </div>
      {/if}
    {:else}
      <p class="mt-4 text-2xl text-center">
        Press the left button on the sensor to read the temperature
      </p>
    {/if}
  </div>
</div>
