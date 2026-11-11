import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Library, BookOpen, Sparkles } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onTakeTour?: () => void;
}

export function WelcomeModal({ open, onClose, onTakeTour }: WelcomeModalProps) {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Create AI Playbooks with AI Coaching",
      description:
        "AI playbooks are instruction sets that guide AI in reviewing contracts. They contain review points, red flags, and negotiation strategies—not the contracts themselves. Get real-time AI coaching as you build your playbooks.",
    },
    {
      icon: <Library className="h-6 w-6" />,
      title: "AI Playbook Library with AI Coaching",
      description:
        "Start from pre-built AI playbooks for common contract scenarios and customize them to your needs. AI coaching helps you understand each playbook's strategy and adapt it to your specific requirements.",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Clause Library with AI Coaching",
      description:
        "Browse practical guidance for contract clauses with 3 versions (Neutral, Party A, Party B), drafting notes, and negotiation tips. AI coaching provides context-aware suggestions as you explore.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to Contract AI Playbook Builder
          </DialogTitle>
          <DialogDescription className="text-center">
            Streamline your contract review with AI-powered playbooks and intelligent coaching
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex gap-4 rounded-lg border bg-muted/30 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold leading-none">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <Sparkles className="h-4 w-4 shrink-0" />
          <p>The original clause and template libraries are available. No sample playbooks have been created.</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Explore on My Own
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              onClose();
              onTakeTour?.();
            }}
          >
            Take a Quick Tour
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
