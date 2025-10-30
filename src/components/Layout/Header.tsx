import { Link, useLocation } from 'react-router-dom';
import { Database, BarChart3, Settings, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const publicNavItems = [
    { path: '/', label: 'Votación', icon: Database },
  ];

  const adminNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/upload', label: 'Carga de Datos', icon: Database },
    { path: '/cleaning', label: 'Limpieza', icon: Settings },
    { path: '/config', label: 'Modelo', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : publicNavItems;

  return (
    <header className="border-b border-border bg-card shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-institutional">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ONPE</h1>
              <p className="text-xs text-muted-foreground">Análisis Electoral</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}

            {user ? (
              <Button
                onClick={signOut}
                variant="ghost"
                size="sm"
                className="ml-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Cerrar Sesión</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="ml-2">
                  <LogIn className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Administrador</span>
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
