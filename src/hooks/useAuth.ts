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
    // Check for existing session
    checkSession();

    // Listen for auth changes (only for Supabase users)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await handleSupabaseUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      // Check for local storage session first (for customers/branches)
      const localSession = localStorage.getItem('mentor_session');
      if (localSession) {
        const sessionData = JSON.parse(localSession);
        setUser(sessionData);
        setLoading(false);
        return;
      }

      // Check Supabase session (for admin/operators)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleSupabaseUser(session.user);
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseUser = async (supabaseUser: User) => {
    try {
      // Check if user is admin
      if (supabaseUser.email === 'admin@ilaclamatik.com') {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email,
          userType: 'admin',
          userData: supabaseUser
        });
        return;
      }

      // Check if user is operator
      const { data: operator } = await supabase
        .from('operators')
        .select('*')
        .eq('auth_id', supabaseUser.id)
        .maybeSingle();

      if (operator) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email,
          userType: 'operator',
          userData: operator
        });
      }
    } catch (err) {
      console.error('Error handling Supabase user:', err);
    }
  };

  const login = async (userType: 'admin' | 'operator' | 'customer' | 'branch', credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      if (userType === 'admin' || userType === 'operator') {
        // Supabase Authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (error) throw error;

        if (data.user) {
          await handleSupabaseUser(data.user);
        }
      } else {
        // Local Authentication for customers and branches
        await handleLocalAuth(userType, credentials);
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalAuth = async (userType: 'customer' | 'branch', credentials: { email: string; password: string }) => {
    try {
      if (userType === 'customer') {
        // Check customer credentials
        const { data: customer, error } = await supabase
          .from('customers')
          .select('*')
          .eq('email', credentials.email)
          .maybeSingle();

        if (error || !customer) {
          throw new Error('Müşteri bulunamadı');
        }

        // Verify password
        if (customer.password_hash !== credentials.password) {
          throw new Error('Şifre hatalı');
        }

        const authUser: AuthUser = {
          id: customer.id,
          email: customer.email,
          userType: 'customer',
          userData: customer,
          customer_id: customer.id,
          customer_name: customer.kisa_isim || customer.cari_isim || customer.email
        };

        setUser(authUser);
        localStorage.setItem('mentor_session', JSON.stringify(authUser));

      } else if (userType === 'branch') {
        // Check branch credentials
        const { data: branch, error } = await supabase
          .from('branches')
          .select('*, customers(*)')
          .eq('email', credentials.email)
          .maybeSingle();

        if (error || !branch) {
          throw new Error('Şube bulunamadı');
        }

        // Verify password
        if (branch.password_hash !== credentials.password) {
          throw new Error('Şifre hatalı');
        }

        const authUser: AuthUser = {
          id: branch.id,
          email: branch.email,
          userType: 'branch',
          userData: branch,
          branch_id: branch.id,
          customer_id: branch.customer_id,
          branch_name: branch.sube_adi || branch.email,
          customer_name: branch.customers?.kisa_isim || branch.customers?.cari_isim
        };

        setUser(authUser);
        localStorage.setItem('mentor_session', JSON.stringify(authUser));
      }
    } catch (err: any) {
      throw new Error(err.message || 'Giriş yapılırken hata oluştu');
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
