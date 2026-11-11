import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2, FileText } from "lucide-react";
import { ReferenceUpload } from "@/components/ReferenceUpload";
import { Link } from "wouter";

export default function CreatePlaybookAI() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"initial" | "references" | "questions" | "generating" | "done">("initial");
  
  // Read clauseName from URL parameters and pre-fill message
  const urlParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const clauseName = urlParams.get('clauseName');
  const initialMessage = clauseName ? `I need a ${clauseName} playbook for my contract` : "";
  
  const [userMessage, setUserMessage] = useState(initialMessage);
  const [partyPosition, setPartyPosition] = useState<"neutral" | "non_affected" | "protected">("neutral");
  const [keyRisks, setKeyRisks] = useState<string[]>([]);
  const [inferredContext, setInferredContext] = useState<any>(null);
  const [uploadedReferences, setUploadedReferences] = useState<number[]>([]);

  const intakeMutation = trpc.generation.generateIntake.useMutation({
    onSuccess: (data) => {
      setInferredContext(data.inferredContext);
      setStep("references");
    },
    onError: (error) => {
      toast.error("Failed to process your request: " + error.message);
    },
  });

  const createPlaybookMutation = trpc.playbooks.create.useMutation();

  const generateMutation = trpc.generation.generatePlaybook.useMutation({
    onSuccess: async (playbook) => {
      // Create the playbook in the database
      try {
        const created = await createPlaybookMutation.mutateAsync({
          name: playbook.name,
          description: playbook.description,
          category: "general",
          taskContext: playbook.taskContext,
          guidelines: JSON.stringify(playbook.guidelines),
          exampleClause: playbook.exampleClause,
          partyPosition,
          tags: inferredContext?.contractType ? [inferredContext.contractType] : [],
        });
        
        toast.success("Playbook generated successfully!");
        setStep("done");
        setTimeout(() => {
          setLocation(`/playbook/${created.id}`);
        }, 1500);
      } catch (error: any) {
        toast.error("Failed to save playbook: " + error.message);
      }
    },
    onError: (error) => {
      toast.error("Failed to generate playbook: " + error.message);
    },
  });

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) {
      toast.error("Please describe the playbook you need");
      return;
    }
    intakeMutation.mutate({ userMessage });
  };

  const handleGenerate = () => {
    if (!inferredContext?.clauseType) {
      toast.error("Could not determine clause type from your message");
      return;
    }

    setStep("generating");
    generateMutation.mutate({
      clauseType: inferredContext.clauseType,
      partyPosition,
      keyRisks: keyRisks.length > 0 ? keyRisks : undefined,
      userInstructions: userMessage,
      referenceFileIds: uploadedReferences.length > 0 ? uploadedReferences : undefined,
    });
  };

  const riskOptions = [
    { id: "delay", label: "Delay / Performance Issues" },
    { id: "ip", label: "IP Infringement" },
    { id: "data", label: "Data Breach / Privacy" },
    { id: "liability", label: "Product Liability" },
    { id: "regulatory", label: "Regulatory Compliance" },
    { id: "financial", label: "Financial Exposure" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container max-w-4xl py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Playbook Generator</CardTitle>
                <CardDescription>
                  Create AI instruction sets (playbooks) that guide AI in reviewing contracts. These are prompts, not contract documents.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === "initial" && (
              <>
                <Card className="border-2 border-primary/30 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Trained on Top Company Examples
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Our AI analyzes <strong>high-quality SEC EDGAR filings</strong> from Fortune 500 companies, combined with <strong>Practical Law-style guidance</strong> and <strong>Claude's reasoning</strong> to generate playbooks that are:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-background rounded-lg">
                        <div className="text-2xl font-bold text-primary">70%</div>
                        <p className="text-xs text-muted-foreground mt-1">Complete on first generation</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <div className="text-2xl font-bold text-primary">100%</div>
                        <p className="text-xs text-muted-foreground mt-1">Tailored to your needs</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      Think of it as <strong>Law Insider + Practical Law + Claude AI</strong> working together to draft your playbook
                    </p>
                  </CardContent>
                </Card>
                
                <form onSubmit={handleInitialSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="message">What playbook do you need?</Label>
                  <Textarea
                    id="message"
                    placeholder="Example: I need a Force Majeure playbook for a vendor contract where we're the buyer..."
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    className="min-h-[120px] mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Describe the type of clause and any specific concerns you have
                  </p>
                </div>

                <Button type="submit" disabled={intakeMutation.isPending} className="w-full">
                  {intakeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
              </>
            )}

            {step === "references" && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">What I understood:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {inferredContext?.clauseType && (
                      <li>• Clause Type: <span className="font-medium">{inferredContext.clauseType}</span></li>
                    )}
                    {inferredContext?.contractType && (
                      <li>• Contract Type: <span className="font-medium">{inferredContext.contractType}</span></li>
                    )}
                    {inferredContext?.industry && (
                      <li>• Industry: <span className="font-medium">{inferredContext.industry}</span></li>
                    )}
                  </ul>
                </div>

                <ReferenceUpload
                  onUploadComplete={(fileId) => {
                    setUploadedReferences([...uploadedReferences, fileId]);
                  }}
                  maxFiles={5}
                />

                <div className="bg-muted/50 border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Why upload references?</p>
                      <p>The AI will analyze your uploaded contracts to understand your company's preferred language, risk tolerance, and negotiation style. This makes the generated playbook more tailored to your specific needs.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("initial")}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep("questions")}
                    className="flex-1"
                  >
                    Continue
                    {uploadedReferences.length > 0 && (
                      <span className="ml-2 text-xs opacity-75">({uploadedReferences.length} files)</span>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === "questions" && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">What I understood:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {inferredContext?.clauseType && (
                      <li>• Clause Type: <span className="font-medium">{inferredContext.clauseType}</span></li>
                    )}
                    {inferredContext?.contractType && (
                      <li>• Contract Type: <span className="font-medium">{inferredContext.contractType}</span></li>
                    )}
                    {inferredContext?.industry && (
                      <li>• Industry: <span className="font-medium">{inferredContext.industry}</span></li>
                    )}
                  </ul>
                </div>

                <div>
                  <Label>Which party do you represent?</Label>
                  <RadioGroup value={partyPosition} onValueChange={(v: any) => setPartyPosition(v)} className="mt-3">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="neutral" id="neutral" />
                      <Label htmlFor="neutral" className="flex-1 cursor-pointer">
                        <div className="font-medium">Neutral Position</div>
                        <div className="text-sm text-muted-foreground">Balanced, fair to both sides</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="non_affected" id="non_affected" />
                      <Label htmlFor="non_affected" className="flex-1 cursor-pointer">
                        <div className="font-medium">Non-Affected Party</div>
                        <div className="text-sm text-muted-foreground">Buyer/Customer (stricter requirements)</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="protected" id="protected" />
                      <Label htmlFor="protected" className="flex-1 cursor-pointer">
                        <div className="font-medium">Protected Party</div>
                        <div className="text-sm text-muted-foreground">Seller/Vendor (broader protections)</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>What are your top risk priorities? (Optional)</Label>
                  <div className="mt-3 space-y-2">
                    {riskOptions.map((risk) => (
                      <div key={risk.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={risk.id}
                          checked={keyRisks.includes(risk.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setKeyRisks([...keyRisks, risk.id]);
                            } else {
                              setKeyRisks(keyRisks.filter((r) => r !== risk.id));
                            }
                          }}
                        />
                        <Label htmlFor={risk.id} className="cursor-pointer">
                          {risk.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("references")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    className="flex-1"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Playbook
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === "generating" && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Generating your playbook...</h3>
                <p className="text-muted-foreground">
                  Our AI is creating a customized contract review playbook based on your requirements
                </p>
              </div>
            )}

            {step === "done" && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Playbook Generated!</h3>
                <p className="text-muted-foreground">Redirecting to your new playbook...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
