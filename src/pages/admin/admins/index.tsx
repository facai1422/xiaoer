
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Admin {
  id: string;
  username: string;
  password: string;
  role: string;
  permissions: string[];
  createdAt: string;
}

const AdminsManagement = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    role: "admin",
    permissions: [] as string[],
  });

  // 从 localStorage 加载管理员数据
  useEffect(() => {
    const savedAdmins = JSON.parse(localStorage.getItem("admins") || "[]");
    setAdmins(savedAdmins);
  }, []);

  const permissions = [
    { id: "orders", label: "订单管理" },
    { id: "users", label: "用户管理" },
    { id: "finance", label: "财务管理" },
    { id: "settings", label: "系统设置" },
  ];

  const handleAddAdmin = () => {
    if (!newAdmin.username || !newAdmin.password) {
      toast.error("请填写完整信息");
      return;
    }

    const existingAdmin = admins.find(
      (admin) => admin.username === newAdmin.username
    );
    if (existingAdmin) {
      toast.error("该用户名已存在");
      return;
    }

    const admin: Admin = {
      id: Date.now().toString(),
      ...newAdmin,
      createdAt: new Date().toISOString(),
    };

    const updatedAdmins = [...admins, admin];
    localStorage.setItem("admins", JSON.stringify(updatedAdmins));
    setAdmins(updatedAdmins);
    setShowAddDialog(false);
    setNewAdmin({
      username: "",
      password: "",
      role: "admin",
      permissions: [],
    });
    toast.success("管理员添加成功");
  };

  const handleRemoveAdmin = (adminId: string) => {
    if (window.confirm("确定要删除该管理员吗？")) {
      const updatedAdmins = admins.filter((admin) => admin.id !== adminId);
      localStorage.setItem("admins", JSON.stringify(updatedAdmins));
      setAdmins(updatedAdmins);
      toast.success("管理员删除成功");
    }
  };

  const togglePermission = (permission: string) => {
    setNewAdmin((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">管理员管理</h2>
        <Button onClick={() => setShowAddDialog(true)}>添加管理员</Button>
      </div>

      <div className="grid gap-4">
        {admins.map((admin) => (
          <Card key={admin.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{admin.username}</h3>
                <p className="text-sm text-gray-500">角色: {admin.role}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium">权限:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {admin.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {
                          permissions.find((p) => p.id === permission)?.label ||
                          permission
                        }
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  创建时间: {new Date(admin.createdAt).toLocaleString()}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveAdmin(admin.id)}
              >
                删除
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加管理员</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="username" className="text-sm font-medium">
                用户名
              </label>
              <Input
                id="username"
                value={newAdmin.username}
                onChange={(e) =>
                  setNewAdmin((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="password"
                type="password"
                value={newAdmin.password}
                onChange={(e) =>
                  setNewAdmin((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">角色</label>
              <Select
                value={newAdmin.role}
                onValueChange={(value) =>
                  setNewAdmin((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="super_admin">超级管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">权限</label>
              <div className="grid grid-cols-2 gap-2">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={permission.id}
                      checked={newAdmin.permissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <label
                      htmlFor={permission.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddAdmin}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminsManagement;
