export interface Sticker {
  id: string;
  name: string;
  category: 'emoji' | 'doodles' | 'shapes' | 'fashion' | 'travel' | 'food' | 'nature' | 'party' | 'tech' | 'vintage' | 'animated';
  premium: boolean;
  path: string;
  animated?: boolean;
  tags?: string[];
}

export interface StickerPack {
  id: string;
  name: string;
  price: number;
  stickers: Sticker[];
  productId: string;
}
