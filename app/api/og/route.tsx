import { ImageResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? 'AINative Studio Live';
  const subtitle = searchParams.get('subtitle') ?? 'Developer Streaming Platform';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          backgroundColor: '#0a0a0a',
          padding: '60px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'white',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            AINATIVE
            <span style={{ color: '#6b7280', fontSize: '14px', marginLeft: '8px', fontWeight: 400 }}>
              LIVE
            </span>
          </span>
        </div>
        <div
          style={{
            fontSize: title.length > 40 ? '48px' : '64px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '16px',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: '24px',
            color: '#9ca3af',
            fontWeight: 400,
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
