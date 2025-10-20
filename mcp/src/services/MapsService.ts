export class MapsService {
  private static readonly MAP_POOLS = {
    M1V1: [
      "Incorporeal LE", "Last Fantasy LE", "Ley Lines", "Magannatha LE",
      "Persephone", "Pylon LE", "Tokamak", "Torches", "Ultralove"
    ],
    M2V2: [
      "Arctic Flowers LE", "Breakwater LE", "Crimson Research Lab LE",
      "Emerald City CE", "Reclamation LE", "Rhoskallian LE", "Rohana LE",
      "Undercurrent LE", "Yellowjacket"
    ],
    M3V3: [
      "Arkadia", "Desolator", "Lost July", "Megastructure", "Rosebud LE",
      "Sandstorm CE", "Sentinel CE", "Voracity", "White Chamber"
    ],
    M4V4: [
      "Ashen Cradle", "Concord LE", "Dystopian Complex", "Floodplain",
      "Morheimen", "Riptide", "Slowdive", "Tunguska", "Tuonela LE"
    ]
  };

  static getMapsForMode(mode: string): string[] {
    return this.MAP_POOLS[mode as keyof typeof this.MAP_POOLS] || [];
  }
}