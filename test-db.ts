import { prisma } from './src/lib/prisma';

async function test() {
  try {
    const novels = await prisma.novel.findMany({
      select: { title: true, createdAt: true }
    });
    console.log('--- VERITABANI DURUMU ---');
    console.log('Bulunan Roman Sayisi:', novels.length);
    novels.forEach((n, i) => {
      console.log(`${i + 1}. ${n.title} (Eklendi: ${n.createdAt})`);
    });
    console.log('--- VERITABANI DURUMU ---');
  } catch (e: any) {
    console.error('HATA:', e.message);
  } finally {
    process.exit(0);
  }
}

test();
