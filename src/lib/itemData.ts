export type ItemPreset = {
  id: string
  name: string
  image: string
  price: number
}

export const ITEM_PRESETS: ItemPreset[] = [
  item('seyram-elixir', '세이람의 영약', '세이람의영약.png', 2_000_000),
  item('alleria-elixir', '알레리아의 영약', '알레리아의 영약.png', 2_000_000),
  item('honor-elixir', '명예의 영약', '명예의영약.png', 5_000_000),
  item('collector-elixir', '콜렉터의 영약', '콜렉터의영약.png', 20_000_000),
]

export function getItemImageUrl(image: string) {
  return `/items/${image}`
}

function item(id: string, name: string, image: string, price: number): ItemPreset {
  return { id, name, image, price }
}
