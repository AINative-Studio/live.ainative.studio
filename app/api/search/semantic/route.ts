import { NextRequest, NextResponse } from 'next/server';

const AINATIVE_API_URL = 'https://api.ainative.studio/api/v1/chat/completions';
const AINATIVE_API_TOKEN = process.env.AINATIVE_API_TOKEN || '';

export interface SemanticSearchResult {
  streamId: string;
  title: string;
  description: string;
  relevanceScore: number;
  matchReason: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    if (!AINATIVE_API_TOKEN) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const systemPrompt =
      'You are a semantic search engine for AINative Studio Live, a developer streaming platform. ' +
      'Given a natural language search query, interpret the intent and generate relevant stream results. ' +
      'Respond in valid JSON with this exact structure: ' +
      '{"results": [{"streamId": "generated-id", "title": "stream title", "description": "brief description", "relevanceScore": 0.95, "matchReason": "why this matches"}], "interpretation": "how you understood the query"}. ' +
      'Generate 3-8 realistic results sorted by relevance. Scores should be between 0 and 1. ' +
      'Focus on developer streaming topics: coding, debugging, system design, frameworks, languages. ' +
      'Only output JSON, no markdown.';

    const userContent = `Search query: "${query}"\n\nFind relevant developer streams matching this query.`;

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
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AINative API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Semantic search unavailable', fallback: true },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    try {
      const parsed = JSON.parse(content);
      const results: SemanticSearchResult[] = (parsed.results || []).map(
        (r: SemanticSearchResult) => ({
          streamId: String(r.streamId),
          title: String(r.title),
          description: String(r.description),
          relevanceScore: Number(r.relevanceScore),
          matchReason: String(r.matchReason),
        })
      );

      return NextResponse.json({
        results,
        interpretation: parsed.interpretation || null,
      });
    } catch {
      console.error('Failed to parse semantic search JSON:', content);
      return NextResponse.json({
        results: [],
        interpretation: null,
        fallback: true,
      });
    }
  } catch (err) {
    console.error('Semantic search error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
