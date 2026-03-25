
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id IN ('project-files', 'table-attachments', 'avatars'));

DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('project-files', 'table-attachments', 'avatars'));

DROP POLICY IF EXISTS "Authenticated users can delete files" ON storage.objects;
CREATE POLICY "Users can delete files"
ON storage.objects FOR DELETE
TO public
USING (bucket_id IN ('project-files', 'table-attachments', 'avatars'));

CREATE POLICY "Users can update files"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id IN ('project-files', 'table-attachments', 'avatars'));
