export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  categories: string[];
  image: string;
  images?: string[];
  stock: number;
  rating: number;
  reviews: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'alimentacao' | 'treino' | 'dieta';
  author: string;
  date: string;
  image: string;
  readTime: string;
}

export interface CartItem extends Product {
  quantity: number;
}
