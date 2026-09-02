import { prisma } from './prisma'

// فحص تعارض المصالح: هل الاسم ده (خصم جديد أو موكل جديد) متطابق مع
// موكل حالي أو خصم في قضية حالية في نفس المكتب؟ ده تحذير مش منع - القرار
// النهائي للمحامي، لكن لازم يظهر له وميتفوتش.

export interface ConflictMatch {
  type: 'existing_client' | 'existing_opponent'
  id: string
  name: string
  detail?: string
}

function normalize(name: string): string {
  return name.trim().toLowerCase()
}

export async function findConflicts(
  name: string,
  organizationId: string,
  excludeClientId?: string
): Promise<ConflictMatch[]> {
  const q = normalize(name)
  if (q.length < 3) return []

  const matches: ConflictMatch[] = []

  const clients = await prisma.client.findMany({
    where: {
      organizationId,
      name: { contains: q, mode: 'insensitive' },
      ...(excludeClientId && { id: { not: excludeClientId } }),
    },
    select: { id: true, name: true },
    take: 5,
  })
  for (const c of clients) {
    matches.push({ type: 'existing_client', id: c.id, name: c.name })
  }

  const cases = await prisma.case.findMany({
    where: {
      organizationId,
      opponent: { contains: q, mode: 'insensitive' },
    },
    select: { id: true, opponent: true, internalId: true, title: true },
    take: 5,
  })
  for (const c of cases) {
    matches.push({
      type: 'existing_opponent',
      id: c.id,
      name: c.opponent,
      detail: `خصم في القضية "${c.title}" (${c.internalId})`,
    })
  }

  return matches
}
