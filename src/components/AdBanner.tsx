import React from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
}

const AdBanner = ({ slot, format = 'auto' }: AdBannerProps) => {
  return (
    <div className="w-full my-8 flex flex-col items-center">
      {/* Reklam Etiketi */}
      <span className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 font-bold">Reklam / Advertisement</span>
      
      {/* Reklam Kutusu */}
      <div className="w-full min-h-[100px] md:min-h-[250px] bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden group transition-all hover:border-white/10">
        <div className="text-gray-700 text-sm font-medium">Reklam Alanı</div>
        
        {/* AdSense Onayından Sonra Buraya <ins> kodu gelecek */}
        {/* 
          <ins className="adsbygoogle"
               style={{ display: 'block' }}
               data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
               data-ad-slot={slot}
               data-ad-format={format}
               data-full-width-responsive="true"></ins>
        */}
      </div>
    </div>
  );
};

export default AdBanner;
