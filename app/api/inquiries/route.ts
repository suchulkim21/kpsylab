import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.resolve(process.cwd(), 'data', 'inquiries.json');

// Interface for Inquiry
interface Inquiry {
  id: string;
  content: string;
  email?: string;
  createdAt: string;
  answer?: string;
}

// Helper functions
function getInquiries(): Inquiry[] {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  try {
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading inquiries file:', error);
    return [];
  }
}

function saveInquiries(inquiries: Inquiry[]) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(inquiries, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving inquiries file:', error);
    throw error;
  }
}

// GET: 모든 문의 조회
export async function GET() {
  try {
    const inquiries = getInquiries();
    // 최신순으로 정렬
    const sorted = inquiries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

// POST: 문의 작성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, email } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const inquiries = getInquiries();

    const newInquiry: Inquiry = {
      id: Math.random().toString(36).substring(2, 9),
      content: content.trim(),
      email: email?.trim(),
      createdAt: new Date().toISOString(),
    };

    inquiries.push(newInquiry);
    saveInquiries(inquiries);

    return NextResponse.json(newInquiry, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to save inquiry', details: String(error) },
      { status: 500 }
    );
  }
}



