import { createClient } from "@/lib/supabase";
import LoginClient from "./LoginClient";

const LoginPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <LoginClient />
    </div>
  );
};

export default LoginPage;
