/**
 * WHIP proxy — forwards SDP offer from browser to Cloudflare's WHIP endpoint.
 * This avoids CORS issues since Cloudflare's WebRTC endpoint doesn't allow
 * browser origins.
 *
 * POST /api/whip?url=<cloudflare-whip-url>
 * Body: SDP offer (text/plain)
 * Returns: SDP answer from Cloudflare
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const whipUrl = request.nextUrl.searchParams.get('url');

  if (!whipUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Only allow Cloudflare stream URLs
  if (!whipUrl.includes('cloudflarestream.com')) {
    return NextResponse.json({ error: 'Invalid WHIP endpoint' }, { status: 403 });
  }

  try {
    const sdpOffer = await request.text();

    // Cloudflare WHIP requires the Stream API token for authentication
    const cfToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
    const headers: Record<string, string> = {
      'Content-Type': 'application/sdp',
    };
    if (cfToken) {
      headers['Authorization'] = `Bearer ${cfToken}`;
    }

    const cfResponse = await fetch(whipUrl, {
      method: 'POST',
      headers,
      body: sdpOffer,
    });

    if (!cfResponse.ok) {
      const errorText = await cfResponse.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { error: `Cloudflare WHIP error: ${cfResponse.status} ${errorText}` },
        { status: cfResponse.status }
      );
    }

    const sdpAnswer = await cfResponse.text();
    const location = cfResponse.headers.get('Location');

    return new NextResponse(sdpAnswer, {
      status: 201,
      headers: {
        'Content-Type': 'application/sdp',
        ...(location ? { 'Location': location } : {}),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'WHIP proxy error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  const resourceUrl = request.nextUrl.searchParams.get('url');

  if (!resourceUrl || !resourceUrl.includes('cloudflarestream.com')) {
    return NextResponse.json({ error: 'Invalid resource URL' }, { status: 400 });
  }

  try {
    await fetch(resourceUrl, { method: 'DELETE' });
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 200 }); // Best effort
  }
}
