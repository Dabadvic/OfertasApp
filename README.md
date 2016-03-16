# OfertasApp
Android application for the reception of local offers in real time, developed with Ionic.
A video demonstration can be found here: https://youtu.be/2W2UJwyi9Dg

To use this application in your device, you need the ionic framework installed. 

Once installed, you can use the command:
```
ionic serve
```
To preview the final result in your browser.

If you prefer to test it in your own Android device, you need to plug it in and execute the next command:
```
ionic run android
```
Take note that for installing it you will need to have the USB debbuging enabled on your device, as [described](http://developer.android.com/intl/es/tools/device.html) on the Android developer site.

## External libraries
[locationpicker.js](http://logicify.github.io/jquery-locationpicker-plugin/): Library for simplifying the use of Google maps for picking up a location.

[parse-1.4.2.min.js](https://www.parse.com/docs/downloads): Official library from Parse in JavaScript, needed for the conection to the Parse database.

[qrcode.js](http://davidshimjs.github.io/qrcodejs/): Used for generating QR codes.

## External plugins
[parse-push-plugin](https://github.com/taivo/parse-push-plugin): Plugin for Parse's Push notifications reception.

[PushPlugin](https://github.com/phonegap-build/PushPlugin): Complementing the previous one, for showing Push notifications received in the device's notification bar.

[ParsePlugin](https://github.com/avivais/phonegap-parse-plugin): Obsolete, replaced by "parse-push-plugin".

[BarcodeScanner](https://github.com/wildabeast/BarcodeScanner): Needed for scaning QR codes.
