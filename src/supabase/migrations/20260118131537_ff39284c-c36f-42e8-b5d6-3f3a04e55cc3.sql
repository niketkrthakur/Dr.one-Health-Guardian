-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'patient',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
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

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT,
    age INTEGER,
    gender TEXT,
    blood_group TEXT,
    phone TEXT,
    emergency_contact TEXT,
    emergency_contact_name TEXT,
    avatar_url TEXT,
    allergies TEXT[] DEFAULT '{}',
    chronic_conditions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
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

-- Doctors can view patient profiles (via QR access token - handled in app)
CREATE POLICY "Doctors can view profiles with access token"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'doctor'));

-- Create prescriptions table
CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    medications JSONB DEFAULT '[]',
    file_url TEXT,
    file_type TEXT,
    is_verified BOOLEAN DEFAULT false,
    upload_source TEXT NOT NULL DEFAULT 'user', -- 'user' or 'doctor'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Prescriptions RLS policies
CREATE POLICY "Patients can view their own prescriptions"
ON public.prescriptions
FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own prescriptions"
ON public.prescriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id AND upload_source = 'user');

CREATE POLICY "Doctors can view patient prescriptions"
ON public.prescriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can add prescriptions"
ON public.prescriptions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'doctor') AND upload_source = 'doctor');

-- Create medical_history table (append-only for safety)
CREATE TABLE public.medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recorded_by UUID REFERENCES auth.users(id),
    record_type TEXT NOT NULL, -- 'diagnosis', 'procedure', 'lab_result', 'note'
    title TEXT NOT NULL,
    description TEXT,
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on medical_history
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

-- Medical history RLS policies
CREATE POLICY "Patients can view their own history"
ON public.medical_history
FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own history"
ON public.medical_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient history"
ON public.medical_history
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can add to patient history"
ON public.medical_history
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'doctor'));

-- Create access_tokens table for QR-based doctor access
CREATE TABLE public.access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_by UUID REFERENCES auth.users(id),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on access_tokens
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;

-- Access tokens RLS policies
CREATE POLICY "Patients can create access tokens"
ON public.access_tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view their own tokens"
ON public.access_tokens
FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Anyone can view token for validation"
ON public.access_tokens
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Doctors can update tokens when using"
ON public.access_tokens
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'doctor'));

-- Create trigger for profile auto-creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for avatars and prescriptions
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('prescriptions', 'prescriptions', false);

-- Storage RLS policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS policies for prescriptions
CREATE POLICY "Users can view their own prescriptions"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload their own prescriptions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Doctors can view prescriptions"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'prescriptions' AND public.has_role(auth.uid(), 'doctor'));