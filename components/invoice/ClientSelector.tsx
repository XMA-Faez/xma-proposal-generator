"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, User } from "lucide-react";

interface Client {
  id: string;
  client_name: string;
  client_company: string;
  client_address: string;
  client_trn: string;
  source: string;
}

interface ClientSelectorProps {
  value: {
    client_name: string;
    client_company: string;
    client_address: string;
    client_trn: string;
  };
  onChange: (client: {
    client_name: string;
    client_company: string;
    client_address: string;
    client_trn: string;
  }) => void;
}

export default function ClientSelector({
  value,
  onChange,
}: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newClient, setNewClient] = useState({
    client_name: "",
    client_company: "",
    client_address: "",
    client_trn: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client_company.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleClientSelect = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      onChange({
        client_name: client.client_name,
        client_company: client.client_company,
        client_address: client.client_address,
        client_trn: client.client_trn,
      });
    }
  };

  const handleNewClientSave = () => {
    onChange(newClient);
    setNewClient({
      client_name: "",
      client_company: "",
      client_address: "",
      client_trn: "",
    });
    setShowNewClientDialog(false);
  };

  const isCurrentClient = (client: Client) => {
    return (
      client.client_name === value.client_name &&
      client.client_company === value.client_company
    );
  };

  const currentClientId = clients.find(isCurrentClient)?.id || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-white">Client Information</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowNewClientDialog(true)}
          className="border-zinc-600 bg-zinc-950 text-white hover:bg-zinc-600"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Client
        </Button>
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-400">Loading clients...</div>
      ) : (
        <div className="space-y-4">
          {/* Search and Select */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search existing clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-950 border-zinc-600 text-white placeholder:text-zinc-400"
              />
            </div>

            {searchTerm && filteredClients.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-600 rounded-md max-h-40 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      handleClientSelect(client.id);
                      setSearchTerm("");
                    }}
                    className={`w-full p-3 text-left hover:bg-zinc-600 border-b border-zinc-600 last:border-b-0 ${
                      isCurrentClient(client) ? "bg-zinc-600" : ""
                    }`}
                  >
                    <div className="font-medium text-white">
                      {client.client_name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {client.client_company}
                    </div>
                    {client.client_trn && (
                      <div className="text-xs text-gray-500">
                        TRN: {client.client_trn}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Client Selection Dropdown */}
          <div>
            <Label>Select Existing Client</Label>
            <Select value={currentClientId} onValueChange={handleClientSelect}>
              <SelectTrigger className="bg-zinc-950 !h-12 border-zinc-600 text-white">
                <SelectValue placeholder="Choose from existing clients..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {clients.map((client) => (
                  <SelectItem
                    key={client.id}
                    value={client.id}
                    className="text-white hover:bg-zinc-900"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{client.client_name}</div>
                        <div className="text-sm text-gray-400">
                          {client.client_company}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Manual Entry Fields */}
      <div className="border-t border-zinc-600 pt-4 space-y-4">
        <Label className="text-gray-400">
          Or enter client details manually:
        </Label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client_name">Client Name *</Label>
            <Input
              id="client_name"
              value={value.client_name}
              onChange={(e) =>
                onChange({ ...value, client_name: e.target.value })
              }
              className="bg-zinc-950 border-zinc-600 text-white placeholder:text-zinc-400"
              required
            />
          </div>
          <div>
            <Label htmlFor="client_company">Company Name *</Label>
            <Input
              id="client_company"
              value={value.client_company}
              onChange={(e) =>
                onChange({ ...value, client_company: e.target.value })
              }
              className="bg-zinc-950 border-zinc-600 text-white placeholder:text-zinc-400"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="client_address">Address *</Label>
          <Textarea
            id="client_address"
            value={value.client_address}
            onChange={(e) =>
              onChange({ ...value, client_address: e.target.value })
            }
            className="bg-zinc-950 border-zinc-600 text-white placeholder:text-zinc-400"
            required
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="client_trn">TRN (Tax Registration Number)</Label>
          <Input
            id="client_trn"
            value={value.client_trn}
            onChange={(e) => onChange({ ...value, client_trn: e.target.value })}
            className="bg-zinc-950 border-zinc-600 text-white placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* New Client Dialog */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent className="bg-zinc-800 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new_client_name">Client Name *</Label>
                <Input
                  id="new_client_name"
                  value={newClient.client_name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, client_name: e.target.value })
                  }
                  className="bg-zinc-950 border-zinc-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="new_client_company">Company Name *</Label>
                <Input
                  id="new_client_company"
                  value={newClient.client_company}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      client_company: e.target.value,
                    })
                  }
                  className="bg-zinc-950 border-zinc-600 text-white"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="new_client_address">Address *</Label>
              <Textarea
                id="new_client_address"
                value={newClient.client_address}
                onChange={(e) =>
                  setNewClient({ ...newClient, client_address: e.target.value })
                }
                className="bg-zinc-950 border-zinc-600 text-white"
                required
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="new_client_trn">TRN</Label>
              <Input
                id="new_client_trn"
                value={newClient.client_trn}
                onChange={(e) =>
                  setNewClient({ ...newClient, client_trn: e.target.value })
                }
                className="bg-zinc-950 border-zinc-600 text-white"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewClientDialog(false)}
                className="border-zinc-600 text-white hover:bg-zinc-900"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleNewClientSave}
                disabled={!newClient.client_name || !newClient.client_company}
              >
                Add Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

