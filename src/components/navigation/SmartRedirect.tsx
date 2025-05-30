
import { Navigate } from 'react-router-dom';
import { useDefaultRedirect } from '@/hooks/useDefaultRedirect';

export function SmartRedirect() {
  const { defaultRoute, isLoading } = useDefaultRedirect();

  if (isLoading) {
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Sin acceso</h2>
          <p className="text-muted-foreground">No tienes permisos para acceder a ninguna página.</p>
        </div>
      </div>
    );
  }

  return <Navigate to={defaultRoute} replace />;
}
