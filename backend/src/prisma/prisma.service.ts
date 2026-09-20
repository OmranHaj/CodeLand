import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    // إنشاء اتصال بقاعدة البيانات باستخدام الرابط من ملف .env
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    
    // تمرير المحول إلى PrismaClient
    super({ adapter });
  }
}