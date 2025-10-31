import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
  Database,
  Zap,
  RefreshCw
} from 'lucide-react';
import { dataAPI } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ModelHistory {
  id: string;
  model_type: string;
  status: string;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  training_time: number | null;
  records_processed: number;
  predictions_generated: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

const MODEL_TYPE_NAMES: { [key: string]: string } = {
  'logistic-regression': 'Regresión Logística',
  'random-forest': 'Random Forest',
  'gradient-boosting': 'Gradient Boosting',
  'svm': 'SVM',
  'neural-network': 'Red Neuronal'
};

const ModelsHistory = () => {
  const [history, setHistory] = useState<ModelHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await dataAPI.getModelsHistory(10);
      
      if (response.success && response.history) {
        setHistory(response.history);
      } else {
        setHistory([]);
      }
      
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error('Error fetching models history:', err);
      setError('Error al cargar el historial de modelos');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Completado</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Fallido</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Procesando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Historial de Análisis Predictivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Historial de Análisis Predictivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Historial de Análisis Predictivos
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistory}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Últimos 10 entrenamientos de modelos de Machine Learning
        </p>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <Alert>
            <AlertDescription>
              No hay historial de modelos entrenados. Entrena tu primer modelo en la sección de procesamiento.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {history.map((model, index) => (
              <div
                key={model.id}
                className="relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-foreground">
                      #{history.length - index}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {MODEL_TYPE_NAMES[model.model_type] || model.model_type}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(model.completed_at || model.started_at)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(model.status)}
                </div>

                {/* Metrics Grid */}
                {model.status === 'completed' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>Precisión</span>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {model.accuracy !== null ? `${model.accuracy.toFixed(1)}%` : '--'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>F1-Score</span>
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {model.f1_score !== null ? `${model.f1_score.toFixed(1)}%` : '--'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Tiempo</span>
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {model.training_time !== null ? `${model.training_time.toFixed(1)}s` : '--'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>Predicciones</span>
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {model.predictions_generated || 0}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      <span>{model.records_processed || 0} registros procesados</span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {model.error_message && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertDescription className="text-xs">
                      {model.error_message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelsHistory;

