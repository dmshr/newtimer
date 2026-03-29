import { prisma } from '@/lib/prisma'

export async function getAllBosses() {
  return await prisma.boss.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function saveBoss(data) {
  return await prisma.boss.create({
    data: {
      name: data.name
    }
  })
}