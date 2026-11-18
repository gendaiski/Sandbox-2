import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DraggablePlaybookCard } from "@/components/DraggablePlaybookCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Settings,
  LogOut,
  Sparkles,
  Clock,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { DashboardSearch } from "@/components/DashboardSearch";
import { DashboardTutorial } from "@/components/DashboardTutorial";
import { FolderSidebar } from "@/components/FolderSidebar";
import { WelcomeModal } from "@/components/WelcomeModal";
import { useFirstVisit } from "@/hooks/useFirstVisit";
import { useTour } from "@/hooks/useTour";

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { isFirstVisit, isLoading: isFirstVisitLoading, markAsVisited } = useFirstVisit();
  const { startTour } = useTour();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedPlaybookIds, setSelectedPlaybookIds] = useState<Set<number>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  const playbooks = trpc.playbooks.getPlaybooks.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const folders = trpc.folders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const foldersList = folders.data || [];
  
  // Filter playbooks by folder
  const filteredPlaybooks = playbooks.data?.filter(p => {
    if (selectedFolderId === null) return true; // Show all
    return p.folderId === selectedFolderId;
  }) || [];
  
  // Show welcome modal on first visit
  useEffect(() => {
    if (!isFirstVisitLoading && isFirstVisit && isAuthenticated) {
      setShowWelcomeModal(true);
    }
  }, [isFirstVisit, isFirstVisitLoading, isAuthenticated]);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    markAsVisited();
  };

  const handleTakeTour = () => {
    setShowWelcomeModal(false);
    markAsVisited();
    // Start tour after a short delay to let modal close
    setTimeout(() => {
      startTour();
    }, 300);
  };

  const utils = trpc.useUtils();
  const movePlaybookMutation = trpc.folders.movePlaybook.useMutation({
    onSuccess: () => {
      utils.playbooks.getPlaybooks.invalidate();
      utils.folders.list.invalidate();
    },
  });
  
  const archivePlaybookMutation = trpc.playbooks.archivePlaybook.useMutation({
    onSuccess: () => {
      utils.playbooks.getPlaybooks.invalidate();
    },
  });
  
  const deletePlaybookMutation = trpc.playbooks.delete.useMutation({
    onSuccess: () => {
      utils.playbooks.getPlaybooks.invalidate();
    },
  });
  
  const handleSelectPlaybook = (id: number, isMultiSelect: boolean) => {
    setSelectedPlaybookIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!isMultiSelect) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const handleMoveToFolder = async (playbookId: number, folderId: number | null) => {
    await movePlaybookMutation.mutateAsync({ playbookId, folderId });
    // Auto-switch to the target folder view
    setSelectedFolderId(folderId);
  };
  
  const handleBulkMove = async (folderId: number | null) => {
    const count = selectedPlaybookIds.size;
    const folderName = folderId === null 
      ? "All Playbooks" 
      : foldersList.find(f => f.id === folderId)?.name || "Unknown Folder";
    
    try {
      for (const playbookId of Array.from(selectedPlaybookIds)) {
        await movePlaybookMutation.mutateAsync({ playbookId, folderId });
      }
      setSelectedPlaybookIds(new Set());
      setIsBulkMode(false);
      // Auto-switch to the target folder view
      setSelectedFolderId(folderId);
      toast.success(`Moved ${count} playbook${count > 1 ? 's' : ''} to ${folderName}`);
    } catch (error) {
      toast.error("Failed to move playbooks. Please try again.");
    }
  };
  
  const handleBulkArchive = async () => {
    for (const playbookId of Array.from(selectedPlaybookIds)) {
      await archivePlaybookMutation.mutateAsync({ id: playbookId });
    }
    setSelectedPlaybookIds(new Set());
    setIsBulkMode(false);
  };
  
  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedPlaybookIds.size} playbooks? This action cannot be undone.`)) {
      for (const playbookId of Array.from(selectedPlaybookIds)) {
        await deletePlaybookMutation.mutateAsync({ id: playbookId });
      }
      setSelectedPlaybookIds(new Set());
      setIsBulkMode(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const handleLogout = async () => {
    await logout();
    window.location.hash = "/";
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="contract-dashboard min-h-screen bg-background">
      <WelcomeModal 
        open={showWelcomeModal} 
        onClose={handleCloseWelcomeModal}
        onTakeTour={handleTakeTour}
      />
      <DashboardTutorial />
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Contract AI Playbook Builder</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild data-tour="clause-library">
              <Link href="/clause-library">
                <BookOpen className="h-4 w-4 mr-2" />
                Clause Library
              </Link>
            </Button>
            <Button variant="ghost" asChild data-tour="ai-playbook-library">
              <Link href="/playbook-library">
                <FileText className="h-4 w-4 mr-2" />
                AI Playbook Library
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => startTour()}
              title="Restart Product Tour"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Product Tour
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content with Sidebar */}
      <div className="flex">
        <div data-tour="folders-sidebar">
          <FolderSidebar
            selectedFolderId={selectedFolderId}
            onFolderSelect={setSelectedFolderId}
          />
        </div>
        <div className="flex-1 container py-8">
        {/* Search Box */}
        <div className="mb-8 flex justify-center" data-tutorial="search-box">
          <DashboardSearch />
        </div>

        {/* Bulk Actions Bar */}
        {isBulkMode && selectedPlaybookIds.size > 0 && (
          <div className="mb-4 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium">{selectedPlaybookIds.size} selected</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPlaybookIds(new Set());
                  setIsBulkMode(false);
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select onValueChange={(value) => handleBulkMove(value === "all" ? null : parseInt(value))}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Move to Folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Playbooks</SelectItem>
                  {foldersList.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: folder.color || "#3b82f6" }} />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkArchive}
              >
                Archive
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'User'}</h1>
            <p className="text-muted-foreground">
              Manage your AI contract playbooks and create new ones with AI assistance
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="lg" className="gradient-primary text-white" asChild data-tutorial="create-playbook" data-tour="create-playbook">
            <Link href="/create-ai">
              <Plus className="h-5 w-5 mr-2" />
              Create Playbook with AI
            </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Playbooks</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredPlaybooks.length}</div>
              <p className="text-xs text-muted-foreground">Across all categories</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredPlaybooks.filter(p => p.status === 'draft' || p.status === 'testing').length}
              </div>
              <p className="text-xs text-muted-foreground">Draft and testing</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredPlaybooks.filter(p => p.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">Ready to export</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/clause-library">
            <Card className="shadow-elegant hover:shadow-elegant-lg transition-all cursor-pointer" data-tutorial="clause-library">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Clause Library</CardTitle>
                </div>
                <CardDescription>
                  Browse practical guidance for contract clauses with 3 versions (Neutral, Party A, Party B), drafting notes, and negotiation tips
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href="/playbook-library">
            <Card className="shadow-elegant hover:shadow-elegant-lg transition-all cursor-pointer" data-tutorial="playbook-library">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>AI Playbook Library</CardTitle>
                </div>
                <CardDescription>
                  Start from pre-built AI playbooks for common contract scenarios and customize them to your needs
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Playbooks List */}
        <div className="space-y-6" data-tutorial="your-playbooks">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold">Your AI Playbooks</h2>
            <Button
              size="sm"
              variant={isBulkMode ? "default" : "outline"}
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                if (isBulkMode) setSelectedPlaybookIds(new Set());
              }}
              data-tour="select-multiple"
            >
              {isBulkMode ? "Exit Bulk Mode" : "Select Multiple"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            AI playbooks are instruction sets that guide AI in reviewing contracts. They contain review points, red flags, and negotiation strategies—not the contracts themselves.
          </p>

          {playbooks.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPlaybooks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaybooks.map((playbook) => (
                <DraggablePlaybookCard
                  key={playbook.id}
                  playbook={playbook}
                  isSelected={selectedPlaybookIds.has(playbook.id)}
                  onSelect={isBulkMode ? handleSelectPlaybook : undefined}
                  folders={foldersList}
                  onMoveToFolder={handleMoveToFolder}
                />
              ))}
            </div>
          ) : (
            <Card className="shadow-elegant">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No playbooks yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Get started by creating your first playbook from a template or from scratch with AI guidance
                </p>
                <Button className="gradient-primary text-white" asChild>
                  <Link href="/create-ai">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Playbook
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    </div>
    </DndProvider>
  );
}
