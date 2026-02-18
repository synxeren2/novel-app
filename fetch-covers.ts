import { prisma } from './src/lib/prisma';
import { supabase } from './src/lib/supabase';
import fetch from 'node-fetch';

async function fetchAndUploadCover(novel: any) {
  const query = encodeURIComponent(`${novel.title} ${novel.author}`);
  console.log(`🔍 Kapak araniyor: ${novel.title} - ${novel.author}`);

  try {
    const searchUrl = `https://openlibrary.org/search.json?q=${query}`;
    const response = await fetch(searchUrl);
    const data: any = await response.json();

    let coverUrl = null;
    if (data.docs && data.docs.length > 0) {
      const doc = data.docs.find((d: any) => d.cover_i);
      if (doc && doc.cover_i) {
        coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      }
    }

    if (coverUrl) {
      console.log(`📸 Bulundu: ${coverUrl}`);
      const imgRes = await fetch(coverUrl);
      const buffer = await imgRes.arrayBuffer();

      const fileName = `covers/${novel.id}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('novels')
        .upload(fileName, Buffer.from(buffer), { 
          contentType: 'image/jpeg',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('novels')
        .getPublicUrl(fileName);

      await prisma.novel.update({
        where: { id: novel.id },
        data: { coverUrl: publicUrl }
      });

      console.log(`✅ Tamamlandi: ${novel.title}`);
      return true;
    }
    console.log(`❌ Bulunamadi: ${novel.title}`);
    return false;
  } catch (err: any) {
    console.error(`⚠️ Hata:`, err.message);
    return false;
  }
}

async function main() {
  try {
    const novels = await prisma.novel.findMany({ where: { coverUrl: null } });
    console.log(`📚 ${novels.length} kitap taranacak...\n`);
    for (const novel of novels) {
      await fetchAndUploadCover(novel);
      await new Promise(r => setTimeout(r, 1000));
    }
    console.log('\n✨ Tum islemler bitti!');
  } catch (e: any) {
    console.error(e.message);
  } finally {
    process.exit(0);
  }
}

main();
