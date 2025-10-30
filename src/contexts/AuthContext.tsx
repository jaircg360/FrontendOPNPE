import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  session: { access_token: string } | null;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar si hay una sesión existente
    const checkExistingSession = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setSession({ access_token: token });
          setIsAdmin(userData.is_admin || false);
        } catch (error) {
          console.error('Error al cargar sesión:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    checkExistingSession();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await authAPI.signUp(email, password, fullName);
      
      // Guardar token y usuario
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setSession({ access_token: response.access_token });
      setIsAdmin(response.user.is_admin);

      toast({
        title: "¡Registro exitoso!",
        description: "Bienvenido al sistema electoral ONPE",
      });

      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Error al registrarse";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return { error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.signIn(email, password);
      
      // Guardar token y usuario
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setSession({ access_token: response.access_token });
      setIsAdmin(response.user.is_admin);

      toast({
        title: "¡Inicio de sesión exitoso!",
        description: "Bienvenido de vuelta",
      });

      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Credenciales inválidas";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      await authAPI.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar estado local
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        signUp,
        signIn,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
