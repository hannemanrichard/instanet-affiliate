-- Seed Reference Data for Design-Centric Platform
-- Migration: 007_seed_reference_data.sql
-- This migration populates essential reference data for the new schema

-- ==============================================
-- 1. SEED CATEGORIES
-- ==============================================

INSERT INTO categories (name, description, is_active) VALUES
('Apparel', 'Clothing and garments', true),
('Accessories', 'Non-clothing items', true),
('Home & Living', 'Home decor and living items', true);

-- Subcategories
INSERT INTO categories (name, description, parent_id, is_active) VALUES
('Tops', 'Upper body garments', (SELECT id FROM categories WHERE name = 'Apparel'), true),
('Bottoms', 'Lower body garments', (SELECT id FROM categories WHERE name = 'Apparel'), true),
('Outerwear', 'Jackets, hoodies, and coats', (SELECT id FROM categories WHERE name = 'Apparel'), true),
('Accessories', 'Hats, bags, and other accessories', (SELECT id FROM categories WHERE name = 'Apparel'), true);

-- ==============================================
-- 2. SEED DESIGN CATEGORIES
-- ==============================================

INSERT INTO design_categories (name, description, is_active) VALUES
('Anime & Manga', 'Japanese animation and comic designs', true),
('Sports', 'Team logos, sports themes', true),
('Abstract', 'Geometric and abstract art', true),
('Text & Typography', 'Text-based designs and quotes', true),
('Nature', 'Animals, plants, landscapes', true),
('Pop Culture', 'Movies, TV shows, celebrities', true),
('Gaming', 'Video game characters and themes', true),
('Minimalist', 'Simple, clean designs', true);

-- ==============================================
-- 3. SEED COLORS
-- ==============================================

INSERT INTO colors (name, hex_code, is_active) VALUES
('Black', '#000000', true),
('White', '#FFFFFF', true),
('Red', '#FF0000', true),
('Blue', '#0000FF', true),
('Green', '#008000', true),
('Yellow', '#FFFF00', true),
('Orange', '#FFA500', true),
('Purple', '#800080', true),
('Pink', '#FFC0CB', true),
('Gray', '#808080', true),
('Navy', '#000080', true),
('Maroon', '#800000', true);

-- ==============================================
-- 4. SEED SIZES
-- ==============================================

INSERT INTO sizes (name, sort_order, is_active) VALUES
('XS', 1, true),
('S', 2, true),
('M', 3, true),
('L', 4, true),
('XL', 5, true),
('XXL', 6, true),
('XXXL', 7, true);

-- ==============================================
-- 5. SEED DESIGN TYPES
-- ==============================================

INSERT INTO design_types (name, description, is_active) VALUES
('Graphic', 'Illustrated designs and artwork', true),
('Text', 'Typography and text-based designs', true),
('Logo', 'Brand logos and symbols', true),
('Pattern', 'Repeating patterns and textures', true),
('Photo', 'Photographic designs', true),
('Vector', 'Scalable vector graphics', true);

-- ==============================================
-- 6. SEED PRODUCT TEMPLATES
-- ==============================================

INSERT INTO product_templates (name, description, category_id, base_weight, base_cost, is_active) VALUES
('Classic T-Shirt', 'Basic cotton t-shirt', (SELECT id FROM categories WHERE name = 'Tops'), 150.00, 5.50, true),
('Premium T-Shirt', 'High-quality cotton t-shirt', (SELECT id FROM categories WHERE name = 'Tops'), 180.00, 7.50, true),
('Hoodie', 'Pullover hoodie with pocket', (SELECT id FROM categories WHERE name = 'Outerwear'), 500.00, 15.00, true),
('Tank Top', 'Sleeveless cotton tank', (SELECT id FROM categories WHERE name = 'Tops'), 120.00, 4.50, true),
('Long Sleeve T-Shirt', 'Long sleeve cotton shirt', (SELECT id FROM categories WHERE name = 'Tops'), 200.00, 8.00, true),
('Sweatshirt', 'Fleece sweatshirt', (SELECT id FROM categories WHERE name = 'Outerwear'), 400.00, 12.00, true);

-- ==============================================
-- 7. SEED PRODUCT TEMPLATE COLORS
-- ==============================================

-- Classic T-Shirt colors
INSERT INTO product_template_colors (product_template_id, color_id, is_available)
SELECT pt.id, c.id, true
FROM product_templates pt, colors c
WHERE pt.name = 'Classic T-Shirt' 
AND c.name IN ('Black', 'White', 'Red', 'Blue', 'Green', 'Navy', 'Gray');

-- Premium T-Shirt colors
INSERT INTO product_template_colors (product_template_id, color_id, is_available)
SELECT pt.id, c.id, true
FROM product_templates pt, colors c
WHERE pt.name = 'Premium T-Shirt' 
AND c.name IN ('Black', 'White', 'Red', 'Blue', 'Green', 'Navy', 'Gray', 'Maroon');

-- Hoodie colors
INSERT INTO product_template_colors (product_template_id, color_id, is_available)
SELECT pt.id, c.id, true
FROM product_templates pt, colors c
WHERE pt.name = 'Hoodie' 
AND c.name IN ('Black', 'White', 'Red', 'Blue', 'Green', 'Navy', 'Gray');

-- Tank Top colors
INSERT INTO product_template_colors (product_template_id, color_id, is_available)
SELECT pt.id, c.id, true
FROM product_templates pt, colors c
WHERE pt.name = 'Tank Top' 
AND c.name IN ('Black', 'White', 'Red', 'Blue', 'Pink');

-- Long Sleeve T-Shirt colors
INSERT INTO product_template_colors (product_template_id, color_id, is_available)
SELECT pt.id, c.id, true
FROM product_templates pt, colors c
WHERE pt.name = 'Long Sleeve T-Shirt' 
AND c.name IN ('Black', 'White', 'Red', 'Blue', 'Green', 'Navy', 'Gray');

-- Sweatshirt colors
INSERT INTO product_template_colors (product_template_id, color_id, is_available)
SELECT pt.id, c.id, true
FROM product_templates pt, colors c
WHERE pt.name = 'Sweatshirt' 
AND c.name IN ('Black', 'White', 'Red', 'Blue', 'Green', 'Navy', 'Gray');

-- ==============================================
-- 8. SEED PRODUCT TEMPLATE SIZES
-- ==============================================

-- All templates get all sizes
INSERT INTO product_template_sizes (product_template_id, size_id, is_available)
SELECT pt.id, s.id, true
FROM product_templates pt, sizes s
WHERE pt.is_active = true AND s.is_active = true;

-- ==============================================
-- 9. SEED PRINT AREAS
-- ==============================================

-- T-Shirt print areas
INSERT INTO product_template_print_areas (product_template_id, area_name, width_cm, height_cm, position_x, position_y, is_active)
SELECT pt.id, 'Front', 30.0, 35.0, 0, 0, true
FROM product_templates pt
WHERE pt.name IN ('Classic T-Shirt', 'Premium T-Shirt', 'Long Sleeve T-Shirt');

INSERT INTO product_template_print_areas (product_template_id, area_name, width_cm, height_cm, position_x, position_y, is_active)
SELECT pt.id, 'Back', 30.0, 35.0, 0, 0, true
FROM product_templates pt
WHERE pt.name IN ('Classic T-Shirt', 'Premium T-Shirt', 'Long Sleeve T-Shirt');

-- Hoodie print areas
INSERT INTO product_template_print_areas (product_template_id, area_name, width_cm, height_cm, position_x, position_y, is_active)
SELECT pt.id, 'Front', 30.0, 35.0, 0, 0, true
FROM product_templates pt
WHERE pt.name = 'Hoodie';

INSERT INTO product_template_print_areas (product_template_id, area_name, width_cm, height_cm, position_x, position_y, is_active)
SELECT pt.id, 'Back', 30.0, 35.0, 0, 0, true
FROM product_templates pt
WHERE pt.name = 'Hoodie';

-- Tank Top print areas
INSERT INTO product_template_print_areas (product_template_id, area_name, width_cm, height_cm, position_x, position_y, is_active)
SELECT pt.id, 'Front', 25.0, 30.0, 0, 0, true
FROM product_templates pt
WHERE pt.name = 'Tank Top';

-- Sweatshirt print areas
INSERT INTO product_template_print_areas (product_template_id, area_name, width_cm, height_cm, position_x, position_y, is_active)
SELECT pt.id, 'Front', 30.0, 35.0, 0, 0, true
FROM product_templates pt
WHERE pt.name = 'Sweatshirt';

INSERT INTO product_template_print_areas (product_template_id, area_name, width_cm, height_cm, position_x, position_y, is_active)
SELECT pt.id, 'Back', 30.0, 35.0, 0, 0, true
FROM product_templates pt
WHERE pt.name = 'Sweatshirt';

-- ==============================================
-- 10. SEED SAMPLE DESIGNS
-- ==============================================

INSERT INTO designs (title, description, design_type_id, design_category_id, design_file_url, thumbnail_url, is_public, is_featured, created_at)
SELECT 
  'Luffy Gear 5',
  'One Piece Luffy in Gear 5 transformation',
  dt.id,
  dc.id,
  'https://example.com/designs/luffy-gear5.ai',
  'https://example.com/thumbnails/luffy-gear5.jpg',
  true,
  true,
  NOW()
FROM design_types dt, design_categories dc
WHERE dt.name = 'Graphic' AND dc.name = 'Anime & Manga';

INSERT INTO designs (title, description, design_type_id, design_category_id, design_file_url, thumbnail_url, is_public, is_featured, created_at)
SELECT 
  'Lakers Logo',
  'Los Angeles Lakers team logo',
  dt.id,
  dc.id,
  'https://example.com/designs/lakers-logo.ai',
  'https://example.com/thumbnails/lakers-logo.jpg',
  true,
  true,
  NOW()
FROM design_types dt, design_categories dc
WHERE dt.name = 'Logo' AND dc.name = 'Sports';

INSERT INTO designs (title, description, design_type_id, design_category_id, design_file_url, thumbnail_url, is_public, is_featured, created_at)
SELECT 
  'Minimalist Mountain',
  'Simple mountain silhouette design',
  dt.id,
  dc.id,
  'https://example.com/designs/minimalist-mountain.ai',
  'https://example.com/thumbnails/minimalist-mountain.jpg',
  true,
  false,
  NOW()
FROM design_types dt, design_categories dc
WHERE dt.name = 'Graphic' AND dc.name = 'Minimalist';

-- ==============================================
-- 11. SEED SAMPLE DESIGN PRODUCTS
-- ==============================================

-- Luffy Gear 5 on Classic T-Shirt
INSERT INTO design_products (design_id, product_template_id, name, description, retail_price, wholesale_price, retail_commission, wholesale_commission, is_active, is_featured)
SELECT 
  d.id,
  pt.id,
  'Luffy Gear 5 Classic T-Shirt',
  'One Piece Luffy Gear 5 transformation on classic cotton t-shirt',
  24.99,
  19.99,
  15.0,
  10.0,
  true,
  true
FROM designs d, product_templates pt
WHERE d.title = 'Luffy Gear 5' AND pt.name = 'Classic T-Shirt';

-- Lakers Logo on Hoodie
INSERT INTO design_products (design_id, product_template_id, name, description, retail_price, wholesale_price, retail_commission, wholesale_commission, is_active, is_featured)
SELECT 
  d.id,
  pt.id,
  'Lakers Logo Hoodie',
  'Los Angeles Lakers logo on premium hoodie',
  45.99,
  35.99,
  15.0,
  10.0,
  true,
  true
FROM designs d, product_templates pt
WHERE d.title = 'Lakers Logo' AND pt.name = 'Hoodie';

-- Minimalist Mountain on Premium T-Shirt
INSERT INTO design_products (design_id, product_template_id, name, description, retail_price, wholesale_price, retail_commission, wholesale_commission, is_active, is_featured)
SELECT 
  d.id,
  pt.id,
  'Minimalist Mountain Premium T-Shirt',
  'Simple mountain design on premium cotton t-shirt',
  29.99,
  23.99,
  15.0,
  10.0,
  true,
  false
FROM designs d, product_templates pt
WHERE d.title = 'Minimalist Mountain' AND pt.name = 'Premium T-Shirt';

-- ==============================================
-- 12. SEED INITIAL PHYSICAL INVENTORY
-- ==============================================

-- Seed some initial inventory for Classic T-Shirt
INSERT INTO physical_inventory (product_template_id, color_id, size_id, quantity, reorder_point, cost_per_unit)
SELECT pt.id, c.id, s.id, 100, 20, 5.50
FROM product_templates pt, colors c, sizes s
WHERE pt.name = 'Classic T-Shirt' 
AND c.name IN ('Black', 'White', 'Red', 'Blue')
AND s.name IN ('S', 'M', 'L', 'XL');

-- Seed some initial inventory for Hoodie
INSERT INTO physical_inventory (product_template_id, color_id, size_id, quantity, reorder_point, cost_per_unit)
SELECT pt.id, c.id, s.id, 50, 10, 15.00
FROM product_templates pt, colors c, sizes s
WHERE pt.name = 'Hoodie' 
AND c.name IN ('Black', 'White', 'Red', 'Navy')
AND s.name IN ('M', 'L', 'XL', 'XXL');

-- ==============================================
-- 13. SEED COMMISSION RATES
-- ==============================================

INSERT INTO commission_rates (partner_level, commission_type, rate, is_active)
VALUES
('bronze', 'retail', 10.0, true),
('bronze', 'wholesale', 5.0, true),
('silver', 'retail', 12.0, true),
('silver', 'wholesale', 7.0, true),
('gold', 'retail', 15.0, true),
('gold', 'wholesale', 10.0, true),
('platinum', 'retail', 18.0, true),
('platinum', 'wholesale', 12.0, true);
