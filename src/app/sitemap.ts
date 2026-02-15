import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://romanoku.space' // Replace with your actual domain

  // Get all novels from database
  const novels = await prisma.novel.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  })

  const novelEntries = novels.map((novel) => ({
    url: `${baseUrl}/novels/${novel.id}`,
    lastModified: novel.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...novelEntries,
  ]
}
