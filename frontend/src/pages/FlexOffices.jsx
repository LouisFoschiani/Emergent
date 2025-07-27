import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Layout,
  Users,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { officePlansAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const FlexOffices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await officePlansAPI.getAll(params);
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching office plans:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPlans();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleDeletePlan = async (planId, planName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le plan "${planName}" ?`)) {
      try {
        await officePlansAPI.delete(planId);
        toast({
          title: "Succès",
          description: "Plan supprimé avec succès",
        });
        fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le plan",
          variant: "destructive",
        });
      }
    }
  };

  const handleDuplicatePlan = async (planId, planName) => {
    try {
      const newName = `${planName} (Copie)`;
      await officePlansAPI.duplicate(planId, newName, 'Jean Dupont'); // TODO: Get from auth context
      toast({
        title: "Succès",
        description: "Plan dupliqué avec succès",
      });
      fetchPlans();
    } catch (error) {
      console.error('Error duplicating plan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer le plan",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getElementsStats = (elements = []) => {
    const desks = elements.filter(el => el.type === 'desk');
    const availableDesks = desks.filter(el => el.status === 'available').length;
    const occupiedDesks = desks.filter(el => el.status === 'occupied').length;
    const totalElements = elements.length;

    return { desks: desks.length, availableDesks, occupiedDesks, totalElements };
  };

  if (loading && plans.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Chargement des plans...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Flex Offices</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Créez et gérez vos plans d'espaces de travail collaboratifs
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/flex-offices/editor/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer un plan
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Layout className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Plans actifs
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {plans.filter(p => p.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Postes disponibles
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {plans.reduce((total, plan) => {
                    const stats = getElementsStats(plan.elements);
                    return total + stats.availableDesks;
                  }, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Postes occupés
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {plans.reduce((total, plan) => {
                    const stats = getElementsStats(plan.elements);
                    return total + stats.occupiedDesks;
                  }, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Layout className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total éléments
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {plans.reduce((total, plan) => {
                    const stats = getElementsStats(plan.elements);
                    return total + stats.totalElements;
                  }, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={fetchPlans}
              disabled={loading}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Actualiser"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Layout className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    Aucun plan trouvé
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {searchTerm ? 'Aucun plan ne correspond à votre recherche' : 'Commencez par créer votre premier plan d\'espace de travail'}
                  </p>
                  {!searchTerm && (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate('/flex-offices/editor/new')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un plan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          plans.map((plan) => {
            const stats = getElementsStats(plan.elements);
            return (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold">
                        {plan.name}
                      </CardTitle>
                      {plan.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {plan.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/flex-offices/view/${plan.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/flex-offices/editor/${plan.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicatePlan(plan.id, plan.name)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeletePlan(plan.id, plan.name)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Plan preview - simplified SVG */}
                  <div className="mb-4 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 h-32 relative overflow-hidden">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox={`0 0 ${plan.width} ${plan.height}`}
                      className="border border-slate-200 dark:border-slate-700 rounded"
                      style={{ backgroundColor: plan.background_color }}
                    >
                      {(plan.elements || []).map((element, index) => (
                        <rect
                          key={index}
                          x={element.x}
                          y={element.y}
                          width={element.width}
                          height={element.height}
                          fill={element.properties?.color || '#3b82f6'}
                          opacity={0.8}
                          rx={2}
                        />
                      ))}
                    </svg>
                  </div>

                  {/* Statistics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Postes de travail</span>
                      <span className="font-medium">{stats.desks}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Disponibles</span>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {stats.availableDesks}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Occupés</span>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        {stats.occupiedDesks}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Créé le</span>
                      <span className="text-xs">{formatDate(plan.created_at)}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/flex-offices/view/${plan.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate(`/flex-offices/editor/${plan.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FlexOffices;