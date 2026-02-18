import { prisma } from './src/lib/prisma';
import { supabase } from './src/lib/supabase';
import fs from 'fs';
import path from 'path';

async function sync() {
  console.log('🚀 Kurtarma Operasyonu Başladı...');

  try {
    // 1. Admin Kullanıcı Oluştur (Eğer yoksa)
    const adminEmail = 'admin@romanoku.space';
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!admin) {
      console.log('👤 Admin kullanıcısı oluşturuluyor...');
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin',
          role: 'ADMIN',
          emailVerified: new Date(),
        }
      });
    }
    
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const files = fs.readdirSync(uploadDir);

    for (const fileName of files) {
      if (fileName.endsWith('.pdf')) {
        console.log(`📦 Isleniyor: ${fileName}`);

        const filePath = path.join(uploadDir, fileName);
        const fileBuffer = fs.readFileSync(filePath);

        // 2. Supabase Storage'a Yükle
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('novels')
          .upload(`files/${fileName}`, fileBuffer, { upsert: true });

        if (uploadError) {
          console.error(`❌ Yukleme Hatasi (${fileName}):`, uploadError.message);
          continue;
        }

        const { data: { publicUrl: fileUrl } } = supabase.storage
          .from('novels')
          .getPublicUrl(`files/${fileName}`);

        // 3. Veritabanına Kaydet
        const novel = await prisma.novel.create({
          data: {
            title: `Kurtarilan Roman - ${fileName.split('.')[0]}`,
            author: 'Bilinmiyor',
            fileUrl: fileUrl,
            fileType: 'pdf',
            uploaderId: admin.id,
            category: 'Genel'
          }
        });
        console.log(`✅ Kaydedildi: ${novel.title}`);
      }
    }
    console.log('\n✨ Islem Tamamlandi! Lutfen siteyi yenileyin.');
  } catch (error: any) {
    console.error('❌ Hata Oluştu:', error.message);
  } finally {
    process.exit(0);
  }
}

sync();
