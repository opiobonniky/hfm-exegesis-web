import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';

export function AppLayout() {
  const { isAuthenticated, userInfo } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = userInfo?.userRole === 1;
  const pageTitle = isAdmin ? "Administration Management" : "My Dashboard";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-4 lg:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <SidebarTrigger className="mr-4">
              <Button variant="ghost" size="lg">
                <Menu className="w-10 h-10" />
              </Button>
            </SidebarTrigger>
            <h1 className="text-lg font-semibold text-foreground">
              {pageTitle}
            </h1>
          </header>
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
