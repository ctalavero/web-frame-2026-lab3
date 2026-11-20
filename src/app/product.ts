export const categories = ['Клавіатури', 'Миші', 'Підключення'] as const;

export interface ProductDraft {
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface Product extends ProductDraft {
  id: number;
}
