import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();
  
  const healthData = {
    status: 'ok',
    timestamp,
    uptimeSeconds: Math.floor(uptime),
    services: {
      api: 'healthy',
      geminiModel: 'gemini-2.5-flash',
      storageBucket: 'documents'
    }
  };

  logger.info('Health check requested', {
    event: 'health_check',
    endpoint: '/api/health',
    status: 'success'
  });

  return NextResponse.json(healthData, { status: 200 });
}
