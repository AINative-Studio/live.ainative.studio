import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | AINative Studio Live',
  description: 'Terms of Service for AINative Studio Live - Live coding streams for AI-native developers',
};

export default function TermsPage() {
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
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground mt-1">Last updated: January 18, 2026</p>
          </div>
        </div>

        <div className="prose prose-invert prose-purple max-w-none">
          <div className="bg-card border border-border rounded-lg p-6 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using AINative Studio Live ("the Service"), you agree to be bound by these Terms of Service ("Terms").
                If you do not agree to these Terms, please do not use the Service. We reserve the right to modify these Terms at any time,
                and your continued use of the Service constitutes acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                AINative Studio Live is a live streaming platform designed for developers to broadcast their coding sessions,
                share knowledge, and build in public. The Service includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Live video streaming capabilities for development work</li>
                <li>Real-time chat and community interaction</li>
                <li>User profiles and follower systems</li>
                <li>Content discovery and categorization</li>
                <li>Stream recording and playback features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. User Accounts</h2>
              <h3 className="text-xl font-semibold mb-3 text-foreground">3.1 Account Creation</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-foreground">3.2 Account Eligibility</h3>
              <p className="text-muted-foreground leading-relaxed">
                You must be at least 13 years old to use the Service. If you are under 18, you must have permission from a parent or guardian.
                By creating an account, you represent that you meet these requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Content and Conduct</h2>
              <h3 className="text-xl font-semibold mb-3 text-foreground">4.1 User Content</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You retain ownership of all content you create, upload, or stream through the Service ("User Content").
                By submitting User Content, you grant AINative Studio Live a worldwide, non-exclusive, royalty-free license to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Host, store, and display your User Content</li>
                <li>Distribute your User Content to other users</li>
                <li>Create derivative works for technical purposes (e.g., transcoding videos)</li>
                <li>Use your User Content for promotional purposes with your consent</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-foreground">4.2 Prohibited Content</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You agree not to create, upload, or share content that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Violates any applicable laws or regulations</li>
                <li>Infringes on intellectual property rights of others</li>
                <li>Contains malware, viruses, or harmful code</li>
                <li>Promotes violence, discrimination, or harassment</li>
                <li>Contains sexually explicit material</li>
                <li>Impersonates any person or entity</li>
                <li>Contains spam or unsolicited advertising</li>
                <li>Violates the privacy of others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Streaming Guidelines</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                When streaming on AINative Studio Live, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Stream content that is relevant to software development and technology</li>
                <li>Respect the intellectual property rights of software vendors</li>
                <li>Maintain a professional and respectful environment in your chat</li>
                <li>Not stream content that violates any third-party terms of service</li>
                <li>Properly attribute and credit open-source software and resources</li>
                <li>Comply with all applicable software licenses during streams</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Intellectual Property</h2>
              <h3 className="text-xl font-semibold mb-3 text-foreground">6.1 Service Content</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Service, including its design, functionality, graphics, logos, and other elements (excluding User Content),
                is owned by AINative Studio and protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-foreground">6.2 DMCA Compliance</h3>
              <p className="text-muted-foreground leading-relaxed">
                We respect intellectual property rights and comply with the Digital Millennium Copyright Act (DMCA).
                If you believe your copyright has been infringed, please contact us at legal@ainative.studio with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                <li>Identification of the copyrighted work</li>
                <li>Location of the infringing material</li>
                <li>Your contact information</li>
                <li>A statement of good faith belief</li>
                <li>A statement under penalty of perjury</li>
                <li>Your physical or electronic signature</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of the Service is also governed by our{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                , which explains how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Termination</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account and access to the Service at any time,
                with or without cause, and with or without notice. Reasons for termination may include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                <li>Violation of these Terms of Service</li>
                <li>Illegal or fraudulent activity</li>
                <li>Harassment of other users or staff</li>
                <li>Repeated content violations</li>
                <li>Extended period of inactivity</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You may terminate your account at any time by contacting support@ainative.studio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Disclaimers</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE</li>
                <li>NON-INFRINGEMENT OF THIRD-PARTY RIGHTS</li>
                <li>UNINTERRUPTED OR ERROR-FREE SERVICE</li>
                <li>ACCURACY OR RELIABILITY OF CONTENT</li>
                <li>SECURITY OF USER DATA</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, AINATIVE STUDIO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY
                OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                <li>Your use or inability to use the Service</li>
                <li>Unauthorized access to or alteration of your content</li>
                <li>Statements or conduct of any third party on the Service</li>
                <li>Any other matter relating to the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless AINative Studio, its affiliates, officers, directors, employees,
                and agents from any claims, losses, damages, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                <li>Your use of the Service</li>
                <li>Your User Content</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of California,
                United States, without regard to its conflict of law provisions. Any legal action or proceeding arising
                under these Terms will be brought exclusively in the federal or state courts located in San Francisco County,
                California.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via
                email or through the Service. Your continued use of the Service after such modifications constitutes
                acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-foreground font-medium">AINative Studio Live</p>
                <p className="text-muted-foreground">Email: legal@ainative.studio</p>
                <p className="text-muted-foreground">Support: support@ainative.studio</p>
                <p className="text-muted-foreground">Website: https://www.ainative.studio</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
