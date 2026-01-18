import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | AINative Studio Live',
  description: 'Privacy Policy for AINative Studio Live - How we collect, use, and protect your data',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground mt-1">Last updated: January 18, 2026</p>
          </div>
        </div>

        <div className="prose prose-invert prose-purple max-w-none">
          <div className="bg-card border border-border rounded-lg p-6 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                AINative Studio Live ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our live streaming
                platform for developers. Please read this policy carefully to understand our practices regarding your
                personal data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold mb-3 text-foreground">2.1 Information You Provide</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We collect information that you voluntarily provide when using our Service:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li><strong className="text-foreground">Account Information:</strong> Username, email address, password, profile picture, and bio</li>
                <li><strong className="text-foreground">Profile Data:</strong> Programming languages, skills, social media links, and preferences</li>
                <li><strong className="text-foreground">Content:</strong> Stream titles, descriptions, chat messages, and uploaded media</li>
                <li><strong className="text-foreground">Communications:</strong> Messages sent to support or other users</li>
                <li><strong className="text-foreground">Payment Information:</strong> Billing details for premium features (processed by third-party providers)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-foreground">2.2 Information Collected Automatically</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                When you use our Service, we automatically collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li><strong className="text-foreground">Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong className="text-foreground">Usage Data:</strong> Pages viewed, streams watched, search queries, interaction patterns</li>
                <li><strong className="text-foreground">Stream Metrics:</strong> Viewer counts, watch duration, engagement statistics</li>
                <li><strong className="text-foreground">Cookies and Tracking:</strong> Session data, preferences, authentication tokens</li>
                <li><strong className="text-foreground">Location Data:</strong> General location based on IP address (not precise geolocation)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-foreground">2.3 Information from Third Parties</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may receive information from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong className="text-foreground">OAuth Providers:</strong> GitHub, Google, Twitter (when you use social login)</li>
                <li><strong className="text-foreground">Analytics Services:</strong> Google Analytics, Mixpanel, or similar tools</li>
                <li><strong className="text-foreground">Payment Processors:</strong> Stripe or other payment service providers</li>
                <li><strong className="text-foreground">CDN Providers:</strong> Cloudflare Stream for video delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use the collected information for the following purposes:
              </p>

              <h3 className="text-xl font-semibold mb-3 text-foreground">3.1 Service Delivery</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Create and manage your account</li>
                <li>Enable live streaming and video playback</li>
                <li>Facilitate real-time chat and interactions</li>
                <li>Process payments and manage subscriptions</li>
                <li>Provide customer support</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-foreground">3.2 Service Improvement</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Analyze usage patterns to improve features</li>
                <li>Develop new functionality and services</li>
                <li>Monitor and optimize performance</li>
                <li>Debug technical issues</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-foreground">3.3 Personalization</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Recommend relevant streams and content</li>
                <li>Customize your user experience</li>
                <li>Remember your preferences and settings</li>
                <li>Suggest streamers to follow</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-foreground">3.4 Communication</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Send service-related notifications</li>
                <li>Provide important updates and announcements</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Respond to your inquiries and requests</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-foreground">3.5 Safety and Security</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Detect and prevent fraud and abuse</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect against security threats</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. How We Share Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold mb-3 text-foreground">4.1 Public Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The following information is public by default:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Username, profile picture, and bio</li>
                <li>Live streams and stream metadata</li>
                <li>Chat messages (visible to all viewers)</li>
                <li>Follower/following relationships</li>
                <li>Public activity (follows, likes, shares)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-foreground">4.2 Service Providers</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We share information with trusted third-party service providers who assist us in:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Cloud hosting and storage (AWS, Google Cloud)</li>
                <li>Video streaming infrastructure (Cloudflare Stream)</li>
                <li>Payment processing (Stripe)</li>
                <li>Analytics and monitoring (Google Analytics)</li>
                <li>Email delivery (SendGrid, Resend)</li>
                <li>Customer support tools (Intercom, Zendesk)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-foreground">4.3 Legal Requirements</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may disclose your information if required to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Comply with legal obligations and court orders</li>
                <li>Respond to lawful government requests</li>
                <li>Protect our rights, property, or safety</li>
                <li>Investigate fraud or security issues</li>
                <li>Enforce our Terms of Service</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-foreground">4.4 Business Transfers</h3>
              <p className="text-muted-foreground leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred
                to the acquiring entity. We will notify you before your information becomes subject to a different
                privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We retain your information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Provide the Service to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                When you delete your account, we will delete or anonymize your personal information within 90 days,
                except where we are required to retain it for legal or legitimate business purposes. Stream recordings
                and chat logs may be retained for archival purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Your Privacy Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>

              <h3 className="text-xl font-semibold mb-3 text-foreground">6.1 Access and Portability</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can request a copy of your personal information in a structured, machine-readable format.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-foreground">6.2 Correction</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can update or correct inaccurate information through your account settings or by contacting us.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-foreground">6.3 Deletion</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can request deletion of your account and personal information, subject to legal retention requirements.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-foreground">6.4 Opt-Out</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can opt out of marketing communications by clicking "unsubscribe" in emails or adjusting your
                notification preferences in account settings.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-foreground">6.5 Data Processing Restrictions</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can request limitations on how we process your data in certain circumstances.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                To exercise these rights, contact us at privacy@ainative.studio. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li><strong className="text-foreground">Essential Cookies:</strong> Required for authentication and core functionality</li>
                <li><strong className="text-foreground">Performance Cookies:</strong> Help us understand how users interact with the Service</li>
                <li><strong className="text-foreground">Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong className="text-foreground">Analytics Cookies:</strong> Collect aggregated usage data for improvement</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You can manage cookie preferences through your browser settings. Note that disabling certain cookies
                may limit functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Encryption of data in transit (TLS/SSL)</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication protocols</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your
                information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal
                information from children under 13. If we discover that we have collected information from a child
                under 13, we will delete it immediately. If you believe we have collected information from a child
                under 13, please contact us at privacy@ainative.studio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">10. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence.
                These countries may have different data protection laws. When we transfer your information internationally,
                we ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy
                and applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">11. California Privacy Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information held by us</li>
                <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising your CCPA rights</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                To exercise these rights, contact us at privacy@ainative.studio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">12. European Privacy Rights (GDPR)</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Right of access to your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Rights related to automated decision-making</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You may also lodge a complaint with your local data protection authority.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3 mb-4">
                <li>Posting the updated policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending an email notification (for significant changes)</li>
                <li>Displaying a prominent notice on the Service</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Your continued use of the Service after changes indicates acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
                please contact us:
              </p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-foreground font-medium">AINative Studio Live - Privacy Team</p>
                <p className="text-muted-foreground">Email: privacy@ainative.studio</p>
                <p className="text-muted-foreground">Support: support@ainative.studio</p>
                <p className="text-muted-foreground">Website: https://www.ainative.studio</p>
                <p className="text-muted-foreground mt-2">
                  For GDPR-related inquiries: dpo@ainative.studio
                </p>
              </div>
            </section>

            <section className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                This Privacy Policy is part of our{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
                . By using AINative Studio Live, you agree to both documents.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
