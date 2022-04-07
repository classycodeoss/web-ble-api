<script>
  export let isAvailable;
</script>

{#if isAvailable}
<div class="bg-green-400 text-black my-4 p-3 rounded-md flex flex-row items-center gap-2">
  <span class="material-icons"> check_circle </span>
  <span>Bluetooth is available</span>
</div>
{:else}
<div class="bg-red-400 text-black my-4 p-3 rounded-md">
  <div class="flex flex-row items-center gap-2">
    <span class="material-icons"> error </span>
    <span>Bluetooth is not available</span><br />
  </div>
  <p class="ml-8">
    Check out this
    <a
      class="text-blue-200 underline"
      rel="external"
      href="https://chromestatus.com/feature/5264933985976320">guide</a
    >
    , to enable bluetooth (only available for Chrome, Edge or Opera)
  </p>
</div>
{/if}