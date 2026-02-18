import { prisma } from './src/lib/prisma';
import { supabase } from './src/lib/supabase';
import fs from 'fs';
import path from 'path';

async function sync() {
  // Dosya yolunu daha güvenli tanımlayalım
  const sourceDir = "C:/Users/Eren/Downloads/Telegram Desktop/kitaplar";
  
  console.log('🧹 Eski kayitlar temizleniyor...');
  try {
    await prisma.novel.deleteMany({});
    console.log('✅ Veritabani temizlendi.');

    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
      console.error('❌ Admin kullanicisi bulunamadi!');
      process.exit(1);
    }

    if (!fs.existsSync(sourceDir)) {
      console.error('❌ Kaynak klasor bulunamadi!');
      process.exit(1);
    }

    const files = fs.readdirSync(sourceDir);
    console.log(`📂 Klasorde ${files.length} dosya bulundu.\n`);

    for (const fileName of files) {
      if (fileName.toLowerCase().endsWith('.pdf')) {
        let title = fileName.replace('.pdf', '');
        let author = 'Bilinmiyor';

        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          author = parts[0].trim();
          title = parts[1].trim();
        }

        console.log(`📦 Yukleniyor: ${title} (${author})`);

        const filePath = path.join(sourceDir, fileName);
        const fileBuffer = fs.readFileSync(filePath);
        const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('novels')
          .upload(`files/${safeFileName}`, fileBuffer, { upsert: true });

        if (uploadError) {
          console.error(`❌ Storage Hatasi:`, uploadError.message);
          continue;
        }

        const { data: { publicUrl: fileUrl } } = supabase.storage
          .from('novels')
          .getPublicUrl(`files/${safeFileName}`);

        await prisma.novel.create({
          data: {
            title: title,
            author: author,
            fileUrl: fileUrl,
            fileType: 'pdf',
            uploaderId: admin.id,
            category: 'Genel'
          }
        });
        console.log(`✅ Eklendi: ${title}`);
      }
    }
    console.log('\n✨ Islem tamamlandi!');
  } catch (err: any) {
    console.error('❌ Hata:', err.message);
  } finally {
    process.exit(0);
  }
}

sync();
