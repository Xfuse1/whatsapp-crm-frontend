interface Config {
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiBaseUrl: string;
}

function loadEnv(): Config {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!supabaseUrl || !supabaseAnonKey || !apiBaseUrl) {
    throw new Error(
      'Missing required environment variables. Please check your .env.local file.'
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    apiBaseUrl,
  };
}

export const config = loadEnv();
