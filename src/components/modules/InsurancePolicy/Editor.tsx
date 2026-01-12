import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Upload } from 'lucide-react';
import { BRAND_GREEN } from '../../../constants';
import { supabase } from '../../../lib/supabase';
import type { DocumentSettings } from '../../../types';

interface PDFDocument {
  id: string;
  document_type: string;
  document_title: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

interface InsurancePolicyEditorProps {
  settings: DocumentSettings;
  onSettingsChange: (updates: Partial<DocumentSettings>) => void;
}

export function InsurancePolicyEditor({ settings, onSettingsChange }: InsurancePolicyEditorProps) {
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPdfUrl, setNewPdfUrl] = useState('');
  const [newPdfTitle, setNewPdfTitle] = useState('');

  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_pdfs')
        .select('*')
        .eq('document_type', '4.3b')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setPdfs(data || []);
    } catch (err) {
      console.error('Error loading PDFs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPDF = async () => {
    if (!newPdfUrl || !newPdfTitle) {
      alert('Lütfen PDF URL ve başlık giriniz');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('document_pdfs')
        .insert({
          document_type: '4.3b',
          document_title: newPdfTitle,
          file_name: newPdfUrl.split('/').pop() || 'document.pdf',
          file_url: newPdfUrl
        });

      if (error) throw error;

      alert('PDF başarıyla eklendi!');
      setNewPdfUrl('');
      setNewPdfTitle('');
      loadPDFs();
    } catch (err: any) {
      console.error('Error adding PDF:', err);
      alert('PDF eklenirken hata: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePDF = async (id: string) => {
    if (!confirm('Bu PDF\'i silmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('document_pdfs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('PDF başarıyla silindi!');
      loadPDFs();
    } catch (err: any) {
      console.error('Error deleting PDF:', err);
      alert('PDF silinirken hata: ' + err.message);
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800 mb-4">
        Mali sorumluluk sigorta poliçesi belgelerini buradan yönetin. İlaçlama sırasında müşteri eşyasına zarar durumunu karşılayan sigorta belgeleri.
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: BRAND_GREEN }}>
          <Plus size={16} /> Yeni PDF Ekle
        </h2>
        <div className="space-y-3 p-3 bg-gray-50 rounded border">
          <input
            type="text"
            placeholder="PDF Başlığı (ör: Mali Sorumluluk Sigortası 2024)"
            value={newPdfTitle}
            onChange={(e) => setNewPdfTitle(e.target.value)}
            className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
          />
          <input
            type="text"
            placeholder="PDF URL (ör: /documents/sigorta-poilcesi-2024.pdf)"
            value={newPdfUrl}
            onChange={(e) => setNewPdfUrl(e.target.value)}
            className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
          />
          <button
            onClick={handleAddPDF}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Ekleniyor...
              </>
            ) : (
              <>
                <Upload size={16} />
                PDF Ekle
              </>
            )}
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 border-t pt-4" style={{ color: BRAND_GREEN }}>
          <Shield size={16} /> Yüklü PDF Dosyaları ({pdfs.length})
        </h2>

        {loading ? (
          <div className="text-xs text-green-600 text-center py-4">
            PDF'ler yükleniyor...
          </div>
        ) : pdfs.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-8 bg-gray-50 rounded">
            Henüz PDF dosyası eklenmemiş.
          </div>
        ) : (
          <div className="space-y-2">
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="flex items-center justify-between p-3 bg-white border rounded hover:border-green-600 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {pdf.document_title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {pdf.file_url}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(pdf.uploaded_at).toLocaleDateString('tr-TR')} {new Date(pdf.uploaded_at).toLocaleTimeString('tr-TR')}
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePDF(pdf.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                  title="PDF'i Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
