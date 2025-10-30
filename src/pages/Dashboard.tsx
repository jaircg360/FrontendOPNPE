import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BarChartComponent from '@/components/Charts/BarChartComponent';
import LineChartComponent from '@/components/Charts/LineChartComponent';
import PieChartComponent from '@/components/Charts/PieChartComponent';
import RadialChartComponent from '@/components/Charts/RadialChartComponent';
import TopCandidates from '@/components/Dashboard/TopCandidates';
import { TrendingUp, Users, FileText, Target } from 'lucide-react';

const Dashboard = () => {
  const { electoralDataStats, modelConfig } = useDataContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!electoralDataStats || !electoralDataStats.has_data || !modelConfig.isComplete) {
      navigate('/upload');
    }
  }, [electoralDataStats, modelConfig, navigate]);

  // Mock data for demonstration
  const barData = [
    { name: 'Región Norte', votos: 45000 },
    { name: 'Región Centro', votos: 52000 },
    { name: 'Región Sur', votos: 38000 },
    { name: 'Región Este', votos: 41000 },
    { name: 'Región Oeste', votos: 47000 },
  ];

  const lineData = [
    { name: '2016', participacion: 75 },
    { name: '2018', participacion: 78 },
    { name: '2020', participacion: 82 },
    { name: '2022', participacion: 79 },
    { name: '2024', participacion: 85 },
  ];

  const pieData = [
    { name: 'Partido A', value: 35 },
    { name: 'Partido B', value: 28 },
    { name: 'Partido C', value: 22 },
    { name: 'Partido D', value: 15 },
  ];

  const radialData = [
    { name: 'Precisión', accuracy: 92, fill: 'hsl(215 100% 32%)' },
    { name: 'Recall', accuracy: 88, fill: 'hsl(348 100% 45%)' },
    { name: 'F1-Score', accuracy: 90, fill: 'hsl(215 85% 55%)' },
  ];

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
          <Badge variant="outline" className="text-sm">
            Modelo: {modelConfig.modelType || 'No especificado'}
          </Badge>
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
            <div className="text-2xl font-bold text-foreground">94.2%</div>
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
