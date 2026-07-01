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

export const BOSS_PRESETS: BossPreset[] = [
  boss('zakum', '자쿰', '자쿰.png', [
    ['노멀', 349_000],
    ['카오스', 8_080_000],
  ]),
  boss('pierre', '피에르', '피에르.png', [
    ['노멀', 551_000],
    ['카오스', 8_170_000],
  ]),
  boss('vanban', '반반', '반반.png', [
    ['노멀', 551_000],
    ['카오스', 8_150_000],
  ]),
  boss('bloodyqueen', '블러디퀸', '블러디퀸.png', [
    ['노멀', 551_000],
    ['카오스', 8_140_000],
  ]),
  boss('vellum', '벨륨', '벨륨.png', [
    ['노멀', 551_000],
    ['카오스', 9_280_000],
  ]),
  boss('magnus', '매그너스', '매그너스.png', [
    ['노멀', 1_160_000],
    ['하드', 8_560_000],
  ]),
  boss('papulatus', '파풀라투스', '파풀라투스.png', [
    ['노멀', 1_200_000],
    ['카오스', 13_100_000],
  ]),
  boss('swoo', '스우', '스우.png', [
    ['노멀', 16_700_000],
    ['하드', 51_500_000],
    ['익스트림', 574_000_000],
  ]),
  boss('damien', '데미안', '데미안.png', [
    ['노멀', 17_500_000],
    ['하드', 48_900_000],
  ]),
  boss('guardian-angel-slime', '가디언 엔젤 슬라임', '가디언엔젤슬라임.png', [
    ['노멀', 25_500_000],
    ['카오스', 75_100_000],
  ]),
  boss('lucid', '루시드', '루시드.png', [
    ['이지', 29_800_000],
    ['노멀', 35_600_000],
    ['하드', 62_900_000],
  ]),
  boss('will', '윌', '윌.png', [
    ['이지', 32_300_000],
    ['노멀', 41_100_000],
    ['하드', 77_100_000],
  ]),
  boss('dusk', '더스크', '더스크.png', [
    ['노멀', 44_000_000],
    ['카오스', 69_800_000],
  ]),
  boss('dunkel', '듄켈', '듄켈.png', [
    ['노멀', 47_500_000],
    ['하드', 94_400_000],
  ]),
  boss('true-hilla', '진힐라', '진힐라.png', [
    ['노멀', 71_200_000],
    ['하드', 106_000_000],
  ]),
  boss('black-mage', '검은 마법사', '검은마법사.png', [
    ['하드', 700_000_000],
    ['익스트림', 9_200_000_000],
  ]),
  boss('seren', '세렌', '세렌.png', [
    ['노멀', 239_000_000],
    ['하드', 356_000_000],
    ['익스트림', 2_835_000_000],
  ]),
  boss('kalos', '감시자 칼로스', '감시자칼로스.png', [
    ['이지', 280_000_000],
    ['노멀', 505_000_000],
    ['카오스', 1_273_000_000],
    ['익스트림', 4_104_000_000],
  ]),
  boss('kaling', '카링', '카링.png', [
    ['이지', 377_000_000],
    ['노멀', 678_000_000],
    ['하드', 1_739_000_000],
    ['익스트림', 5_387_000_000],
  ]),
  boss('limbo', '림보', '림보.png', [
    ['노멀', 1_026_000_000],
    ['하드', 2_385_000_000],
  ]),
  boss('baldrix', '발드락스', '발드락스.png', [
    ['노멀', 1_368_000_000],
    ['하드', 3_078_000_000],
  ]),
  boss('first-adversary', '최초의 대적자', '최초의대적자.png', [
    ['이지', 308_000_000],
    ['노멀', 560_000_000],
    ['하드', 1_435_000_000],
    ['익스트림', 4_712_000_000],
  ]),
  boss('hungsung', '흉성', '흉성.png', [
    ['노멀', 625_000_000],
    ['하드', 2_678_000_000],
  ]),
  boss('jupiter', '유피테르', '유피테르.png', [
    ['노멀', 1_615_000_000],
    ['하드', 4_845_000_000],
  ]),
  boss('meilin', '메이린', '메이린.png', [
    ['일반', 300_000_000],
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
