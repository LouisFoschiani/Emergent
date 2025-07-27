import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Square, 
  Circle, 
  Users, 
  Phone, 
  Coffee, 
  Printer, 
  TreePine, 
  Minus,
  RotateCw,
  Trash2,
  Move,
  Copy
} from 'lucide-react';

const ELEMENT_TYPES = {
  desk: { 
    icon: Square, 
    label: 'Bureau', 
    defaultSize: { width: 120, height: 80 },
    color: '#3b82f6'
  },
  chair: { 
    icon: Circle, 
    label: 'Chaise', 
    defaultSize: { width: 40, height: 40 },
    color: '#64748b'
  },
  meeting_room: { 
    icon: Users, 
    label: 'Salle de réunion', 
    defaultSize: { width: 200, height: 150 },
    color: '#8b5cf6'
  },
  phone_booth: { 
    icon: Phone, 
    label: 'Phone booth', 
    defaultSize: { width: 80, height: 80 },
    color: '#f59e0b'
  },
  lounge: { 
    icon: Coffee, 
    label: 'Espace détente', 
    defaultSize: { width: 180, height: 120 },
    color: '#06b6d4'
  },
  kitchen: { 
    icon: Coffee, 
    label: 'Cuisine', 
    defaultSize: { width: 150, height: 100 },
    color: '#84cc16'
  },
  printer: { 
    icon: Printer, 
    label: 'Imprimante', 
    defaultSize: { width: 60, height: 60 },
    color: '#6b7280'
  },
  plant: { 
    icon: TreePine, 
    label: 'Plante', 
    defaultSize: { width: 40, height: 40 },
    color: '#10b981'
  }
};

const STATUS_COLORS = {
  available: '#10b981',
  occupied: '#ef4444',
  reserved: '#f59e0b',
  maintenance: '#6b7280'
};

const OfficePlanCanvas = ({ 
  plan, 
  elements = [], 
  onElementAdd, 
  onElementUpdate, 
  onElementDelete,
  readOnly = false 
}) => {
  const canvasRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);

  const handleCanvasClick = useCallback((e) => {
    if (readOnly || !selectedTool) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Snap to grid
    const gridSize = plan?.grid_size || 20;
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;

    const elementType = ELEMENT_TYPES[selectedTool];
    if (elementType) {
      const newElement = {
        name: `${elementType.label} ${elements.length + 1}`,
        type: selectedTool,
        x: snappedX,
        y: snappedY,
        width: elementType.defaultSize.width,
        height: elementType.defaultSize.height,
        rotation: 0,
        status: 'available',
        properties: {
          color: elementType.color
        }
      };

      onElementAdd(newElement);
      setSelectedTool(null);
    }
  }, [selectedTool, elements.length, onElementAdd, plan?.grid_size, readOnly]);

  const handleElementMouseDown = useCallback((e, element) => {
    if (readOnly) return;

    e.stopPropagation();
    setSelectedElement(element);
    setIsDragging(true);
    setDraggedElement(element);

    const rect = canvasRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left - element.x;
    const startY = e.clientY - rect.top - element.y;

    const handleMouseMove = (e) => {
      const x = e.clientX - rect.left - startX;
      const y = e.clientY - rect.top - startY;

      // Snap to grid
      const gridSize = plan?.grid_size || 20;
      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;

      setDraggedElement(prev => ({
        ...prev,
        x: snappedX,
        y: snappedY
      }));
    };

    const handleMouseUp = () => {
      if (draggedElement) {
        onElementUpdate(draggedElement.id, {
          x: draggedElement.x,
          y: draggedElement.y
        });
      }
      setIsDragging(false);
      setDraggedElement(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [draggedElement, onElementUpdate, plan?.grid_size, readOnly]);

  const renderGrid = () => {
    if (!showGrid || !plan) return null;

    const { width, height, grid_size: gridSize = 20 } = plan;
    const lines = [];

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      );
    }

    return lines;
  };

  const renderElement = (element) => {
    const isSelected = selectedElement?.id === element.id;
    const isDraggedElement = draggedElement?.id === element.id;
    const currentElement = isDraggedElement ? draggedElement : element;
    
    const statusColor = STATUS_COLORS[currentElement.status] || '#6b7280';
    const elementType = ELEMENT_TYPES[currentElement.type];
    const Icon = elementType?.icon || Square;

    return (
      <g
        key={currentElement.id}
        transform={`translate(${currentElement.x}, ${currentElement.y}) rotate(${currentElement.rotation || 0})`}
        style={{ cursor: readOnly ? 'default' : 'move' }}
        onMouseDown={(e) => handleElementMouseDown(e, currentElement)}
      >
        {/* Element background */}
        <rect
          width={currentElement.width}
          height={currentElement.height}
          fill={currentElement.properties?.color || statusColor}
          stroke={isSelected ? '#1d4ed8' : '#64748b'}
          strokeWidth={isSelected ? 3 : 1}
          rx={4}
          opacity={currentElement.status === 'maintenance' ? 0.5 : 0.8}
        />
        
        {/* Element label */}
        <text
          x={currentElement.width / 2}
          y={currentElement.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="12"
          fontWeight="500"
        >
          {currentElement.name}
        </text>

        {/* Status indicator - top right corner */}
        <circle
          cx={currentElement.width - 10}
          cy={10}
          r={6}
          fill={statusColor}
          stroke="white"
          strokeWidth={2}
        />

        {/* Selection handles */}
        {isSelected && !readOnly && (
          <>
            <rect
              x={-4}
              y={-4}
              width={8}
              height={8}
              fill="#1d4ed8"
              stroke="white"
              strokeWidth={1}
            />
            <rect
              x={currentElement.width - 4}
              y={-4}
              width={8}
              height={8}
              fill="#1d4ed8"
              stroke="white"
              strokeWidth={1}
            />
            <rect
              x={-4}
              y={currentElement.height - 4}
              width={8}
              height={8}
              fill="#1d4ed8"
              stroke="white"
              strokeWidth={1}
            />
            <rect
              x={currentElement.width - 4}
              y={currentElement.height - 4}
              width={8}
              height={8}
              fill="#1d4ed8"
              stroke="white"
              strokeWidth={1}
            />
          </>
        )}
      </g>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      available: 'Disponible',
      occupied: 'Occupé',
      reserved: 'Réservé',
      maintenance: 'Maintenance'
    };

    return (
      <Badge className={`${colors[status]} hover:${colors[status]}`}>
        {labels[status]}
      </Badge>
    );
  };

  if (!plan) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500">Chargement du plan...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Toolbar */}
      {!readOnly && (
        <Card className="w-64 mr-4">
          <CardHeader>
            <CardTitle className="text-lg">Outils</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Element tools */}
            <div>
              <h4 className="text-sm font-medium mb-2">Éléments</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ELEMENT_TYPES).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={type}
                      variant={selectedTool === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTool(selectedTool === type ? null : type)}
                      className="flex flex-col items-center gap-1 h-auto py-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{config.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* View controls */}
            <div>
              <h4 className="text-sm font-medium mb-2">Affichage</h4>
              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className="w-full"
              >
                Grille
              </Button>
            </div>

            {/* Selected element properties */}
            {selectedElement && (
              <div>
                <h4 className="text-sm font-medium mb-2">Propriétés</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-slate-600">Nom</label>
                    <div className="text-sm font-medium">{selectedElement.name}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Type</label>
                    <div className="text-sm">{ELEMENT_TYPES[selectedElement.type]?.label}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Statut</label>
                    <div className="mt-1">{getStatusBadge(selectedElement.status)}</div>
                  </div>
                  {selectedElement.assigned_to && (
                    <div>
                      <label className="text-xs text-slate-600">Assigné à</label>
                      <div className="text-sm">{selectedElement.assigned_to}</div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onElementUpdate(selectedElement.id, {
                          rotation: (selectedElement.rotation || 0) + 90
                        });
                      }}
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newElement = {
                          ...selectedElement,
                          name: `${selectedElement.name} (copie)`,
                          x: selectedElement.x + 20,
                          y: selectedElement.y + 20
                        };
                        delete newElement.id;
                        onElementAdd(newElement);
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onElementDelete(selectedElement.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Canvas */}
      <div className="flex-1">
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <div className="relative h-full overflow-auto">
              <svg
                ref={canvasRef}
                width={plan.width}
                height={plan.height}
                style={{ backgroundColor: plan.background_color }}
                onClick={handleCanvasClick}
                className="border border-slate-200 cursor-crosshair"
              >
                {/* Grid */}
                {renderGrid()}
                
                {/* Elements */}
                {elements.map(renderElement)}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfficePlanCanvas;