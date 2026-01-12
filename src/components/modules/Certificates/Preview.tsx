import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BRAND_GREEN } from '../../../constants';
import type { DocumentSettings } from '../../../types';

interface PDFDocument {
  id: string;
  document_type: string;
  document_title: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

interface CertificatesPreviewProps {
  settings: DocumentSettings;
}

export function CertificatesPreview({ settings }: CertificatesPreviewProps) {
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_pdfs')
        .select('*')
        .eq('document_type', '3.2')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setPdfs(data || []);

      if (data && data.length > 0) {
        setSelectedPdfUrl(data[0].file_url);
      }
    } catch (err) {
      console.error('Error loading PDFs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND_GREEN }}></div>
          <p className="text-gray-600">PDF yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (pdfs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">Henüz PDF dosyası eklenmemiş</p>
          <p className="text-sm">Sol panelden PDF ekleyebilirsiniz</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      <div className="bg-white p-4 border-b shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sertifika Seçin:
          </label>
          <select
            value={selectedPdfUrl}
            onChange={(e) => setSelectedPdfUrl(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
          >
            {pdfs.map((pdf) => (
              <option key={pdf.id} value={pdf.file_url}>
                {pdf.document_title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {selectedPdfUrl && (
          <iframe
            src={selectedPdfUrl}
            className="w-full h-full border-0"
            title="PDF Görüntüleyici"
          />
        )}
      </div>
    </div>
  );
}
