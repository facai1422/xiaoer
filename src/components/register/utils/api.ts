
import { supabase } from "@/integrations/supabase/client";

export const registerUser = async (username: string, password: string) => {
  const { data: { user }, error } = await supabase.auth.signUp({
    email: `${username}@placeholder.com`,
    password,
  });

  if (error) throw error;
  return user;
};

export const updateUserProfile = async (userId: string, username: string, inviteCode: string) => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      username,
      invite_code: inviteCode 
    })
    .eq('user_id', userId);  // 使用 user_id 字段查询

  if (error) throw error;
  return true;
};
