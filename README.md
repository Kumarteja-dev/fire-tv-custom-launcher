# Fire TV Custom Launcher

A customized Fire TV launcher based on the open-source **Fire TV Web Launcher** project by `pickdani`.

This build keeps the launcher lightweight and web-based while adding a polished theme system, custom remote navigation, animated focus effects, and a custom Sharingan-inspired theme alongside the Glass-style experience.

## Current features

- Custom Fire TV home screen built with HTML, CSS, and JavaScript
- Favorite apps in a single horizontal row
- Theme switching from the footer
- Glass theme
- Sharingan-inspired animated theme
- Full-screen custom artwork
- Animated eye tracking tied to the selected app
- Blink and wake animations
- Focus spotlight/glow
- Navigation sound feedback
- 25-second Sharingan idle mode
- Improved Fire TV remote UP/DOWN navigation
- Clock and weather widgets
- Austin weather configuration by default
- FireStick Fixer integration for reliable Home-button redirection on Fire OS 8

Tested on:

- **Amazon Fire TV Stick 4K, 2nd generation**
- **Fire OS 8.1.8.5**

## Project layout

The launcher UI lives here:

```text
app/src/main/assets/home/
```

Important files:

```text
config.js                 Favorite apps, weather, backgrounds
index.html                Main launcher markup
style.css                 Base / Glass styling
main.js                   Launcher startup logic
remote.js                 Fire TV remote navigation
themes.js                 Theme switching
sharingan.js              Sharingan animations and tracking
themes/sharingan.css      Sharingan theme styling
images/                   Theme artwork, logos, and local assets
```

## Requirements

On the Windows PC used for setup:

- Git
- Java 21
- Android SDK
- Android Platform Tools / ADB

If Git Bash cannot find `adb`:

```sh
export ANDROID_HOME="/c/Users/<YOUR_USER>/AppData/Local/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```

## Fire Stick setup

### 1. Enable Developer Options

1. Open **Settings → My Fire TV → About**.
2. Highlight the Fire TV device name.
3. Press the center/OK button 7 times.
4. Return to **My Fire TV → Developer Options**.
5. Turn on **ADB Debugging**.

### 2. Find the Fire Stick IP

Open:

**Settings → My Fire TV → About → Network**

### 3. Connect with ADB

```sh
adb connect <FIRE_TV_IP>:5555
adb devices
```

Accept the debugging authorization prompt on the TV.

## Launcher package

```text
dev.tvhome
```

After the APK is installed, the web assets can be updated without rebuilding the APK.

## FireStick Fixer and Home-button behavior

This build uses **FireStick Fixer** for Home-button redirection on Fire OS 8.

Important:

- Use the FireStick Fixer accessibility service.
- Do **not** enable the Web Launcher `HomeGuardService` at the same time.
- Running both services caused Home-button conflicts during testing.

Working accessibility service:

```text
io.github.hatim.firestickfixer/.HijackService
```

## Push launcher changes to the Fire Stick

### Windows / Git Bash

Because Git Bash can rewrite Android paths, use:

```sh
MSYS2_ARG_CONV_EXCL="/sdcard" adb push app/src/main/assets/home/. /sdcard/tvhome/
```

Files should exist directly under:

```text
/sdcard/tvhome/
```

For example:

```text
/sdcard/tvhome/config.js
/sdcard/tvhome/index.html
/sdcard/tvhome/main.js
```

Do not accidentally create:

```text
/sdcard/tvhome/home/
```

### Restart the launcher

```sh
adb shell am force-stop dev.tvhome
adb shell monkey -p dev.tvhome -c android.intent.category.LAUNCHER 1
```

## Configure favorite apps

Edit:

```text
app/src/main/assets/home/config.js
```

Current favorite packages include:

```js
favorites: [
  "com.amazon.firebat",
  "com.netflix.ninja",
  "com.amazon.firetv.youtube",
  "com.hbo.hbonow",
  "com.peacocktv.peacockfiretv",
  "com.apple.atve.amazon.appletv",
  "com.cricbuzz.android.tv",
  "com.fox.foxone",
],
```

Useful package discovery command:

```sh
adb shell pm list packages -3
```

Prime Video on the tested Fire Stick uses:

```text
com.amazon.firebat
```

## Weather

Weather is provided by Open-Meteo.

Current default configuration:

```js
weather: {
  city: "Austin",
  latitude: 30.2672,
  longitude: -97.7431,
  units: "fahrenheit",
  refreshMinutes: 15,
},
```

Change these values in `config.js` for another location.

## Themes

### Glass

The clean everyday theme.

### Sharingan-inspired theme

Adds:

- Full-screen custom artwork
- Animated Mangekyo-style eye tracking
- Blink animation
- Wake-only eye spin
- Spotlight that follows the focused app
- Styled favorite-app presentation
- Navigation sound feedback
- Idle mode after 25 seconds
- Remote-navigation fixes between favorites and footer controls

Primary files:

```text
app/src/main/assets/home/sharingan.js
app/src/main/assets/home/themes/sharingan.css
```

## Remote navigation behavior

- LEFT / RIGHT moves through favorite apps normally.
- DOWN from any favorite app moves into the footer.
- UP from any footer button returns to the closest favorite app above it.
- Footer/app mapping is based on DOM positions rather than hardcoded package names.

## Install on another Fire Stick

```sh
git clone https://github.com/Kumarteja-dev/fire-tv-custom-launcher.git
cd fire-tv-custom-launcher
adb connect <NEW_FIRE_TV_IP>:5555
```

Install the launcher APK and FireStick Fixer if they are not already installed, then push the launcher assets:

```sh
MSYS2_ARG_CONV_EXCL="/sdcard" adb push app/src/main/assets/home/. /sdcard/tvhome/
```

Restart:

```sh
adb shell am force-stop dev.tvhome
adb shell monkey -p dev.tvhome -c android.intent.category.LAUNCHER 1
```

If the second Fire Stick has different installed apps, update `config.js`.

## Git remotes

Recommended setup:

```text
origin    → your customized repository
upstream  → original Fire TV Web Launcher repository
```

Current repositories:

```text
origin:   https://github.com/Kumarteja-dev/fire-tv-custom-launcher.git
upstream: https://github.com/pickdani/fire-tv-web-launcher.git
```

## Optional debloat tools

The upstream project includes:

```text
tools/debloat.sh
```

Review the script before using it. Debloating is optional.

## Troubleshooting

### `adb: command not found`

```sh
export ANDROID_HOME="/c/Users/<YOUR_USER>/AppData/Local/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```

### Fire Stick disappears from ADB

```sh
adb connect <FIRE_TV_IP>:5555
```

The Fire Stick IP may change after a router or device reboot.

### Home button jumps between Amazon Home and the custom launcher

Make sure only FireStick Fixer is enabled as the accessibility redirect service. Do not enable both FireStick Fixer and Web Launcher HomeGuard.

### Launcher files appear under `/sdcard/tvhome/home/`

```sh
MSYS2_ARG_CONV_EXCL="*" adb shell "rm -rf /sdcard/tvhome && mkdir -p /sdcard/tvhome"
MSYS2_ARG_CONV_EXCL="/sdcard" adb push app/src/main/assets/home/. /sdcard/tvhome/
```

## Credits

Based on the original open-source **Fire TV Web Launcher** by `pickdani`:

https://github.com/pickdani/fire-tv-web-launcher

FireStick Fixer is used for Home-button redirection.

Weather data is provided by Open-Meteo.

## Artwork and trademarks

Some custom themes may reference third-party characters, logos, or user-supplied artwork. Those assets are not necessarily covered by this repository's MIT license.

Brand names and trademarks belong to their respective owners.

If you redistribute this repository publicly, make sure you have permission to redistribute custom artwork or other third-party assets included in your copy.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Code originating from the base project remains under the repository's [MIT License](LICENSE.md), subject to the original project's license terms and any separate rights that apply to third-party assets.
