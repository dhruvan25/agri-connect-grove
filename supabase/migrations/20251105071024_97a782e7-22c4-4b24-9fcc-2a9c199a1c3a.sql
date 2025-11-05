-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('farmer', 'buyer', 'admin');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  district TEXT,
  state TEXT,
  farm_size DECIMAL,
  farm_type TEXT,
  business_name TEXT,
  business_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create crops table
CREATE TABLE public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view crops"
ON public.crops
FOR SELECT
TO authenticated
USING (true);

-- Create mandis table
CREATE TABLE public.mandis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.mandis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mandis"
ON public.mandis
FOR SELECT
TO authenticated
USING (true);

-- Create mandi prices table
CREATE TABLE public.mandi_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandi_id UUID REFERENCES public.mandis(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL NOT NULL,
  unit TEXT DEFAULT 'quintal',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mandi prices"
ON public.mandi_prices
FOR SELECT
TO authenticated
USING (true);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mandi_id UUID REFERENCES public.mandis(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, mandi_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
ON public.favorites
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
ON public.favorites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON public.favorites
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create farmer analytics table
CREATE TABLE public.farmer_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE NOT NULL,
  harvest_date DATE,
  soil_type TEXT,
  acreage DECIMAL,
  expected_yield DECIMAL,
  farming_method TEXT,
  is_organic BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.farmer_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view their own analytics"
ON public.farmer_analytics
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Farmers can create their own analytics"
ON public.farmer_analytics
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can update their own analytics"
ON public.farmer_analytics
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Farmers can delete their own analytics"
ON public.farmer_analytics
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Insert sample crops
INSERT INTO public.crops (name, category, image_url) VALUES
('Tomato', 'Vegetables', '/crops/tomato.jpg'),
('Onion', 'Vegetables', '/crops/onion.jpg'),
('Potato', 'Vegetables', '/crops/potato.jpg'),
('Wheat', 'Grains', '/crops/wheat.jpg'),
('Rice', 'Grains', '/crops/rice.jpg'),
('Cotton', 'Cash Crops', '/crops/cotton.jpg'),
('Sugarcane', 'Cash Crops', '/crops/sugarcane.jpg'),
('Chilli', 'Spices', '/crops/chilli.jpg');

-- Insert sample mandis
INSERT INTO public.mandis (name, location, district, state) VALUES
('APMC Vashi', 'Vashi', 'Thane', 'Maharashtra'),
('Azadpur Mandi', 'Azadpur', 'North Delhi', 'Delhi'),
('Koyambedu Market', 'Koyambedu', 'Chennai', 'Tamil Nadu'),
('Pune APMC', 'Pune', 'Pune', 'Maharashtra'),
('Bangalore APMC', 'Yeshwanthpur', 'Bangalore', 'Karnataka'),
('Lasalgaon Mandi', 'Lasalgaon', 'Nashik', 'Maharashtra');

-- Insert sample prices
INSERT INTO public.mandi_prices (mandi_id, crop_id, price, unit, date)
SELECT 
  m.id,
  c.id,
  CASE 
    WHEN c.name = 'Tomato' THEN 2000 + (RANDOM() * 1000)::INTEGER
    WHEN c.name = 'Onion' THEN 1500 + (RANDOM() * 800)::INTEGER
    WHEN c.name = 'Potato' THEN 1200 + (RANDOM() * 600)::INTEGER
    WHEN c.name = 'Wheat' THEN 2500 + (RANDOM() * 500)::INTEGER
    WHEN c.name = 'Rice' THEN 3000 + (RANDOM() * 1000)::INTEGER
    ELSE 2000 + (RANDOM() * 1000)::INTEGER
  END,
  'quintal',
  CURRENT_DATE
FROM public.mandis m
CROSS JOIN public.crops c
WHERE c.name IN ('Tomato', 'Onion', 'Potato', 'Wheat', 'Rice');

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mandi_prices_updated_at
BEFORE UPDATE ON public.mandi_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farmer_analytics_updated_at
BEFORE UPDATE ON public.farmer_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();