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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Users, Shield, RefreshCw } from 'lucide-react';
import { groupsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const ManageGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await groupsAPI.getAll(params);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les groupes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchGroups();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleDeleteGroup = async (groupId, groupName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le groupe ${groupName} ?`)) {
      try {
        await groupsAPI.delete(groupId);
        toast({
          title: "Succès",
          description: "Groupe supprimé avec succès",
        });
        fetchGroups();
      } catch (error) {
        console.error('Error deleting group:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le groupe",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    return status === 'Actif' ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        {status}
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
        {status}
      </Badge>
    );
  };

  const getPermissionsBadges = (permissions) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'read': 'bg-blue-100 text-blue-800',
      'write': 'bg-yellow-100 text-yellow-800',
      'delete': 'bg-purple-100 text-purple-800'
    };

    return (
      <div className="flex gap-1 flex-wrap">
        {permissions.map((permission, index) => (
          <Badge 
            key={index} 
            className={`${colors[permission]} hover:${colors[permission]} text-xs`}
          >
            {permission}
          </Badge>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const stats = {
    total: groups.length,
    active: groups.filter(g => g.status === 'Actif').length,
    totalMembers: groups.reduce((sum, group) => sum + group.members, 0)
  };

  if (loading && groups.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Chargement des groupes...</span>
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestion des groupes</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez les groupes d'utilisateurs et leurs permissions
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Créer un groupe
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total groupes
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
              <Shield className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Groupes actifs
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.active}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total membres
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.totalMembers}
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
                placeholder="Rechercher par nom, description ou responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={fetchGroups}
              disabled={loading}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Actualiser"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Groupes ({groups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du groupe</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Membres</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-slate-500 dark:text-slate-400">
                        {searchTerm ? 'Aucun groupe trouvé pour cette recherche' : 'Aucun groupe trouvé'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  groups.map((group) => (
                    <TableRow key={group.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {group.description}
                      </TableCell>
                      <TableCell>{group.leader}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>{group.members}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(group.status)}
                      </TableCell>
                      <TableCell>
                        {getPermissionsBadges(group.permissions)}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {formatDate(group.created_at)}
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
                              <Users className="mr-2 h-4 w-4" />
                              Gérer les membres
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteGroup(group.id, group.name)}
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

export default ManageGroups;