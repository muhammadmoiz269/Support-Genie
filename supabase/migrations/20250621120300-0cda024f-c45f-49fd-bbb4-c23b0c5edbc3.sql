
-- Create a table for knowledge base articles
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (optional - making it public for now since it's knowledge base)
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read knowledge base
CREATE POLICY "Anyone can view knowledge base" 
  ON public.knowledge_base 
  FOR SELECT 
  USING (true);

-- Create policy to allow inserts (you can restrict this later)
CREATE POLICY "Anyone can create knowledge base articles" 
  ON public.knowledge_base 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow updates
CREATE POLICY "Anyone can update knowledge base articles" 
  ON public.knowledge_base 
  FOR UPDATE 
  USING (true);

-- Create policy to allow deletes
CREATE POLICY "Anyone can delete knowledge base articles" 
  ON public.knowledge_base 
  FOR DELETE 
  USING (true);

-- Insert existing knowledge base data
INSERT INTO public.knowledge_base (title, content, category, keywords) VALUES
('POS System API Authentication & Integration Issues', 'To resolve POS API authentication issues: 1) Ensure your API key is active and not expired (check your merchant dashboard), 2) Verify the API endpoint URL matches your environment (sandbox vs production), 3) Check that your IP address is whitelisted, 4) Confirm the Authorization header format: "Authorization: Bearer YOUR_API_KEY", 5) For payment processing APIs, ensure your merchant account is active and in good standing. Common error codes: 401 (invalid credentials), 403 (insufficient permissions), 429 (rate limit exceeded). If issues persist, regenerate your API key and update all integrations.', 'API Issue', ARRAY['api', 'authentication', 'token', 'bearer', 'authorization', 'integration', 'merchant', 'endpoint']),

('Payment Processing Delays and Transaction Issues', 'Payment processing in retail POS systems typically takes 2-5 seconds for card transactions and up to 10 seconds for mobile payments. Delays can occur due to: 1) Network connectivity issues (check internet connection), 2) Card reader hardware problems (clean card reader, check cables), 3) Bank authorization delays (especially for large amounts), 4) Insufficient funds or declined cards, 5) System overload during peak hours. For stuck transactions: check transaction status in your POS dashboard, void the transaction if necessary, and retry. Always provide receipt copies to customers for pending transactions. Contact support if delays exceed 2 minutes.', 'Transaction Delay', ARRAY['payment', 'transaction', 'delay', 'processing', 'stuck', 'card', 'mobile', 'receipt', 'void']),

('POS System Setup and Staff Onboarding Guide', 'Complete POS setup process: 1) Hardware installation: Connect card readers, receipt printers, cash drawers, and barcode scanners, 2) Software configuration: Install POS app, configure tax rates, set up product catalog with SKUs and pricing, 3) Payment setup: Configure payment processors (credit/debit cards, mobile payments, gift cards), 4) Staff training: Create user accounts with appropriate permissions, train on basic operations (sales, returns, inventory lookup), 5) Testing: Process test transactions, verify receipt printing, test all payment methods. For new employees: provide access to training materials, shadow experienced staff for first week, practice common scenarios (returns, discounts, split payments).', 'Onboarding', ARRAY['setup', 'installation', 'training', 'staff', 'onboarding', 'hardware', 'configuration', 'permissions']),

('POS Interface Navigation and Checkout Process', 'POS interface navigation: 1) Main screen shows product search, quick-add buttons for popular items, and current transaction total, 2) Use barcode scanner or manual SKU entry to add products, 3) Apply discounts via the "Discount" button (employee authorization may be required), 4) Process payments by selecting payment method (cash, card, mobile, gift card), 5) Complete sale and print receipt. For returns: use "Return" mode, scan items or enter manually, select reason, process refund to original payment method. Split payments: add partial payment amounts until total is covered. Customer display shows itemized list and running total.', 'Product Flow', ARRAY['navigation', 'interface', 'checkout', 'barcode', 'scanner', 'payment', 'receipt', 'returns', 'discounts']),

('Inventory Management and Stock Control', 'Inventory management features: 1) Real-time stock tracking: View current quantities, set low-stock alerts, track product movement, 2) Receiving inventory: Use "Receive Stock" function, scan items or enter manually, update quantities and costs, 3) Stock adjustments: Document shrinkage, damage, or corrections with reason codes, 4) Product catalog management: Add new products with SKUs, descriptions, categories, pricing tiers, 5) Reporting: Generate inventory reports, best-sellers analysis, slow-moving stock reports. Set up automatic reorder points for popular items. Use cycle counting for accuracy. Integration with suppliers for automated ordering available in premium plans.', 'Inventory', ARRAY['inventory', 'stock', 'tracking', 'receiving', 'adjustments', 'catalog', 'reorder', 'reports']),

('Customer Management and Loyalty Programs', 'Customer management system: 1) Customer profiles: Store contact information, purchase history, preferences, and notes, 2) Loyalty program setup: Configure points earning ($ spent = points), redemption rates, tier levels, 3) Customer lookup: Search by phone, email, or loyalty card number during checkout, 4) Marketing tools: Send promotional emails, birthday discounts, targeted offers based on purchase history, 5) Customer analytics: View customer lifetime value, frequency analysis, segmentation reports. During checkout: ask for phone number to add/lookup customer, apply loyalty discounts automatically, update points balance. Customer data is encrypted and GDPR compliant.', 'Customer Management', ARRAY['customer', 'loyalty', 'points', 'profiles', 'marketing', 'discounts', 'analytics', 'rewards']),

('End-of-Day Procedures and Cash Management', 'Daily closing procedures: 1) Cash count: Count all denominations in register, compare to system expected amount, 2) Credit card batch settlement: Process all pending card transactions (usually automatic), 3) Sales reporting: Generate daily sales summary, payment method breakdown, top-selling items, 4) Cash drop: Remove excess cash, leave starting amount for next day, document bank deposit, 5) System backup: Ensure all data is synced to cloud, 6) Security checklist: Lock cash drawer, secure terminals, set alarm system. For discrepancies: investigate transaction logs, check for voids/refunds, document any shortages. Weekly tasks: deep clean equipment, update product prices, review staff performance metrics.', 'Daily Operations', ARRAY['closing', 'cash', 'count', 'settlement', 'reporting', 'backup', 'security', 'procedures']),

('Troubleshooting Hardware Issues', 'Common POS hardware problems and solutions: 1) Receipt printer not working: Check paper roll, clean print head, verify USB/network connection, restart printer, 2) Card reader errors: Clean card slot, check cable connections, update drivers, test with known good card, 3) Barcode scanner issues: Clean scanner lens, check scan settings, verify USB connection, test scan distance, 4) Cash drawer not opening: Check power connection, verify drawer cable, manually open with key if needed, 5) Touchscreen problems: Clean screen, calibrate touch settings, check for physical damage. General troubleshooting: restart POS system, check all cable connections, update software/drivers. Keep spare cables and cleaning supplies on hand.', 'Hardware Support', ARRAY['hardware', 'printer', 'scanner', 'card reader', 'touchscreen', 'troubleshooting', 'cables', 'cleaning']),

('Multi-Location and Franchise Management', 'Multi-store management features: 1) Centralized dashboard: View sales across all locations, compare performance metrics, manage inventory transfers, 2) Location-specific settings: Configure local tax rates, pricing variations, staff permissions by store, 3) Inventory synchronization: Transfer stock between locations, view multi-location inventory levels, automatic reorder suggestions, 4) Reporting: Consolidated reports across all stores, location comparison analytics, regional performance tracking, 5) Staff management: Assign employees to specific locations, track hours and sales performance by store. Real-time synchronization ensures data consistency. Franchise owners can access only their location data while corporate sees everything.', 'Multi-Location', ARRAY['multi-location', 'franchise', 'centralized', 'transfers', 'synchronization', 'dashboard', 'regional']),

('Gift Cards and Store Credit Management', 'Gift card system management: 1) Issuing gift cards: Sell physical or digital cards, set custom amounts or fixed denominations, activate cards immediately, 2) Redemption process: Scan card barcode or enter card number, check balance, apply partial or full redemption, 3) Store credit: Issue for returns without receipt, set expiration dates, track usage history, 4) Card management: View all active cards, check balances, deactivate lost/stolen cards, generate usage reports, 5) Integration: Works with loyalty program, can be purchased online and used in-store. Cards never expire unless specified. Refund policies: store credit for returns over 30 days, cash refunds for returns within 30 days with receipt.', 'Gift Cards', ARRAY['gift cards', 'store credit', 'redemption', 'balance', 'activate', 'returns', 'refunds']);
