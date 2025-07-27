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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await usersAPI.getAll(params);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userName} ?`)) {
      try {
        await usersAPI.delete(userId);
        toast({
          title: "Succès",
          description: "Utilisateur supprimé avec succès",
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'utilisateur",
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

  const getRoleBadge = (role) => {
    const colors = {
      'Administrateur': 'bg-purple-100 text-purple-800',
      'Manager': 'bg-blue-100 text-blue-800',
      'Utilisateur': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={`${colors[role]} hover:${colors[role]}`}>
        {role}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Chargement des utilisateurs...</span>
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestion des utilisateurs</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un utilisateur
        </Button>
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
                placeholder="Rechercher par nom, email ou département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={fetchUsers}
              disabled={loading}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Actualiser"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-slate-500 dark:text-slate-400">
                        {searchTerm ? 'Aucun utilisateur trouvé pour cette recherche' : 'Aucun utilisateur trouvé'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {formatDate(user.last_login)}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {user.phone}
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
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user.id, user.name)}
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

export default ManageUsers;