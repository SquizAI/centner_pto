'use client';

/**
 * Social Media Client Component
 * Handles the UI for social media connections and imports
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Instagram, Facebook, Check, X, RefreshCw, Trash2 } from 'lucide-react';
import { disconnectAccount, syncAccount } from '@/app/actions/social-media-actions';
import InstagramImport from '@/components/admin/InstagramImport';
import FacebookImport from '@/components/admin/FacebookImport';

interface Connection {
  id: string;
  platform: 'instagram' | 'facebook';
  account_name: string;
  account_username?: string;
  is_active: boolean;
  connected_at: string;
  last_sync_at?: string;
  last_error?: string;
  token_expires_at?: string;
  metadata?: Record<string, any>;
}

interface Album {
  id: string;
  title: string;
  slug: string;
  campus: string;
  event_date?: string;
}

interface Props {
  initialConnections: Connection[];
  albums: Album[];
}

export default function SocialMediaClient({ initialConnections, albums }: Props) {
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [activeTab, setActiveTab] = useState<string>('connections');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Handle URL query parameters (success/error from OAuth)
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      setMessage({ type: 'success', text: success });
      // Clear URL parameters
      window.history.replaceState({}, '', '/admin/social-media');
    } else if (error) {
      setMessage({ type: 'error', text: error });
      window.history.replaceState({}, '', '/admin/social-media');
    }
  }, [searchParams]);

  const handleConnect = (platform: 'instagram' | 'facebook') => {
    // Redirect to OAuth endpoint
    window.location.href = `/api/social-media/${platform}/auth`;
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this account? Import history will be preserved.')) {
      return;
    }

    setLoading((prev) => ({ ...prev, [connectionId]: true }));

    const result = await disconnectAccount(connectionId);

    if (result.success) {
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      setMessage({ type: 'success', text: 'Account disconnected successfully' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to disconnect account' });
    }

    setLoading((prev) => ({ ...prev, [connectionId]: false }));
  };

  const handleSync = async (connectionId: string) => {
    setLoading((prev) => ({ ...prev, [`sync-${connectionId}`]: true }));

    const result = await syncAccount(connectionId);

    if (result.success) {
      setMessage({ type: 'success', text: 'Account synced successfully' });
      // Update last_sync_at in UI
      setConnections((prev) =>
        prev.map((c) =>
          c.id === connectionId ? { ...c, last_sync_at: new Date().toISOString() } : c
        )
      );
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to sync account' });
    }

    setLoading((prev) => ({ ...prev, [`sync-${connectionId}`]: false }));
  };

  const instagramConnections = connections.filter((c) => c.platform === 'instagram');
  const facebookConnections = connections.filter((c) => c.platform === 'facebook');

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="instagram" disabled={instagramConnections.length === 0}>
            Instagram Import
          </TabsTrigger>
          <TabsTrigger value="facebook" disabled={facebookConnections.length === 0}>
            Facebook Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-6">
          {/* Instagram Connection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Instagram className="h-6 w-6 text-pink-600" />
                  <div>
                    <CardTitle>Instagram Business</CardTitle>
                    <CardDescription>
                      Connect your Instagram Business account to import photos
                    </CardDescription>
                  </div>
                </div>
                {instagramConnections.length === 0 && (
                  <Button onClick={() => handleConnect('instagram')}>
                    <Instagram className="h-4 w-4 mr-2" />
                    Connect Instagram
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {instagramConnections.length > 0 ? (
                <div className="space-y-4">
                  {instagramConnections.map((conn) => (
                    <ConnectionCard
                      key={conn.id}
                      connection={conn}
                      onDisconnect={handleDisconnect}
                      onSync={handleSync}
                      loading={loading}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No Instagram account connected. Connect your Instagram Business account to start
                  importing photos.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Facebook Connection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Facebook className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Facebook Page</CardTitle>
                    <CardDescription>
                      Connect your Facebook page to import photos
                    </CardDescription>
                  </div>
                </div>
                {facebookConnections.length === 0 && (
                  <Button onClick={() => handleConnect('facebook')}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Connect Facebook
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {facebookConnections.length > 0 ? (
                <div className="space-y-4">
                  {facebookConnections.map((conn) => (
                    <ConnectionCard
                      key={conn.id}
                      connection={conn}
                      onDisconnect={handleDisconnect}
                      onSync={handleSync}
                      loading={loading}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No Facebook page connected. Connect your Facebook page to start importing photos.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instagram">
          {instagramConnections.length > 0 && (
            <InstagramImport connections={instagramConnections} albums={albums} />
          )}
        </TabsContent>

        <TabsContent value="facebook">
          {facebookConnections.length > 0 && (
            <FacebookImport connections={facebookConnections} albums={albums} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConnectionCard({
  connection,
  onDisconnect,
  onSync,
  loading,
}: {
  connection: Connection;
  onDisconnect: (id: string) => void;
  onSync: (id: string) => void;
  loading: Record<string, boolean>;
}) {
  const isExpired =
    connection.token_expires_at && new Date(connection.token_expires_at) <= new Date();

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {connection.is_active && !isExpired ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <X className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{connection.account_name}</p>
            {connection.account_username && (
              <span className="text-sm text-muted-foreground">
                @{connection.account_username}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Connected {new Date(connection.connected_at).toLocaleDateString()}</span>
            {connection.last_sync_at && (
              <>
                <span>•</span>
                <span>Last synced {new Date(connection.last_sync_at).toLocaleString()}</span>
              </>
            )}
          </div>
          {connection.last_error && (
            <p className="text-sm text-red-500 mt-1">{connection.last_error}</p>
          )}
          {isExpired && (
            <Badge variant="destructive" className="mt-1">
              Token Expired
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSync(connection.id)}
          disabled={loading[`sync-${connection.id}`] || isExpired}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading[`sync-${connection.id}`] ? 'animate-spin' : ''}`}
          />
          Sync
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDisconnect(connection.id)}
          disabled={loading[connection.id]}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </div>
    </div>
  );
}
