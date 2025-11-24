import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente padrão com anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Função para criar cliente com token customizado
export const createSupabaseClientWithToken = (accessToken: string): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
};

// Função para definir sessão com token
export const setSupabaseSession = async (accessToken: string, refreshToken?: string) => {
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken || accessToken,
  });
  
  if (error) {
    console.error('Erro ao definir sessão:', error);
    throw error;
  }
  
  return data;
};
