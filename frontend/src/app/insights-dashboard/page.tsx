'use client';

import { Container } from "@/components/ui/container";
import InsightsDashboard from "@/components/insights/InsightsDashboard";
import Header from "@/components/Header";

export default function InsightsDashboardPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center bg-background">
        <Container className="py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6">
              <span className="gradient-text">Qloo Insights</span> Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore cultural intelligence and taste-based insights.
            </p>
          </div>
          <div className="mt-8">
            <InsightsDashboard />
          </div>
        </Container>
      </main>
    </>
  );
} 