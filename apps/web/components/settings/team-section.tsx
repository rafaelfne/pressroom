'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, X, Shield, ShieldCheck, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TeamMember = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string;
    avatarUrl: string | null;
  };
};

type TeamData = {
  id: string;
  name: string;
  members: TeamMember[];
} | null;

type TeamSectionProps = {
  team: TeamData;
  currentUserId: string;
  currentUserRole: string;
};

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'owner':
      return <Crown className="h-3 w-3" />;
    case 'admin':
      return <ShieldCheck className="h-3 w-3" />;
    default:
      return <Shield className="h-3 w-3" />;
  }
}

function getRoleBadgeVariant(role: string): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'owner':
      return 'default';
    case 'admin':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function TeamSection({ team, currentUserId, currentUserRole }: TeamSectionProps) {
  const router = useRouter();
  const [inviteInput, setInviteInput] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const canManage = ['owner', 'admin'].includes(currentUserRole);
  const isOwner = currentUserRole === 'owner';

  if (!team) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <CardDescription>No team found. Create one to get started.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleInvite = async () => {
    if (!inviteInput.trim()) return;
    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername: inviteInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error || 'Failed to invite');
        return;
      }

      if (data.type === 'added') {
        setInviteSuccess(`${inviteInput} has been added to the team!`);
      } else {
        setInviteSuccess(`Invitation sent to ${inviteInput}`);
      }
      setInviteInput('');
      router.refresh();
    } catch {
      setInviteError('Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const res = await fetch(`/api/team/members/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/team/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to change role:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>
          Your team members have access to all organizations and templates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Members list */}
        <div className="divide-y rounded-md border">
          {team.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {getInitials(member.user.name, member.user.email)}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {member.user.name || member.user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOwner && member.role !== 'owner' ? (
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(member.user.id, value)}
                  >
                    <SelectTrigger className="h-7 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">admin</SelectItem>
                      <SelectItem value="member">member</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                    {getRoleIcon(member.role)}
                    {member.role}
                  </Badge>
                )}
                {canManage && member.role !== 'owner' && member.user.id !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveMember(member.user.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Invite form */}
        {canManage && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Invite member</p>
            <div className="flex gap-2">
              <Input
                placeholder="Email or username"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInvite();
                }}
              />
              <Button onClick={handleInvite} disabled={inviting || !inviteInput.trim()}>
                <UserPlus className="mr-2 h-4 w-4" />
                {inviting ? 'Inviting...' : 'Invite'}
              </Button>
            </div>
            {inviteError && <p className="text-sm text-destructive">{inviteError}</p>}
            {inviteSuccess && <p className="text-sm text-green-600">{inviteSuccess}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
