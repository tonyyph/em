/**
 * The asset manifest.
 *
 * Every file `npm run assets:build` writes, what draws it, and what the file is
 * expected to look like once written. The build script reads this to know what
 * to produce; `__tests__/design/brandAssets.test.ts` reads the same list to
 * check that what is committed still matches what the geometry produces — so a
 * tweak to a bezier that nobody re-exported fails a test rather than shipping
 * an icon that disagrees with the app.
 *
 * Raster only where a platform refuses vector: the App Store icon, the launcher
 * icons, and the native launch mark. Everything else the app itself draws stays
 * a `react-native-svg` component, because that is the form the app can theme.
 */

export type VectorAsset = {
  kind: "svg";
  file: string;
  /** Key into the generators map in `scripts/build-brand-assets.ts`. */
  source: string;
  purpose: string;
};

export type RasterAsset = {
  kind: "png";
  file: string;
  source: string;
  size: number;
  /**
   * PNG colour type. 6 is RGBA, 2 is RGB with no alpha channel at all — which
   * is what the App Store demands of an icon, and what a launcher icon wants so
   * no ghost edge shows against a light wallpaper.
   */
  alpha: boolean;
  purpose: string;
};

export type BrandAsset = VectorAsset | RasterAsset;

export const brandAssets: BrandAsset[] = [
  {
    kind: "svg",
    file: "assets/brand/em-mark.svg",
    source: "mark",
    purpose: "Master vector — the contour ẽ in currentColor, for handoff and marketing."
  },
  {
    kind: "svg",
    file: "assets/texture/atmosphere-field.svg",
    source: "field-light",
    purpose: "Reusable contour texture, light."
  },
  {
    kind: "svg",
    file: "assets/texture/atmosphere-field-dark.svg",
    source: "field-dark",
    purpose: "Reusable contour texture, dark — near-invisible by design."
  },
  {
    kind: "png",
    file: "assets/icon/icon-appstore.png",
    source: "icon-light",
    size: 1024,
    alpha: false,
    purpose: "App Store listing icon. Alpha would be rejected outright."
  },
  {
    kind: "png",
    file: "assets/icon/icon-ios.png",
    source: "icon-light",
    size: 1024,
    alpha: false,
    purpose: "ios.icon.light — square, unrounded; iOS applies the mask."
  },
  {
    kind: "png",
    file: "assets/icon/icon-ios-dark.png",
    source: "icon-dark",
    size: 1024,
    alpha: true,
    purpose: "ios.icon.dark — mark on transparency, iOS supplies the backdrop."
  },
  {
    kind: "png",
    file: "assets/icon/icon-ios-tinted.png",
    source: "icon-tinted",
    size: 1024,
    alpha: true,
    purpose: "ios.icon.tinted — monochrome mark, recoloured by the system."
  },
  {
    kind: "png",
    file: "assets/icon/icon-android.png",
    source: "icon-light",
    size: 1024,
    alpha: false,
    purpose: "Legacy Android launcher icon and the notification/store fallback."
  },
  {
    kind: "png",
    file: "assets/icon/adaptive-icon.png",
    source: "icon-adaptive",
    size: 1024,
    alpha: true,
    purpose: "Android adaptive foreground; the ground comes from backgroundColor."
  },
  {
    kind: "png",
    file: "assets/splash/splash-mark.png",
    source: "splash-light",
    size: 320,
    alpha: true,
    purpose: "Native launch mark, light — 160pt at @2x."
  },
  {
    kind: "png",
    file: "assets/splash/splash-mark-dark.png",
    source: "splash-dark",
    size: 320,
    alpha: true,
    purpose: "Native launch mark, dark."
  }
];
