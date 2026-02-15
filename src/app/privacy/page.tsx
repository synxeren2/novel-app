import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-300 space-y-8">
      <h1 className="text-4xl font-black uppercase text-white tracking-tighter">Gizlilik Politikası</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">1. Veri Toplama</h2>
        <p>Roman Oku & İndir (romanoku.space) olarak, kullanıcılarımızın deneyimini iyileştirmek için anonim kullanım verileri ve kayıt sırasında temel bilgiler toplamaktayız.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">2. Çerezler ve Reklamlar</h2>
        <p>Sitemizde Google AdSense gibi üçüncü taraf reklam sağlayıcıları çerezler kullanabilir. Bu çerezler, ilgi alanlarınıza göre reklam sunulmasını sağlar. Google'ın reklam çerezlerini nasıl kullandığını öğrenmek için Google Reklam ve Gizlilik sayfasını ziyaret edebilirsiniz.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">3. Üçüncü Taraf Bağlantıları</h2>
        <p>Sitemiz üzerinden ulaşılan diğer sitelerin içeriklerinden veya gizlilik politikalarından sorumlu değiliz.</p>
      </section>

      <section className="space-y-4 text-sm text-gray-500 italic">
        Son güncelleme: 15 Şubat 2026
      </section>
    </div>
  );
}
