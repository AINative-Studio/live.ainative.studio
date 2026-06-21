import { NextRequest, NextResponse } from 'next/server';

const MEMORY_API = 'https://api.ainative.studio/memory/v2';
const AINATIVE_API_TOKEN = process.env.AINATIVE_API_TOKEN || '';

/**
 * Server-side proxy for ZeroMemory API.
 * Keeps the API token on the server and exposes remember/recall/profile
 * operations to the client via POST /api/memory?action=remember|recall|profile.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, entityId, content, metadata, query, limit } = body;

    if (!AINATIVE_API_TOKEN) {
      // Gracefully degrade when memory is not configured
      return NextResponse.json({ memories: [], profile: null }, { status: 200 });
    }

    if (!entityId) {
      return NextResponse.json({ error: 'entityId is required' }, { status: 400 });
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AINATIVE_API_TOKEN}`,
    };

    switch (action) {
      case 'remember': {
        if (!content) {
          return NextResponse.json({ error: 'content is required' }, { status: 400 });
        }

        const res = await fetch(`${MEMORY_API}/remember`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            entity_id: entityId,
            content,
            metadata: metadata || {},
            memory_type: 'episodic',
          }),
        });

        if (!res.ok) {
          console.error('ZeroMemory remember error:', res.status, await res.text());
          return NextResponse.json({ stored: false }, { status: 200 });
        }

        const data = await res.json();
        return NextResponse.json({ stored: true, ...data });
      }

      case 'recall': {
        if (!query) {
          return NextResponse.json({ error: 'query is required' }, { status: 400 });
        }

        const res = await fetch(`${MEMORY_API}/recall`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            entity_id: entityId,
            query,
            limit: limit || 5,
          }),
        });

        if (!res.ok) {
          console.error('ZeroMemory recall error:', res.status, await res.text());
          return NextResponse.json({ memories: [] }, { status: 200 });
        }

        const data = await res.json();
        return NextResponse.json(data);
      }

      case 'profile': {
        const res = await fetch(
          `${MEMORY_API}/profile?entity_id=${encodeURIComponent(entityId)}`,
          { headers }
        );

        if (!res.ok) {
          console.error('ZeroMemory profile error:', res.status, await res.text());
          return NextResponse.json({ profile: null }, { status: 200 });
        }

        const data = await res.json();
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: remember, recall, or profile' },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error('Memory API error:', err);
    // Gracefully degrade — never break the app because memory is down
    return NextResponse.json({ memories: [], profile: null }, { status: 200 });
  }
}
