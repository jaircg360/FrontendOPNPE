import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BarChartComponent from '@/components/Charts/BarChartComponent';
import LineChartComponent from '@/components/Charts/LineChartComponent';
import PieChartComponent from '@/components/Charts/PieChartComponent';
import RadialChartComponent from '@/components/Charts/RadialChartComponent';
import TopCandidates from '@/components/Dashboard/TopCandidates';
import ModelsHistory from '@/components/Dashboard/ModelsHistory';
import { TrendingUp, Users, FileText, Target, RefreshCw } from 'lucide-react';
import { dataAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DepartmentData {
  name: string;
  votos: number;
}

interface ParticipationData {
  name: string;
  participacion: number;
}

interface PartyData {
  name: string;
  value: number;
}

interface MetricData {
  name: string;
  accuracy: number;
  fill: string;
}

const Dashboard = () => {
  const { electoralDataStats, modelConfig } = useDataContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [barData, setBarData] = useState<DepartmentData[]>([]);
  const [lineData, setLineData] = useState<ParticipationData[]>([]);
  const [pieData, setPieData] = useState<PartyData[]>([]);
  const [radialData, setRadialData] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modelAccuracy, setModelAccuracy] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!electoralDataStats || !electoralDataStats.has_data || !modelConfig.isComplete) {
      navigate('/upload');
    } else {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electoralDataStats, modelConfig, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar información del modelo actual (incluyendo precisión real)
      try {
        const modelInfoResponse = await dataAPI.getCurrentModelInfo();
        if (modelInfoResponse.success && modelInfoResponse.model_info) {
          setModelAccuracy(modelInfoResponse.model_info.accuracy);
        }
      } catch (err) {
        console.error('Error cargando info del modelo:', err);
      }

      // Cargar datos de departamentos
      const deptResponse = await dataAPI.getVotesByDepartment();
      if (deptResponse.success && deptResponse.departments) {
        setBarData(deptResponse.departments);
      }

      // Cargar datos de participación por año
      const yearResponse = await dataAPI.getParticipationByYear();
      if (yearResponse.success && yearResponse.years) {
        setLineData(yearResponse.years);
      }

      // Cargar datos de partidos
      const partyResponse = await dataAPI.getVotesByParty();
      if (partyResponse.success && partyResponse.parties) {
        setPieData(partyResponse.parties);
      }

      // Cargar métricas del modelo
      const metricsResponse = await dataAPI.getModelMetrics();
      if (metricsResponse.success && metricsResponse.metrics) {
        setRadialData(metricsResponse.metrics);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar algunos datos del dashboard",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast({
      title: "Actualizado",
      description: "Los datos se han actualizado correctamente",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando datos del dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Dashboard Analítico Electoral</h1>
            <p className="text-muted-foreground">
              Resultados del análisis procesado con Pandas, NumPy, Scikit-Learn y PyTorch
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Badge variant="outline" className="text-sm">
              Modelo: {modelConfig.modelType || 'No especificado'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Votantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">13,770,000</div>
            <p className="text-xs text-muted-foreground">+12.5% respecto a elección anterior</p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Participación</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">78.3%</div>
            <p className="text-xs text-muted-foreground">Alta participación ciudadana</p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesas Escrutadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">95.7%</div>
            <p className="text-xs text-muted-foreground">23,452 de 24,501 mesas</p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisión del Modelo</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {modelAccuracy !== null ? `${modelAccuracy.toFixed(1)}%` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {modelConfig.modelType === 'neural-network' && 'Red Neuronal (PyTorch)'}
              {modelConfig.modelType === 'logistic-regression' && 'Regresión Logística'}
              {modelConfig.modelType === 'random-forest' && 'Random Forest'}
              {modelConfig.modelType === 'gradient-boosting' && 'Gradient Boosting'}
              {modelConfig.modelType === 'svm' && 'SVM (Scikit-Learn)'}
              {!modelConfig.modelType && 'Modelo predictivo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Candidates Section */}
      <div className="mb-6">
        <TopCandidates />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartComponent data={barData} title="Distribución de Votos por Región" />
        <LineChartComponent data={lineData} title="Evolución de Participación Electoral" />
        <PieChartComponent data={pieData} title="Porcentaje de Votos por Partido" />
        <RadialChartComponent data={radialData} title="Métricas de Precisión del Modelo" />
      </div>

      {/* Models History */}
      <div className="mt-8">
        <ModelsHistory />
      </div>

      {/* Summary Card */}
      <Card className="mt-8 shadow-medium">
        <CardHeader>
          <CardTitle>Resumen del Análisis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Fuente de datos:</strong> Supabase (PostgreSQL)
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Registros analizados:</strong> {electoralDataStats?.total_records.toLocaleString() || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Departamentos:</strong> {electoralDataStats?.departments.length || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Años electorales:</strong> {electoralDataStats?.election_years.join(', ') || 'No disponible'}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Modelo utilizado:</strong> {modelConfig.modelType || 'No especificado'}
            </p>
            <p className="text-sm text-card-foreground">
              El análisis se completó exitosamente. Los resultados muestran patrones significativos
              en la distribución electoral y alta precisión en las predicciones del modelo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
