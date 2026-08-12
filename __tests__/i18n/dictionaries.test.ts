import { en, vi } from "@/i18n/dictionaries";

describe("copy deck", () => {
  it("translates every English key into Vietnamese", () => {
    const missing = Object.keys(en).filter(
      (key) => !vi[key as keyof typeof vi]?.trim()
    );
    expect(missing).toEqual([]);
  });

  it("has no Vietnamese key without an English counterpart", () => {
    const orphans = Object.keys(vi).filter((key) => !(key in en));
    expect(orphans).toEqual([]);
  });

  /**
   * Vietnamese runs longer than English. This does not enforce a limit — it
   * pins the assumption the layouts were designed against, so a future string
   * that blows well past it fails here rather than silently clipping on device.
   */
  it("keeps Vietnamese within twice the length of its English source", () => {
    const tooLong = Object.entries(en)
      .filter(([key, source]) => {
        const translated = vi[key as keyof typeof vi];
        return source.length > 12 && translated.length > source.length * 2;
      })
      .map(([key]) => key);

    expect(tooLong).toEqual([]);
  });

  it("uses real Vietnamese diacritics rather than unaccented ASCII", () => {
    const accented = /[àáảãạăâèéẻẽẹêìíỉĩịòóỏõọôơùúủũụưỳýỷỹỵđ]/i;
    const suspicious = Object.entries(vi)
      .filter(([key, value]) => value.length > 20 && !accented.test(value) && key !== "appName")
      .map(([key]) => key);

    expect(suspicious).toEqual([]);
  });
});
