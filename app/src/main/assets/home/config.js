// Edit this file to change what the home screen shows.
export default {
  // Apps on the main row, in this order, by package name.
  // "All apps" on the TV shows every app. Or run: adb shell pm list packages
  favorites: [
"com.netflix.ninja",
"com.amazon.firebat",
"com.amazon.firetv.youtube",
"com.hbo.hbonow",
"com.peacocktv.peacockfiretv",
"com.apple.atve.amazon.appletv",
"com.cricbuzz.android.tv",
"com.fox.foxone",
],

  // Apps never shown in "All apps".
  hidden: [
    "com.amazon.tv.launcher",
  ],

  // Weather from Open-Meteo (free, no account). Set to null to hide it.
  weather: {
  city: "Austin",
  latitude: 30.2672,
  longitude: -97.7431,
  units: "fahrenheit",     
  refreshMinutes: 15,
},

  // One image or a list: files in this folder, or https:// links.
  // With a list, the background fades to the next one every backgroundMinutes.
  background: [
    "fall-esplanade.jpg",
    "fall-common.jpg",
    "fall-public-garden.jpg",
  ],
  backgroundMinutes: 30,
};
