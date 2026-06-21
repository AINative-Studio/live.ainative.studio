import { NextRequest, NextResponse } from 'next/server';

const AINATIVE_API_URL = 'https://api.ainative.studio/api/v1/chat/completions';
const AINATIVE_API_TOKEN = process.env.AINATIVE_API_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamTitle, streamDescription, language, duration, viewerCount } = body;

    if (!streamTitle) {
      return NextResponse.json({ error: 'streamTitle is required' }, { status: 400 });
    }

    if (!AINATIVE_API_TOKEN) {
      // Generate simple fallback posts when API is not configured
      return NextResponse.json({
        twitter: generateFallbackTwitter(streamTitle, language, viewerCount),
        linkedin: generateFallbackLinkedIn(streamTitle, streamDescription, language, duration, viewerCount),
      });
    }

    const systemPrompt =
      'You are a social media content writer for AINative Studio Live, a developer streaming platform. ' +
      'Generate engaging social media posts about a completed live coding stream. ' +
      'Keep the tone technical but approachable. Use relevant hashtags for developer audiences. ' +
      'Do NOT use emojis excessively — 1-2 max per post. ' +
      'Return valid JSON with exactly two keys: "twitter" (max 280 chars) and "linkedin" (max 700 chars).';

    const durationStr = duration ? `${Math.floor(duration / 60)} minutes` : 'a session';
    const viewerStr = viewerCount ? `${viewerCount} viewers` : 'viewers';

    const userContent = [
      `Stream title: "${streamTitle}"`,
      streamDescription ? `Description: ${streamDescription}` : '',
      language ? `Language/Tech: ${language}` : '',
      `Duration: ${durationStr}`,
      `Peak viewers: ${viewerStr}`,
      '',
      'Generate a Twitter post (max 280 chars) and a LinkedIn post (max 700 chars) about this stream. Return as JSON: { "twitter": "...", "linkedin": "..." }',
    ]
      .filter(Boolean)
      .join('\n');

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
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      console.error('AINative API error:', response.status, await response.text());
      // Fall back to generated posts
      return NextResponse.json({
        twitter: generateFallbackTwitter(streamTitle, language, viewerCount),
        linkedin: generateFallbackLinkedIn(streamTitle, streamDescription, language, duration, viewerCount),
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Try parsing JSON from the response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          twitter: parsed.twitter || generateFallbackTwitter(streamTitle, language, viewerCount),
          linkedin: parsed.linkedin || generateFallbackLinkedIn(streamTitle, streamDescription, language, duration, viewerCount),
        });
      }
    } catch {
      // JSON parsing failed, use fallback
    }

    return NextResponse.json({
      twitter: generateFallbackTwitter(streamTitle, language, viewerCount),
      linkedin: generateFallbackLinkedIn(streamTitle, streamDescription, language, duration, viewerCount),
    });
  } catch (err) {
    console.error('Social post generation error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateFallbackTwitter(title: string, language?: string, viewers?: number): string {
  const langTag = language ? ` #${language.replace(/[^a-zA-Z0-9]/g, '')}` : '';
  const viewerStr = viewers ? ` with ${viewers} viewers` : '';
  return `Just wrapped up a live coding session: "${title}"${viewerStr} on @AINativeStudio!${langTag} #LiveCoding #DevStream`;
}

function generateFallbackLinkedIn(
  title: string,
  description?: string,
  language?: string,
  duration?: number,
  viewers?: number
): string {
  const durationStr = duration ? `${Math.floor(duration / 60)} minutes` : 'a session';
  const viewerStr = viewers ? `${viewers} developers tuned in` : 'Developers tuned in';
  const descStr = description ? `\n\n${description}` : '';
  const langStr = language ? `\nTech: ${language}` : '';

  return `Just finished a ${durationStr} live coding stream: "${title}" on AINative Studio Live.${descStr}\n\n${viewerStr} to watch the development process in real-time.${langStr}\n\nLive coding is a great way to share knowledge, get feedback, and build in public. Check out AINative Studio Live for more developer streams.\n\n#LiveCoding #DeveloperCommunity #BuildInPublic`;
}
