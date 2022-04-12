# Web BLE Demo
This project is capable to pair a Texas Instruments CC2541 (EOL) using BLE and the Web Bluetooth API.
Development Resources for the CC2541:

[User manual (unofficial)](http://devrel.zoomquiet.top/data/20160412163806/index.html)

[Data Sheet (Raw Sensor)](https://www.ti.com/product/CC2541?utm_source=google&utm_medium=cpc&utm_campaign=epd-con-null-prodfolderdynamic-cpc-pf-google-de&utm_content=prodfolddynamic&ds_k=DYNAMIC+SEARCH+ADS&DCM=yes&gclid=CjwKCAjwo8-SBhAlEiwAopc9WzsiHlMSiU5a_5D582L_hhsn6AjeQg5xJeKqXLEcMnr99H2G35x5FBoCOdoQAvD_BwE&gclsrc=aw.ds)

[Data Sheet (Sensor Tag)](https://www.ti.com/tool/CC2541-SENSORTAG-IBEACON-RD?utm_source=google&utm_medium=cpc&utm_campaign=sys-ind-null-refdesdynamic-cpc-evm-google-de&utm_content=refdesdynamic&ds_k=DYNAMIC+SEARCH+ADS&DCM=yes&gclid=CjwKCAjwo8-SBhAlEiwAopc9WzUjtCRFNklXLMBLhsE3Xy3lg4vNWoGeqX3IFEyn5ERhZY9aUtQr7hoC3PEQAvD_BwE&gclsrc=aw.ds)


[Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)

[Associated Blog Post](https://medium.com/p/9d765ff851ea)

## Running the Project

1. Clone the project locally using `git clone git@github.com:classycodeoss/web-ble-api.git`
2. Install dependencies using `npm install` (or `pnpm install` or `yarn`)
3. Run the project using `npm run dev`

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.
> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
