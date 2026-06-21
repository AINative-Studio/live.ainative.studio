import { NextRequest, NextResponse } from 'next/server';

const AINATIVE_API_URL = 'https://api.ainative.studio/api/v1/chat/completions';
const AINATIVE_API_TOKEN = process.env.AINATIVE_API_TOKEN || '';

export interface Caption {
  startTime: number;
  endTime: number;
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vodId, videoUrl } = body;

    if (!vodId) {
      return NextResponse.json({ error: 'vodId is required' }, { status: 400 });
    }

    if (!AINATIVE_API_TOKEN) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const systemPrompt =
      'You are a transcription assistant for AINative Studio Live, a developer streaming platform. ' +
      'Generate realistic captions/subtitles for a VOD recording. ' +
      'Respond in valid JSON with this exact structure: ' +
      '{"captions": [{"startTime": 0, "endTime": 5, "text": "caption text"}, ...]}. ' +
      'Generate 15-25 caption segments covering the video duration. ' +
      'Each segment should be 3-8 seconds long. Use technical developer-focused language. ' +
      'Only output JSON, no markdown.';

    let userContent = `Generate captions for VOD recording ID: ${vodId}.`;
    if (videoUrl) {
      userContent += ` Video URL: ${videoUrl}`;
    }
    userContent +=
      '\n\nGenerate realistic caption segments that a developer might say during a coding stream. ' +
      'Include greetings, code explanations, debugging commentary, and technical discussion.';

    const response = await fetch(AINATIVE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AINATIVE_API_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        stream: false,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AINative API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate captions' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    try {
      const parsed = JSON.parse(content);
      const captions: Caption[] = (parsed.captions || []).map(
        (c: { startTime: number; endTime: number; text: string }) => ({
          startTime: Number(c.startTime),
          endTime: Number(c.endTime),
          text: String(c.text),
        })
      );

      return NextResponse.json({ captions });
    } catch {
      // If the LLM didn't return valid JSON, return empty captions
      console.error('Failed to parse captions JSON:', content);
      return NextResponse.json({ captions: [] });
    }
  } catch (err) {
    console.error('Caption generation error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
