import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Download,
  FileText,
  Cloud,
  Copy,
  CheckCircle2
} from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

type ExportFormat = "claude_skill" | "chatgpt_skill" | "onedrive_doc" | "prompt_text";

export default function Export() {
  const { id } = useParams<{ id: string }>();
  const playbookId = parseInt(id);
  const { isAuthenticated } = useAuth();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("prompt_text");
  const [exportedData, setExportedData] = useState<string>("");
  const [isExported, setIsExported] = useState(false);

  const playbook = trpc.playbooks.getById.useQuery({ id: playbookId }, {
    enabled: isAuthenticated && !isNaN(playbookId),
  });

  const createExportMutation = trpc.exports.create.useMutation({
    onSuccess: (data) => {
      setExportedData(data.exportData || "");
      setIsExported(true);
      toast.success("Playbook exported successfully!");
    },
  });

  const handleExport = () => {
    if (!playbook.data) return;

    let exportData = "";

    switch (selectedFormat) {
      case "claude_skill":
        exportData = formatForClaudeSkill(playbook.data);
        break;
      case "chatgpt_skill":
        exportData = formatForChatGPTSkill(playbook.data);
        break;
      case "onedrive_doc":
        exportData = formatForDocument(playbook.data);
        break;
      case "prompt_text":
        exportData = formatAsPrompt(playbook.data);
        break;
    }

    createExportMutation.mutate({
      playbookId,
      exportFormat: selectedFormat,
      exportData,
    });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportedData);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([exportedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playbook.data?.name || 'playbook'}-${selectedFormat}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (playbook.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!playbook.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Playbook Not Found</CardTitle>
            <CardDescription>The playbook you're trying to export doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/playbook/${playbookId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="font-bold text-xl">Export Playbook</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Format Selection */}
            <div className="space-y-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Select Export Format</CardTitle>
                  <CardDescription>
                    Choose how you want to use your playbook
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedFormat} onValueChange={(value) => {setSelectedFormat(value as ExportFormat);setIsExported(false);setExportedData("");}}>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value="claude_skill" id="claude" />
                        <Label htmlFor="claude" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-semibold">Claude Skill</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Formatted for Claude Projects with custom instructions
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value="chatgpt_skill" id="chatgpt" />
                        <Label htmlFor="chatgpt" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-semibold">ChatGPT Custom GPT</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Ready for ChatGPT Custom GPT integration
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value="onedrive_doc" id="onedrive" />
                        <Label htmlFor="onedrive" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Cloud className="h-4 w-4 text-primary" />
                            <span className="font-semibold">OneDrive Document</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Save as formatted document to OneDrive
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value="prompt_text" id="prompt" />
                        <Label htmlFor="prompt" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Copy className="h-4 w-4 text-primary" />
                            <span className="font-semibold">Prompt Text</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Plain text ready to paste into any LLM
                          </p>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  <Button
                    className="w-full mt-6 gradient-primary text-white"
                    size="lg"
                    onClick={handleExport}
                    disabled={createExportMutation.isPending}
                  >
                    {createExportMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        Export Playbook
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Playbook Info */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Playbook Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{playbook.data.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{playbook.data.category || 'General'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-medium">v{playbook.data.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{playbook.data.status}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Result */}
            <Card className="shadow-elegant lg:sticky lg:top-24 h-fit">
              <CardHeader>
                <CardTitle>Export Result</CardTitle>
                <CardDescription>
                  {isExported ? "Your playbook is ready" : "Export result will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isExported ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Successfully exported!</span>
                    </div>

                    <Textarea
                      value={exportedData}
                      readOnly
                      className="min-h-[400px] font-mono text-xs"
                    />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleCopyToClipboard}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Download className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Select a format and click Export to generate your playbook
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get playbook content (handles both legacy and structured formats)
function getPlaybookContent(playbook: any): string {
  // If legacy content field exists, use it
  if (playbook.content) {
    return playbook.content;
  }

  // Otherwise, reconstruct from structured fields
  let content = '';

  if (playbook.taskContext) {
    content += `## Task Context\n\n${playbook.taskContext}\n\n`;
  }

  // Parse guidelines if stored as JSON string
  let guidelines: Array<{ title: string; instruction: string; rationale: string; exampleClause?: string }> = [];
  try {
    if (playbook.guidelines) {
      guidelines = typeof playbook.guidelines === 'string' 
        ? JSON.parse(playbook.guidelines) 
        : playbook.guidelines;
    }
  } catch (e) {
    console.error("Failed to parse guidelines:", e);
  }

  if (guidelines.length > 0) {
    content += `## Guidelines\n\n`;
    guidelines.forEach((guideline, index) => {
      content += `### ${index + 1}. ${guideline.title}\n\n`;
      content += `**Instruction:** ${guideline.instruction}\n\n`;
      content += `**Rationale:** ${guideline.rationale}\n\n`;
      if (guideline.exampleClause) {
        content += `**Example Clause:**\n\`\`\`\n${guideline.exampleClause}\n\`\`\`\n\n`;
      }
    });
  }

  if (playbook.exampleClause) {
    content += `## Example Clause\n\n\`\`\`\n${playbook.exampleClause}\n\`\`\`\n\n`;
  }

  return content || 'No content available';
}

// Format functions for different export types
function formatForClaudeSkill(playbook: any): string {
  return `# Claude Project Instructions: ${playbook.name}

${playbook.description || ''}

## 📖 HOW TO USE THIS PLAYBOOK WITH CLAUDE

### Step 1: Create a Claude Project
1. Go to https://claude.ai/projects
2. Click "Create Project"
3. Name it: "${playbook.name}"

### Step 2: Add This Playbook as Project Knowledge
1. In your new project, click "Add content"
2. Select "Add text" or "Add document"
3. Paste this entire playbook content
4. Save the project

### Step 3: Upload Your Contract
1. In the project chat, click the 📎 (attachment) icon
2. Upload your contract (PDF, DOCX, or TXT)
3. Wait for Claude to confirm the upload

### Step 4: Start the Review
Type this prompt:
\`\`\`
Please review the uploaded contract using the ${playbook.name} playbook. Follow each guideline systematically, identify red flags, and provide specific recommendations.
\`\`\`

### What to Expect
- Claude will analyze each clause against the playbook guidelines
- Red flags and risks will be highlighted
- Specific negotiation strategies will be suggested
- References to playbook sections for each recommendation

---

## Your Role
You are an expert contract review assistant specializing in ${playbook.category || 'contract'} analysis. Use the playbook below to guide your reviews.

## Playbook Content

${getPlaybookContent(playbook)}

## Instructions
When reviewing contracts:
1. Follow the playbook systematically
2. Highlight red flags immediately
3. Provide specific, actionable recommendations
4. Reference relevant sections from the playbook
5. Suggest negotiation strategies when appropriate`;
}

function formatForChatGPTSkill(playbook: any): string {
  return `## 📖 HOW TO USE THIS PLAYBOOK WITH CHATGPT

### Method 1: Custom GPT (Recommended)

#### Step 1: Create a Custom GPT
1. Go to https://chat.openai.com/gpts/editor
2. Click "Create a GPT"
3. Name it: "${playbook.name}"
4. Description: "Contract review assistant using ${playbook.name}"

#### Step 2: Configure Instructions
1. In the "Configure" tab, paste this entire playbook into the "Instructions" field
2. Set capabilities: Enable "Code Interpreter" for document analysis
3. Click "Save"

#### Step 3: Use Your Custom GPT
1. Upload your contract (PDF, DOCX, or TXT)
2. Type: "Please review this contract using the playbook instructions"
3. The GPT will analyze systematically and provide recommendations

### Method 2: Regular ChatGPT

#### Step 1: Start a New Chat
1. Go to https://chat.openai.com
2. Start a new conversation

#### Step 2: Set Context
1. Copy and paste this entire playbook into the chat
2. Type: "I will upload a contract for you to review using the playbook above"

#### Step 3: Upload Contract
1. Click the 📎 (attachment) icon
2. Upload your contract
3. Type: "Please review this contract systematically using the playbook"

### What to Expect
- Systematic clause-by-clause analysis
- Red flags and risk identification
- Specific negotiation recommendations
- References to playbook guidelines

---

You are a specialized contract review assistant for ${playbook.category || 'contract'} agreements.

**Playbook Name:** ${playbook.name}
**Description:** ${playbook.description || ''}

**Your Expertise:**
${getPlaybookContent(playbook)}

**How to Use This Playbook:**
- Analyze contracts systematically using the review points above
- Identify and flag potential issues
- Provide clear, actionable recommendations
- Reference specific playbook sections in your analysis
- Suggest negotiation strategies when appropriate`;
}

function formatForDocument(playbook: any): string {
  return `${playbook.name}
${'='.repeat(playbook.name.length)}

Description: ${playbook.description || 'N/A'}
Category: ${playbook.category || 'General'}
Version: ${playbook.version}
Status: ${playbook.status}

${getPlaybookContent(playbook)}

---
Document generated by Contract AI Playbook Builder | Created by Abigail Hope Serrano
`;
}

function formatAsPrompt(playbook: any): string {
  return `## 📖 HOW TO USE THIS PLAYBOOK

This is a ready-to-use prompt for any LLM (Claude, ChatGPT, Gemini, etc.)

### Quick Start
1. Copy this entire text
2. Open your preferred LLM (Claude.ai, ChatGPT, etc.)
3. Paste this prompt into a new conversation
4. Upload or paste your contract
5. Ask: "Please review this contract using the playbook above"

### For Best Results
- Upload the contract as a file (PDF/DOCX) rather than pasting text
- Ask specific follow-up questions about flagged issues
- Request negotiation language for concerning clauses

---

Act as an expert contract review assistant. Use the following playbook to analyze contracts:

${getPlaybookContent(playbook)}

When reviewing contracts, systematically apply each section of this playbook, identify red flags, and provide specific recommendations with references to the playbook guidance.`;
}
