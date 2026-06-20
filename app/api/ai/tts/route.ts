import { NextRequest, NextResponse } from 'next/server';

const AINATIVE_API_URL = 'https://api.ainative.studio/api/v1/multimodal/tts';
const AINATIVE_API_TOKEN = process.env.AINATIVE_API_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    if (!AINATIVE_API_TOKEN) {
      return NextResponse.json(
        { error: 'AI service is not configured. Set AINATIVE_API_TOKEN.' },
        { status: 503 }
      );
    }

    // Truncate very long text to avoid excessive TTS cost
    const truncatedText = text.slice(0, 500);

    const response = await fetch(AINATIVE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AINATIVE_API_TOKEN}`,
      },
      body: JSON.stringify({
        text: truncatedText,
        voice: 'default',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AINative TTS API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      audio: data.audio || data.base64 || null,
    });
  } catch (err) {
    console.error('TTS error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
