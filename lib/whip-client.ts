/**
 * WHIP (WebRTC-HTTP Ingestion Protocol) client for Cloudflare Stream.
 *
 * Sends a browser MediaStream to Cloudflare's CDN via WebRTC.
 * Protocol spec: https://www.ietf.org/archive/id/draft-ietf-wish-whip-01.html
 *
 * Usage:
 *   const client = new WHIPClient(whipUrl);
 *   await client.publish(mediaStream);
 *   // ... later
 *   await client.disconnect();
 */

export class WHIPClient {
  private pc: RTCPeerConnection | null = null;
  private resourceUrl: string | null = null;
  private whipUrl: string;

  constructor(whipUrl: string) {
    this.whipUrl = whipUrl;
  }

  /**
   * Publish a MediaStream to Cloudflare via WHIP.
   * Creates an RTCPeerConnection, adds tracks, creates an SDP offer,
   * and negotiates with the WHIP endpoint.
   */
  async publish(stream: MediaStream): Promise<void> {
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
      bundlePolicy: 'max-bundle',
    });

    // Add all tracks from the MediaStream
    stream.getTracks().forEach((track) => {
      this.pc!.addTransceiver(track, { direction: 'sendonly' });
    });

    // Create SDP offer
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    // Wait for ICE gathering to complete
    await this.waitForIceGathering();

    const localDescription = this.pc.localDescription;
    if (!localDescription) {
      throw new Error('Failed to create local SDP description');
    }

    // Send offer via local WHIP proxy to avoid CORS issues with Cloudflare
    const proxyUrl = `/api/whip?url=${encodeURIComponent(this.whipUrl)}`;
    const response = await fetch(proxyUrl, {
      method: 'POST',
      body: localDescription.sdp,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`WHIP negotiation failed (${response.status}): ${errorText}`);
    }

    // Store the resource URL for later teardown
    const location = response.headers.get('Location');
    if (location) {
      this.resourceUrl = location;
    }

    // Set remote answer
    const answerSdp = await response.text();
    await this.pc.setRemoteDescription(
      new RTCSessionDescription({ type: 'answer', sdp: answerSdp })
    );
  }

  /**
   * Disconnect and clean up the WebRTC session.
   */
  async disconnect(): Promise<void> {
    // Send DELETE via proxy to tear down the WHIP resource
    if (this.resourceUrl) {
      try {
        await fetch(`/api/whip?url=${encodeURIComponent(this.resourceUrl)}`, { method: 'DELETE' });
      } catch (e) {
        // Best effort — server may already have cleaned up
      }
    }

    // Close the peer connection
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    this.resourceUrl = null;
  }

  /**
   * Get connection state.
   */
  get connectionState(): RTCPeerConnectionState | 'new' {
    return this.pc?.connectionState ?? 'new';
  }

  /**
   * Register a callback for connection state changes.
   */
  onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    if (this.pc) {
      this.pc.onconnectionstatechange = () => {
        callback(this.pc!.connectionState);
      };
    }
  }

  /**
   * Wait for ICE candidate gathering to complete.
   */
  private waitForIceGathering(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.pc) return resolve();

      if (this.pc.iceGatheringState === 'complete') {
        return resolve();
      }

      // Timeout after 5 seconds — use whatever candidates we have
      const timeout = setTimeout(() => resolve(), 5000);

      this.pc.onicegatheringstatechange = () => {
        if (this.pc?.iceGatheringState === 'complete') {
          clearTimeout(timeout);
          resolve();
        }
      };
    });
  }
}
