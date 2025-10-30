import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useDataContext } from '@/contexts/DataContext';
import { ArrowRight, Database, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { dataAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const DataUpload = () => {
  const { electoralDataStats, setElectoralDataStats } = useDataContext();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchElectoralDataStats();
  }, []);

  const fetchElectoralDataStats = async () => {
    try {
      const stats = await dataAPI.getElectoralDataStats();
      setElectoralDataStats(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas de datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Datos Electorales</h1>
        <p className="text-muted-foreground">
          Gestión y análisis de datos electorales históricos almacenados en Supabase
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estadísticas de Datos Electorales
            </CardTitle>
            <CardDescription>
              Información sobre los datos electorales disponibles en la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {electoralDataStats && electoralDataStats.has_data ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border bg-accent/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Total de Registros</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {electoralDataStats.total_records.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-accent/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Total de Votos</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {electoralDataStats.total_votes.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-accent/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Años Electorales</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {electoralDataStats.election_years.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {electoralDataStats.election_years.join(', ')}
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-accent/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Departamentos</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {electoralDataStats.departments.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {electoralDataStats.departments.slice(0, 3).join(', ')}
                    {electoralDataStats.departments.length > 3 && '...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Database className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg text-muted-foreground mb-2">
                  No hay datos electorales cargados en la base de datos
                </p>
                <p className="text-sm text-muted-foreground">
                  Por favor, contacta al administrador para cargar datos históricos electorales
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {electoralDataStats && electoralDataStats.has_data && (
          <>
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Información del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Fuente de datos:</strong> Supabase (PostgreSQL)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Estado:</strong> {electoralDataStats.message}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Procesamiento:</strong> Los datos están listos para análisis con Machine Learning
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Link to="/config">
                <Button size="lg" className="shadow-medium">
                  Continuar al Análisis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataUpload;
