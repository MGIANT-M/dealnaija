CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('agent', 'investor', 'admin')),
  avatar_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES users(id),
  agency_name VARCHAR(255),
  cac_number VARCHAR(50),
  bio TEXT,
  reputation_score DECIMAL(4,2) DEFAULT 0.00,
  verified_listings_count INT DEFAULT 0,
  deals_closed_count INT DEFAULT 0,
  total_commission_earned DECIMAL(15,2) DEFAULT 0.00,
  referral_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50) DEFAULT 'land',
  seller_type VARCHAR(30) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100) NOT NULL,
  lga VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  land_size DECIMAL(12,4) NOT NULL,
  size_unit VARCHAR(20) DEFAULT 'm2',
  price DECIMAL(15,2) NOT NULL,
  price_negotiable BOOLEAN DEFAULT FALSE,
  distressed_deal BOOLEAN DEFAULT FALSE,
  discount_percentage DECIMAL(5,2),
  title_document VARCHAR(100),
  has_survey_plan BOOLEAN DEFAULT FALSE,
  has_deed_of_assignment BOOLEAN DEFAULT FALSE,
  has_cof_o BOOLEAN DEFAULT FALSE,
  status VARCHAR(30) DEFAULT 'pending',
  inspection_instructions TEXT,
  verification_level VARCHAR(30) DEFAULT 'basic',
  trust_score DECIMAL(4,2) DEFAULT 0.00,
  admin_notes TEXT,
  co_broker_enabled BOOLEAN DEFAULT FALSE,
  agent_commission_pct DECIMAL(5,2) DEFAULT 5.00,
  co_broker_commission_pct DECIMAL(5,2) DEFAULT 2.50,
  views_count INT DEFAULT 0,
  inquiries_count INT DEFAULT 0,
  saves_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  investor_id UUID NOT NULL REFERENCES users(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  preferred_date DATE,
  preferred_time VARCHAR(20),
  status VARCHAR(30) DEFAULT 'pending',
  notes TEXT,
  investor_confirmed BOOLEAN DEFAULT FALSE,
  investor_rating INT,
  investor_feedback TEXT,
  property_matches_listing BOOLEAN,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  investor_id UUID REFERENCES users(id),
  co_broker_id UUID REFERENCES users(id),
  stage VARCHAR(30) DEFAULT 'inquiry_received',
  agreed_price DECIMAL(15,2),
  agent_commission_amount DECIMAL(15,2),
  co_broker_commission_amount DECIMAL(15,2),
  platform_fee DECIMAL(15,2),
  referral_code_used VARCHAR(20),
  referring_agent_id UUID REFERENCES users(id),
  notes TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_id UUID NOT NULL REFERENCES users(id),
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  reward_type VARCHAR(50),
  reward_value DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  broadcast_type VARCHAR(30) DEFAULT 'deal_alert',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  related_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
