
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  created_at: string;
  updated_at: string;
  description?: string;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key', { ascending: true });

      if (error) throw error;
      
      setSettings(data || []);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error("加载系统设置失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKey || !newValue) {
      toast.error("Key and Value cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .insert([{ setting_key: newKey, setting_value: newValue }]);

      if (error) throw error;

      toast.success("Setting created successfully");
      setNewKey("");
      setNewValue("");
      fetchSettings();
    } catch (error) {
      console.error("Error creating setting:", error);
      toast.error("Failed to create setting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string, value: any) => {
    setEditId(id);
    setEditValue(typeof value === 'string' ? value : JSON.stringify(value));
  };

  const handleUpdate = async () => {
    if (!editId || !editValue) {
      toast.error("Value cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: editValue })
        .eq('id', editId);

      if (error) throw error;

      toast.success("Setting updated successfully");
      setEditId(null);
      setEditValue("");
      fetchSettings();
    } catch (error) {
      console.error("Error updating setting:", error);
      toast.error("Failed to update setting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this setting?")) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Setting deleted successfully");
      fetchSettings();
    } catch (error) {
      console.error("Error deleting setting:", error);
      toast.error("Failed to delete setting");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Manage your system settings here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-medium">Create New Setting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <Button className="mt-2" onClick={handleCreate} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  settings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell>{setting.setting_key}</TableCell>
                      <TableCell>
                        {editId === setting.id ? (
                          <Input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                        ) : (
                          typeof setting.setting_value === 'string' 
                            ? setting.setting_value 
                            : JSON.stringify(setting.setting_value)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editId === setting.id ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleUpdate}
                              disabled={isLoading}
                            >
                              {isLoading ? "Updating..." : "Update"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditId(null)}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(setting.id, setting.setting_value)}
                              disabled={isLoading}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(setting.id)}
                              disabled={isLoading}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
