import { NextRequest, NextResponse } from 'next/server';

const AINATIVE_API_URL = 'https://api.ainative.studio/api/v1/multimodal/image';
const AINATIVE_API_TOKEN = process.env.AINATIVE_API_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, language } = body;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    if (!AINATIVE_API_TOKEN) {
      return NextResponse.json(
        { error: 'AI service is not configured. Set AINATIVE_API_TOKEN.' },
        { status: 503 }
      );
    }

    const promptParts = [
      `A professional stream thumbnail for: ${title}.`,
      'Dark theme, coding aesthetic, developer streaming platform.',
      'Clean modern design with subtle code elements.',
    ];

    if (language) {
      promptParts.push(`Programming language: ${language}.`);
    }
    if (description) {
      promptParts.push(`Context: ${description}.`);
    }

    const response = await fetch(AINATIVE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AINATIVE_API_TOKEN}`,
      },
      body: JSON.stringify({
        prompt: promptParts.join(' '),
        width: 1280,
        height: 720,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AINative image API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate thumbnail' },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      imageUrl: data.image_url || null,
      base64: data.base64 || data.image || null,
    });
  } catch (err) {
    console.error('Thumbnail generation error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
