
import React from 'react';

export function AuthLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-muted-foreground">Verificando permisos...</p>
      </div>
    </div>
  );
}
