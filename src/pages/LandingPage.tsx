import { useState, useRef } from 'react';
import { Layout, ChevronDown, Sparkles, Zap, Download, Palette, Code, ArrowRight, Check, Star, MousePointer2, Layers, Share2, Upload, Wand2, Image, HelpCircle, Crown } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';
import { useNavigate } from 'react-router-dom';

// Features data
const features = [
  {
    icon: Code,
    title: 'Syntax Highlighting',
    description: '50+ languages supported with beautiful themes',
    color: 'blue',
  },
  {
    icon: Palette,
    title: 'Stunning Backgrounds',
    description: 'Gradients, solid colors, and custom designs',
    color: 'purple',
  },
  {
    icon: Layers,
    title: 'Layer Management',
    description: 'Group, reorder, lock and organize elements',
    color: 'emerald',
  },
  {
    icon: MousePointer2,
    title: 'Drag & Drop Editor',
    description: 'Intuitive canvas with resize and rotate',
    color: 'orange',
  },
  {
    icon: Download,
    title: 'High-Res Export',
    description: 'PNG, JPEG at 2x resolution for crisp visuals',
    color: 'pink',
  },
  {
    icon: Share2,
    title: 'Social Ready',
    description: 'Preset sizes for Twitter, LinkedIn, Instagram',
    color: 'cyan',
  },
];

// Testimonials data
const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Senior Developer @ Stripe',
    avatar: '👩‍💻',
    content: "Finally, a tool that makes my code look as good as it runs. I use YvCode for all my Twitter posts now.",
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Tech Content Creator',
    avatar: '👨‍🎨',
    content: "The templates save me hours every week. My engagement has doubled since I started using YvCode.",
    rating: 5,
  },
  {
    name: 'Elena Rodriguez',
    role: 'Open Source Maintainer',
    avatar: '👩‍🔬',
    content: "Beautiful code screenshots in seconds. The branding feature is perfect for documentation.",
    rating: 5,
  },
];

// Users data - people using the app
const users = [
  { name: 'Alex', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Sarah', avatar: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Marcus', avatar: 'https://i.pravatar.cc/150?img=8' },
  { name: 'Elena', avatar: 'https://i.pravatar.cc/150?img=9' },
  { name: 'James', avatar: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Priya', avatar: 'https://i.pravatar.cc/150?img=16' },
  { name: 'David', avatar: 'https://i.pravatar.cc/150?img=11' },
];

// Logos/Companies data
const trustedBy = [
  'Vercel', 'Stripe', 'GitHub', 'Netflix', 'Spotify', 'Airbnb'
];

// How it works steps
const howItWorks = [
  {
    step: 1,
    icon: Upload,
    title: 'Paste your code',
    description: 'Drop in any code snippet or start typing. We auto-detect the language.',
    color: 'blue',
  },
  {
    step: 2,
    icon: Wand2,
    title: 'Customize the look',
    description: 'Choose themes, backgrounds, fonts, and add your branding in seconds.',
    color: 'purple',
  },
  {
    step: 3,
    icon: Image,
    title: 'Export & share',
    description: 'Download in high resolution or copy directly to clipboard. Done!',
    color: 'emerald',
  },
];

// Pricing plans
const pricingPlans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for getting started',
    features: [
      'Unlimited snapshots',
      '20+ syntax themes',
      'PNG & JPEG export',
      'Basic backgrounds',
      'Community templates',
    ],
    cta: 'Start Free',
    popular: false,
    color: 'neutral',
  },
  {
    name: 'Pro',
    price: '12',
    description: 'For serious content creators',
    features: [
      'Everything in Free',
      'SVG & 4K export',
      'Custom branding',
      'Premium templates',
      'No watermark',
      'Priority support',
    ],
    cta: 'Go Pro',
    popular: true,
    color: 'blue',
  },
  {
    name: 'Team',
    price: '29',
    description: 'For teams & organizations',
    features: [
      'Everything in Pro',
      'Team workspaces',
      'Shared templates',
      'Brand kit',
      'API access',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    popular: false,
    color: 'purple',
  },
];

// FAQ data
const faqs = [
  {
    question: 'Is YvCode really free?',
    answer: 'Yes! The core features are 100% free with no sign-up required. We offer Pro and Team plans for advanced features like custom branding, 4K export, and team collaboration.',
  },
  {
    question: 'What languages are supported?',
    answer: 'We support 50+ programming languages including JavaScript, TypeScript, Python, Go, Rust, Java, C++, Swift, Kotlin, and many more. Syntax highlighting is automatic.',
  },
  {
    question: 'Can I use the images commercially?',
    answer: 'Absolutely! All images you create are yours to use however you want — social media, documentation, presentations, courses, or anywhere else.',
  },
  {
    question: 'Do you store my code?',
    answer: 'No. Everything happens in your browser. Your code never leaves your device unless you explicitly export or share it. Privacy is a priority.',
  },
  {
    question: 'What export formats are available?',
    answer: 'Free users can export PNG and JPEG at 2x resolution. Pro users get additional SVG export and 4K resolution for the crispest images possible.',
  },
  {
    question: 'Can I add my own branding?',
    answer: 'Yes! You can add your name, avatar, social handles, and custom colors. Pro users get additional branding features like custom watermarks and brand presets.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { newSnap } = useCanvasStore();
  const pricingRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleNewSnap = () => {
    newSnap({ title: 'Untitled', aspect: '16:9', width: 1920, height: 1080 });
    navigate('/editor');
  };

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 text-sm font-medium text-blue-600 dark:text-blue-400 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>100% Free — No sign-up required</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:via-white dark:to-white/60 bg-clip-text text-transparent">
                Turn your code into
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                stunning visuals
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Create beautiful code screenshots for social media, documentation, and presentations — <span className="text-neutral-900 dark:text-white font-medium">in seconds, not hours.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={handleNewSnap}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-2xl font-semibold text-lg transition-all hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1"
              >
                <Zap className="w-5 h-5" />
                Start Creating — It's Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={scrollToPricing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-white/5 hover:bg-neutral-50 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-white rounded-2xl font-semibold text-lg transition-all hover:shadow-lg"
              >
                <Layout className="w-5 h-5" />
                View Pricing
              </button>
            </div>

            {/* Social Proof - User Avatars */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center -space-x-3">
                {users.map((user, index) => (
                  <img
                    key={index}
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white dark:border-neutral-900 object-cover shadow-lg hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                    title={user.name}
                  />
                ))}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white dark:border-neutral-900 bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs md:text-sm font-semibold shadow-lg">
                  +2K
                </div>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Join <span className="font-semibold text-neutral-700 dark:text-white">2,000+</span> developers creating beautiful code images
              </p>
            </div>
          </div>

          {/* Hero Visual - Video Presentation */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-purple-500/20 blur-3xl rounded-3xl" />
            <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-2 shadow-2xl shadow-black/40 border border-white/10">
              <div className="aspect-video rounded-2xl overflow-hidden">
                {/* YouTube Embed - optimized with lazy loading */}
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/D7__t7uShNw?rel=0&modestbranding=1"
                  title="YvCode Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By / Logos Section */}
      <section className="relative py-16 px-6 border-y border-neutral-200/50 dark:border-white/5 bg-neutral-100/50 dark:bg-white/2">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm font-medium text-neutral-500 dark:text-neutral-500 mb-8 uppercase tracking-wider">
            Trusted by developers at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {trustedBy.map((company, index) => (
              <div
                key={index}
                className="text-2xl md:text-3xl font-bold text-neutral-300 dark:text-neutral-700 hover:text-neutral-400 dark:hover:text-neutral-600 transition-colors cursor-default"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
              Everything you need, nothing you don't
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              A focused set of tools designed to help you create beautiful code visuals fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 group-hover:border-blue-500/40',
                purple: 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20 group-hover:border-purple-500/40',
                emerald: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 group-hover:border-emerald-500/40',
                orange: 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 group-hover:border-orange-500/40',
                pink: 'bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-500/20 group-hover:border-pink-500/40',
                cyan: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20 group-hover:border-cyan-500/40',
              };
              return (
                <div
                  key={index}
                  className="group relative bg-white dark:bg-white/5 hover:bg-neutral-50 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-colors ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">{feature.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm font-medium text-blue-600 dark:text-blue-400 mb-6">
              <Zap className="w-4 h-4" />
              <span>Simple & Fast</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
              Create in 3 simple steps
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              No learning curve. No complex tools. Just beautiful results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20" />
            
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              const colorClasses = {
                blue: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
                purple: 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
                emerald: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
              };
              return (
                <div key={index} className="relative text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${colorClasses[item.color as keyof typeof colorClasses]}`}>
                        <Icon className="w-9 h-9" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">{item.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xs">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-sm font-medium text-pink-600 dark:text-pink-400 mb-6">
              <Star className="w-4 h-4" fill="currentColor" />
              <span>Loved by Developers</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
              What creators are saying
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Join thousands of developers who share beautiful code every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" />
                  ))}
                </div>
                <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-neutral-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} id="pricing" className="relative py-32 px-6 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm font-medium text-purple-600 dark:text-purple-400 mb-6">
              <Crown className="w-4 h-4" />
              <span>Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
              Start free, upgrade when ready
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              No hidden fees. No surprises. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-white/5 border rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  plan.popular
                    ? 'border-blue-500 dark:border-blue-500/50 shadow-xl shadow-blue-500/10'
                    : 'border-neutral-200 dark:border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">{plan.name}</h3>
                  <p className="text-neutral-500 dark:text-neutral-500 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">${plan.price}</span>
                    {plan.price !== '0' && <span className="text-neutral-500">/month</span>}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleNewSnap}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                      : 'bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-900 dark:text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-sm font-medium text-orange-600 dark:text-orange-400 mb-6">
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
              Frequently asked questions
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Everything you need to know about YvCode.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-neutral-300 dark:hover:border-white/20"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                >
                  <span className="font-semibold text-neutral-900 dark:text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-500 transition-transform duration-300 shrink-0 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-6 pb-5 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 rounded-3xl p-12 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-3xl rounded-full" />
            
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to create something amazing?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Start creating beautiful code visuals in seconds. No sign-up, no credit card, just pure creativity.
              </p>
              <button
                onClick={handleNewSnap}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-neutral-100 text-neutral-900 rounded-2xl font-semibold text-lg transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                <Zap className="w-5 h-5" />
                Start Creating Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
