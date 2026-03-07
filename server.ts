import express from "express";
import axios from "axios";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: any;
try {
  const dbPath = process.env.VERCEL ? "/tmp/halex.db" : "halex.db";
  db = new Database(dbPath);
  
  // Initialize Database Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      category TEXT,
      image TEXT,
      images TEXT,
      stock INTEGER DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_nsu TEXT UNIQUE,
      customer_email TEXT,
      items TEXT,
      total REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, item_id, item_type)
    );
  `);

  // Migration: Add missing columns if they don't exist
  try {
    db.exec("ALTER TABLE products ADD COLUMN images TEXT");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0");
  } catch (e) {}

  // Seed initial data if empty
  const productCount = db.prepare("SELECT count(*) as count FROM products").get() as { count: number };
  if (productCount.count === 0) {
    const insertProduct = db.prepare("INSERT INTO products (id, name, price, description, category, image, images, stock, rating, reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    const initialProducts = [
      ['l7-ultra-450-kit', '1 Kit L7 ULTRA 450mg + Detox', 159.90, 'Combo completo para emagrecimento com L7 Ultra 450mg e Detox para resultados rápidos e naturais.', 'emagrecedores', 'https://picsum.photos/seed/l7ultra-kit/600/600', JSON.stringify(['https://picsum.photos/seed/l7ultra-kit1/600/600']), 50, 4.9, 156],
      ['l7-turbo-500-kit', 'Kit L7 TURBO 500mg + Detox', 189.90, 'Potencialize sua queima de gordura com o Kit L7 Turbo 500mg e Detox. Energia e saciedade.', 'emagrecedores', 'https://picsum.photos/seed/l7turbo-kit/600/600', JSON.stringify(['https://picsum.photos/seed/l7turbo-kit1/600/600']), 40, 4.8, 92],
      ['l7-ultra-450', 'L7 Ultra 450mg', 149.00, 'Inibidor de apetite natural com Laranja Moro, L-Carnitina e Psyllium para queima de gordura.', 'emagrecedores', 'https://picsum.photos/seed/l7ultra/600/600', JSON.stringify([]), 100, 4.9, 210],
      ['l7-nitro-750-kit', 'Kit L7 Nitro 750mg + Detox Shake', 199.90, 'A fórmula mais potente: L7 Nitro 750mg combinada com Detox Shake para resultados máximos.', 'emagrecedores', 'https://picsum.photos/seed/l7nitro-kit/600/600', JSON.stringify([]), 25, 5.0, 78],
      ['l7-nitro-750', 'L7 NITRO 750mg', 169.00, 'Máxima concentração para queima de gordura abdominal e controle total do apetite.', 'emagrecedores', 'https://picsum.photos/seed/l7nitro/600/600', JSON.stringify([]), 60, 4.9, 134],
      ['l7-turbo-500', 'L7 TURBO 500mg', 159.00, 'Equilíbrio perfeito entre energia e queima calórica para o seu dia a dia.', 'emagrecedores', 'https://picsum.photos/seed/l7turbo/600/600', JSON.stringify([]), 80, 4.7, 115],
      ['l7-nitro-750-full', '1 Kit L7 NITRO 750mg + Detox + Colágeno', 239.00, 'O combo definitivo: Emagrecimento potente, detoxificação e cuidado com a pele e articulações.', 'emagrecedores', 'https://picsum.photos/seed/l7nitro-full/600/600', JSON.stringify([]), 15, 5.0, 45],
      ['l7-turbo-500-full', '1 Kit L7 TURBO 500mg + Detox + Colágeno', 229.00, 'Emagreça com saúde e mantenha a firmeza da pele com este kit completo de L7 Turbo e Colágeno.', 'emagrecedores', 'https://picsum.photos/seed/l7turbo-full/600/600', JSON.stringify([]), 20, 4.9, 38]
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
} catch (e) {
  console.error("SQLite initialization failed:", e);
  db = null;
}

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.URL_Supabase;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
  console.log("Supabase integrated successfully.");
} else {
  console.warn("Supabase credentials missing. Using local SQLite only.");
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/api/health", async (req, res) => {
  let supabaseProductsCount = 0;
  let supabaseError = null;
  
  if (supabase) {
    try {
      const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
      supabaseProductsCount = count || 0;
      supabaseError = error;
    } catch (e: any) {
      supabaseError = e.message;
    }
  }

  res.json({ 
    status: "ok", 
    env: process.env.NODE_ENV, 
    supabase: !!supabase,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    sqlite: !!db,
    supabaseProductsCount,
    supabaseError
  });
});


  // API Routes
  // Seed Supabase if empty (Async)
  if (supabase) {
    (async () => {
      try {
      const { data: existingProducts, error: prodError } = await supabase.from('products').select('id').limit(1);
      if (!prodError && (!existingProducts || existingProducts.length === 0)) {
        console.log("Seeding Supabase products...");
        const initialProducts = [
          { id: 'l7-ultra-450-kit', name: '1 Kit L7 ULTRA 450mg + Detox', price: 159.90, description: 'Combo completo para emagrecimento com L7 Ultra 450mg e Detox para resultados rápidos e naturais.', category: 'emagrecedores', image: 'https://picsum.photos/seed/l7ultra-kit/600/600', images: JSON.stringify(['https://picsum.photos/seed/l7ultra-kit1/600/600']), stock: 50, rating: 4.9, reviews: 156 },
          { id: 'l7-turbo-500-kit', name: 'Kit L7 TURBO 500mg + Detox', price: 189.90, description: 'Potencialize sua queima de gordura com o Kit L7 Turbo 500mg e Detox. Energia e saciedade.', category: 'emagrecedores', image: 'https://picsum.photos/seed/l7turbo-kit/600/600', images: JSON.stringify(['https://picsum.photos/seed/l7turbo-kit1/600/600']), stock: 40, rating: 4.8, reviews: 92 },
          { id: 'l7-ultra-450', name: 'L7 Ultra 450mg', price: 149.00, description: 'Inibidor de apetite natural com Laranja Moro, L-Carnitina e Psyllium para queima de gordura.', category: 'emagrecedores', image: 'https://picsum.photos/seed/l7ultra/600/600', images: JSON.stringify([]), stock: 100, rating: 4.9, reviews: 210 },
          { id: 'l7-nitro-750-kit', name: 'Kit L7 Nitro 750mg + Detox Shake', price: 199.90, description: 'A fórmula mais potente: L7 Nitro 750mg combinada com Detox Shake para resultados máximos.', category: 'emagrecedores', image: 'https://picsum.photos/seed/l7nitro-kit/600/600', images: JSON.stringify([]), stock: 25, rating: 5.0, reviews: 78 },
          { id: 'l7-nitro-750', name: 'L7 NITRO 750mg', price: 169.00, description: 'Máxima concentration para queima de gordura abdominal e controle total do apetite.', category: 'emagrecedores', image: 'https://picsum.photos/seed/l7nitro/600/600', images: JSON.stringify([]), stock: 60, rating: 4.9, reviews: 134 },
          { id: 'l7-turbo-500', name: 'L7 TURBO 500mg', price: 159.00, description: 'Equilíbrio perfeito entre energia e queima calórica para o seu dia a dia.', category: 'emagrecedores', image: 'https://picsum.photos/seed/l7turbo/600/600', images: JSON.stringify([]), stock: 80, rating: 4.7, reviews: 115 },
          { id: 'l7-nitro-750-full', name: '1 Kit L7 NITRO 750mg + Detox + Colágeno', price: 239.00, description: 'O combo definitivo: Emagrecimento potente, detoxificação e cuidado com a pele e articulações.', category: 'emagrecedores', image: 'https://picsum.photos/seed/l7nitro-full/600/600', images: JSON.stringify([]), stock: 15, rating: 5.0, reviews: 45 },
          { id: 'l7-turbo-500-full', name: '1 Kit L7 TURBO 500mg + Detox + Colágeno', price: 229.00, description: 'Emagreça com saúde e mantenha a firmeza da pele com este kit completo de L7 Turbo e Colágeno.', category: 'emagrecedores', image: 'https://picsum.photos/seed/l7turbo-full/600/600', images: JSON.stringify([]), stock: 20, rating: 4.9, reviews: 38 }
        ];
        await supabase.from('products').insert(initialProducts);
      }

      const { data: existingPosts, error: postError } = await supabase.from('posts').select('id').limit(1);
      if (!postError && (!existingPosts || existingPosts.length === 0)) {
        console.log("Seeding Supabase posts...");
        const initialPosts = [
          { id: '1', title: '5 Dicas de Alimentação para Ganho de Massa', excerpt: 'Descubra como estruturar sua dieta.', content: 'Conteúdo completo aqui...', category: 'alimentacao', author: 'Equipe Halex', date: '2024-03-01', image: 'https://picsum.photos/seed/food1/800/400', readTime: '5 min' },
          { id: '2', title: 'Treino de Pernas: O Guia Definitivo', excerpt: 'Não pule o dia de pernas!', content: 'Conteúdo completo aqui...', category: 'treino', author: 'Coach Halex', date: '2024-02-28', image: 'https://picsum.photos/seed/gym1/800/400', readTime: '8 min' },
          { id: '3', title: 'Dieta Flexível: Funciona Mesmo?', excerpt: 'Entenda os conceitos da dieta flexível.', content: 'Conteúdo completo aqui...', category: 'dieta', author: 'Nutri Halex', date: '2024-02-25', image: 'https://picsum.photos/seed/diet1/800/400', readTime: '6 min' }
        ];
        await supabase.from('posts').insert(initialPosts);
      }
    } catch (e) {
      console.error("Supabase seeding failed (likely tables not created yet):", e);
    }
  })();
}

  app.get("/api/products", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        return res.json(data.map(p => {
          let images = [];
          try {
            images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
          } catch (e) {
            images = [];
          }
          return { ...p, images };
        }));
      }
      if (error) console.error("Supabase products fetch error:", error);
    }
    
    if (db) {
      const products = db.prepare("SELECT * FROM products").all() as any[];
      const formattedProducts = products.map(p => ({
        ...p,
        images: p.images ? JSON.parse(p.images) : []
      }));
      return res.json(formattedProducts);
    }
    res.json([]);
  });

  app.get("/api/products/:id", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
      if (!error && data) {
        return res.json({
          ...data,
          images: typeof data.images === 'string' ? JSON.parse(data.images) : (data.images || [])
        });
      }
    }

    if (db) {
      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id) as any;
      if (product) {
        return res.json({
          ...product,
          images: product.images ? JSON.parse(product.images) : []
        });
      }
    }
    res.status(404).json({ error: "Product not found" });
  });

  app.get("/api/posts", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('posts').select('*');
      if (!error && data) {
        return res.json(data.map(p => ({ ...p, readTime: p.read_time })));
      }
      if (error) console.error("Supabase posts fetch error:", error);
    }
    if (db) {
      const posts = db.prepare("SELECT * FROM posts").all();
      return res.json(posts);
    }
    res.json([]);
  });

  app.get("/api/posts/:id", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('posts').select('*').eq('id', req.params.id).single();
      if (!error && data) {
        return res.json(data);
      }
    }
    if (db) {
      const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
      if (post) {
        return res.json(post);
      }
    }
    res.status(404).json({ error: "Post not found" });
  });

  app.get("/api/orders", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return res.json(data.map(o => ({
          ...o,
          items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
        })));
      }
    }
    if (db) {
      const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as any[];
      return res.json(orders.map(o => ({
        ...o,
        items: JSON.parse(o.items)
      })));
    }
    res.json([]);
  });

  // Admin API - Products
  app.post("/api/products", async (req, res) => {
    const { id, name, price, description, category, image, images, stock, rating, reviews } = req.body;
    const productData = { id, name, price, description, category, image, images: JSON.stringify(images || []), stock: stock || 0, rating: rating || 5, reviews: reviews || 0 };
    
    if (db) {
      db.prepare("INSERT INTO products (id, name, price, description, category, image, images, stock, rating, reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(id, name, price, description, category, image, productData.images, productData.stock, productData.rating, productData.reviews);
    }
    
    if (supabase) {
      const { error } = await supabase.from('products').upsert([productData]);
      if (error) console.error("Supabase product upsert error:", error);
    }
    
    res.json({ success: true });
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (db) {
      db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    }
    
    if (supabase) {
      await supabase.from('products').delete().eq('id', req.params.id);
    }
    
    res.json({ success: true });
  });

  app.put("/api/products/:id", async (req, res) => {
    const { name, price, description, category, image, images, stock, rating, reviews } = req.body;
    const productData = { 
      name, 
      price, 
      description, 
      category, 
      image, 
      images: typeof images === 'string' ? images : JSON.stringify(images || []), 
      stock: stock || 0, 
      rating: rating || 5, 
      reviews: reviews || 0 
    };
    
    if (db) {
      db.prepare("UPDATE products SET name = ?, price = ?, description = ?, category = ?, image = ?, images = ?, stock = ?, rating = ?, reviews = ? WHERE id = ?")
        .run(productData.name, productData.price, productData.description, productData.category, productData.image, productData.images, productData.stock, productData.rating, productData.reviews, req.params.id);
    }
    
    if (supabase) {
      const { error } = await supabase.from('products').update(productData).eq('id', req.params.id);
      if (error) console.error("Supabase product update error:", error);
    }
    
    res.json({ success: true });
  });

  // Admin API - Posts
  app.post("/api/posts", async (req, res) => {
    console.log("POST /api/posts - req.body:", req.body);
    const { id, title, excerpt, content, category, author, date, image, readTime } = req.body;
    const postData = { id, title, excerpt, content, category, author, date, image, read_time: readTime };
    
    try {
      if (db) {
        db.prepare("INSERT INTO posts (id, title, excerpt, content, category, author, date, image, readTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .run(id, title, excerpt, content, category, author, date, image, readTime);
      }
      
      if (supabase) {
        const { error } = await supabase.from('posts').upsert([postData]);
        if (error) throw error;
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving post:", error);
      res.status(500).json({ success: false, error: "Failed to save post" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    if (db) {
      db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    }
    
    if (supabase) {
      await supabase.from('posts').delete().eq('id', req.params.id);
    }
    
    res.json({ success: true });
  });

  app.put("/api/posts/:id", async (req, res) => {
    const { title, excerpt, content, category, author, date, image, readTime } = req.body;
    const postData = { title, excerpt, content, category, author, date, image, read_time: readTime };
    
    if (db) {
      db.prepare("UPDATE posts SET title = ?, excerpt = ?, content = ?, category = ?, author = ?, date = ?, image = ?, read_time = ? WHERE id = ?")
        .run(postData.title, postData.excerpt, postData.content, postData.category, postData.author, postData.date, postData.image, postData.read_time, req.params.id);
    }
    
    if (supabase) {
      await supabase.from('posts').update(postData).eq('id', req.params.id);
    }
    
    res.json({ success: true });
  });

  // InfinitePay Checkout
  app.get("/api/orders/:email", async (req, res) => {
  const { email } = req.params;
  try {
    let orders = [];
    if (supabase) {
      const { data, error } = await supabase.from('orders').select('*').eq('customer_email', email).order('created_at', { ascending: false });
      if (!error) orders = data;
    } else if (db) {
      orders = db.prepare("SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC").all(email);
    }
    res.json(orders.map(o => ({ ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items })));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.post("/api/checkout", async (req, res) => {
    const { items, total, customer_email } = req.body;
    
    // For L7Fitness, we only need the handle (InfiniteTag)
    const rawHandle = process.env.INFINITEPAY_HANDLE || "l7fitness";
    const handle = rawHandle.replace('$', '').trim();
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const orderNsu = String("L7-" + Date.now());
    
    // Save order to DB (SQLite + Supabase)
    const orderData = {
      id: "ord_" + Date.now(),
      order_nsu: orderNsu,
      customer_email: customer_email || 'guest@example.com',
      items: JSON.stringify(items),
      total: total,
      status: 'pending'
    };

    if (db) {
      db.prepare("INSERT INTO orders (id, order_nsu, customer_email, items, total, status) VALUES (?, ?, ?, ?, ?, ?)").run(
        orderData.id, orderData.order_nsu, orderData.customer_email, orderData.items, orderData.total, orderData.status
      );
    }

    if (supabase) {
      await supabase.from('orders').insert([orderData]);
    }

    try {
      // Real InfinitePay API Call (Public Checkout Links)
      const payload = {
        handle: handle,
        order_nsu: orderNsu,
        items: items.map((item: any) => ({
          description: String(item.name),
          quantity: parseInt(item.quantity),
          price: Math.round(parseFloat(item.price) * 100)
        })),
        itens: items.map((item: any) => ({
          description: String(item.name),
          quantity: parseInt(item.quantity),
          price: Math.round(parseFloat(item.price) * 100)
        })),
        redirect_url: `${appUrl}/checkout/success`,
        webhook_url: `${appUrl}/api/webhook-infinitepay`
      };

      console.log("InfinitePay Request Payload:", JSON.stringify(payload));

      const response = await axios.post("https://api.infinitepay.io/invoices/public/checkout/links", payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      const responseData = response.data;
      console.log("InfinitePay Response Data:", JSON.stringify(responseData));

      const checkoutUrl = responseData?.checkout_url || 
                          responseData?.url || 
                          responseData?.data?.checkout_url ||
                          responseData?.data?.url;
      
      if (checkoutUrl) {
        res.json({ url: checkoutUrl, id: checkoutUrl.split('/').pop() });
      } else {
        console.error("InfinitePay Link Missing. Full Response:", JSON.stringify(responseData));
        const apiError = responseData?.message || responseData?.error || "Estrutura de resposta desconhecida";
        throw new Error(`Link não encontrado. Resposta da API: ${apiError}`);
      }
    } catch (error: any) {
      const errorDetail = error.response?.data || error.message;
      console.error("InfinitePay Error Detail:", JSON.stringify(errorDetail));
      
      // Fallback to simulation
      res.json({ 
        url: `https://pay.infinitepay.io/${handle}/checkout-simulado`,
        id: "sim_" + Date.now(),
        simulated: true,
        debug_error: errorDetail
      });
    }
  });

  // InfinitePay Webhook Handler
  app.post("/api/webhook-infinitepay", async (req, res) => {
    const data = req.body;
    console.log("InfinitePay Webhook Received:", JSON.stringify(data));
    
    const orderNsu = data.order_nsu || data.data?.order_nsu;
    const status = (data.status === 'paid' || data.data?.status === 'paid') ? 'paid' : 'failed';

    if (orderNsu) {
      // Update SQLite
      if (db) {
        db.prepare("UPDATE orders SET status = ? WHERE order_nsu = ?").run(status, orderNsu);
      }
      
      // Update Supabase
      if (supabase) {
        await supabase.from('orders').update({ status }).eq('order_nsu', orderNsu);
      }
    }
    
    res.status(200).send("OK");
  });

  // Favorites API
  app.get("/api/favorites/:userId", async (req, res) => {
    const { userId } = req.params;
    if (supabase) {
      const { data, error } = await supabase.from('favorites').select('*').eq('user_id', userId);
      if (!error && data) return res.json(data);
    }
    if (db) {
      const favorites = db.prepare("SELECT * FROM favorites WHERE user_id = ?").all(userId);
      return res.json(favorites);
    }
    res.json([]);
  });

  app.post("/api/favorites", async (req, res) => {
    const { user_id, item_id, item_type } = req.body;
    const id = `fav_${Date.now()}`;
    try {
      if (db) {
        db.prepare("INSERT INTO favorites (id, user_id, item_id, item_type) VALUES (?, ?, ?, ?)").run(id, user_id, item_id, item_type);
      }
      if (supabase) {
        await supabase.from('favorites').upsert([{ id, user_id, item_id, item_type }]);
      }
      res.json({ success: true, id });
    } catch (e) {
      res.status(400).json({ error: "Already favorited or error" });
    }
  });

  app.delete("/api/favorites/:userId/:itemId", async (req, res) => {
    const { userId, itemId } = req.params;
    if (db) {
      db.prepare("DELETE FROM favorites WHERE user_id = ? AND item_id = ?").run(userId, itemId);
    }
    if (supabase) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('item_id', itemId);
    }
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    (async () => {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    })();
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

export default app;
