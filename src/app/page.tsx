import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-16 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900">
            Grant Application Completeness Assistant
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Review your funding application against the official grant guidelines before submission.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/reviews/new">
              <Button size="lg" className="text-lg px-8 h-14 rounded-full shadow-lg hover:shadow-xl transition-all">
                Start a Review
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Workflow Section */}
      <section className="py-20 container mx-auto px-4 max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-5 gap-6 text-center">
          {[
            { step: '1', title: 'Upload documents', desc: 'Guideline & Draft App' },
            { step: '2', title: 'Extract requirements', desc: 'AI finds what you need' },
            { step: '3', title: 'Match evidence', desc: 'Finds matching quotes' },
            { step: '4', title: 'Review gaps', desc: 'Human in the loop' },
            { step: '5', title: 'Completeness report', desc: 'Final checklist' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-slate-100 py-12 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="text-yellow-600 mt-1">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="text-left text-sm text-yellow-900 leading-relaxed">
                  <strong>Disclaimer:</strong> This tool provides an evidence-based completeness review. It does not make legal or funding-eligibility decisions. The final decision belongs to the user and the grant organization.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
