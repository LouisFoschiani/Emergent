import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OfficePlanCanvas from '../components/OfficePlanCanvas';
import { useState, useEffect } from 'react';
import { officePlansAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const OfficePlanViewer = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plan, setPlan] = useState(null);
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await officePlansAPI.getById(planId);
        setPlan(response.data);
        setElements(response.data.elements || []);
      } catch (error) {
        console.error('Error fetching plan:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le plan",
          variant: "destructive",
        });
        navigate('/flex-offices');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement du plan...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/flex-offices')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            
            <div>
              <h1 className="font-semibold text-lg">{plan?.name}</h1>
              <p className="text-sm text-slate-600">{plan?.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
            <Button 
              onClick={() => navigate(`/flex-offices/editor/${planId}`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Modifier
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-6">
        <OfficePlanCanvas
          plan={plan}
          elements={elements}
          readOnly={true}
        />
      </div>
    </div>
  );
};

export default OfficePlanViewer;