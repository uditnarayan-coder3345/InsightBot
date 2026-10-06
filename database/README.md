# Database

Run `schema.sql` in the Supabase SQL Editor to create profiles, documents, document chunks, conversations, messages, indexes, and owner-scoped RLS policies. The backend uses a service role key and performs ownership filtering itself; the browser must never receive that key.

The SQL enables pgvector but leaves the embedding column dimension unspecified until the Gemini embedding model is selected. The backend creates the private `documents` Storage bucket lazily when the first file upload is attempted.
