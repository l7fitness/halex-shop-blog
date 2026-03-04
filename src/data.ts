import { Product, BlogPost } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Whey Protein Isolate - 900g',
    price: 189.90,
    description: 'Proteína isolada de alta qualidade para recuperação muscular rápida e ganho de massa magra.',
    category: 'suplementos',
    image: 'https://picsum.photos/seed/whey/600/600',
    rating: 4.9,
    reviews: 128
  },
  {
    id: '2',
    name: 'Creatina Monohidratada - 300g',
    price: 99.90,
    description: 'Aumento de força, explosão e performance nos treinos de alta intensidade.',
    category: 'suplementos',
    image: 'https://picsum.photos/seed/creatine/600/600',
    rating: 4.8,
    reviews: 245
  },
  {
    id: '3',
    name: 'Pré-Treino Explosive - 300g',
    price: 129.90,
    description: 'Foco mental, energia duradoura e pump muscular insano para seus treinos.',
    category: 'suplementos',
    image: 'https://picsum.photos/seed/preworkout/600/600',
    rating: 4.7,
    reviews: 89
  },
  {
    id: '4',
    name: 'Coqueteleira Halex Pro',
    price: 45.00,
    description: 'Design ergonômico e vedação perfeita para seus shakes diários.',
    category: 'acessorios',
    image: 'https://picsum.photos/seed/shaker/600/600',
    rating: 4.5,
    reviews: 56
  },
  {
    id: '5',
    name: 'BCAA 2:1:1 - 120 Cápsulas',
    price: 79.90,
    description: 'Aminoácidos essenciais para prevenir o catabolismo e auxiliar na recuperação.',
    category: 'suplementos',
    image: 'https://picsum.photos/seed/bcaa/600/600',
    rating: 4.6,
    reviews: 112
  },
  {
    id: '6',
    name: 'Camiseta Oversized Halex Beast',
    price: 89.90,
    description: 'Conforto e estilo para o treino e para o dia a dia.',
    category: 'vestuario',
    image: 'https://picsum.photos/seed/shirt/600/600',
    rating: 4.9,
    reviews: 43
  }
];

export const POSTS: BlogPost[] = [
  {
    id: '1',
    title: '5 Dicas de Alimentação para Ganho de Massa',
    excerpt: 'Descubra como estruturar sua dieta para maximizar a hipertrofia muscular com alimentos estratégicos.',
    content: 'O ganho de massa muscular exige um superávit calórico e a ingestão adequada de macronutrientes...',
    category: 'alimentacao',
    author: 'Equipe Halex',
    date: '2024-03-01',
    image: 'https://picsum.photos/seed/food1/800/400',
    readTime: '5 min'
  },
  {
    id: '2',
    title: 'Treino de Pernas: O Guia Definitivo',
    excerpt: 'Não pule o dia de pernas! Aprenda os melhores exercícios para construir membros inferiores poderosos.',
    content: 'Um treino de pernas eficiente deve focar em exercícios compostos como agachamento e leg press...',
    category: 'treino',
    author: 'Coach Halex',
    date: '2024-02-28',
    image: 'https://picsum.photos/seed/gym1/800/400',
    readTime: '8 min'
  },
  {
    id: '3',
    title: 'Dieta Flexível: Funciona Mesmo?',
    excerpt: 'Entenda os conceitos da dieta flexível e como ela pode ajudar na aderência ao seu plano alimentar.',
    content: 'A dieta flexível foca no controle de macronutrientes, permitindo maior liberdade nas escolhas alimentares...',
    category: 'dieta',
    author: 'Nutri Halex',
    date: '2024-02-25',
    image: 'https://picsum.photos/seed/diet1/800/400',
    readTime: '6 min'
  }
];
