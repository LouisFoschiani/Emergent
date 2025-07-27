import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Users, Heart, Calendar, User, Building2, Computer, TrendingUp, Activity } from 'lucide-react';
import { statisticsAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await statisticsAPI.get();
        setStats(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Utilisateurs totaux",
      value: stats?.total_users || 0,
      change: "+12%",
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Utilisateurs actifs",
      value: stats?.active_users || 0,
      change: "+8%",
      icon: Activity,
      color: "text-green-500"
    },
    {
      title: "Groupes",
      value: stats?.total_groups || 0,
      change: "+3%",
      icon: Building2,
      color: "text-purple-500"
    },
    {
      title: "Équipements",
      value: stats?.total_equipments || 0,
      change: "+15%",
      icon: Computer,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tableau de bord</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Vue d'ensemble de votre plateforme</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </div>
              <div className="flex items-center mt-1">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">vs mois dernier</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Equipment Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Computer className="w-5 h-5 text-green-500" />
                En service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.equipments_in_service}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                équipements actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Computer className="w-5 h-5 text-blue-500" />
                Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.equipments_available}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                équipements libres
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Computer className="w-5 h-5 text-orange-500" />
                En maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.equipments_in_maintenance}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                équipements en réparation
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes favoris */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Mes favoris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                Vous n'avez pas encore de postes favoris
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mes réservations du jour */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Mes réservations du jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                Aucune réservation aujourd'hui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mes amis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Mes amis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Aucun ami trouvé
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mes groupes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              Mes groupes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Aucun groupe
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mes événements du jour */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Mes événements du jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Aucun événement aujourd'hui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;