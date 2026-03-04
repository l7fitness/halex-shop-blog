export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'suplementos' | 'acessorios' | 'vestuario';
  image: string;
  rating: number;
  reviews: number;
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
