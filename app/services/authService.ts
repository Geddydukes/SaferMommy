import { supabase } from '../../lib/supabase';

export class AuthService {
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password });
  }

  async signOut() {
    return await supabase.auth.signOut();
  }
}

export const authService = new AuthService();