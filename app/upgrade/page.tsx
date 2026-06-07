import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Zap, Shield, Building2 } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: null,
    description: 'Get started with live streaming',
    icon: Zap,
    iconColor: 'text-muted-foreground',
    features: [
      'Basic streaming',
      '720p max resolution',
      '2-hour session limit',
      'Limited VOD storage',
      'Community support',
    ],
    cta: 'Current Plan',
    ctaHref: '/dashboard',
    ctaVariant: 'outline' as const,
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    description: 'For serious streamers and creators',
    icon: Shield,
    iconColor: 'text-brand-primary',
    features: [
      '1080p streaming',
      'Unlimited session length',
      'Unlimited VOD storage',
      'Advanced analytics',
      'Priority support',
      'Custom stream overlays',
      'Multi-stream destinations',
    ],
    cta: 'Upgrade to Pro',
    ctaHref: '#',
    ctaVariant: 'default' as const,
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Contact us',
    description: 'Custom solutions for teams and orgs',
    icon: Building2,
    iconColor: 'text-accent',
    features: [
      'Everything in Pro',
      'Custom SLA',
      'Dedicated support manager',
      'SSO / SAML authentication',
      'Custom data retention',
      'Private cloud deployment',
      'Volume pricing',
    ],
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@ainative.studio',
    ctaVariant: 'outline' as const,
    highlight: false,
  },
];

export const metadata = {
  title: 'Upgrade — AINative Studio Live',
  description: 'Choose the plan that fits your streaming needs.',
};

export default function UpgradePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header nav */}
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-3 mb-8 w-fit">
          <img src="/ainative-icon.svg" alt="AINative Studio Live" className="h-10 w-auto" />
          <span className="text-xl font-bold tracking-tight uppercase flex items-center gap-1">
            <span className="text-white">AI</span>
            <span className="text-brand-primary">NATIVE</span>
            <span className="text-muted-foreground text-sm ml-2 font-normal">LIVE</span>
          </span>
        </Link>
      </div>

      <main className="flex-1 container mx-auto px-4 pb-20">
        {/* Page heading */}
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-brand-primary tracking-widest uppercase mb-3">
            &gt; select_plan
          </p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start for free. Scale when you are ready. No hidden fees.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={[
                  'relative flex flex-col rounded-xl border p-8 transition-shadow',
                  tier.highlight
                    ? 'border-brand-primary bg-surface-secondary shadow-[0_0_30px_rgba(88,103,239,0.15)]'
                    : 'border-border bg-card hover:shadow-ds-md',
                ].join(' ')}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wide uppercase">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Tier header */}
                <div className="mb-6">
                  <div className={`mb-3 ${tier.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold mb-1">{tier.name}</h2>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  {tier.price === null ? (
                    <span className="text-4xl font-bold">Free</span>
                  ) : tier.price === 'Contact us' ? (
                    <span className="text-2xl font-bold">Contact us</span>
                  ) : (
                    <span className="flex items-end gap-1">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground mb-1">{tier.period}</span>
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  variant={tier.ctaVariant}
                  className={[
                    'w-full font-medium',
                    tier.highlight
                      ? 'bg-brand-primary hover:bg-primary-dark text-white'
                      : '',
                  ].join(' ')}
                >
                  <Link href={tier.ctaHref}>{tier.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ note */}
        <p className="text-center text-sm text-muted-foreground mt-12">
          Questions?{' '}
          <a href="mailto:support@ainative.studio" className="text-brand-primary hover:underline">
            Contact support
          </a>{' '}
          or{' '}
          <Link href="/dashboard" className="text-brand-primary hover:underline">
            go back to dashboard
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
