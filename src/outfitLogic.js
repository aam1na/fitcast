import { colorsCompatible } from "./closetData";

function rulesForVibe(vibeText) {
  const v = (vibeText || "").toLowerCase();
  if (v.indexOf("cultural") !== -1 || v.indexOf("eid") !== -1 || v.indexOf("wedding") !== -1) return { wantsSet: true, wantsLayer: false, wantsAccessory: true };
  if (v.indexOf("party") !== -1 || v.indexOf("date") !== -1 || v.indexOf("night") !== -1) return { wantsSet: true, wantsLayer: false, wantsAccessory: true };
  if (v.indexOf("business") !== -1 || v.indexOf("work") !== -1 || v.indexOf("office") !== -1) return { wantsSet: false, wantsLayer: true, wantsAccessory: true };
  if (v.indexOf("cozy") !== -1 || v.indexOf("lowkey") !== -1 || v.indexOf("relax") !== -1) return { wantsSet: false, wantsLayer: true, wantsAccessory: false };
  if (v.indexOf("brunch") !== -1 || v.indexOf("casual") !== -1) return { wantsSet: false, wantsLayer: false, wantsAccessory: true };
  return { wantsSet: false, wantsLayer: false, wantsAccessory: true };
}

function leastWorn(list) {
  if (!list.length) return null;
  return list.reduce(function (a, b) { return a.daysSinceWorn > b.daysSinceWorn ? a : b; });
}

function pickForWeather(list, weather) {
  if (!list.length) return null;
  const matching = weather ? list.filter(function (i) { return i.weatherTags && i.weatherTags.indexOf(weather.condition) !== -1; }) : [];
  if (matching.length > 0) return leastWorn(matching);
  const neutral = list.filter(function (i) { return !i.weatherTags || i.weatherTags.length === 0; });
  if (neutral.length > 0) return leastWorn(neutral);
  return leastWorn(list);
}

// The anchor is the reason for the day's pick: a weather-relevant piece
// that hasn't been worn in a while. Only weather-tied items qualify.
export function pickAnchorItem(items, weather) {
  if (!weather) return null;
  const candidates = items.filter(function (item) { return item.weatherTags && item.weatherTags.indexOf(weather.condition) !== -1; });
  if (candidates.length === 0) return null;
  return leastWorn(candidates);
}

// Builds a real outfit: a set, or a color-compatible top and bottom,
// plus a layer or accessory depending on the vibe, plus shoes.
export function buildOutfit(items, weather, vibeText, prefs) {
  prefs = prefs || {};
  const rules = rulesForVibe(vibeText);
  const avoid = (prefs.colorsToAvoid || []).map(function (c) { return c.toLowerCase(); }).filter(Boolean);
  const usable = items.filter(function (item) {
    const nm = item.name.toLowerCase();
    return !avoid.some(function (a) { return nm.indexOf(a) !== -1; });
  });

  const anchor = pickAnchorItem(usable, weather);

  const sets = usable.filter(function (i) { return i.category === "SET"; });
  const tops = usable.filter(function (i) { return i.category === "TOP" && !i.isLayer; });
  const layers = usable.filter(function (i) { return i.category === "TOP" && i.isLayer; });
  const bottoms = usable.filter(function (i) { return i.category === "BOTTOM"; });
  const shoes = usable.filter(function (i) { return i.category === "SHOES"; });
  const accessories = usable.filter(function (i) { return ["JEWELRY", "BAG", "BELT", "HAT"].indexOf(i.category) !== -1; });
  const heads = usable.filter(function (i) { return i.category === "HEAD_COVERING"; });

  const pieces = [];
  let baseIsLayer = false;

  if (anchor && anchor.category === "SET") {
    pieces.push(anchor);
  } else if (rules.wantsSet && sets.length > 0 && (!anchor || anchor.category === "SET")) {
    pieces.push(pickForWeather(sets, weather));
  } else {
    let top = anchor && anchor.category === "TOP" && !anchor.isLayer ? anchor : pickForWeather(tops, weather);
    if (!top) { top = pickForWeather(layers, weather); baseIsLayer = true; }
    let bottom = anchor && anchor.category === "BOTTOM" ? anchor : pickForWeather(bottoms, weather);
    if (top && bottom && !colorsCompatible(top.color, bottom.color)) {
      const altBottom = bottoms.find(function (b) { return colorsCompatible(top.color, b.color); });
      if (altBottom) bottom = altBottom;
    }
    if (top) pieces.push(top);
    if (bottom && pieces.indexOf(bottom) === -1) pieces.push(bottom);
  }

  const wantsLayerForWeather = weather && ["cold", "rainy", "drizzle", "snowy"].indexOf(weather.condition) !== -1;
  if (!baseIsLayer && layers.length > 0 && (rules.wantsLayer || wantsLayerForWeather)) {
    const baseColor = pieces[0] ? pieces[0].color : null;
    const layer = anchor && anchor.category === "TOP" && anchor.isLayer ? anchor : pickForWeather(layers, weather);
    if (layer && pieces.indexOf(layer) === -1 && (!baseColor || colorsCompatible(layer.color, baseColor))) pieces.push(layer);
  }

  const shoe = anchor && anchor.category === "SHOES" ? anchor : pickForWeather(shoes, weather);
  if (shoe && pieces.indexOf(shoe) === -1) pieces.push(shoe);

  if (rules.wantsAccessory && accessories.length > 0) {
    const acc = pickForWeather(accessories, weather);
    if (acc && pieces.indexOf(acc) === -1) pieces.push(acc);
  }

  if (prefs.headCoveringMatchingEnabled && heads.length > 0) {
    const head = pickForWeather(heads, weather);
    if (head && pieces.indexOf(head) === -1) pieces.push(head);
  }

  return { anchor: anchor, pieces: pieces };
}