import express from "express";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("halex.db");

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
  console.log("Supabase integrated successfully.");
} else {
  console.warn("Supabase credentials missing. Using local SQLite only.");
}

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
    item_type TEXT NOT NULL, -- 'product' or 'post'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id, item_type)
  );
`);

// Migration: Add missing columns if they don't exist
try {
  db.exec("ALTER TABLE products ADD COLUMN images TEXT");
} catch (e) {
  // Column already exists or other error
}
try {
  db.exec("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0");
} catch (e) {
  // Column already exists or other error
}

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

const app = express();

async function startServer() {
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.get("/api/products", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data && data.length > 0) {
        return res.json(data.map(p => ({
          ...p,
          images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || [])
        })));
      }
    }
    
    const products = db.prepare("SELECT * FROM products").all() as any[];
    const formattedProducts = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    }));
    res.json(formattedProducts);
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

    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id) as any;
    if (product) {
      res.json({
        ...product,
        images: product.images ? JSON.parse(product.images) : []
      });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  app.get("/api/posts", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('posts').select('*');
      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    }
    const posts = db.prepare("SELECT * FROM posts").all();
    res.json(posts);
  });

  app.get("/api/posts/:id", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('posts').select('*').eq('id', req.params.id).single();
      if (!error && data) {
        return res.json(data);
      }
    }
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
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
    const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as any[];
    res.json(orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    })));
  });

  // Admin API - Products
  app.post("/api/products", async (req, res) => {
    const { id, name, price, description, category, image, images, stock, rating, reviews } = req.body;
    const productData = { id, name, price, description, category, image, images: JSON.stringify(images || []), stock: stock || 0, rating: rating || 5, reviews: reviews || 0 };
    
    db.prepare("INSERT INTO products (id, name, price, description, category, image, images, stock, rating, reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, price, description, category, image, productData.images, productData.stock, productData.rating, productData.reviews);
    
    if (supabase) {
      await supabase.from('products').upsert([productData]);
    }
    
    res.json({ success: true });
  });

  app.delete("/api/products/:id", async (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    
    if (supabase) {
      await supabase.from('products').delete().eq('id', req.params.id);
    }
    
    res.json({ success: true });
  });

  app.put("/api/products/:id", async (req, res) => {
    const { name, price, description, category, image, images, stock, rating, reviews } = req.body;
    const productData = { name, price, description, category, image, images: JSON.stringify(images || []), stock: stock || 0, rating: rating || 5, reviews: reviews || 0 };
    
    db.prepare("UPDATE products SET name = ?, price = ?, description = ?, category = ?, image = ?, images = ?, stock = ?, rating = ?, reviews = ? WHERE id = ?")
      .run(productData.name, productData.price, productData.description, productData.category, productData.image, productData.images, productData.stock, productData.rating, productData.reviews, req.params.id);
    
    if (supabase) {
      await supabase.from('products').update(productData).eq('id', req.params.id);
    }
    
    res.json({ success: true });
  });

  // Admin API - Posts
  app.post("/api/posts", async (req, res) => {
    const { id, title, excerpt, content, category, author, date, image, readTime } = req.body;
    const postData = { id, title, excerpt, content, category, author, date, image, readTime };
    
    db.prepare("INSERT INTO posts (id, title, excerpt, content, category, author, date, image, readTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, title, excerpt, content, category, author, date, image, readTime);
    
    if (supabase) {
      await supabase.from('posts').upsert([postData]);
    }
    
    res.json({ success: true });
  });

  app.delete("/api/posts/:id", async (req, res) => {
    db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    
    if (supabase) {
      await supabase.from('posts').delete().eq('id', req.params.id);
    }
    
    res.json({ success: true });
  });

  app.put("/api/posts/:id", async (req, res) => {
    const { title, excerpt, content, category, author, date, image, readTime } = req.body;
    const postData = { title, excerpt, content, category, author, date, image, readTime };
    
    db.prepare("UPDATE posts SET title = ?, excerpt = ?, content = ?, category = ?, author = ?, date = ?, image = ?, readTime = ? WHERE id = ?")
      .run(postData.title, postData.excerpt, postData.content, postData.category, postData.author, postData.date, postData.image, postData.readTime, req.params.id);
    
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
    } else {
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

    db.prepare("INSERT INTO orders (id, order_nsu, customer_email, items, total, status) VALUES (?, ?, ?, ?, ?, ?)").run(
      orderData.id, orderData.order_nsu, orderData.customer_email, orderData.items, orderData.total, orderData.status
    );

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
      db.prepare("UPDATE orders SET status = ? WHERE order_nsu = ?").run(status, orderNsu);
      
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
    const favorites = db.prepare("SELECT * FROM favorites WHERE user_id = ?").all(userId);
    res.json(favorites);
  });

  app.post("/api/favorites", async (req, res) => {
    const { user_id, item_id, item_type } = req.body;
    const id = `fav_${Date.now()}`;
    try {
      db.prepare("INSERT INTO favorites (id, user_id, item_id, item_type) VALUES (?, ?, ?, ?)").run(id, user_id, item_id, item_type);
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
    db.prepare("DELETE FROM favorites WHERE user_id = ? AND item_id = ?").run(userId, itemId);
    if (supabase) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('item_id', itemId);
    }
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

  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
