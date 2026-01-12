import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { CustomerData, Branch, Customer } from '../types';

export function useCustomerData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerData, setCustomerData] = useState<CustomerData>({
    ticariUnvan: '',
    faaliyetKonusu: '',
    vergiDairesi: '',
    vergiNo: '',
    mersisNo: '',
    adres: '',
    telefon: '',
    faks: '',
    eposta: '',
    webSitesi: '',
    yetkiliKisi: '',
    yetkiliUnvan: '',
    yetkiliTel: '',
    hizmetBaslangicTarihi: new Date().toISOString().split('T')[0]
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerData(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, kisa_isim, cari_isim, email')
        .order('kisa_isim');

      if (error) {
        console.error('Müşteri listesi çekme hatası:', error.message);
        return;
      }

      if (data) {
        const mappedCustomers = data.map((customer: any) => ({
          id: customer.id,
          kisa_isim: customer.kisa_isim || '',
          cariIsim: customer.cari_isim || customer.kisa_isim || '',
          email: customer.email || ''
        }));
        setCustomers(mappedCustomers);
      }
    } catch (err) {
      console.error('Beklenmedik hata:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomerData(customerId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          branches:branches(*)
        `)
        .eq('id', customerId)
        .single();

      if (error) {
        console.error('Veri çekme hatası:', error.message);
        return;
      }

      if (data) {
        setCustomerData({
          ticariUnvan: data.cari_isim || data.kisa_isim || '',
          faaliyetKonusu: data.faaliyet_konusu || '',
          vergiDairesi: data.tax_office || '',
          vergiNo: data.tax_number || '',
          mersisNo: data.mersis_no || '',
          adres: data.adres || '',
          telefon: data.telefon || '',
          faks: '',
          eposta: data.email || '',
          webSitesi: '',
          yetkiliKisi: '',
          yetkiliUnvan: '',
          yetkiliTel: '',
          hizmetBaslangicTarihi: data.hizmet_baslangic_tarihi || new Date().toISOString().split('T')[0]
        });

        if (data.branches && data.branches.length > 0) {
          const mappedBranches = data.branches.map((branch: any) => ({
            id: branch.id,
            subeAdi: branch.sube_adi || '',
            yetkili: '',
            metrekare: '',
            adres: branch.adres || '',
            telefon: branch.telefon || ''
          }));
          setBranches(mappedBranches);
        }
      }
    } catch (err) {
      console.error('Beklenmedik hata:', err);
    } finally {
      setLoading(false);
    }
  }

  const updateCustomerData = (updates: Partial<CustomerData>) => {
    setCustomerData(prev => ({ ...prev, ...updates }));
  };

  return {
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    customerData,
    setCustomerData: updateCustomerData,
    branches,
    setBranches,
    loading,
    refetch: () => selectedCustomerId && fetchCustomerData(selectedCustomerId)
  };
}