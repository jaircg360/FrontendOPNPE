import { useEffect, useState } from 'react';
import { candidatesAPI, votesAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Vote, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface Candidate {
  id: string;
  name: string;
  party: string;
  image_url: string;
  description: string;
  proposals: string[];
}

interface VoteCount {
  candidate_id: string;
  candidate_name: string;
  party: string;
  vote_count: number;
  percentage: number;
}

const Voting = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dni: '',
    phone: '',
    department: '',
    province: '',
    district: '',
    address: ''
  });
  const [voteCounts, setVoteCounts] = useState<{ [key: string]: VoteCount }>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [refreshingCounts, setRefreshingCounts] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCandidates();
    fetchVoteCounts();
    if (user) {
      checkExistingVote();
    }

    // Actualizar conteo cada 10 segundos
    const interval = setInterval(() => {
      fetchVoteCounts();
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchCandidates = async () => {
    try {
      const data = await candidatesAPI.getAll();
      setCandidates(data);
    } catch (error) {
      console.error('Error al obtener candidatos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los candidatos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkExistingVote = async () => {
    if (!user) return;
    
    try {
      const data = await votesAPI.checkUserVote();
      if (data.has_voted && data.candidate_id) {
        setVotedFor(data.candidate_id);
      }
    } catch (error) {
      console.error('Error al verificar voto:', error);
    }
  };

  const fetchVoteCounts = async () => {
    try {
      setRefreshingCounts(true);
      const data = await votesAPI.getVoteCounts();
      
      if (data.success) {
        // Crear un mapa de votos por candidate_id
        const countsMap: { [key: string]: VoteCount } = {};
        data.candidates.forEach((candidateData: VoteCount) => {
          countsMap[candidateData.candidate_id] = candidateData;
        });
        
        setVoteCounts(countsMap);
        setTotalVotes(data.total_votes);
      }
    } catch (error) {
      console.error('Error al obtener conteo de votos:', error);
    } finally {
      setRefreshingCounts(false);
    }
  };

  const handleRefreshCounts = () => {
    fetchVoteCounts();
    toast({
      title: "Actualizado",
      description: "Conteo de votos actualizado",
    });
  };

  const handleVote = (candidateId: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para votar",
        variant: "destructive",
      });
      return;
    }

    if (votedFor) {
      toast({
        title: "Ya votaste",
        description: "Solo puedes votar una vez",
        variant: "destructive",
      });
      return;
    }

    setSelectedCandidateId(candidateId);
    setShowVoteDialog(true);
  };

  const submitVote = async () => {
    if (!selectedCandidateId || !user) return;

    if (!formData.fullName || !formData.dni || !formData.phone || 
        !formData.department || !formData.province || !formData.district || !formData.address) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    // Validar DNI (8 dígitos)
    if (!/^\d{8}$/.test(formData.dni)) {
      toast({
        title: "DNI inválido",
        description: "El DNI debe tener 8 dígitos",
        variant: "destructive",
      });
      return;
    }

    try {
      await votesAPI.create({
        candidate_id: selectedCandidateId,
        full_name: formData.fullName,
        dni: formData.dni,
        phone: formData.phone,
        department: formData.department,
        province: formData.province,
        district: formData.district,
        address: formData.address,
      });

      setVotedFor(selectedCandidateId);
      setShowVoteDialog(false);
      setFormData({ fullName: '', dni: '', phone: '', department: '', province: '', district: '', address: '' });
      
      // Actualizar conteo de votos inmediatamente
      fetchVoteCounts();
      
      toast({
        title: "¡Voto registrado!",
        description: "Tu voto ha sido registrado exitosamente",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "No se pudo registrar tu voto";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando candidatos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Elecciones Presidenciales 2025</h1>
        <p className="text-lg text-muted-foreground">Selecciona tu candidato preferido</p>
        
        {/* Total de votos y botón de actualización */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="secondary" className="text-base py-2 px-4">
            <Users className="h-4 w-4 mr-2 inline" />
            Total de votos: {totalVotes.toLocaleString('es-PE')}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshCounts}
            disabled={refreshingCounts}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshingCounts ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <Card
            key={candidate.id}
            className={`shadow-medium transition-all hover:shadow-strong ${
              votedFor === candidate.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-1">{candidate.name}</CardTitle>
                  <Badge variant="secondary" className="mb-2">
                    {candidate.party}
                  </Badge>
                  <CardDescription className="text-sm">{candidate.description}</CardDescription>
                  
                  {/* Conteo de votos en tiempo real */}
                  {voteCounts[candidate.id] && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          Votos actuales:
                        </span>
                        <span className="font-bold text-foreground">
                          {voteCounts[candidate.id].vote_count.toLocaleString('es-PE')}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Porcentaje:</span>
                          <span className="font-semibold flex items-center gap-1">
                            {voteCounts[candidate.id].percentage.toFixed(2)}%
                            {voteCounts[candidate.id].vote_count > 0 && (
                              <TrendingUp className="h-3 w-3 text-primary" />
                            )}
                          </span>
                        </div>
                        <Progress 
                          value={voteCounts[candidate.id].percentage} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
                {votedFor === candidate.id && (
                  <CheckCircle2 className="h-8 w-8 text-primary flex-shrink-0 ml-2" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <img
                src={candidate.image_url}
                alt={candidate.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Propuestas:</h4>
                <ul className="space-y-1">
                  {candidate.proposals.map((proposal, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start">
                      <span className="mr-2">•</span>
                      <span>{proposal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleVote(candidate.id)}
                disabled={votedFor !== null}
                className="w-full mt-4"
                variant={votedFor === candidate.id ? 'default' : 'outline'}
              >
                {votedFor === candidate.id ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Voto Registrado
                  </>
                ) : (
                  <>
                    <Vote className="mr-2 h-4 w-4" />
                    Votar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingrese sus datos personales</DialogTitle>
            <DialogDescription>
              Por favor, complete sus datos para registrar su voto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ingrese su nombre completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                type="text"
                maxLength={8}
                value={formData.dni}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, dni: value });
                }}
                placeholder="12345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ingrese su teléfono"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Ej: Lima"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Provincia *</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="Ej: Lima"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">Distrito *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Ej: Miraflores"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección Completa *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ingrese su dirección completa"
              />
            </div>

            <Button onClick={submitVote} className="w-full">
              Confirmar Voto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Voting;
