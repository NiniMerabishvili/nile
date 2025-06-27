-- Create storage bucket for gym images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gym-images', 'gym-images', true)
ON CONFLICT (id) DO NOTHING; 