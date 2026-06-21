import { NextRequest, NextResponse } from 'next/server';

const GRAPHRAG_API = 'https://api.ainative.studio/api/v1/public/memory/v2/graph/graphrag';
const AINATIVE_API_TOKEN = process.env.AINATIVE_API_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamTitle, streamTags, viewerHistory } = body;

    if (!streamTitle && (!streamTags || streamTags.length === 0)) {
      return NextResponse.json(
        { error: 'streamTitle or streamTags is required' },
        { status: 400 }
      );
    }

    // Build query from stream context
    const queryParts = [];
    if (streamTitle) queryParts.push(streamTitle);
    if (streamTags?.length) queryParts.push(streamTags.join(', '));

    const query = queryParts.join(' - ');

    // Try GraphRAG first
    if (AINATIVE_API_TOKEN) {
      try {
        const graphRes = await fetch(GRAPHRAG_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AINATIVE_API_TOKEN}`,
          },
          body: JSON.stringify({
            query,
            limit: 4,
            metadata: {
              source: 'stream-recommendations',
              tags: streamTags || [],
              viewer_history: viewerHistory || [],
            },
          }),
        });

        if (graphRes.ok) {
          const graphData = await graphRes.json();

          // Transform GraphRAG results into stream suggestions
          if (graphData.results && graphData.results.length > 0) {
            const suggestions = graphData.results.map((result: any, index: number) => ({
              id: result.id || `rec-${index}`,
              title: result.title || result.content?.substring(0, 80) || 'Related Stream',
              description: result.content || result.summary || '',
              tags: result.metadata?.tags || streamTags || [],
              score: result.score || result.relevance || 0,
            }));

            return NextResponse.json({ suggestions, source: 'graphrag' });
          }
        }
      } catch (graphErr) {
        console.error('GraphRAG API error:', graphErr);
        // Fall through to tag-based matching
      }
    }

    // Fallback: generate tag-based suggestions
    const suggestions = generateTagBasedSuggestions(streamTitle, streamTags || []);
    return NextResponse.json({ suggestions, source: 'tags' });
  } catch (err) {
    console.error('Recommendations error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateTagBasedSuggestions(
  title: string,
  tags: string[]
): Array<{ id: string; title: string; description: string; tags: string[]; score: number }> {
  // Generate contextual placeholder suggestions based on the tags
  const suggestions = [];
  const tagNames = tags.map((t) => (typeof t === 'string' ? t : (t as any).name || ''));

  const topics = [
    { prefix: 'Building', suffix: 'from scratch' },
    { prefix: 'Deep dive into', suffix: 'internals' },
    { prefix: 'Live debugging', suffix: 'in production' },
    { prefix: 'Advanced', suffix: 'patterns and best practices' },
  ];

  for (let i = 0; i < Math.min(4, topics.length); i++) {
    const topic = topics[i];
    const tag = tagNames[i % tagNames.length] || 'code';
    suggestions.push({
      id: `tag-rec-${i}`,
      title: `${topic.prefix} ${tag} ${topic.suffix}`,
      description: `A related stream about ${tag} that you might find interesting based on your viewing history.`,
      tags: tagNames.slice(0, 3),
      score: 1 - i * 0.2,
    });
  }

  return suggestions;
}
