import { NextRequest, NextResponse } from 'next/server';

const AINATIVE_API_URL = 'https://api.ainative.studio/api/v1/chat/completions';
const AINATIVE_API_TOKEN = process.env.AINATIVE_API_TOKEN || '';
const MEMORY_API = 'https://api.ainative.studio/memory/v2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, streamTitle, streamLanguage, streamDescription, code, userId } = body;

    if (!question && !code) {
      return NextResponse.json({ error: 'question or code is required' }, { status: 400 });
    }

    if (!AINATIVE_API_TOKEN) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    // Recall viewer memories for context enrichment (non-blocking on failure)
    let viewerContext = '';
    if (userId && AINATIVE_API_TOKEN) {
      viewerContext = await recallViewerContext(userId, question || code || '');
    }

    const systemPrompt = buildSystemPrompt(streamTitle, streamLanguage, streamDescription, viewerContext);
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

    // Store the Q&A interaction as a memory (fire-and-forget)
    if (userId && AINATIVE_API_TOKEN) {
      storeInteractionMemory(userId, userContent, answer, streamTitle).catch((err) =>
        console.error('Failed to store interaction memory:', err)
      );
    }

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('AI chat error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Recall relevant viewer memories to enrich the AI system prompt.
 */
async function recallViewerContext(entityId: string, query: string): Promise<string> {
  try {
    const res = await fetch(`${MEMORY_API}/recall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AINATIVE_API_TOKEN}`,
      },
      body: JSON.stringify({
        entity_id: entityId,
        query,
        limit: 5,
      }),
    });

    if (!res.ok) return '';

    const data = await res.json();
    const memories = data.memories || [];

    if (memories.length === 0) return '';

    const memoryLines = memories
      .map((m: { content: string }) => `- ${m.content}`)
      .join('\n');

    return `\n\nThe viewer has previously watched and interacted with:\n${memoryLines}`;
  } catch {
    return '';
  }
}

/**
 * Store the Q&A exchange as an episodic memory for future context.
 */
async function storeInteractionMemory(
  entityId: string,
  question: string,
  answer: string,
  streamTitle?: string
): Promise<void> {
  const truncatedAnswer = answer.length > 200 ? answer.slice(0, 200) + '...' : answer;
  const content = `Asked about: "${question.slice(0, 100)}" — Answer: ${truncatedAnswer}`;

  await fetch(`${MEMORY_API}/remember`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AINATIVE_API_TOKEN}`,
    },
    body: JSON.stringify({
      entity_id: entityId,
      content,
      metadata: {
        type: 'ai_interaction',
        streamTitle: streamTitle || null,
        timestamp: new Date().toISOString(),
      },
      memory_type: 'episodic',
    }),
  });
}

function buildSystemPrompt(
  title?: string,
  language?: string,
  description?: string,
  viewerContext?: string
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
  if (viewerContext) {
    prompt += viewerContext;
  }

  return prompt;
}
