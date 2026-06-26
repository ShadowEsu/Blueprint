# Blueprint Supabase layer

`schema.sql` is the complete schema and seeded competition dataset from the supplied Blueprint-main project. The same SQL is mirrored in `migrations/20260626000000_blueprint_schema.sql` for a normal Supabase migration workflow.

The Aami-derived agent reads these tables through `agent/supabase/functions/agent/data/source.ts`. If Supabase is unavailable, it falls back to a schema-shaped local dataset; scene actions remain functional in either mode.

Security model: public read through RLS, private write, anon/publishable key in clients, and no service-role key in browser code.

