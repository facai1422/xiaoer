
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUploadField } from "./FileUploadField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApplicationFormProps {
  onSuccess: () => void;
}

export const ApplicationForm = ({ onSuccess }: ApplicationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [idCardFront, setIdCardFront] = useState<File | null>(null);
  const [idCardBack, setIdCardBack] = useState<File | null>(null);

  const handleFileUpload = async (file: File, path: string) => {
    const fileName = `${crypto.randomUUID()}-${file.name.replace(/[^\x00-\x7F]/g, '')}`;
    const { data, error } = await supabase.storage
      .from('merchant-files')
      .upload(`${path}/${fileName}`, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 验证手机号
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        toast.error("请输入正确的手机号码");
        return;
      }

      // 验证其他字段
      if (!companyName || !contactName || !businessLicense || !idCardFront || !idCardBack) {
        toast.error("请填写完整信息并上传所需文件");
        return;
      }

      // 检查重复申请
      const { data: applications, error: queryError } = await supabase
        .rpc('check_merchant_application', {
          p_phone: phone
        });

      if (queryError) {
        console.error('Error checking application:', queryError);
        toast.error("系统错误，请重试");
        return;
      }

      if (applications && applications.length > 0) {
        const existingApp = applications[0] as any;
        if (existingApp.status === 'pending') {
          toast.error("您已提交过申请，请等待审核");
          return;
        } else if (existingApp.status === 'approved') {
          toast.error("您的申请已通过，请直接登录");
          onSuccess();
          return;
        }
      }

      // 上传文件
      const businessLicenseUrl = await handleFileUpload(businessLicense, 'business-license');
      const idCardFrontUrl = await handleFileUpload(idCardFront, 'id-card');
      const idCardBackUrl = await handleFileUpload(idCardBack, 'id-card');

      // 创建申请记录
      const { error: insertError } = await supabase
        .rpc('create_merchant_application', {
          p_phone: phone,
          p_company_name: companyName,
          p_contact_name: contactName,
          p_business_license: businessLicenseUrl,
          p_id_card_front: idCardFrontUrl,
          p_id_card_back: idCardBackUrl
        });

      if (insertError) throw insertError;

      toast.success("申请提交成功，请等待管理员审核");
      onSuccess();
    } catch (error) {
      console.error('Application error:', error);
      toast.error("申请提交失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">手机号码</label>
        <Input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="请输入手机号码"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">公司名称</label>
        <Input
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="请输入公司名称"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">联系人姓名</label>
        <Input
          required
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="请输入联系人姓名"
        />
      </div>

      <FileUploadField
        label="营业执照"
        required
        onChange={setBusinessLicense}
      />

      <FileUploadField
        label="身份证正面"
        required
        onChange={setIdCardFront}
      />

      <FileUploadField
        label="身份证背面"
        required
        onChange={setIdCardBack}
      />

      <Button
        type="submit"
        className="w-full bg-[#1890ff] hover:bg-[#40a9ff]"
        disabled={isLoading}
      >
        {isLoading ? "提交中..." : "提交申请"}
      </Button>
    </form>
  );
};
