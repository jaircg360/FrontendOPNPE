import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDataContext } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlayCircle, Database } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { dataAPI } from '@/lib/api';

const ModelConfig = () => {
  const { electoralDataStats, modelConfig, setModelConfig } = useDataContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  const handleProcessData = async () => {
    if (!electoralDataStats || !electoralDataStats.has_data) {
      toast({
        title: 'Error',
        description: 'No hay datos electorales disponibles en la base de datos.',
        variant: 'destructive',
      });
      return;
    }

    if (!modelConfig.modelType) {
      toast({
        title: 'Error',
        description: 'Por favor, seleccione un modelo de análisis.',
        variant: 'destructive',
      });
      return;
    }

    setModelConfig({ ...modelConfig, isProcessing: true });
    setProgress(0);

    try {
      // Simular progreso mientras se procesa
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      toast({
        title: 'Procesando modelo',
        description: 'Entrenando el modelo de Machine Learning...',
      });

      const response = await dataAPI.processModel({
        modelType: modelConfig.modelType,
        isProcessing: true,
        isComplete: false
      });

      clearInterval(progressInterval);
      setProgress(100);

      setModelConfig({ 
        ...modelConfig, 
        isProcessing: false, 
        isComplete: true 
      });
      
      toast({
        title: 'Proceso completado',
        description: `El análisis se ha realizado exitosamente. Precisión: ${(response.accuracy * 100).toFixed(2)}%`,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Error al procesar el modelo';
      
      setModelConfig({ ...modelConfig, isProcessing: false });
      setProgress(0);

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Selección de Modelo</h1>
        <p className="text-muted-foreground">
          Elija el modelo de Machine Learning para el análisis predictivo electoral
        </p>
      </div>

      {!electoralDataStats || !electoralDataStats.has_data ? (
        <Card className="shadow-medium">
          <CardContent className="py-12 text-center">
            <Database className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-2">
              No hay datos electorales disponibles en la base de datos.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Se requieren datos históricos para entrenar los modelos predictivos.
            </p>
            <Button onClick={() => navigate('/upload')} className="mt-4">
              Ver Estadísticas de Datos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Selección de Modelo de Machine Learning</CardTitle>
              <CardDescription>
                Elija el algoritmo que se ejecutará con Scikit-Learn o PyTorch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={modelConfig.modelType}
                onValueChange={(value) => setModelConfig({ ...modelConfig, modelType: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logistic-regression">
                    Regresión Logística (Scikit-Learn)
                  </SelectItem>
                  <SelectItem value="random-forest">
                    Random Forest (Scikit-Learn)
                  </SelectItem>
                  <SelectItem value="neural-network">
                    Red Neuronal (PyTorch)
                  </SelectItem>
                  <SelectItem value="gradient-boosting">
                    Gradient Boosting (XGBoost)
                  </SelectItem>
                  <SelectItem value="svm">
                    Support Vector Machine (Scikit-Learn)
                  </SelectItem>
                </SelectContent>
              </Select>

              {modelConfig.modelType && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h4 className="mb-2 font-medium text-foreground">Modelo seleccionado</h4>
                  <p className="text-sm text-muted-foreground">
                    {modelConfig.modelType === 'logistic-regression' && 'Regresión Logística - Ideal para clasificación binaria y multiclase'}
                    {modelConfig.modelType === 'random-forest' && 'Random Forest - Ensemble de árboles de decisión, robusto y preciso'}
                    {modelConfig.modelType === 'neural-network' && 'Red Neuronal - Deep Learning con PyTorch para patrones complejos'}
                    {modelConfig.modelType === 'gradient-boosting' && 'Gradient Boosting - XGBoost para máxima precisión predictiva'}
                    {modelConfig.modelType === 'svm' && 'Support Vector Machine - Clasificación con margen máximo'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {modelConfig.isProcessing && (
            <Card className="shadow-medium">
              <CardContent className="py-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-lg font-medium">Procesando análisis...</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Este proceso puede tomar unos momentos. Por favor espere.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleProcessData}
              disabled={modelConfig.isProcessing || !modelConfig.modelType}
              className="shadow-medium"
            >
              {modelConfig.isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Ejecutar Análisis
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelConfig;
