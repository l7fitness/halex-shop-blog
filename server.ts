import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("halex.db");

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    category TEXT,
    image TEXT,
    rating REAL,
    reviews INTEGER
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    category TEXT,
    author TEXT,
    date TEXT,
    image TEXT,
    readTime TEXT
  );
`);

// Seed initial data if empty
const productCount = db.prepare("SELECT count(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare("INSERT INTO products (id, name, price, description, category, image, rating, reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  
  const initialProducts = [
    ['1', 'Whey Protein Isolate - 900g', 189.90, 'Proteína isolada de alta qualidade.', 'suplementos', 'https://picsum.photos/seed/whey/600/600', 4.9, 128],
    ['2', 'Creatina Monohidratada - 300g', 99.90, 'Aumento de força e performance.', 'suplementos', 'https://picsum.photos/seed/creatine/600/600', 4.8, 245],
    ['3', 'Pré-Treino Explosive - 300g', 129.90, 'Foco mental e energia duradoura.', 'suplementos', 'https://picsum.photos/seed/preworkout/600/600', 4.7, 89],
    ['4', 'Coqueteleira Halex Pro', 45.00, 'Design ergonômico e vedação perfeita.', 'acessorios', 'https://picsum.photos/seed/shaker/600/600', 4.5, 56],
    ['5', 'BCAA 2:1:1 - 120 Cápsulas', 79.90, 'Aminoácidos essenciais.', 'suplementos', 'https://picsum.photos/seed/bcaa/600/600', 4.6, 112],
    ['6', 'Camiseta Oversized Halex Beast', 89.90, 'Conforto e estilo para o treino.', 'vestuario', 'https://picsum.photos/seed/shirt/600/600', 4.9, 43]
  ];

  for (const p of initialProducts) {
    insertProduct.run(...p);
  }
}

const postCount = db.prepare("SELECT count(*) as count FROM posts").get() as { count: number };
if (postCount.count === 0) {
  const insertPost = db.prepare("INSERT INTO posts (id, title, excerpt, content, category, author, date, image, readTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  
  const initialPosts = [
    ['1', '5 Dicas de Alimentação para Ganho de Massa', 'Descubra como estruturar sua dieta.', 'Conteúdo completo aqui...', 'alimentacao', 'Equipe Halex', '2024-03-01', 'https://picsum.photos/seed/food1/800/400', '5 min'],
    ['2', 'Treino de Pernas: O Guia Definitivo', 'Não pule o dia de pernas!', 'Conteúdo completo aqui...', 'treino', 'Coach Halex', '2024-02-28', 'https://picsum.photos/seed/gym1/800/400', '8 min'],
    ['3', 'Dieta Flexível: Funciona Mesmo?', 'Entenda os conceitos da dieta flexível.', 'Conteúdo completo aqui...', 'dieta', 'Nutri Halex', '2024-02-25', 'https://picsum.photos/seed/diet1/800/400', '6 min']
  ];

  for (const p of initialPosts) {
    insertPost.run(...p);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.get("/api/posts", (req, res) => {
    const posts = db.prepare("SELECT * FROM posts").all();
    res.json(posts);
  });

  // Admin API - Products
  app.post("/api/products", (req, res) => {
    const { id, name, price, description, category, image, rating, reviews } = req.body;
    const info = db.prepare("INSERT INTO products (id, name, price, description, category, image, rating, reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, price, description, category, image, rating, reviews);
    res.json({ success: true, id: info.lastInsertRowid });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin API - Posts
  app.post("/api/posts", (req, res) => {
    const { id, title, excerpt, content, category, author, date, image, readTime } = req.body;
    const info = db.prepare("INSERT INTO posts (id, title, excerpt, content, category, author, date, image, readTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, title, excerpt, content, category, author, date, image, readTime);
    res.json({ success: true, id: info.lastInsertRowid });
  });

  app.delete("/api/posts/:id", (req, res) => {
    db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
