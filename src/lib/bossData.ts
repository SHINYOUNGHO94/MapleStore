export type BossDifficulty = {
  label: string
  price: number
}

export type BossPreset = {
  id: string
  name: string
  image: string
  difficulties: BossDifficulty[]
}

// Prices: https://gi.maplestory.nexon.com/Update/813 (2026-09-17).
// Black Mage October prices applied early at the owner's request (2026-09-22).
export const BOSS_PRESETS: BossPreset[] = [
  boss('zakum', '자쿰', '자쿰.png', [
    ['노멀', 349_000],
    ['카오스', 4_040_000],
  ]),
  boss('pierre', '피에르', '피에르.png', [
    ['노멀', 551_000],
    ['카오스', 4_080_000],
  ]),
  boss('vanban', '반반', '반반.png', [
    ['노멀', 551_000],
    ['카오스', 4_070_000],
  ]),
  boss('bloodyqueen', '블러디퀸', '블러디퀸.png', [
    ['노멀', 551_000],
    ['카오스', 4_070_000],
  ]),
  boss('vellum', '벨륨', '벨륨.png', [
    ['노멀', 551_000],
    ['카오스', 4_640_000],
  ]),
  boss('magnus', '매그너스', '매그너스.png', [
    ['노멀', 1_160_000],
    ['하드', 4_280_000],
  ]),
  boss('papulatus', '파풀라투스', '파풀라투스.png', [
    ['노멀', 1_200_000],
    ['카오스', 6_550_000],
  ]),
  boss('swoo', '스우', '스우.png', [
    ['노멀', 8_350_000],
    ['하드', 48_900_000],
    ['익스트림', 545_000_000],
  ]),
  boss('damien', '데미안', '데미안.png', [
    ['노멀', 8_750_000],
    ['하드', 46_400_000],
  ]),
  boss('guardian-angel-slime', '가디언 엔젤 슬라임', '가디언엔젤슬라임.png', [
    ['노멀', 12_700_000],
    ['카오스', 71_300_000],
  ]),
  boss('lucid', '루시드', '루시드.png', [
    ['이지', 14_900_000],
    ['노멀', 17_800_000],
    ['하드', 59_700_000],
  ]),
  boss('will', '윌', '윌.png', [
    ['이지', 16_100_000],
    ['노멀', 20_500_000],
    ['하드', 73_200_000],
  ]),
  boss('dusk', '더스크', '더스크.png', [
    ['노멀', 22_000_000],
    ['카오스', 66_300_000],
  ]),
  boss('dunkel', '듄켈', '듄켈.png', [
    ['노멀', 23_700_000],
    ['하드', 89_600_000],
  ]),
  boss('true-hilla', '진힐라', '진힐라.png', [
    ['노멀', 67_600_000],
    ['하드', 100_000_000],
  ]),
  boss('black-mage', '검은 마법사', '검은마법사.png', [
    ['하드', 465_000_000],
    ['익스트림', 5_680_000_000],
  ]),
  boss('seren', '세렌', '세렌.png', [
    ['노멀', 167_000_000],
    ['하드', 302_000_000],
    ['익스트림', 1_840_000_000],
  ]),
  boss('kalos', '감시자 칼로스', '감시자칼로스.png', [
    ['이지', 238_000_000],
    ['노멀', 479_000_000],
    ['카오스', 1_230_000_000],
    ['익스트림', 4_104_000_000],
  ]),
  boss('kaling', '카링', '카링.png', [
    ['이지', 320_000_000],
    ['노멀', 593_000_000],
    ['하드', 1_560_000_000],
    ['익스트림', 5_387_000_000],
  ]),
  boss('limbo', '림보', '림보.png', [
    ['노멀', 995_000_000],
    ['하드', 2_385_000_000],
  ]),
  boss('baldrix', '발드락스', '발드락스.png', [
    ['노멀', 1_320_000_000],
    ['하드', 3_078_000_000],
  ]),
  boss('first-adversary', '최초의 대적자', '최초의대적자.png', [
    ['이지', 261_000_000],
    ['노멀', 532_000_000],
    ['하드', 1_390_000_000],
    ['익스트림', 4_712_000_000],
  ]),
  boss('hungsung', '흉성', '흉성.png', [
    ['노멀', 576_000_000],
    ['하드', 2_678_000_000],
  ]),
  boss('jupiter', '유피테르', '유피테르.png', [
    ['노멀', 1_560_000_000],
    ['하드', 4_845_000_000],
  ]),
  boss('bellona', '벨로나', '벨로나.png', [
    ['이지', 396_000_000],
    ['노멀', 824_000_000],
    ['하드', 2_950_000_000],
  ]),
]

export function getSortedBossPresets(): BossPreset[] {
  return [...BOSS_PRESETS].sort((a, b) => minPrice(a) - minPrice(b))
}

export function getBossImageUrl(image: string) {
  return `/bosses/${image}`
}

function boss(id: string, name: string, image: string, difficulties: Array<[string, number]>): BossPreset {
  return {
    id,
    name,
    image,
    difficulties: difficulties.map(([label, price]) => ({ label, price })),
  }
}

function minPrice(bossPreset: BossPreset) {
  return Math.min(...bossPreset.difficulties.map((difficulty) => difficulty.price))
}
