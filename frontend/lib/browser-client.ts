import { createBrowserClient } from "@supabase/ssr";

type SupabaseSchema = Record<string, never>;
export function browserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

  const client = createBrowserClient<SupabaseSchema>(supabaseUrl, supabaseKey);

  return client;
}
