import { NextResponse } from "next/server";
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const startTime = Date.now();
    await db.$queryRaw`SELECT 1 as test`;
    const dbResponseTime = Date.now() - startTime;

    // Get database info
    const userCount = await db.user.count();
    const projectCount = await db.project.count();

    const healthInfo = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: "connected",
        responseTime: `${dbResponseTime}ms`,
        provider: "neon-postgresql",
        stats: {
          users: userCount,
          projects: projectCount
        }
      },
      services: {
        api: "operational",
        puter: "integrated",
        fallback: "available"
      },
      version: process.env.APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development"
    };

    return NextResponse.json(healthInfo);
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      database: {
        status: "disconnected",
        provider: "neon-postgresql"
      }
    }, { status: 503 });
  }
}