import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Computer, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { equipmentsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const ManageEquipments = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await equipmentsAPI.getAll(params);
      setEquipments(response.data);
    } catch (error) {
      console.error('Error fetching equipments:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les équipements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchEquipments();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleDeleteEquipment = async (equipmentId, equipmentName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'équipement ${equipmentName} ?`)) {
      try {
        await equipmentsAPI.delete(equipmentId);
        toast({
          title: "Succès",
          description: "Équipement supprimé avec succès",
        });
        fetchEquipments();
      } catch (error) {
        console.error('Error deleting equipment:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'équipement",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'En service': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Disponible': { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      'En maintenance': { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle },
      'Hors service': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig['Hors service'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.bg} ${config.text} hover:${config.bg} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type) => {
    return <Computer className="w-4 h-4 text-slate-400" />;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const stats = {
    total: equipments.length,
    inService: equipments.filter(e => e.status === 'En service').length,
    available: equipments.filter(e => e.status === 'Disponible').length,
    maintenance: equipments.filter(e => e.status === 'En maintenance').length
  };

  if (loading && equipments.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Chargement des équipements...</span>
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestion des équipements</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez l'inventaire et l'attribution des équipements
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un équipement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Computer className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total équipements
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  En service
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.inService}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Disponibles
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.available}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  En maintenance
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.maintenance}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, type, numéro de série ou assigné à..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={fetchEquipments}
              disabled={loading}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Actualiser"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Équipements ({equipments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Numéro de série</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Assigné à</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Garantie</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-slate-500 dark:text-slate-400">
                        {searchTerm ? 'Aucun équipement trouvé pour cette recherche' : 'Aucun équipement trouvé'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  equipments.map((equipment) => (
                    <TableRow key={equipment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(equipment.type)}
                          {equipment.name}
                        </div>
                      </TableCell>
                      <TableCell>{equipment.type}</TableCell>
                      <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400">
                        {equipment.serial_number}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(equipment.status)}
                      </TableCell>
                      <TableCell>
                        {equipment.assigned_to ? (
                          <span className="text-slate-900 dark:text-white">{equipment.assigned_to}</span>
                        ) : (
                          <span className="text-slate-400">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {equipment.location}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(equipment.value)}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {formatDate(equipment.warranty)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteEquipment(equipment.id, equipment.name)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageEquipments;