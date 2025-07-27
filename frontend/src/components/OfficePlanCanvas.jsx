import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
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
  Copy,
  Home,
  DoorOpen,
  Monitor,
  Layers,
  Building
} from 'lucide-react';

const ELEMENT_TYPES = {
  // Furniture
  desk: { 
    icon: Square, 
    label: 'Bureau', 
    defaultSize: { width: 120, height: 80 },
    color: '#3b82f6',
    category: 'furniture',
    shape: 'desk'
  },
  chair: { 
    icon: Circle, 
    label: 'Chaise', 
    defaultSize: { width: 40, height: 40 },
    color: '#64748b',
    category: 'furniture',
    shape: 'circle'
  },
  meeting_room: { 
    icon: Users, 
    label: 'Salle de réunion', 
    defaultSize: { width: 200, height: 150 },
    color: '#8b5cf6',
    category: 'furniture',
    shape: 'meeting_table'
  },
  phone_booth: { 
    icon: Phone, 
    label: 'Phone booth', 
    defaultSize: { width: 80, height: 80 },
    color: '#f59e0b',
    category: 'furniture',
    shape: 'booth'
  },
  lounge: { 
    icon: Coffee, 
    label: 'Espace détente', 
    defaultSize: { width: 180, height: 120 },
    color: '#06b6d4',
    category: 'furniture',
    shape: 'sofa'
  },
  kitchen: { 
    icon: Coffee, 
    label: 'Cuisine', 
    defaultSize: { width: 150, height: 100 },
    color: '#84cc16',
    category: 'furniture',
    shape: 'kitchen'
  },
  printer: { 
    icon: Printer, 
    label: 'Imprimante', 
    defaultSize: { width: 60, height: 60 },
    color: '#6b7280',
    category: 'furniture',
    shape: 'printer'
  },
  plant: { 
    icon: TreePine, 
    label: 'Plante', 
    defaultSize: { width: 40, height: 40 },
    color: '#10b981',
    category: 'furniture',
    shape: 'plant'
  },
  
  // Structure
  wall: { 
    icon: Minus, 
    label: 'Mur', 
    defaultSize: { width: 200, height: 20 },
    color: '#374151',
    category: 'structure',
    shape: 'wall'
  },
  door: { 
    icon: DoorOpen, 
    label: 'Porte', 
    defaultSize: { width: 80, height: 20 },
    color: '#92400e',
    category: 'structure',
    shape: 'door'
  },
  window: { 
    icon: Monitor, 
    label: 'Fenêtre', 
    defaultSize: { width: 100, height: 20 },
    color: '#0891b2',
    category: 'structure',
    shape: 'window'
  },
  foundation: { 
    icon: Home, 
    label: 'Fondation', 
    defaultSize: { width: 300, height: 200 },
    color: '#d1d5db',
    category: 'structure',
    shape: 'foundation'
  },
  pillar: { 
    icon: Building, 
    label: 'Pilier', 
    defaultSize: { width: 40, height: 40 },
    color: '#6b7280',
    category: 'structure',
    shape: 'pillar'
  },
  
  // Areas
  reception: { 
    icon: Home, 
    label: 'Réception', 
    defaultSize: { width: 160, height: 100 },
    color: '#dc2626',
    category: 'areas',
    shape: 'reception'
  },
  bathroom: { 
    icon: Home, 
    label: 'Sanitaires', 
    defaultSize: { width: 100, height: 100 },
    color: '#0369a1',
    category: 'areas',
    shape: 'bathroom'
  },
  storage: { 
    icon: Layers, 
    label: 'Stockage', 
    defaultSize: { width: 120, height: 80 },
    color: '#7c2d12',
    category: 'areas',
    shape: 'storage'
  }
};

const STATUS_COLORS = {
  available: '#10b981',
  occupied: '#ef4444',
  reserved: '#f59e0b',
  maintenance: '#6b7280'
};

const ELEMENT_CATEGORIES = {
  furniture: 'Mobilier',
  structure: 'Structure',
  areas: 'Zones'
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
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);

  const renderElementShape = (element) => {
    const { type, width, height, properties } = element;
    const color = properties?.color || ELEMENT_TYPES[type]?.color || '#6b7280';
    const shape = ELEMENT_TYPES[type]?.shape || 'rect';

    switch (shape) {
      case 'desk':
        return (
          <g>
            <rect width={width} height={height} fill={color} rx={8} opacity={0.9} />
            {/* Desktop surface */}
            <rect x={5} y={5} width={width-10} height={height-10} fill={color} stroke="white" strokeWidth={2} rx={4} opacity={0.7} />
            {/* Legs */}
            <circle cx={15} cy={15} r={3} fill="#374151" />
            <circle cx={width-15} cy={15} r={3} fill="#374151" />
            <circle cx={15} cy={height-15} r={3} fill="#374151" />
            <circle cx={width-15} cy={height-15} r={3} fill="#374151" />
          </g>
        );

      case 'circle':
        const radius = Math.min(width, height) / 2;
        return (
          <circle cx={width/2} cy={height/2} r={radius-5} fill={color} stroke="white" strokeWidth={2} opacity={0.9} />
        );

      case 'meeting_table':
        return (
          <g>
            <ellipse cx={width/2} cy={height/2} rx={width/2-10} ry={height/2-10} fill={color} opacity={0.9} />
            <ellipse cx={width/2} cy={height/2} rx={width/2-20} ry={height/2-20} fill="white" opacity={0.3} />
            {/* Chairs around table */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
              const angle = (i * Math.PI * 2) / 8;
              const chairX = width/2 + Math.cos(angle) * (width/2 - 5);
              const chairY = height/2 + Math.sin(angle) * (height/2 - 5);
              return <circle key={i} cx={chairX} cy={chairY} r={8} fill="#64748b" opacity={0.8} />;
            })}
          </g>
        );

      case 'booth':
        return (
          <g>
            <rect width={width} height={height} fill={color} rx={12} opacity={0.9} />
            <rect x={10} y={10} width={width-20} height={height-20} fill="white" opacity={0.3} rx={8} />
            <circle cx={width/2} cy={height/2} r={8} fill="#374151" />
          </g>
        );

      case 'sofa':
        return (
          <g>
            <rect width={width} height={height} fill={color} rx={16} opacity={0.9} />
            {/* Cushions */}
            <rect x={10} y={10} width={width/3-10} height={height-20} fill="white" opacity={0.3} rx={8} />
            <rect x={width/3+5} y={10} width={width/3-10} height={height-20} fill="white" opacity={0.3} rx={8} />
            <rect x={2*width/3} y={10} width={width/3-10} height={height-20} fill="white" opacity={0.3} rx={8} />
          </g>
        );

      case 'kitchen':
        return (
          <g>
            <rect width={width} height={height} fill={color} rx={4} opacity={0.9} />
            {/* Counter */}
            <rect x={5} y={5} width={width-10} height={30} fill="#d1d5db" rx={2} />
            {/* Appliances */}
            <rect x={15} y={40} width={30} height={30} fill="#374151" rx={2} />
            <rect x={55} y={40} width={30} height={30} fill="#374151" rx={2} />
            {/* Sink */}
            <circle cx={width-30} cy={25} r={12} fill="#0891b2" stroke="white" strokeWidth={2} />
          </g>
        );

      case 'printer':
        return (
          <g>
            <rect width={width} height={height} fill={color} rx={4} opacity={0.9} />
            <rect x={5} y={5} width={width-10} height={20} fill="#374151" rx={2} />
            <rect x={10} y={30} width={width-20} height={height-35} fill="#d1d5db" rx={2} />
            <circle cx={width/2} cy={15} r={3} fill="#10b981" />
          </g>
        );

      case 'plant':
        return (
          <g>
            <circle cx={width/2} cy={height-8} r={8} fill="#92400e" />
            <path d={`M ${width/2} ${height-16} Q ${width/2-10} ${height/2} ${width/2-5} ${height/4} Q ${width/2} ${height/6} ${width/2+5} ${height/4} Q ${width/2+10} ${height/2} ${width/2} ${height-16}`} fill="#10b981" />
            <path d={`M ${width/2} ${height-16} Q ${width/2-8} ${height/2+10} ${width/2-3} ${height/3} Q ${width/2} ${height/5} ${width/2+3} ${height/3} Q ${width/2+8} ${height/2+10} ${width/2} ${height-16}`} fill="#059669" />
          </g>
        );

      case 'wall':
        return (
          <rect width={width} height={height} fill={color} opacity={0.95} />
        );

      case 'door':
        return (
          <g>
            <rect width={width} height={height} fill={color} opacity={0.9} />
            <rect x={5} y={5} width={width-10} height={height/2-5} fill="#92400e" rx={2} />
            <circle cx={width-10} cy={height/4} r={2} fill="#fbbf24" />
          </g>
        );

      case 'window':
        return (
          <g>
            <rect width={width} height={height} fill={color} opacity={0.9} />
            <rect x={5} y={5} width={width-10} height={height-10} fill="white" opacity={0.7} rx={2} />
            <line x1={width/2} y1={5} x2={width/2} y2={height-5} stroke="#0891b2" strokeWidth={2} />
            <line x1={5} y1={height/2} x2={width-5} y2={height/2} stroke="#0891b2" strokeWidth={2} />
          </g>
        );

      case 'foundation':
        return (
          <g>
            <rect width={width} height={height} fill={color} opacity={0.3} stroke="#6b7280" strokeWidth={3} strokeDasharray="10,5" rx={4} />
            <text x={width/2} y={height/2} textAnchor="middle" dominantBaseline="middle" fill="#6b7280" fontSize="12" fontWeight="500">
              FONDATION
            </text>
          </g>
        );

      case 'pillar':
        return (
          <g>
            <rect width={width} height={height} fill={color} opacity={0.9} rx={4} />
            <rect x={5} y={5} width={width-10} height={height-10} fill="#d1d5db" rx={2} />
          </g>
        );

      case 'reception':
        return (
          <g>
            <rect width={width} height={height} fill={color} rx={8} opacity={0.9} />
            <path d={`M 20 ${height/2} Q ${width/2} 20 ${width-20} ${height/2} Q ${width/2} ${height-20} 20 ${height/2}`} fill="white" opacity={0.3} />
            <circle cx={width/2} cy={height/2} r={8} fill="#374151" />
          </g>
        );

      case 'bathroom':
        return (
          <g>
            <rect width={width} height={height} fill={color} rx={4} opacity={0.9} />
            <rect x={10} y={10} width={25} height={15} fill="white" rx={2} />
            <rect x={10} y={height-25} width={15} height={15} fill="white" rx={2} />
            <circle cx={width-20} cy={20} r={8} fill="white" />
          </g>
        );

      case 'storage':
        return (
          <g>
            <rect width={width} height={height} fill={color} rx={4} opacity={0.9} />
            {/* Shelves */}
            <rect x={5} y={10} width={width-10} height={8} fill="#92400e" rx={2} />
            <rect x={5} y={height/2-4} width={width-10} height={8} fill="#92400e" rx={2} />
            <rect x={5} y={height-18} width={width-10} height={8} fill="#92400e" rx={2} />
          </g>
        );

      default:
        return <rect width={width} height={height} fill={color} rx={4} opacity={0.8} />;
    }
  };

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
        status: elementType.category === 'structure' ? 'available' : 'available',
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

    // Check if clicking on resize handle
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    const elementRight = element.x + element.width;
    const elementBottom = element.y + element.height;

    // Check for resize handles (bottom-right corner)
    if (canvasX >= elementRight - 10 && canvasX <= elementRight + 10 &&
        canvasY >= elementBottom - 10 && canvasY <= elementBottom + 10) {
      setIsResizing(true);
      setResizeHandle('se');
      return;
    }

    // Start dragging
    setIsDragging(true);
    setDraggedElement(element);

    const startX = canvasX - element.x;
    const startY = canvasY - element.y;

    const handleMouseMove = (e) => {
      const x = e.clientX - rect.left - startX;
      const y = e.clientY - rect.top - startY;

      // Snap to grid
      const gridSize = plan?.grid_size || 20;
      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;

      if (isResizing) {
        const newWidth = Math.max(20, e.clientX - rect.left - element.x);
        const newHeight = Math.max(20, e.clientY - rect.top - element.y);
        
        setDraggedElement(prev => ({
          ...prev,
          width: Math.round(newWidth / gridSize) * gridSize,
          height: Math.round(newHeight / gridSize) * gridSize
        }));
      } else {
        setDraggedElement(prev => ({
          ...prev,
          x: snappedX,
          y: snappedY
        }));
      }
    };

    const handleMouseUp = () => {
      if (draggedElement) {
        if (isResizing) {
          onElementUpdate(draggedElement.id, {
            width: draggedElement.width,
            height: draggedElement.height
          });
        } else {
          onElementUpdate(draggedElement.id, {
            x: draggedElement.x,
            y: draggedElement.y
          });
        }
      }
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      setDraggedElement(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [draggedElement, onElementUpdate, plan?.grid_size, readOnly, isResizing]);

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

    return (
      <g
        key={currentElement.id}
        transform={`translate(${currentElement.x}, ${currentElement.y}) rotate(${currentElement.rotation || 0})`}
        style={{ cursor: readOnly ? 'default' : 'move' }}
        onMouseDown={(e) => handleElementMouseDown(e, currentElement)}
      >
        {/* Element shape */}
        {renderElementShape(currentElement)}
        
        {/* Element label */}
        <text
          x={currentElement.width / 2}
          y={currentElement.height / 2 + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="11"
          fontWeight="600"
          style={{ pointerEvents: 'none' }}
        >
          {currentElement.name}
        </text>

        {/* Status indicator */}
        {currentElement.status !== 'available' && (
          <circle
            cx={currentElement.width - 10}
            cy={10}
            r={5}
            fill={statusColor}
            stroke="white"
            strokeWidth={2}
          />
        )}

        {/* Selection outline and handles */}
        {isSelected && !readOnly && (
          <>
            <rect
              x={-2}
              y={-2}
              width={currentElement.width + 4}
              height={currentElement.height + 4}
              fill="none"
              stroke="#1d4ed8"
              strokeWidth={2}
              strokeDasharray="5,5"
            />
            
            {/* Corner handles */}
            <rect x={-4} y={-4} width={8} height={8} fill="#1d4ed8" stroke="white" strokeWidth={1} />
            <rect x={currentElement.width - 4} y={-4} width={8} height={8} fill="#1d4ed8" stroke="white" strokeWidth={1} />
            <rect x={-4} y={currentElement.height - 4} width={8} height={8} fill="#1d4ed8" stroke="white" strokeWidth={1} />
            
            {/* Resize handle (bottom-right) */}
            <rect
              x={currentElement.width - 4}
              y={currentElement.height - 4}
              width={8}
              height={8}
              fill="#ef4444"
              stroke="white"
              strokeWidth={1}
              style={{ cursor: 'se-resize' }}
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
        <Card className="w-72 mr-4">
          <CardHeader>
            <CardTitle className="text-lg">Outils</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Element tools by category */}
            {Object.entries(ELEMENT_CATEGORIES).map(([categoryKey, categoryLabel]) => (
              <div key={categoryKey}>
                <h4 className="text-sm font-medium mb-2">{categoryLabel}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ELEMENT_TYPES)
                    .filter(([_, config]) => config.category === categoryKey)
                    .map(([type, config]) => {
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
            ))}

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
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-600">Nom</label>
                    <Input
                      value={selectedElement.name}
                      onChange={(e) => onElementUpdate(selectedElement.id, { name: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Type</label>
                    <div className="text-sm">{ELEMENT_TYPES[selectedElement.type]?.label}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-600">Largeur</label>
                      <Input
                        type="number"
                        value={selectedElement.width}
                        onChange={(e) => onElementUpdate(selectedElement.id, { width: parseInt(e.target.value) })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Hauteur</label>
                      <Input
                        type="number"
                        value={selectedElement.height}
                        onChange={(e) => onElementUpdate(selectedElement.id, { height: parseInt(e.target.value) })}
                        className="h-8 text-sm"
                      />
                    </div>
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