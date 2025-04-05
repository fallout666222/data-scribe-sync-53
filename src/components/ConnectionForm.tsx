
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

interface ConnectionFormProps {
  onConnect: (settings: ConnectionSettings) => void;
}

export interface ConnectionSettings {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ onConnect }) => {
  const [settings, setSettings] = useState<ConnectionSettings>({
    host: 'localhost',
    port: '5432',
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  const handleChange = (field: keyof ConnectionSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(settings);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            <span>Connect to PostgreSQL</span>
          </CardTitle>
          <CardDescription>
            Enter your database connection details below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                value={settings.host}
                onChange={(e) => handleChange('host', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                value={settings.port}
                onChange={(e) => handleChange('port', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="database">Database</Label>
            <Input
              id="database"
              value={settings.database}
              onChange={(e) => handleChange('database', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user">Username</Label>
            <Input
              id="user"
              value={settings.user}
              onChange={(e) => handleChange('user', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={settings.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Connect</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default ConnectionForm;
