import { NextRequest, NextResponse } from 'next/server';

const AINATIVE_API_URL = 'https://api.ainative.studio/api/v1/chat/completions';
const AINATIVE_API_TOKEN = process.env.AINATIVE_API_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamTitle, streamDescription, streamLanguage } = body;

    if (!streamTitle) {
      return NextResponse.json({ error: 'streamTitle is required' }, { status: 400 });
    }

    if (!AINATIVE_API_TOKEN) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const systemPrompt =
      'You are an AI assistant on AINative Studio Live, a developer streaming platform. ' +
      'Generate a brief summary of what the streamer is working on. ' +
      'Respond in valid JSON with this exact structure: ' +
      '{"summary": "2-3 sentence summary", "topics": ["topic1", "topic2"], "currentActivity": "what they are doing right now"}. ' +
      'Keep topics to 3-5 short labels. Only output JSON, no markdown.';

    let userContent = `Stream title: "${streamTitle}"`;
    if (streamDescription) {
      userContent += `\nDescription: "${streamDescription}"`;
    }
    if (streamLanguage) {
      userContent += `\nLanguage/Technology: ${streamLanguage}`;
    }
    userContent += '\n\nGenerate a summary for viewers.';

    const response = await fetch(AINATIVE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AINATIVE_API_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        stream: false,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AINative API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate summary' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse the JSON response from the LLM
    try {
      const parsed = JSON.parse(content);
      return NextResponse.json({
        summary: parsed.summary || 'No summary available.',
        topics: parsed.topics || [],
        currentActivity: parsed.currentActivity || null,
      });
    } catch {
      // If the LLM didn't return valid JSON, use the raw text as summary
      return NextResponse.json({
        summary: content.slice(0, 500),
        topics: [],
        currentActivity: null,
      });
    }
  } catch (err) {
    console.error('AI summary error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
