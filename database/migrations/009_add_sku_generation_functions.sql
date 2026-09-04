-- SKU Generation and Product Tracking Functions
-- Migration: 009_add_sku_generation_functions.sql
-- This migration adds functions for generating SKUs and managing printed products

-- ==============================================
-- 1. SKU GENERATION FUNCTION
-- ==============================================

-- Function to generate unique SKU for printed products
CREATE OR REPLACE FUNCTION generate_printed_product_sku(
  p_design_id UUID,
  p_product_template_id UUID,
  p_color_id UUID,
  p_size_id UUID,
  p_batch_number VARCHAR(50) DEFAULT NULL
) RETURNS VARCHAR(100) AS $$
DECLARE
  design_code VARCHAR(10);
  template_code VARCHAR(10);
  color_code VARCHAR(3);
  size_code VARCHAR(3);
  batch_code VARCHAR(10);
  sku VARCHAR(100);
  counter INTEGER := 1;
BEGIN
  -- Get design code (first 3 chars of design title + last 2 digits of ID)
  SELECT UPPER(LEFT(REPLACE(title, ' ', ''), 3)) || RIGHT(id::text, 2)
  INTO design_code
  FROM designs WHERE id = p_design_id;
  
  -- Get template code (first 3 chars of template name + last 2 digits of ID)
  SELECT UPPER(LEFT(REPLACE(name, ' ', ''), 3)) || RIGHT(id::text, 2)
  INTO template_code
  FROM product_templates WHERE id = p_product_template_id;
  
  -- Get color code (first 3 chars of color name)
  SELECT UPPER(LEFT(name, 3))
  INTO color_code
  FROM colors WHERE id = p_color_id;
  
  -- Get size code
  SELECT UPPER(name)
  INTO size_code
  FROM sizes WHERE id = p_size_id;
  
  -- Get batch code
  IF p_batch_number IS NOT NULL THEN
    batch_code := UPPER(LEFT(p_batch_number, 6));
  ELSE
    batch_code := TO_CHAR(NOW(), 'YYMMDD');
  END IF;
  
  -- Generate base SKU
  sku := design_code || '-' || template_code || '-' || color_code || size_code || '-' || batch_code;
  
  -- Ensure uniqueness by adding counter if needed
  WHILE EXISTS (SELECT 1 FROM printed_products_inventory WHERE sku = sku || '-' || counter) LOOP
    counter := counter + 1;
  END LOOP;
  
  IF counter > 1 THEN
    sku := sku || '-' || counter;
  END IF;
  
  RETURN sku;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 2. PRINTED PRODUCT CREATION FUNCTION
-- ==============================================

-- Function to create a printed product record
CREATE OR REPLACE FUNCTION create_printed_product(
  p_order_item_id UUID,
  p_batch_number VARCHAR(50) DEFAULT NULL,
  p_print_job_id UUID DEFAULT NULL,
  p_warehouse_location VARCHAR(100) DEFAULT 'main_warehouse',
  p_shelf_location VARCHAR(50) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_order_item RECORD;
  v_printed_product_id UUID;
  v_sku VARCHAR(100);
  v_cost_of_goods DECIMAL(10,2);
  v_print_cost DECIMAL(10,2) := 2.50; -- Default print cost
  v_material_cost DECIMAL(10,2);
BEGIN
  -- Get order item details
  SELECT 
    oi.design_product_id,
    oi.color_id,
    oi.size_id,
    dp.design_id,
    dp.product_template_id,
    pt.base_cost
  INTO v_order_item
  FROM order_items oi
  JOIN design_products dp ON oi.design_product_id = dp.id
  JOIN product_templates pt ON dp.product_template_id = pt.id
  WHERE oi.id = p_order_item_id;
  
  -- Generate SKU
  v_sku := generate_printed_product_sku(
    v_order_item.design_id,
    v_order_item.product_template_id,
    v_order_item.color_id,
    v_order_item.size_id,
    p_batch_number
  );
  
  -- Calculate costs
  v_material_cost := v_order_item.base_cost;
  v_cost_of_goods := v_material_cost + v_print_cost;
  
  -- Create printed product record
  INSERT INTO printed_products_inventory (
    order_item_id,
    design_product_id,
    product_template_id,
    color_id,
    size_id,
    design_id,
    sku,
    batch_number,
    print_job_id,
    status,
    condition,
    warehouse_location,
    shelf_location,
    cost_of_goods,
    print_cost,
    material_cost,
    printed_at
  ) VALUES (
    p_order_item_id,
    v_order_item.design_product_id,
    v_order_item.product_template_id,
    v_order_item.color_id,
    v_order_item.size_id,
    v_order_item.design_id,
    v_sku,
    p_batch_number,
    p_print_job_id,
    'printed',
    'new',
    p_warehouse_location,
    p_shelf_location,
    v_cost_of_goods,
    v_print_cost,
    v_material_cost,
    NOW()
  ) RETURNING id INTO v_printed_product_id;
  
  -- Create initial movement record
  INSERT INTO printed_product_movements (
    printed_product_id,
    movement_type,
    to_status,
    to_location,
    reference_type,
    reference_id,
    notes
  ) VALUES (
    v_printed_product_id,
    'printed',
    'printed',
    p_warehouse_location,
    'order',
    p_order_item_id,
    'Product printed and added to inventory'
  );
  
  -- Update order item with printed product reference
  UPDATE order_items 
  SET printed_product_id = v_printed_product_id
  WHERE id = p_order_item_id;
  
  RETURN v_printed_product_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 3. PRODUCT MOVEMENT FUNCTION
-- ==============================================

-- Function to move a printed product
CREATE OR REPLACE FUNCTION move_printed_product(
  p_printed_product_id UUID,
  p_movement_type VARCHAR(50),
  p_to_status VARCHAR(50),
  p_to_location VARCHAR(100) DEFAULT NULL,
  p_reference_type VARCHAR(50) DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_created_by INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_current_status VARCHAR(50);
  v_current_location VARCHAR(100);
  v_movement_id UUID;
BEGIN
  -- Get current status and location
  SELECT status, warehouse_location
  INTO v_current_status, v_current_location
  FROM printed_products_inventory
  WHERE id = p_printed_product_id;
  
  -- Create movement record
  INSERT INTO printed_product_movements (
    printed_product_id,
    movement_type,
    from_status,
    to_status,
    from_location,
    to_location,
    reference_type,
    reference_id,
    notes,
    created_by
  ) VALUES (
    p_printed_product_id,
    p_movement_type,
    v_current_status,
    p_to_status,
    v_current_location,
    p_to_location,
    p_reference_type,
    p_reference_id,
    p_notes,
    p_created_by
  ) RETURNING id INTO v_movement_id;
  
  -- Update printed product status
  UPDATE printed_products_inventory
  SET 
    status = p_to_status,
    warehouse_location = COALESCE(p_to_location, warehouse_location),
    updated_at = NOW()
  WHERE id = p_printed_product_id;
  
  -- Update specific timestamps based on movement type
  CASE p_movement_type
    WHEN 'shipped' THEN
      UPDATE printed_products_inventory SET shipped_at = NOW() WHERE id = p_printed_product_id;
    WHEN 'delivered' THEN
      UPDATE printed_products_inventory SET delivered_at = NOW() WHERE id = p_printed_product_id;
    WHEN 'returned' THEN
      UPDATE printed_products_inventory SET returned_at = NOW() WHERE id = p_printed_product_id;
  END CASE;
  
  RETURN v_movement_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 4. RETURN PROCESSING FUNCTION
-- ==============================================

-- Function to process a returned printed product
CREATE OR REPLACE FUNCTION process_returned_product(
  p_printed_product_id UUID,
  p_order_id INTEGER,
  p_return_reason VARCHAR(100),
  p_return_condition VARCHAR(50),
  p_return_notes TEXT DEFAULT NULL,
  p_refund_amount DECIMAL(10,2) DEFAULT NULL,
  p_restocking_fee DECIMAL(10,2) DEFAULT 0,
  p_processed_by INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_return_id UUID;
  v_can_resell BOOLEAN;
  v_resale_price DECIMAL(10,2);
  v_resale_id UUID;
BEGIN
  -- Create return record
  INSERT INTO returned_printed_products (
    printed_product_id,
    order_id,
    return_reason,
    return_condition,
    return_notes,
    refund_amount,
    restocking_fee,
    processed_by,
    processed_at
  ) VALUES (
    p_printed_product_id,
    p_order_id,
    p_return_reason,
    p_return_condition,
    p_return_notes,
    p_refund_amount,
    p_restocking_fee,
    p_processed_by,
    NOW()
  ) RETURNING id INTO v_return_id;
  
  -- Determine if product can be resold
  v_can_resell := CASE 
    WHEN p_return_condition = 'new' AND p_return_reason IN ('wrong_size', 'customer_change_mind') THEN true
    WHEN p_return_condition = 'used' AND p_return_reason = 'wrong_size' THEN true
    ELSE false
  END;
  
  -- Update return record with resell decision
  UPDATE returned_printed_products
  SET can_resell = v_can_resell
  WHERE id = v_return_id;
  
  -- If can be resold, create resale inventory record
  IF v_can_resell THEN
    -- Calculate resale price (typically 70-80% of original price)
    SELECT (oi.unit_price * 0.75)
    INTO v_resale_price
    FROM order_items oi
    WHERE oi.printed_product_id = p_printed_product_id;
    
    INSERT INTO resale_inventory (
      printed_product_id,
      return_id,
      resale_price,
      resale_commission,
      condition_notes,
      warehouse_location,
      shelf_location
    ) VALUES (
      p_printed_product_id,
      v_return_id,
      v_resale_price,
      15.0, -- Standard resale commission
      p_return_notes,
      'returned_products',
      'resale_section'
    ) RETURNING id INTO v_resale_id;
    
    -- Move product to resale status
    PERFORM move_printed_product(
      p_printed_product_id,
      'returned',
      'returned',
      'returned_products',
      'return',
      v_return_id,
      'Product returned and added to resale inventory',
      p_processed_by
    );
  ELSE
    -- Move to disposal or damaged inventory
    PERFORM move_printed_product(
      p_printed_product_id,
      'returned',
      'damaged',
      'disposal_area',
      'return',
      v_return_id,
      'Product returned but cannot be resold',
      p_processed_by
    );
  END IF;
  
  RETURN v_return_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 5. QUALITY CONTROL FUNCTION
-- ==============================================

-- Function to perform quality control check
CREATE OR REPLACE FUNCTION perform_quality_check(
  p_printed_product_id UUID,
  p_check_type VARCHAR(50),
  p_passed BOOLEAN,
  p_score INTEGER DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_checked_by INTEGER DEFAULT NULL,
  p_evidence_photos TEXT[] DEFAULT '{}',
  p_measurements JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_check_id UUID;
  v_requires_reprint BOOLEAN;
  v_reprint_reason TEXT;
BEGIN
  -- Determine if reprint is required
  v_requires_reprint := NOT p_passed AND p_check_type IN ('print_quality', 'material_quality');
  v_reprint_reason := CASE 
    WHEN NOT p_passed AND p_check_type = 'print_quality' THEN 'Print quality failed inspection'
    WHEN NOT p_passed AND p_check_type = 'material_quality' THEN 'Material quality failed inspection'
    ELSE NULL
  END;
  
  -- Create quality check record
  INSERT INTO quality_control_checks (
    printed_product_id,
    check_type,
    passed,
    score,
    notes,
    checked_by,
    evidence_photos,
    measurements,
    requires_reprint,
    reprint_reason
  ) VALUES (
    p_printed_product_id,
    p_check_type,
    p_passed,
    p_score,
    p_notes,
    p_checked_by,
    p_evidence_photos,
    p_measurements,
    v_requires_reprint,
    v_reprint_reason
  ) RETURNING id INTO v_check_id;
  
  -- Update printed product quality status
  UPDATE printed_products_inventory
  SET 
    quality_check_passed = p_passed,
    quality_notes = p_notes,
    quality_checked_by = p_checked_by,
    quality_checked_at = NOW()
  WHERE id = p_printed_product_id;
  
  RETURN v_check_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 6. TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================

-- Trigger to update printed product when order item is updated
CREATE OR REPLACE FUNCTION update_printed_product_on_order_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If order item is updated, update related printed product
  IF NEW.printed_product_id IS NOT NULL THEN
    UPDATE printed_products_inventory
    SET updated_at = NOW()
    WHERE id = NEW.printed_product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_printed_product_on_order_change
  AFTER UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_printed_product_on_order_change();

-- Trigger to automatically create movement record when printed product status changes
CREATE OR REPLACE FUNCTION auto_create_movement_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create movement if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO printed_product_movements (
      printed_product_id,
      movement_type,
      from_status,
      to_status,
      from_location,
      to_location,
      notes
    ) VALUES (
      NEW.id,
      NEW.status,
      OLD.status,
      NEW.status,
      OLD.warehouse_location,
      NEW.warehouse_location,
      'Status automatically updated'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_movement_on_status_change
  AFTER UPDATE ON printed_products_inventory
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_movement_on_status_change();
