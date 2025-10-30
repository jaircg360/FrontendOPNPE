import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, RefreshCw, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { dataAPI } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Prediction {
  id: string;
  candidate_id: string;
  model_type: string;
  predicted_percentage: number;
  confidence_score: number;
  training_date: string;
  candidates: {
    name: string;
    party: string;
  };
}

interface Candidate {
  name: string;
  party: string;
  percentage: number;
  confidence: number;
  color: string;
}

interface RealVoteCandidate {
  candidate_name: string;
  party_name: string;
  votes: number;
  percentage: number;
}

const COLORS = [
  'hsl(215 100% 50%)',
  'hsl(348 100% 45%)',
  'hsl(160 60% 45%)',
  'hsl(40 90% 50%)',
  'hsl(280 60% 50%)',
  'hsl(190 80% 45%)',
  'hsl(320 70% 50%)',
  'hsl(100 60% 45%)',
];

const TopCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{ type: string; date: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para votos reales
  const [realVotes, setRealVotes] = useState<RealVoteCandidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loadingRealVotes, setLoadingRealVotes] = useState(false);
  const [realVotesError, setRealVotesError] = useState<string | null>(null);

  const fetchPredictions = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await dataAPI.getPredictions();
      
      if (response.success && response.predictions && response.predictions.length > 0) {
        // Convertir predicciones a formato de candidatos
        const candidatesData: Candidate[] = response.predictions.map((pred: Prediction, index: number) => ({
          name: pred.candidates?.name || 'Candidato Desconocido',
          party: pred.candidates?.party || 'Partido Desconocido',
          percentage: pred.predicted_percentage,
          confidence: pred.confidence_score * 100, // Convertir a porcentaje
          color: COLORS[index % COLORS.length],
        }));
        
        setCandidates(candidatesData);
        
        // Guardar información del modelo
        const firstPred = response.predictions[0];
        if (firstPred) {
          const modelTypeNames: { [key: string]: string } = {
            'logistic-regression': 'Regresión Logística',
            'random-forest': 'Random Forest',
            'gradient-boosting': 'Gradient Boosting',
            'svm': 'SVM',
            'neural-network': 'Red Neuronal (PyTorch)'
          };
          
          setModelInfo({
            type: modelTypeNames[firstPred.model_type] || firstPred.model_type,
            date: new Date(firstPred.training_date).toLocaleString('es-PE')
          });
        }
      } else {
        // Si no hay predicciones, usar datos por defecto
        setCandidates([]);
        setModelInfo(null);
        setError('No hay predicciones disponibles. Por favor, procesa un modelo primero.');
      }
    } catch (err) {
      console.error('Error al obtener predicciones:', err);
      setError('Error al cargar las predicciones. Por favor, intenta de nuevo.');
      setCandidates([]);
      setModelInfo(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchElectoralYears = async () => {
    try {
      const response = await dataAPI.getElectoralYears();
      if (response.success && response.years && response.years.length > 0) {
        setAvailableYears(response.years);
        setSelectedYear(response.years[0]); // Seleccionar el año más reciente por defecto
      }
    } catch (err) {
      console.error('Error al obtener años electorales:', err);
    }
  };

  const fetchRealVotes = async (year: number) => {
    try {
      setLoadingRealVotes(true);
      setRealVotesError(null);
      const response = await dataAPI.getRealVotesByYear(year);
      
      if (response.success && response.candidates) {
        setRealVotes(response.candidates);
        setTotalVotes(response.total_votes || 0);
      } else {
        setRealVotes([]);
        setTotalVotes(0);
        setRealVotesError(response.message || 'No hay datos disponibles');
      }
    } catch (err) {
      console.error('Error al obtener votos reales:', err);
      setRealVotesError('Error al cargar votos reales');
      setRealVotes([]);
      setTotalVotes(0);
    } finally {
      setLoadingRealVotes(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
    fetchElectoralYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchRealVotes(selectedYear);
    }
  }, [selectedYear]);

  const handleRefresh = () => {
    fetchPredictions();
    if (selectedYear) {
      fetchRealVotes(selectedYear);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
  };

  if (loading && !refreshing) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Predicciones de Candidatos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Cargando predicciones...</div>
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
            <Trophy className="h-5 w-5 text-primary" />
            Predicciones de Candidatos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Análisis Electoral
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loadingRealVotes}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${(refreshing || loadingRealVotes) ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predictions" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Predicciones ML
            </TabsTrigger>
            <TabsTrigger value="real-votes" className="gap-2">
              <Users className="h-4 w-4" />
              Votos Reales
            </TabsTrigger>
          </TabsList>

          {/* Tab de Predicciones ML */}
          <TabsContent value="predictions" className="mt-4">
            {modelInfo && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/50">
                <Badge variant="outline">{modelInfo.type}</Badge>
                <span className="text-xs text-muted-foreground">
                  Actualizado: {modelInfo.date}
                </span>
              </div>
            )}

            {candidates.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No hay predicciones disponibles. Por favor, procesa un modelo en la sección de configuración.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-4">
                  {candidates.map((candidate, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all hover:shadow-medium"
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{candidate.name}</h4>
                            <p className="text-sm text-muted-foreground">{candidate.party}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xl font-bold text-foreground">
                            {candidate.percentage.toFixed(1)}%
                            {index < 2 && <TrendingUp className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Confianza: {candidate.confidence.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div
                        className="absolute bottom-0 left-0 top-0 opacity-10 transition-all"
                        style={{
                          width: `${candidate.percentage}%`,
                          backgroundColor: candidate.color,
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Predicciones basadas en:</span>{' '}
                    Modelo de Machine Learning con datos históricos reales
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Procesado con Pandas, NumPy, Scikit-Learn y PyTorch
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          {/* Tab de Votos Reales */}
          <TabsContent value="real-votes" className="mt-4">
            {availableYears.length > 0 && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Año Electoral:</span>
                <Select value={selectedYear?.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {totalVotes > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    Total: {totalVotes.toLocaleString('es-PE')} votos
                  </Badge>
                )}
              </div>
            )}

            {loadingRealVotes ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Cargando votos...</div>
              </div>
            ) : realVotesError ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{realVotesError}</AlertDescription>
              </Alert>
            ) : realVotes.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No hay datos de votos reales disponibles para el año seleccionado.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-4">
                  {realVotes.map((candidate, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all hover:shadow-medium"
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{candidate.candidate_name}</h4>
                            <p className="text-sm text-muted-foreground">{candidate.party_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xl font-bold text-foreground">
                            {candidate.percentage.toFixed(1)}%
                            {index < 2 && <TrendingUp className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {candidate.votes.toLocaleString('es-PE')} votos
                          </p>
                        </div>
                      </div>
                      <div
                        className="absolute bottom-0 left-0 top-0 opacity-10 transition-all"
                        style={{
                          width: `${candidate.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Datos históricos reales</span> del año {selectedYear}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fuente: Base de datos electoral (electoral_data)
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TopCandidates;
