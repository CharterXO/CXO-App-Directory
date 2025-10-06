import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get('search');
  const categories = url.searchParams.get('categories');
  const categoryList = categories ? categories.split(',').map((item) => item.trim()).filter(Boolean) : [];

  const apps = await prisma.app.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }
      : undefined,
    orderBy: [{ featured: 'desc' }, { name: 'asc' }]
  });

  const filtered = categoryList.length
    ? apps.filter((app) => {
        const categories = Array.isArray(app.categories) ? (app.categories as string[]) : [];
        return categoryList.every((category) => categories.includes(category));
      })
    : apps;

  return NextResponse.json(
    filtered.map((app) => ({
      ...app,
      categories: Array.isArray(app.categories) ? (app.categories as string[]) : []
    }))
  );
}
