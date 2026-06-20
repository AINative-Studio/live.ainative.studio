import { NextRequest, NextResponse } from 'next/server';

const AINATIVE_API_URL = 'https://api.ainative.studio/api/v1/chat/completions';
const AINATIVE_API_TOKEN = process.env.AINATIVE_API_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, streamTitle, streamLanguage, streamDescription, code } = body;

    if (!question && !code) {
      return NextResponse.json({ error: 'question or code is required' }, { status: 400 });
    }

    if (!AINATIVE_API_TOKEN) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const systemPrompt = buildSystemPrompt(streamTitle, streamLanguage, streamDescription);
    let userContent = question || '';

    if (code) {
      const lang = streamLanguage || 'the programming language being used';
      userContent = `Explain this code snippet (language: ${lang}):\n\n\`\`\`\n${code}\n\`\`\``;
      if (question) {
        userContent = `${question}\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
      }
    }

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
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AINative API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'No response generated.';

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('AI chat error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  title?: string,
  language?: string,
  description?: string
): string {
  let prompt =
    'You are an AI assistant on AINative Studio Live, a developer streaming platform. ' +
    'You help viewers understand the code being streamed. Be concise, technical, and helpful.';

  if (title) {
    prompt += ` The current stream is: "${title}".`;
  }
  if (language) {
    prompt += ` Language: ${language}.`;
  }
  if (description) {
    prompt += ` Stream description: ${description}.`;
  }

  return prompt;
}
