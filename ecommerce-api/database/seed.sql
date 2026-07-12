-- ============================================================
-- Seed Data — untuk development & testing
-- ============================================================

-- Admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role) VALUES
  ('admin@ecommerce.test', '$2a$10$dummyhashwillbereplaced', 'Admin Ecommerce', 'admin');

-- Customer user (password: customer123)
INSERT INTO users (email, password_hash, full_name, role) VALUES
  ('customer@ecommerce.test', '$2a$10$dummyhashwillbereplaced', 'John Doe', 'customer');

-- Categories
INSERT INTO categories (name, slug, description) VALUES
  ('Elektronik', 'elektronik', 'Produk elektronik & gadget'),
  ('Pakaian', 'pakaian', 'Fashion & apparel'),
  ('Rumah Tangga', 'rumah-tangga', 'Peralatan rumah tangga');

-- Products
INSERT INTO products (name, slug, description, price, stock, sku, category_id, image_url) VALUES
  ('Laptop Pro 15"', 'laptop-pro-15', 'Laptop performa tinggi untuk profesional', 15000000, 25, 'LP-15-001',
   (SELECT id FROM categories WHERE slug = 'elektronik'), 'https://placehold.co/600x400'),
  ('Wireless Headphone', 'wireless-headphone', 'Headphone bluetooth noise cancelling', 1200000, 100, 'WH-001',
   (SELECT id FROM categories WHERE slug = 'elektronik'), 'https://placehold.co/600x400'),
  ('Kaos Basic Premium', 'kaos-basic-premium', 'Kaos katun combed 30s', 150000, 200, 'KS-001',
   (SELECT id FROM categories WHERE slug = 'pakaian'), 'https://placehold.co/600x400'),
  ('Set Panci Anti Lengket', 'set-panci-anti-lengket', 'Set panci 5 pcs anti lengket', 450000, 50, 'RT-001',
   (SELECT id FROM categories WHERE slug = 'rumah-tangga'), 'https://placehold.co/600x400');
