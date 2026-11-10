import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { 
  BookOpen, 
  Brain, 
  FileText, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Users
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    window.location.hash = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Contract AI Playbook Builder</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="#features">Features</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#how-it-works">How It Works</Link>
            </Button>
            <Button asChild>
              <a href={getLoginUrl()}>Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                AI-Powered Legal Intelligence
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                Build AI-Ready Contract Playbooks with{" "}
                <span className="text-gradient">AI Coaching</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Generate structured AI playbooks (prompts) for contract review that integrate seamlessly with Claude, ChatGPT, or any LLM. 
                Upload references, describe your needs, and export ready-to-use prompts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gradient-primary text-white" asChild>
                  <a href={getLoginUrl()}>
                    Start Building Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#how-it-works">Learn More</Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Multi-LLM support</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Card className="shadow-elegant-lg border-2">
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Brain className="h-5 w-5" />
                    <span className="text-sm font-medium">AI Assistant</span>
                  </div>
                  <CardTitle>Creating Your Playbook</CardTitle>
                  <CardDescription>
                    Interactive coaching guides you through every step
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-semibold">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Upload reference documents</p>
                      <p className="text-xs text-muted-foreground">From OneDrive or local files</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-semibold">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Describe your playbook needs</p>
                      <p className="text-xs text-muted-foreground">AI coaches you through refinement</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-semibold">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Export to your platform</p>
                      <p className="text-xs text-muted-foreground">Claude, ChatGPT, or any LLM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Why Creating AI Playbooks Is Even Harder
              </h2>
              <p className="text-lg text-muted-foreground">
                Building traditional playbooks is hard. Creating AI-ready playbooks (structured prompts that integrate with LLMs) is exponentially harder.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <span className="text-destructive font-bold">⏱</span>
                    </div>
                    Weeks of Work
                  </CardTitle>
                  <CardDescription>
                    Creating traditional playbooks takes 20-40 hours. Converting them into structured AI prompts that work reliably with LLMs? Add another 10-20 hours of testing and refinement.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <span className="text-destructive font-bold">📚</span>
                    </div>
                    AI Integration Complexity
                  </CardTitle>
                  <CardDescription>
                    Knowing what makes a good prompt for Claude vs ChatGPT, structuring context windows, handling edge cases—requires both legal expertise AND prompt engineering skills most teams don't have.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <span className="text-destructive font-bold">🔄</span>
                    </div>
                    Format Fragmentation
                  </CardTitle>
                  <CardDescription>
                    Each AI platform has different prompt formats, context limits, and capabilities. Maintaining separate versions for Claude Projects, ChatGPT Custom GPTs, and API integrations is a nightmare.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
            
            <Card className="border-2 border-primary/50 bg-primary/5 shadow-elegant-lg">
              <CardHeader>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    The Contract AI Playbook Builder Solution
                  </div>
                  <CardTitle className="text-2xl">
                    Generate AI-Ready Playbooks in Minutes, Not Weeks
                  </CardTitle>
                  <CardDescription className="text-base">
                    Our AI generates structured prompts trained on SEC EDGAR examples from Fortune 500 companies, formatted for seamless LLM integration. Get 70% complete AI playbooks instantly—no prompt engineering required.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>                    <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">70%</div>
                    <p className="text-sm text-muted-foreground">Complete on first generation</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">100%</div>
                    <p className="text-sm text-muted-foreground">Customizable to your needs</p>
                  </div>
                </div>
                <div className="bg-background/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Think of Contract AI Playbook Builder as:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-background text-sm">
                      <BookOpen className="h-3 w-3" /> Law Insider
                    </span>
                    <span className="text-muted-foreground">+</span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-background text-sm">
                      <Shield className="h-3 w-3" /> Practical Law
                    </span>
                    <span className="text-muted-foreground">+</span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-background text-sm">
                      <Brain className="h-3 w-3" /> Claude AI
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-8 border-2">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Built from lived experience:</strong> This app was created based on the actual pain points of a corporate legal team navigating complex contract reviews. Special thanks to <strong>Manus AI</strong> and <strong>Legal Quants</strong> for providing AI credits to vibe-code this solution.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to Build Expert Playbooks
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional tools designed for legal teams to create, refine, and deploy contract review playbooks at scale.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-elegant border-2">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Coaching</CardTitle>
                <CardDescription>
                  Conversational AI guides you through playbook creation with expert suggestions and validation
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="shadow-elegant border-2">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Playbook Library</CardTitle>
                <CardDescription>
                  Start with proven AI playbooks for NDAs, SaaS agreements, employment contracts, and more
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="shadow-elegant border-2">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multi-LLM Support</CardTitle>
                <CardDescription>
                  Connect to OpenAI, Claude, Gemini, or any custom LLM provider with your own API keys
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="shadow-elegant border-2">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>OneDrive Integration</CardTitle>
                <CardDescription>
                  Seamlessly access and reference your existing contract documents from OneDrive
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="shadow-elegant border-2">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Version History</CardTitle>
                <CardDescription>
                  Track iterations, save multiple versions, and manage your playbook library with ease
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="shadow-elegant border-2">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Flexible Export</CardTitle>
                <CardDescription>
                  Export as Claude/ChatGPT skills, OneDrive documents, or prompt-ready text for any platform
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              From concept to deployment in four simple steps
            </p>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Connect Your Tools",
                description: "Link your OneDrive account and configure your preferred LLM providers with secure API key storage"
              },
              {
                step: "02",
                title: "Choose or Create",
                description: "Start with a best practice template or create a custom playbook from scratch with AI guidance"
              },
              {
                step: "03",
                title: "Refine with AI",
                description: "Upload reference documents and iterate through conversational coaching until your playbook is perfect"
              },
              {
                step: "04",
                title: "Export Anywhere",
                description: "Deploy to Claude, ChatGPT, save to OneDrive, or export as text for any LLM platform"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {index < 3 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 h-6 w-6 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <Card className="shadow-elegant-lg border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Build Your First Playbook?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join legal teams using AI to create expert contract review playbooks in minutes, not days.
              </p>
              <Button size="lg" className="gradient-primary text-white" asChild>
                <a href={getLoginUrl()}>
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">PlaybookPro</span>
            </div>
            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p>© 2026 PlaybookPro. Created by Abigail Hope Serrano.</p>
              <p className="text-xs mt-1">Special thanks to <strong>Manus AI</strong> and <strong>Legal Quants</strong> for AI credits.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
