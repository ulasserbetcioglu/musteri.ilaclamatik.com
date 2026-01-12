import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  userType: 'admin' | 'operator' | 'customer' | 'branch';
  userData: any;
  customer_id?: string;
  branch_id?: string;
  customer_name?: string;
  branch_name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await handleSupabaseUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('mentor_session'); // Clear local session on sign out
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        await handleSupabaseUser(session.user);
      } else {
        // If no Supabase session, clear any stale local session
        localStorage.removeItem('mentor_session');
        setUser(null);
      }
    } catch (err) {
      console.error('Session check error:', err);
      setUser(null);
      localStorage.removeItem('mentor_session');
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseUser = async (supabaseUser: User) => {
    try {
      // 1. Check if user is admin
      if (supabaseUser.email === 'admin@ilaclamatik.com') {
        const authUser: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          userType: 'admin',
          userData: supabaseUser
        };
        setUser(authUser);
        localStorage.setItem('mentor_session', JSON.stringify(authUser));
        return;
      }

      // 2. Check if user is operator
      const { data: operator } = await supabase
        .from('operators')
        .select('*')
        .eq('auth_id', supabaseUser.id)
        .maybeSingle();

      if (operator) {
        const authUser: AuthUser = {
          id: operator.id, // Use operator's ID
          email: supabaseUser.email,
          userType: 'operator',
          userData: operator
        };
        setUser(authUser);
        localStorage.setItem('mentor_session', JSON.stringify(authUser));
        return;
      }

      // 3. Check if user is customer
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('auth_id', supabaseUser.id)
        .maybeSingle();

      if (customer) {
        const authUser: AuthUser = {
          id: customer.id, // Use customer's ID
          email: supabaseUser.email,
          userType: 'customer',
          userData: customer,
          customer_id: customer.id,
          customer_name: customer.kisa_isim || customer.cari_isim || customer.email
        };
        setUser(authUser);
        localStorage.setItem('mentor_session', JSON.stringify(authUser));
        return;
      }

      // 4. Check if user is branch
      const { data: branch } = await supabase
        .from('branches')
        .select('*, customers(*)') // Select customer data as well
        .eq('auth_id', supabaseUser.id)
        .maybeSingle();

      if (branch) {
        const authUser: AuthUser = {
          id: branch.id, // Use branch's ID
          email: supabaseUser.email,
          userType: 'branch',
          userData: branch,
          branch_id: branch.id,
          customer_id: branch.customer_id,
          branch_name: branch.sube_adi || branch.email,
          customer_name: branch.customers?.kisa_isim || branch.customers?.cari_isim
        };
        setUser(authUser);
        localStorage.setItem('mentor_session', JSON.stringify(authUser));
        return;
      }

      // If no specific role found, treat as unauthenticated or generic user
      setUser(null);
      localStorage.removeItem('mentor_session'); // Clear any stale local session
      setError('Kullanıcı rolü bulunamadı veya yetkisiz erişim.');

    } catch (err) {
      console.error('Error handling Supabase user:', err);
      setError('Kullanıcı bilgileri alınırken hata oluştu.');
    }
  };

  const login = async (userType: 'admin' | 'operator' | 'customer' | 'branch', credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw error;

      if (data.user) {
        await handleSupabaseUser(data.user);
      } else {
        throw new Error('Giriş başarısız: Kullanıcı verisi alınamadı.');
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Clear local session
      localStorage.removeItem('mentor_session');

      // Sign out from Supabase if applicable
      await supabase.auth.signOut();

      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
}
