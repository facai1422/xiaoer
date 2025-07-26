
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface PayPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payPassword: string;
  onPayPasswordChange: (value: string) => void;
  onConfirm: () => void;
}

export const PayPasswordDialog = ({
  open,
  onOpenChange,
  payPassword,
  onPayPasswordChange,
  onConfirm,
}: PayPasswordDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>请输入支付密码</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="password"
            placeholder="请输入6位数字支付密码"
            value={payPassword}
            onChange={(e) => onPayPasswordChange(e.target.value)}
            maxLength={6}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onConfirm}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
