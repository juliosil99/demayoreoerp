
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Dashboard = () => {
  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('Your user ID:', user.id);
      toast.success('User ID printed to console!');
    } else {
      toast.error('No user found. Please make sure you are logged in.');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Panel de Control</h1>
      <p>¡Bienvenido a tu panel de control!</p>
      <Button onClick={getUserId}>Show my User ID</Button>
    </div>
  );
};

export default Dashboard;
