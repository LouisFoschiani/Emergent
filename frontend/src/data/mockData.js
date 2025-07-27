export const mockUsers = [
  {
    id: 1,
    name: "Jean Dupont",
    email: "jean.dupont@company.com",
    role: "Administrateur",
    status: "Actif",
    lastLogin: "2025-01-20 14:30",
    department: "IT",
    phone: "+33 1 23 45 67 89"
  },
  {
    id: 2,
    name: "Marie Martin",
    email: "marie.martin@company.com",
    role: "Utilisateur",
    status: "Actif",
    lastLogin: "2025-01-20 09:15",
    department: "RH",
    phone: "+33 1 23 45 67 90"
  },
  {
    id: 3,
    name: "Pierre Leroy",
    email: "pierre.leroy@company.com",
    role: "Manager",
    status: "Inactif",
    lastLogin: "2025-01-18 16:45",
    department: "Commercial",
    phone: "+33 1 23 45 67 91"
  },
  {
    id: 4,
    name: "Sophie Bernard",
    email: "sophie.bernard@company.com",
    role: "Utilisateur",
    status: "Actif",
    lastLogin: "2025-01-20 11:20",
    department: "Marketing",
    phone: "+33 1 23 45 67 92"
  },
  {
    id: 5,
    name: "Luc Moreau",
    email: "luc.moreau@company.com",
    role: "Utilisateur",
    status: "Actif",
    lastLogin: "2025-01-19 15:30",
    department: "Finance",
    phone: "+33 1 23 45 67 93"
  }
];

export const mockGroups = [
  {
    id: 1,
    name: "Équipe IT",
    description: "Équipe informatique et développement",
    members: 12,
    created: "2024-01-15",
    status: "Actif",
    leader: "Jean Dupont",
    permissions: ["admin", "read", "write"]
  },
  {
    id: 2,
    name: "Ressources Humaines",
    description: "Gestion du personnel et recrutement",
    members: 8,
    created: "2024-02-20",
    status: "Actif",
    leader: "Marie Martin",
    permissions: ["read", "write"]
  },
  {
    id: 3,
    name: "Commercial",
    description: "Équipe commerciale et ventes",
    members: 15,
    created: "2024-01-10",
    status: "Actif",
    leader: "Pierre Leroy",
    permissions: ["read", "write"]
  },
  {
    id: 4,
    name: "Marketing",
    description: "Communication et marketing digital",
    members: 6,
    created: "2024-03-05",
    status: "Actif",
    leader: "Sophie Bernard",
    permissions: ["read", "write"]
  },
  {
    id: 5,
    name: "Direction",
    description: "Équipe de direction",
    members: 3,
    created: "2024-01-01",
    status: "Actif",
    leader: "Directeur Général",
    permissions: ["admin", "read", "write", "delete"]
  }
];

export const mockEquipments = [
  {
    id: 1,
    name: "MacBook Pro 16\"",
    type: "Ordinateur portable",
    serialNumber: "MB2023001",
    status: "En service",
    assignedTo: "Jean Dupont",
    location: "Bureau 101",
    purchaseDate: "2023-03-15",
    warranty: "2025-03-15",
    value: 2500
  },
  {
    id: 2,
    name: "iPhone 14 Pro",
    type: "Smartphone",
    serialNumber: "IP2023002",
    status: "En service",
    assignedTo: "Marie Martin",
    location: "Bureau 205",
    purchaseDate: "2023-09-20",
    warranty: "2024-09-20",
    value: 1200
  },
  {
    id: 3,
    name: "Dell Monitor 27\"",
    type: "Écran",
    serialNumber: "DL2023003",
    status: "Disponible",
    assignedTo: null,
    location: "Stock IT",
    purchaseDate: "2023-06-10",
    warranty: "2026-06-10",
    value: 350
  },
  {
    id: 4,
    name: "Imprimante Canon",
    type: "Imprimante",
    serialNumber: "CN2023004",
    status: "En maintenance",
    assignedTo: null,
    location: "Open Space",
    purchaseDate: "2023-01-20",
    warranty: "2024-01-20",
    value: 800
  },
  {
    id: 5,
    name: "Surface Laptop",
    type: "Ordinateur portable",
    serialNumber: "SF2023005",
    status: "En service",
    assignedTo: "Sophie Bernard",
    location: "Bureau 312",
    purchaseDate: "2023-08-15",
    warranty: "2025-08-15",
    value: 1800
  }
];

export const mockStats = {
  totalUsers: 142,
  activeUsers: 128,
  totalGroups: 23,
  totalEquipments: 287,
  equipmentsInService: 245,
  equipmentsAvailable: 32,
  equipmentsInMaintenance: 10
};