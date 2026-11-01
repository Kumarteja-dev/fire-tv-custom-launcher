# Itachi expression assets

`itachi-mangekyo.svg` adapts the connected tomoe path from
[Mangekyou Sharingan Itachi.svg by ShounenSuki](https://commons.wikimedia.org/wiki/File:Mangekyou_Sharingan_Itachi.svg),
licensed [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
The adaptation removes the background and iris, makes the center transparent,
and changes the ink color. This adapted SVG uses the same license.

The mouth remains the original artwork. A matching smirk asset is REQUIRED:
an aligned 2048 × 1152 transparent PNG with only the mouth-region replacement
painted, including enough matching skin to conceal the original lip line.
Raise just one corner slightly; preserve the existing ink and skin texture.
Do not stretch the face or substitute a CSS curve.

`#itachi-expression` already clips to the mouth region in original artwork
coordinates. `#itachi-smirk` is the empty, hidden image slot. It deliberately
has no href, so there is no broken image request or simulated expression.
After suitable artwork exists, visually check its registration, then add an
opacity-only brief expression transition and cancel its timers on suspend,
theme change, and reduced motion. No smirk timer is enabled without artwork.
