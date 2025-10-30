-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
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

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  party TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  proposals TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on candidates
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Candidates policies (public read, admin write)
CREATE POLICY "Anyone can view candidates"
  ON public.candidates FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert candidates"
  ON public.candidates FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update candidates"
  ON public.candidates FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete candidates"
  ON public.candidates FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, candidate_id)
);

-- Enable RLS on votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Votes policies
CREATE POLICY "Users can view their own votes"
  ON public.votes FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert votes"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all votes"
  ON public.votes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample candidates
INSERT INTO public.candidates (name, party, image_url, description, proposals) VALUES
  ('María González', 'Partido Progresista', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'Candidata con 15 años de experiencia en gestión pública', ARRAY['Educación gratuita', 'Salud universal', 'Empleo juvenil']),
  ('Carlos Ramírez', 'Alianza Nacional', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Economista especializado en desarrollo sostenible', ARRAY['Reducción de impuestos', 'Infraestructura', 'Seguridad ciudadana']),
  ('Ana Martínez', 'Movimiento Ciudadano', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'Activista social y defensora de derechos humanos', ARRAY['Medio ambiente', 'Igualdad de género', 'Transparencia']),
  ('José Torres', 'Frente Democrático', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'Empresario con visión de desarrollo económico', ARRAY['Innovación tecnológica', 'Exportaciones', 'Turismo']),
  ('Laura Sánchez', 'Partido Liberal', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'Abogada constitucionalista', ARRAY['Reforma judicial', 'Descentralización', 'Lucha anticorrupción']);