import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Download, Zap, Brain, MousePointer, Sparkles, Star, Check } from "lucide-react";

export default function Index() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-neon-cyan rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-dark-900" />
            </div>
            <span className="text-xl font-bold text-neon-cyan">Explain-It</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-sm hover:text-neon-cyan transition-colors">Features</a>
            <a href="#demo" className="text-sm hover:text-neon-cyan transition-colors">Demo</a>
            <a href="#pricing" className="text-sm hover:text-neon-cyan transition-colors">Pricing</a>
            <Button className="bg-neon-cyan text-dark-900 hover:bg-neon-cyan/90 glow-cyan">
              Add to Chrome
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-neon-purple/20 text-neon-purple border-neon-purple/50">
            Chrome Extension
          </Badge>
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Don't Switch Apps — <br />
            <span className="text-neon-cyan text-neon-glow">1-Click Explanation</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            On any website, exam portal, or PDF — just drag, select, and get instant AI explanations. 
            Perfect for CS students taking online tests and coding assessments.
          </p>
          <div className="flex items-center justify-center space-x-4 mb-12">
            <Button size="lg" className="bg-neon-cyan text-dark-900 hover:bg-neon-cyan/90 glow-cyan">
              <Download className="w-5 h-5 mr-2" />
              Add to Chrome - Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Demo Video/Screenshot */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative bg-dark-800 rounded-2xl overflow-hidden shadow-2xl glow-cyan">
              <div className="bg-dark-700 px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 text-center text-sm text-muted-foreground">
                  LeetCode - Coding Interview Practice
                </div>
              </div>
              <div className="relative">
                <img 
                  src="/placeholder.svg" 
                  alt="Explain-It Extension Demo"
                  className="w-full h-96 object-cover bg-gradient-to-br from-dark-900 to-dark-800"
                />
                {/* Sidebar Demo Overlay */}
                <div className="absolute right-0 top-0 h-full w-80 bg-dark-900/95 backdrop-blur-sm border-l border-neon-cyan/30 sidebar-demo animate-slide-in">
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Brain className="w-5 h-5 text-neon-cyan" />
                      <span className="font-semibold text-neon-cyan">AI Explanation</span>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-dark-800 rounded-lg p-4 border border-neon-cyan/20">
                        <h4 className="font-semibold mb-2 text-neon-green">Answer</h4>
                        <p className="text-sm text-muted-foreground">
                          This is a classic two-pointer technique problem...
                        </p>
                      </div>
                      <div className="bg-dark-800 rounded-lg p-4 border border-neon-purple/20">
                        <h4 className="font-semibold mb-2 text-neon-purple">Steps</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <span className="text-neon-cyan">1.</span>
                            <span>Initialize two pointers...</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="text-neon-cyan">2.</span>
                            <span>Move pointers based on sum...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Selection Highlight */}
                <div className="absolute top-16 left-16 w-64 h-32 border-2 border-neon-cyan rounded-lg bg-neon-cyan/10 animate-glow-pulse">
                  <div className="absolute -top-8 left-0 bg-neon-cyan text-dark-900 px-2 py-1 rounded text-xs font-semibold">
                    Selected Question
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Smart & Sneaky Study Companion</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for CS/Engineering students who need instant help during online tests, MOOCs, and coding assessments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-dark-800 border-neon-cyan/20 hover:border-neon-cyan/50 transition-all hover:glow-cyan">
              <CardContent className="p-6">
                <MousePointer className="w-12 h-12 text-neon-cyan mb-4" />
                <h3 className="text-xl font-semibold mb-2">1-Click Capture</h3>
                <p className="text-muted-foreground">
                  Click extension → drag to select question area → instant screenshot and OCR extraction.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-800 border-neon-purple/20 hover:border-neon-purple/50 transition-all hover:glow-purple">
              <CardContent className="p-6">
                <Brain className="w-12 h-12 text-neon-purple mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI-Powered Explanations</h3>
                <p className="text-muted-foreground">
                  GPT analyzes your question and provides step-by-step explanations in the simplest way possible.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-800 border-neon-green/20 hover:border-neon-green/50 transition-all hover:glow-green">
              <CardContent className="p-6">
                <Zap className="w-12 h-12 text-neon-green mb-4" />
                <h3 className="text-xl font-semibold mb-2">Side-by-Side View</h3>
                <p className="text-muted-foreground">
                  Beautiful slide-in sidebar keeps answers visible while you work on the same screen.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-neon-cyan">Works Everywhere</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span>Exam portals (Canvas, Blackboard, Moodle)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span>Coding platforms (LeetCode, HackerRank)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span>PDF documents and research papers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span>YouTube lectures and MOOCs</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 text-neon-purple">Smart Features</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-neon-pink" />
                  <span>OCR text extraction from images</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-neon-pink" />
                  <span>Tabbed interface (Answer, Steps, TL;DR)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-neon-pink" />
                  <span>Custom GPT key settings</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-neon-pink" />
                  <span>Rephrase and simplify options</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-dark-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Loved by Students</h2>
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-lg font-semibold">4.9/5 (1,200+ reviews)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-dark-800 border-neon-cyan/20">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "Game changer for online exams! The AI explanations are spot-on and the sidebar doesn't interfere with my workflow."
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-semibold">Sarah M.</p>
                  <p className="text-muted-foreground">CS Junior, Stanford</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-800 border-neon-purple/20">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "Perfect for coding interviews prep. The step-by-step breakdowns help me understand the logic behind solutions."
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-semibold">Alex K.</p>
                  <p className="text-muted-foreground">Software Engineering Senior, MIT</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-800 border-neon-green/20">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "Works flawlessly on Canvas and Blackboard. The OCR is surprisingly accurate even with complex math equations."
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-semibold">Maria L.</p>
                  <p className="text-muted-foreground">Computer Engineering, Berkeley</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Level Up Your Studies?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using Explain-It to ace their online tests and coding assessments.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" className="bg-neon-cyan text-dark-900 hover:bg-neon-cyan/90 glow-cyan">
              <Download className="w-5 h-5 mr-2" />
              Add to Chrome - It's Free
            </Button>
            <Button size="lg" variant="outline" className="border-neon-purple text-neon-purple hover:bg-neon-purple/10">
              View Pricing Plans
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 7-day free trial • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-neon-cyan rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-dark-900" />
              </div>
              <span className="text-xl font-bold text-neon-cyan">Explain-It</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-neon-cyan transition-colors">Privacy</a>
              <a href="#" className="hover:text-neon-cyan transition-colors">Terms</a>
              <a href="#" className="hover:text-neon-cyan transition-colors">Support</a>
              <a href="#" className="hover:text-neon-cyan transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 Explain-It. Made with ❤️ for students who want to learn smarter, not harder.
          </div>
        </div>
      </footer>
    </div>
  );
}
