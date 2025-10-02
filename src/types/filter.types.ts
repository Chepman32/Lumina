export interface Filter {
  id: string;
  name: string;
  displayName: string;
  category: 'free' | 'cinematic' | 'aesthetic' | 'portrait' | 'seasonal' | 'artistic' | 'vintage';
  premium: boolean;
  shader?: string;
  thumbnail?: string;
}

export interface FilterPack {
  id: string;
  name: string;
  price: number;
  filters: Filter[];
  productId: string;
}
