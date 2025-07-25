// const express = require('express');
// const cors = require('cors');
// const sqlite3 = require('sqlite3').verbose();
// const app = express();
// const PORT = 5000;

// // Connect to SQLite DB (creates file if not exists)
// const db = new sqlite3.Database('./inventory.db');

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Create tables (add location and createdAt if not present)
// db.serialize(() => {
//   db.run(`
//     CREATE TABLE IF NOT EXISTS categories (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT,
//       parentId INTEGER
//     )
//   `);
//   db.run(`
//     CREATE TABLE IF NOT EXISTS parts (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT,
//       partNumber TEXT,
//       package TEXT,
//       categoryId INTEGER,
//       description TEXT,
//       inStock INTEGER,
//       minimumStock INTEGER,
//       location TEXT,
//       createdAt TEXT,
//       comments TEXT
//     )
//   `);
//   // Add missing columns if upgrading
//   db.get("PRAGMA table_info(parts)", (err, info) => {
//     db.all("PRAGMA table_info(parts)", (err, columns) => {
//       const colNames = columns.map(c => c.name);
//       if (!colNames.includes('location')) {
//         db.run('ALTER TABLE parts ADD COLUMN location TEXT');
//       }
//       if (!colNames.includes('createdAt')) {
//         db.run('ALTER TABLE parts ADD COLUMN createdAt TEXT');
//       }
//     });
//   });
// });

// // --- API ROUTES ---

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK' });
// });

// // Get all parts
// app.get('/api/parts', (req, res) => {
//   db.all('SELECT * FROM parts', [], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// });

// // Add new part
// app.post('/api/parts', (req, res) => {
//   const p = req.body;
//   const createdAt = p.createdAt || new Date().toISOString();
//   const stmt = db.prepare(`
//     INSERT INTO parts (name, partNumber, package, categoryId, description, inStock, minimumStock, location, createdAt, comments)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `);
//   stmt.run([
//     p.name, p.partNumber, p.package, p.categoryId, p.description, p.inStock, p.minimumStock, p.location, createdAt, p.comments
//   ], function (err) {
//     if (err) return res.status(500).json({ error: err.message });
//     console.log(`[ADD PART] id=${this.lastID} name=${p.name}`);
//     res.json({ id: this.lastID });
//   });
// });

// // Edit part
// app.put('/api/parts/:id', (req, res) => {
//   const p = req.body;
//   const id = req.params.id;
//   const stmt = db.prepare(`
//     UPDATE parts SET name=?, partNumber=?, package=?, categoryId=?, description=?, inStock=?, minimumStock=?, location=?, comments=? WHERE id=?
//   `);
//   stmt.run([
//     p.name, p.partNumber, p.package, p.categoryId, p.description, p.inStock, p.minimumStock, p.location, p.comments, id
//   ], function (err) {
//     if (err) return res.status(500).json({ error: err.message });
//     console.log(`[EDIT PART] id=${id} name=${p.name}`);
//     res.json({ updated: true });
//   });
// });

// // Delete part
// app.delete('/api/parts/:id', (req, res) => {
//   db.run(`DELETE FROM parts WHERE id = ?`, [req.params.id], function (err) {
//     if (err) return res.status(500).json({ error: err.message });
//     console.log(`[DELETE PART] id=${req.params.id}`);
//     res.json({ deleted: true });
//   });
// });

// // Add category
// app.post('/api/categories', (req, res) => {
//   const { name, parentId } = req.body;
//   db.run(`INSERT INTO categories (name, parentId) VALUES (?, ?)`, [name, parentId], function (err) {
//     if (err) return res.status(500).json({ error: err.message });
//     console.log(`[ADD CATEGORY] id=${this.lastID} name=${name}`);
//     res.json({ id: this.lastID });
//   });
// });

// // Get all categories
// app.get('/api/categories', (req, res) => {
//   db.all('SELECT * FROM categories', [], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// });

// // 🗑 DELETE category by ID
// app.delete('/api/categories/:id', (req, res) => {
//   const categoryId = req.params.id;

//   // First: check for any child categories
//   db.get(`SELECT COUNT(*) as count FROM categories WHERE parentId = ?`, [categoryId], (err, result) => {
//     if (err) {
//       console.error('[DELETE CATEGORY] DB error (children check):', err);
//       return res.status(500).json({ error: err.message });
//     }

//     if (result.count > 0) {
//       console.warn(`[DELETE CATEGORY] id=${categoryId} failed: has subcategories.`);
//       return res.status(400).json({ error: "Cannot delete category with subcategories." });
//     }

//     // Then: check if any parts are using this category
//     db.get(`SELECT COUNT(*) as count FROM parts WHERE categoryId = ?`, [categoryId], (err2, result2) => {
//       if (err2) {
//         console.error('[DELETE CATEGORY] DB error (parts check):', err2);
//         return res.status(500).json({ error: err2.message });
//       }

//       if (result2.count > 0) {
//         console.warn(`[DELETE CATEGORY] id=${categoryId} failed: in use by parts.`);
//         return res.status(400).json({ error: "Cannot delete category in use by parts." });
//       }

//       // If no children or parts, delete category
//       db.run(`DELETE FROM categories WHERE id = ?`, [categoryId], function (err3) {
//         if (err3) {
//           console.error('[DELETE CATEGORY] DB error (delete):', err3);
//           return res.status(500).json({ error: err3.message });
//         }
//         console.log(`[DELETE CATEGORY] id=${categoryId} deleted.`);
//         res.json({ deleted: true });
//       });
//     });
//   });
// });

// app.listen(PORT, () => {
//   console.log(`✅ Backend API running on http://localhost:${PORT}`);
// });


const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 5000;

// Connect to SQLite DB
const db = new sqlite3.Database('./inventory.db');

// Middleware
app.use(cors());
app.use(express.json());

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      parentId INTEGER
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      partNumber TEXT,
      package TEXT,
      categoryId INTEGER,
      description TEXT,
      inStock INTEGER,
      minimumStock INTEGER,
      location TEXT,
      volts TEXT,
      createdAt TEXT,
      comments TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS fastenerCategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      parentId INTEGER
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS fasteners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      headShape TEXT,
      head TEXT,
      diameter TEXT,
      length TEXT,
      washer TEXT,
      material TEXT,
      od TEXT,
      id_dimension TEXT,
      thickness TEXT,
      plating TEXT,
      color TEXT,
      description TEXT,
      location TEXT,
      inStock INTEGER,
      minimumStock INTEGER,
      categoryId INTEGER
    )
  `);
  
  db.all("PRAGMA table_info(parts)", (err, columns) => {
    const colNames = columns.map(c => c.name);
    if (!colNames.includes('location')) {
      db.run('ALTER TABLE parts ADD COLUMN location TEXT');
    }
    if (!colNames.includes('createdAt')) {
      db.run('ALTER TABLE parts ADD COLUMN createdAt TEXT');
    }
    if (!colNames.includes('volts')) {
      db.run('ALTER TABLE parts ADD COLUMN volts TEXT');
    }
  });
  db.all("PRAGMA table_info(fasteners)", (err, columns) => {
    const colNames = columns.map(c => c.name);
    if (!colNames.includes('minimumStock')) {
      db.run('ALTER TABLE fasteners ADD COLUMN minimumStock INTEGER');
    }
    if (!colNames.includes('categoryId')) {
      db.run('ALTER TABLE fasteners ADD COLUMN categoryId INTEGER');
    }
    if (!colNames.includes('headShape')) {
      db.run('ALTER TABLE fasteners ADD COLUMN headShape TEXT');
    }
    if (!colNames.includes('head')) {
      db.run('ALTER TABLE fasteners ADD COLUMN head TEXT');
    }
    if (!colNames.includes('diameter')) {
      db.run('ALTER TABLE fasteners ADD COLUMN diameter TEXT');
    }
    if (!colNames.includes('length')) {
      db.run('ALTER TABLE fasteners ADD COLUMN length TEXT');
    }
    if (!colNames.includes('washer')) {
      db.run('ALTER TABLE fasteners ADD COLUMN washer TEXT');
    }
    if (!colNames.includes('location')) {
      db.run('ALTER TABLE fasteners ADD COLUMN location TEXT');
    }
  });
});

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// =====================
// 🔧 PART ROUTES
// =====================

app.get('/api/parts', (req, res) => {
  db.all('SELECT * FROM parts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/parts', (req, res) => {
  const p = req.body;
  const createdAt = p.createdAt || new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO parts (name, partNumber, package, categoryId, description, inStock, minimumStock, location, volts, createdAt, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    p.name, p.partNumber, p.package, p.categoryId, p.description,
    p.inStock, p.minimumStock, p.location, p.volts, createdAt, p.comments
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    console.log(`[ADD PART] id=${this.lastID} name=${p.name}`);
    res.json({ id: this.lastID });
  });
});

app.put('/api/parts/:id', (req, res) => {
  const id = req.params.id;
  const p = req.body;
  const stmt = db.prepare(`
    UPDATE parts SET name=?, partNumber=?, package=?, categoryId=?, description=?, inStock=?, minimumStock=?, location=?, volts=?, comments=? WHERE id=?
  `);
  stmt.run([
    p.name, p.partNumber, p.package, p.categoryId, p.description,
    p.inStock, p.minimumStock, p.location, p.volts, p.comments, id
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    console.log(`[EDIT PART] id=${id} name=${p.name}`);
    res.json({ updated: true });
  });
});

app.delete('/api/parts/:id', (req, res) => {
  db.run(`DELETE FROM parts WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    console.log(`[DELETE PART] id=${req.params.id}`);
    res.json({ deleted: true });
  });
});

// =====================
// 🔧 CATEGORY ROUTES
// =====================

app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/categories', (req, res) => {
  const { name, parentId } = req.body;
  db.run(`INSERT INTO categories (name, parentId) VALUES (?, ?)`, [name, parentId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    console.log(`[ADD CATEGORY] id=${this.lastID} name=${name}`);
    res.json({ id: this.lastID });
  });
});

// 🗑 DELETE category by ID (with safety checks)
app.delete('/api/categories/:id', (req, res) => {
  const categoryId = req.params.id;

  db.get(`SELECT COUNT(*) as count FROM categories WHERE parentId = ?`, [categoryId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.count > 0) {
      console.warn(`[DELETE CATEGORY] id=${categoryId} failed: has subcategories.`);
      return res.status(400).json({ error: "Cannot delete category with subcategories." });
    }

    db.get(`SELECT COUNT(*) as count FROM parts WHERE categoryId = ?`, [categoryId], (err2, result2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (result2.count > 0) {
        console.warn(`[DELETE CATEGORY] id=${categoryId} failed: in use by parts.`);
        return res.status(400).json({ error: "Cannot delete category in use by parts." });
      }

      db.run(`DELETE FROM categories WHERE id = ?`, [categoryId], function (err3) {
        if (err3) return res.status(500).json({ error: err3.message });
        console.log(`[DELETE CATEGORY] id=${categoryId} deleted.`);
        res.json({ deleted: true });
      });
    });
  });
});

// ✏️ PUT (Edit category name)
app.put('/api/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  const { name } = req.body;

  db.run(`UPDATE categories SET name = ? WHERE id = ?`, [name, categoryId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Category not found" });
    console.log(`[EDIT CATEGORY] id=${categoryId} renamed to ${name}`);
    res.json({ updated: true });
  });
});

// =====================
// 🔧 FASTENER ROUTES
// =====================

app.get('/api/fasteners', (req, res) => {
  console.log('GET /api/fasteners called');
  db.all('SELECT * FROM fasteners', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/fasteners', (req, res) => {
  const f = req.body;
  db.run(`
    INSERT INTO fasteners (name, headShape, head, diameter, length, washer, material, od, id_dimension, thickness, plating, color, description, location, inStock, minimumStock, categoryId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [f.name, f.headShape, f.head, f.diameter, f.length, f.washer, f.material, f.od, f.id_dimension, f.thickness, f.plating, f.color, f.description, f.location, f.inStock, f.minimumStock, f.categoryId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

app.put('/api/fasteners/:id', (req, res) => {
  const id = req.params.id;
  const f = req.body;
  db.run(`
    UPDATE fasteners SET name=?, headShape=?, head=?, diameter=?, length=?, washer=?, material=?, od=?, id_dimension=?, thickness=?, plating=?, color=?, description=?, location=?, inStock=?, minimumStock=?, categoryId=? WHERE id=?`,
    [f.name, f.headShape, f.head, f.diameter, f.length, f.washer, f.material, f.od, f.id_dimension, f.thickness, f.plating, f.color, f.description, f.location, f.inStock, f.minimumStock, f.categoryId, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: true });
    });
});

app.delete('/api/fasteners/:id', (req, res) => {
  db.run('DELETE FROM fasteners WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: true });
  });
});



// =====================
// 🔧 FASTENER CATEGORIES
// =====================

// Create table if not exists (do this inside your DB init block if not already there)
// ✅ GET all fastener categories
app.get('/api/fastener-categories', (req, res) => {
  db.all('SELECT * FROM fastenerCategories', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ ADD a fastener category
app.post('/api/fastener-categories', (req, res) => {
  const { name, parentId } = req.body;
  db.run(
    'INSERT INTO fastenerCategories (name, parentId) VALUES (?, ?)',
    [name, parentId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      console.log(`[ADD FASTENER CATEGORY] id=${this.lastID} name=${name}`);
      res.json({ id: this.lastID });
    });
});

// ✅ UPDATE a fastener category
app.put('/api/fastener-categories/:id', (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  db.run(
    'UPDATE fastenerCategories SET name = ? WHERE id = ?',
    [name, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Category not found' });
      console.log(`[EDIT FASTENER CATEGORY] id=${id} name=${name}`);
      res.json({ updated: true });
    }
  );
});

// ✅ DELETE a fastener category (with checks for children or usage)
// app.delete('/api/fastener-categories/:id', (req, res) => {
//   const id = req.params.id;

//   db.get('SELECT COUNT(*) AS count FROM fastenerCategories WHERE parentId = ?', [id], (err, row) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (row.count > 0) {
//       return res.status(400).json({ error: 'Cannot delete category with subcategories.' });
//     }

//     db.get('SELECT COUNT(*) AS count FROM fasteners WHERE categoryId = ?', [id], (err2, row2) => {
//       if (err2) return res.status(500).json({ error: err2.message });
//       if (row2.count > 0) {
//         return res.status(400).json({ error: 'Cannot delete category in use by fasteners.' });
//       }

//       db.run('DELETE FROM fastenerCategories WHERE id = ?', [id], function (err3) {
//         if (err3) return res.status(500).json({ error: err3.message });
//         console.log(`[DELETE FASTENER CATEGORY] id=${id}`);
//         res.json({ deleted: true });
//       });
//     });
//   });
// });

// DELETE fastener category (with subcategory + usage check)
app.delete('/api/fastener-categories/:id', (req, res) => {
  const categoryId = req.params.id;

  // 1. Check if it has subcategories
  db.get(`SELECT COUNT(*) as count FROM fastenerCategories WHERE parentId = ?`, [categoryId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.count > 0) {
      console.warn(`[DELETE FASTENER CATEGORY] id=${categoryId} failed: has subcategories.`);
      return res.status(400).json({ error: "Cannot delete category with subcategories." });
    }

    // 2. Check if it’s in use by fasteners
    db.get(`SELECT COUNT(*) as count FROM fasteners WHERE categoryId = ?`, [categoryId], (err2, result2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (result2.count > 0) {
        console.warn(`[DELETE FASTENER CATEGORY] id=${categoryId} failed: in use by fasteners.`);
        return res.status(400).json({ error: "Cannot delete category in use by fasteners." });
      }

      // 3. Delete if safe
      db.run(`DELETE FROM fastenerCategories WHERE id = ?`, [categoryId], function (err3) {
        if (err3) return res.status(500).json({ error: err3.message });
        console.log(`[DELETE FASTENER CATEGORY] id=${categoryId} deleted.`);
        res.json({ deleted: true });
      });
    });
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend API running on http://localhost:${PORT}`);
});