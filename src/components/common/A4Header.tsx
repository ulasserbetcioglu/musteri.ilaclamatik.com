import { BRAND_GREEN, LOGO_URL } from '../../constants';
import type { DocumentSettings } from '../../types';

interface A4HeaderProps {
  title: string;
  settings: DocumentSettings;
}

export function A4Header({ title, settings }: A4HeaderProps) {
  return (
    <div className="border-2 border-black mb-6">
      <div className="flex">
        <div className="w-1/4 border-r-2 border-black flex flex-col items-center justify-center p-2 text-center">
          <img src={LOGO_URL} alt="Mentor Logo" className="max-h-12 mb-1" />
          <div className="text-[10px] italic font-bold" style={{ color: BRAND_GREEN }}>
            Leave pest to us.
          </div>
        </div>
        <div className="w-2/4 border-r-2 border-black flex items-center justify-center p-2">
          <h1 className="text-xl font-bold text-center uppercase">{title}</h1>
        </div>
        <div className="w-1/4 text-xs">
          <div className="border-b border-black p-1 flex justify-between">
            <span className="font-bold">Doküman No:</span>
            <span>{settings.dokumanNo}</span>
          </div>
          <div className="border-b border-black p-1 flex justify-between">
            <span className="font-bold">Yayın Tarihi:</span>
            <span>{settings.yayinTarihi}</span>
          </div>
          <div className="border-b border-black p-1 flex justify-between">
            <span className="font-bold">Revizyon No:</span>
            <span>{settings.revizyonNo}</span>
          </div>
          <div className="p-1 flex justify-between">
            <span className="font-bold">Sayfa No:</span>
            <span>1 / 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}