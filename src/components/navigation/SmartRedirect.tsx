
import { Navigate } from 'react-router-dom';
import { useDefaultRedirect } from '@/hooks/useDefaultRedirect';

export function SmartRedirect() {
  const { defaultRoute, isLoading } = useDefaultRedirect();

  console.log("🚀 [SMART_REDIRECT DEBUG] Component rendered - isLoading:", isLoading, "defaultRoute:", defaultRoute);

  if (isLoading) {
    console.log("⏳ [SMART_REDIRECT DEBUG] Showing loading state");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando permisos...</p>
        </div>
      </div>
    );
  }

  if (!defaultRoute) {
    console.log("❌ [SMART_REDIRECT DEBUG] No default route available, showing no access message");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Sin acceso</h2>
          <p className="text-muted-foreground">No tienes permisos para acceder a ninguna página.</p>
        </div>
      </div>
    );
  }

  console.log("✅ [SMART_REDIRECT DEBUG] Redirecting to:", defaultRoute);
  return <Navigate to={defaultRoute} replace />;
}
