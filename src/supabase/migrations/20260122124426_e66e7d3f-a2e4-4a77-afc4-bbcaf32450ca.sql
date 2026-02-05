-- Create medication reminders table
CREATE TABLE public.medication_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  prescription_id UUID REFERENCES public.prescriptions(id),
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT NOT NULL,
  reminder_times TEXT[] NOT NULL DEFAULT '{}',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for medication_reminders
ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;

-- Policies for medication_reminders
CREATE POLICY "Patients can view their own reminders"
  ON public.medication_reminders FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create their own reminders"
  ON public.medication_reminders FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own reminders"
  ON public.medication_reminders FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can delete their own reminders"
  ON public.medication_reminders FOR DELETE
  USING (auth.uid() = patient_id);

-- Create prescription refill requests table
CREATE TABLE public.refill_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  prescription_id UUID REFERENCES public.prescriptions(id),
  medication_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  request_notes TEXT,
  doctor_response TEXT,
  doctor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for refill_requests
ALTER TABLE public.refill_requests ENABLE ROW LEVEL SECURITY;

-- Policies for refill_requests
CREATE POLICY "Patients can view their own refill requests"
  ON public.refill_requests FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create refill requests"
  ON public.refill_requests FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view all refill requests"
  ON public.refill_requests FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Doctors can update refill requests"
  ON public.refill_requests FOR UPDATE
  USING (has_role(auth.uid(), 'doctor'::app_role));

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_medication_reminders_updated_at
  BEFORE UPDATE ON public.medication_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_refill_requests_updated_at
  BEFORE UPDATE ON public.refill_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();