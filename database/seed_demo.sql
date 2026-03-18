INSERT INTO users (
  id, email, password_hash, full_name, phone, role,
  is_approved, is_active, agency_name, bio,
  reputation_score, verified_listings_count, deals_closed_count,
  referral_code
) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'admin@dealnaija.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGqJ5q2JL.8rJ8t.5N8k3H.LGPC',
  'DealNaija Admin',
  '08000000000',
  'admin',
  TRUE, TRUE,
  NULL, NULL,
  0, 0, 0,
  NULL
),
(
  'a0000000-0000-0000-0000-000000000002',
  'chidi.okonkwo@dealnaija.com',
  '$2a$12$K9lP1eH7vT3xM2nR6qY8uOJhG4wF5sD0iA9bN1cE3mX7yZ6pQ2oWv',
  'Chidi Okonkwo',
  '08023456789',
  'agent',
  TRUE, TRUE,
  'Okonkwo Prime Properties',
  'Senior land agent with 12 years experience in Lagos.',
  87.50, 14, 9,
  'CHIDIN4G2'
),
(
  'a0000000-0000-0000-0000-000000000003',
  'aisha.bello@dealnaija.com',
  '$2a$12$K9lP1eH7vT3xM2nR6qY8uOJhG4wF5sD0iA9bN1cE3mX7yZ6pQ2oWv',
  'Aisha Bello',
  '08134567890',
  'agent',
  TRUE, TRUE,
  'Bello & Partners Real Estate',
  'FCT-licensed property consultant.',
  79.00, 11, 6,
  'AISHAB7X1'
),
(
  'a0000000-0000-0000-0000-000000000004',
  'emeka.nwosu@dealnaija.com',
  '$2a$12$K9lP1eH7vT3xM2nR6qY8uOJhG4wF5sD0iA9bN1cE3mX7yZ6pQ2oWv',
  'Emeka Nwosu',
  '07065432109',
  'agent',
  TRUE, TRUE,
  'Nwosu Land Consortium',
  'Port Harcourt-based land agent.',
  72.00, 8, 5,
  'EMEKAN3J8'
),
(
  'a0000000-0000-0000-0000-000000000005',
  'investor@dealnaija.com',
  '$2a$12$K9lP1eH7vT3xM2nR6qY8uOJhG4wF5sD0iA9bN1cE3mX7yZ6pQ2oWv',
  'Tunde Adeyemi',
  '08056789012',
  'investor',
  TRUE, TRUE,
  NULL, NULL,
  0, 0, 0,
  NULL
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (
  id, agent_id, title, description, property_type, seller_type,
  address, city, state, lga, latitude, longitude,
  land_size, size_unit, price, price_negotiable,
  distressed_deal, discount_percentage, title_document,
  has_survey_plan, has_deed_of_assignment, has_cof_o,
  status, verification_level, trust_score,
  inspection_instructions, co_broker_enabled,
  agent_commission_pct, co_broker_commission_pct,
  views_count, inquiries_count, saves_count
) VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002',
  'Bank-Liquidated Beachfront Land - Lekki Phase 2, Lagos',
  'A rare opportunity to acquire a prime beachfront plot in Lekki Phase 2. Recovered by Zenith Bank following a mortgage default. 200m from the Atlantic Ocean. Governors Consent title.',
  'land', 'bank',
  '14 Admiralty Way, Lekki Phase 2', 'Lekki', 'Lagos', 'Eti-Osa',
  6.4308, 3.5792,
  900, 'm2', 58500000, TRUE,
  TRUE, 32, 'governors_consent',
  TRUE, TRUE, FALSE,
  'approved', 'fully_verified', 91.00,
  'Mon-Fri 9AM-4PM. WhatsApp agent 24hrs before.',
  TRUE, 5.0, 2.5, 247, 18, 34
),
(
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000003',
  'Distressed 2-Hectare Company Land - Kuje District, Abuja FCT',
  'Construction company winding down is offloading this 2-hectare land in Kuje. Flat, dry, accessible. Water supply infrastructure installed. C of O in company name.',
  'land', 'company',
  'Kuje-Gwagwa Road, Plot 44', 'Kuje', 'FCT - Abuja', 'Kuje',
  8.8833, 7.0167,
  2.0, 'hectare', 42000000, TRUE,
  TRUE, 40, 'C_of_O',
  TRUE, FALSE, TRUE,
  'approved', 'document_verified', 78.00,
  'Weekdays and weekends by appointment.',
  TRUE, 5.0, 3.0, 183, 12, 27
),
(
  'b0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000004',
  'Prime GRA Corner Plot - Old Government Reserved Area, Port Harcourt',
  'Clean fenced 1200 sqm in Old GRA Port Harcourt. 24-hour power supply. Concrete fence on 3 sides. Seller relocating abroad. Full documents available.',
  'land', 'private_owner',
  '7 Ikwerre Close, Old GRA', 'Port Harcourt', 'Rivers', 'Port Harcourt',
  4.8174, 7.0498,
  1200, 'm2', 95000000, FALSE,
  FALSE, NULL, 'C_of_O',
  TRUE, TRUE, TRUE,
  'approved', 'fully_verified', 96.00,
  'By appointment only. Tue-Sat.',
  FALSE, 5.0, 0, 312, 24, 51
),
(
  'b0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000002',
  '11 Hectares Agricultural Land - Kaduna-Abuja Expressway',
  'Large scale land along Kaduna-Abuja Expressway. 11 hectares of flat fertile land. Suitable for farming, agro-processing, or industrial development.',
  'land', 'company',
  'Km 42, Kaduna-Abuja Expressway', 'Chikun', 'Kaduna', 'Chikun',
  10.3764, 7.7063,
  11.0, 'hectare', 38500000, TRUE,
  FALSE, NULL, 'gazette',
  TRUE, FALSE, FALSE,
  'approved', 'document_verified', 68.00,
  'Any day with 24hr notice.',
  TRUE, 4.0, 2.0, 141, 9, 19
),
(
  'b0000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000003',
  'Government Auction Land - Bodija Estate Extension, Ibadan',
  'Corner plot in Bodija Estate Extension released by Oyo State Government. Corner piece with access from two streets. New C of O processed in buyers name after purchase.',
  'land', 'government',
  'Plot 22B, Bodija Estate Extension', 'Ibadan', 'Oyo', 'Ibadan North',
  7.4198, 3.9052,
  600, 'm2', 24500000, FALSE,
  TRUE, 22, 'C_of_O',
  TRUE, FALSE, TRUE,
  'approved', 'document_verified', 74.00,
  'Open inspection every Saturday 10AM-1PM.',
  TRUE, 5.0, 2.5, 198, 15, 29
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO property_images (property_id, image_url, is_primary, sort_order) VALUES
('b0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800&q=80', TRUE, 0),
('b0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=800&q=80', TRUE, 0),
('b0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80', TRUE, 0),
('b0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80', TRUE, 0),
('b0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80', TRUE, 0)
ON CONFLICT DO NOTHING;
