import { NextRequest, NextResponse } from 'next/server';

const AINATIVE_API_URL = 'https://api.ainative.studio/api/v1/chat/completions';
const AINATIVE_API_TOKEN = process.env.AINATIVE_API_TOKEN || '';

export type ModerationAction = 'safe' | 'warning' | 'block';

export interface ModerationResult {
  action: ModerationAction;
  reason: string;
}

const SYSTEM_PROMPT =
  'You are a chat moderator for a developer streaming platform. ' +
  'Classify the following message as "safe", "warning", or "block". ' +
  'Only block messages with hate speech, spam, or explicit content. ' +
  'Developer jargon, code snippets, and technical discussion are always safe. ' +
  'Respond with JSON: { "action": "safe"|"warning"|"block", "reason": "string" }';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, streamContext } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'message is required and must be a string' },
        { status: 400 }
      );
    }

    if (!AINATIVE_API_TOKEN) {
      return NextResponse.json(
        { error: 'AI moderation service is not configured' },
        { status: 503 }
      );
    }

    let userContent = `Classify this chat message:\n\n"${message}"`;
    if (streamContext) {
      userContent += `\n\nStream context: ${streamContext}`;
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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        stream: false,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI moderation API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to moderate message' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawAnswer = data.choices?.[0]?.message?.content || '';

    // Parse the JSON response from the LLM
    const result = parseModeration(rawAnswer);

    return NextResponse.json(result);
  } catch (err) {
    console.error('AI moderation error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function parseModeration(raw: string): ModerationResult {
  try {
    // Extract JSON from the response (LLM may wrap it in markdown)
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const action = ['safe', 'warning', 'block'].includes(parsed.action)
        ? parsed.action
        : 'safe';
      return {
        action: action as ModerationAction,
        reason: parsed.reason || '',
      };
    }
  } catch {
    // Fall through to default
  }

  // Default to safe if parsing fails
  return { action: 'safe', reason: 'Unable to classify — defaulting to safe' };
}
