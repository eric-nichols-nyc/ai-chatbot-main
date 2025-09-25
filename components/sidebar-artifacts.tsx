'use client';

import { useEffect, useState } from 'react';
import type { User } from 'next-auth';
import useSWR from 'swr';
import { formatDistance } from 'date-fns';
import { FileIcon, LoaderIcon } from 'lucide-react';

import { fetcher } from '@/lib/utils';
import { useArtifact } from '@/hooks/use-artifact';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserArtifact {
  id: string;
  title: string;
  kind: 'text' | 'code' | 'sheet' | 'image';
  content: string;
  updatedAt: string;
  createdAt: string;
}

interface SidebarArtifactsProps {
  user: User;
}

export function SidebarArtifacts({ user }: SidebarArtifactsProps) {
  const { artifact, setArtifact } = useArtifact();
  const [showPrompt, setShowPrompt] = useState(false);

  const { data: userArtifact, isLoading } = useSWR<UserArtifact>(
    user?.id ? '/api/user-artifact' : null,
    fetcher,
  );

  // Show prompt if user has an artifact but it's not currently visible
  useEffect(() => {
    if (userArtifact && !artifact.isVisible && !showPrompt) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [userArtifact, artifact.isVisible, showPrompt]);

  const handleOpenArtifact = () => {
    if (!userArtifact) return;

    setArtifact({
      documentId: userArtifact.id,
      title: userArtifact.title,
      kind: userArtifact.kind,
      content: userArtifact.content,
      isVisible: true,
      status: 'idle',
      boundingBox: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
    });
    setShowPrompt(false);
  };

  const handleDismissPrompt = () => {
    setShowPrompt(false);
  };

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled>
            <LoaderIcon className="animate-spin" />
            <span>Loading artifacts...</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!userArtifact) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled>
            <FileIcon />
            <span>No artifacts yet</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleOpenArtifact}
          isActive={
            artifact.isVisible && artifact.documentId === userArtifact.id
          }
          tooltip={`Open "${userArtifact.title}"`}
        >
          <FileIcon />
          <div className="flex flex-col items-start">
            <span className="truncate max-w-[200px]">{userArtifact.title}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistance(new Date(userArtifact.updatedAt), new Date())} ago
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Artifact Prompt */}
      {showPrompt && (
        <div className="px-2 py-1">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FileIcon className="text-blue-600 dark:text-blue-400 h-4 w-4" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  You have an artifact
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                "{userArtifact.title}"
              </p>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="default"
                  className="h-6 px-2 text-xs"
                  onClick={handleOpenArtifact}
                >
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={handleDismissPrompt}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SidebarMenu>
  );
}
