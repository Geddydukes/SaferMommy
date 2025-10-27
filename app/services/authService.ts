import { getSupabaseClient } from '../../lib/supabase';

export class AuthService {
  async signIn(email: string, password: string) {
    return await getSupabaseClient().auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string) {
    return await getSupabaseClient().auth.signUp({ email, password });
  }

  async signOut() {
    return await getSupabaseClient().auth.signOut();
  }
}

export const authService = new AuthService();