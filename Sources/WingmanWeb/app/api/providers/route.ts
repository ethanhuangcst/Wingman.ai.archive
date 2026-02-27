import { NextRequest, NextResponse } from 'next/server';
import { getAllProviders, getDefaultProvider } from '../../lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching providers from database...');
    const providers = await getAllProviders();
    console.log('Providers fetched:', providers);
    const defaultProvider = await getDefaultProvider();
    console.log('Default provider:', defaultProvider);
    
    return NextResponse.json({
      providers,
      defaultProvider
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}
