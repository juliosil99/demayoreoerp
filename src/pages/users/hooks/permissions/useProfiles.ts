
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Profile } from "../../types";
import { useAuth } from "@/contexts/AuthContext";

export function useProfiles() {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const { 
    data: profiles, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      console.log("🔍 Obteniendo perfiles...");
      
      // Paso 1: Obtener todos los perfiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error("❌ Error obteniendo perfiles:", profilesError);
        toast.error("Error al cargar perfiles: " + profilesError.message);
        throw profilesError;
      }
      
      console.log("✅ Perfiles obtenidos:", profilesData);
      
      // Filtrar duplicados basados en email (mantener el más reciente)
      const uniqueProfiles = profilesData.reduce((acc: any[], profile) => {
        const existing = acc.find(p => p.email === profile.email && profile.email);
        if (!existing) {
          acc.push(profile);
        } else {
          // Mantener el perfil más reciente
          if (profile.created_at > existing.created_at) {
            const index = acc.indexOf(existing);
            acc[index] = profile;
          }
        }
        return acc;
      }, []);
      
      // Paso 2: Obtener todas las relaciones company_users e invitaciones para incluir usuarios sin perfiles completos
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from("company_users")
        .select(`
          user_id,
          role,
          company:companies(id, nombre)
        `);

      if (companyUsersError) {
        console.error("❌ Error obteniendo usuarios de empresa:", companyUsersError);
      }

      // Paso 3: Obtener invitaciones para correlacionar emails con usuarios sin perfil
      const { data: invitationsData, error: invitationsError } = await supabase
        .from("user_invitations")
        .select("email, status")
        .eq("status", "completed");

      if (invitationsError) {
        console.error("❌ Error obteniendo invitaciones:", invitationsError);
      }

      // Paso 4: Crear un mapa de emails completados
      const completedInvitationEmails = new Set(
        invitationsData?.map(inv => inv.email) || []
      );

      // Paso 5: Obtener todos los IDs de usuario únicos
      const allUserIds = new Set([
        ...uniqueProfiles.map(p => p.id),
        ...(companyUsersData || []).map(cu => cu.user_id)
      ]);

      const profilesWithCompany = await Promise.all(
        Array.from(allUserIds).map(async (userId) => {
          // Buscar perfil existente
          let profile = uniqueProfiles.find(p => p.id === userId);
          
          if (!profile) {
            // Para usuarios en company_users pero no en profiles, crear placeholder
            console.log(`⚠️ Perfil no encontrado para usuario ${userId}, creando placeholder`);
            
            // Intentar obtener email de invitaciones completadas para este usuario
            const companyUser = companyUsersData?.find(cu => cu.user_id === userId);
            let emailFromInvitation = null;
            
            // Si encontramos el usuario en company_users, buscar su email en invitaciones
            if (companyUser) {
              // Buscar en invitaciones completadas que puedan corresponder a este usuario
              const matchingInvitation = invitationsData?.find(inv => 
                completedInvitationEmails.has(inv.email)
              );
              emailFromInvitation = matchingInvitation?.email || null;
            }
            
            profile = {
              id: userId,
              email: emailFromInvitation,
              first_name: null,
              last_name: null,
              created_at: new Date().toISOString()
            };

            // Si tenemos email, intentar actualizar el perfil en la base de datos
            if (emailFromInvitation) {
              console.log(`📝 Actualizando perfil con email para usuario ${userId}:`, emailFromInvitation);
              const { error: updateError } = await supabase
                .from("profiles")
                .upsert({
                  id: userId,
                  email: emailFromInvitation
                }, {
                  onConflict: 'id'
                });

              if (updateError) {
                console.error("❌ Error actualizando perfil:", updateError);
              } else {
                console.log("✅ Perfil actualizado con email");
                profile.email = emailFromInvitation;
              }
            }
          }
          
          // Obtener información de la empresa desde company_users
          const companyUser = companyUsersData?.find(cu => cu.user_id === userId);
          
          return {
            ...profile,
            company: companyUser?.company || null
          };
        })
      );
      
      console.log("✅ Perfiles con información de empresa:", profilesWithCompany);
      return profilesWithCompany as Profile[];
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 5000,
  });

  return { profiles, isLoading, currentUserId, error, refetch };
}
