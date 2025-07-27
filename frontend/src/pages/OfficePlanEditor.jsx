import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Download, 
  Share2, 
  Settings,
  RefreshCw
} from 'lucide-react';
import { officePlansAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import OfficePlanCanvas from '../components/OfficePlanCanvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';

const OfficePlanEditor = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plan, setPlan] = useState(null);
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planSettingsOpen, setPlanSettingsOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      if (planId === 'new') {
        // Create new plan
        const newPlan = {
          id: 'temp',
          name: 'Nouveau Plan',
          description: '',
          width: 1200,
          height: 800,
          background_color: '#f8fafc',
          grid_size: 20,
          created_by: 'Jean Dupont', // TODO: Get from auth context
          elements: []
        };
        setPlan(newPlan);
        setElements([]);
      } else {
        const response = await officePlansAPI.getById(planId);
        setPlan(response.data);
        setElements(response.data.elements || []);
      }
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

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (planId === 'new') {
        // Create new plan
        const planData = {
          name: plan.name,
          description: plan.description,
          width: plan.width,
          height: plan.height,
          background_color: plan.background_color,
          grid_size: plan.grid_size,
          created_by: plan.created_by
        };
        
        const response = await officePlansAPI.create(planData);
        const createdPlan = response.data;
        
        // Add all elements to the new plan
        for (const element of elements) {
          await officePlansAPI.addElement(createdPlan.id, element);
        }
        
        toast({
          title: "Succès",
          description: "Plan créé avec succès",
        });
        
        navigate(`/flex-offices/editor/${createdPlan.id}`);
      } else {
        // Update existing plan
        await officePlansAPI.update(planId, {
          name: plan.name,
          description: plan.description,
          width: plan.width,
          height: plan.height,
          background_color: plan.background_color,
          grid_size: plan.grid_size
        });
        
        toast({
          title: "Succès",
          description: "Plan sauvegardé avec succès",
        });
      }
      
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le plan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleElementAdd = async (elementData) => {
    try {
      if (planId === 'new') {
        // For new plans, just add to local state
        const newElement = {
          ...elementData,
          id: `temp-${Date.now()}`
        };
        setElements(prev => [...prev, newElement]);
      } else {
        const response = await officePlansAPI.addElement(planId, elementData);
        setElements(prev => [...prev, response.data]);
      }
      setUnsavedChanges(true);
    } catch (error) {
      console.error('Error adding element:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'élément",
        variant: "destructive",
      });
    }
  };

  const handleElementUpdate = async (elementId, updateData) => {
    try {
      if (planId === 'new') {
        // For new plans, just update local state
        setElements(prev => prev.map(el => 
          el.id === elementId ? { ...el, ...updateData } : el
        ));
      } else {
        const response = await officePlansAPI.updateElement(planId, elementId, updateData);
        setElements(prev => prev.map(el => 
          el.id === elementId ? response.data : el
        ));
      }
      setUnsavedChanges(true);
    } catch (error) {
      console.error('Error updating element:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'élément",
        variant: "destructive",
      });
    }
  };

  const handleElementDelete = async (elementId) => {
    try {
      if (planId === 'new') {
        // For new plans, just remove from local state
        setElements(prev => prev.filter(el => el.id !== elementId));
      } else {
        await officePlansAPI.deleteElement(planId, elementId);
        setElements(prev => prev.filter(el => el.id !== elementId));
      }
      setUnsavedChanges(true);
    } catch (error) {
      console.error('Error deleting element:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'élément",
        variant: "destructive",
      });
    }
  };

  const handlePlanUpdate = (field, value) => {
    setPlan(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Chargement du plan...</span>
          </div>
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
            
            <div className="flex items-center gap-3">
              <div>
                <Input
                  value={plan?.name || ''}
                  onChange={(e) => handlePlanUpdate('name', e.target.value)}
                  className="font-semibold text-lg border-none p-0 h-auto"
                  placeholder="Nom du plan"
                />
                <p className="text-sm text-slate-600 mt-1">
                  {plan?.description || 'Aucune description'}
                </p>
              </div>
              
              {unsavedChanges && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Non sauvegardé
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={planSettingsOpen} onOpenChange={setPlanSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres du plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="planName">Nom</Label>
                    <Input
                      id="planName"
                      value={plan?.name || ''}
                      onChange={(e) => handlePlanUpdate('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="planDescription">Description</Label>
                    <Textarea
                      id="planDescription"
                      value={plan?.description || ''}
                      onChange={(e) => handlePlanUpdate('description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="planWidth">Largeur (px)</Label>
                      <Input
                        id="planWidth"
                        type="number"
                        value={plan?.width || 1200}
                        onChange={(e) => handlePlanUpdate('width', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="planHeight">Hauteur (px)</Label>
                      <Input
                        id="planHeight"
                        type="number"
                        value={plan?.height || 800}
                        onChange={(e) => handlePlanUpdate('height', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="backgroundColor">Couleur de fond</Label>
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={plan?.background_color || '#f8fafc'}
                      onChange={(e) => handlePlanUpdate('background_color', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gridSize">Taille de la grille (px)</Label>
                    <Input
                      id="gridSize"
                      type="number"
                      min="10"
                      max="50"
                      value={plan?.grid_size || 20}
                      onChange={(e) => handlePlanUpdate('grid_size', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </Button>

            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>

            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-6">
        <OfficePlanCanvas
          plan={plan}
          elements={elements}
          onElementAdd={handleElementAdd}
          onElementUpdate={handleElementUpdate}
          onElementDelete={handleElementDelete}
        />
      </div>
    </div>
  );
};

export default OfficePlanEditor;