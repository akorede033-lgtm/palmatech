export type UserRole = 'Admin' | 'Manager' | 'Supervisor' | 'Worker' | 'Accountant' | 'Administrator' | 'Farm Manager' | 'Field Supervisor' | 'Field Worker';

export type NavTab =
  | 'dashboard'
  | 'blocks'
  | 'workers'
  | 'daily_reports'
  | 'inspections'
  | 'pest_disease'
  | 'harvest'
  | 'inventory'
  | 'equipment'
  | 'expenses'
  | 'reports'
  | 'ai_agronomist'
  | 'database_setup';

export interface FarmBlock {
  id: string;
  blockNumber: number;
  name: string;
  areaHa: number;
  palmAgeYears: number;
  plantingYear: number;
  totalPalms: number;
  terrain: 'Flat' | 'Undulating' | 'Coastal Alluvial' | 'Peat';
  assignedSupervisor: string;
  assignedWorkersCount: number;
  currentActivity: string;
  inspectionStatus: 'Passed' | 'Pending Review' | 'Attention Required';
  pestStatus: 'Clear' | 'Low Alert' | 'Moderate' | 'Severe';
  lastActivityDate: string;
  targetYieldTonnes: number;
  actualYieldTonnesMonth: number;
  coordinates: { x: number; y: number }; // Percentage position on 500ha grid map
  notes: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  workerId: string;
  role: 'Field Worker' | 'Harvester' | 'Pruner' | 'Sprayer' | 'Tractor Driver' | 'Supervisor';
  assignedBlockId: string;
  employmentStatus: 'Active' | 'On Leave' | 'Terminated' | 'Inactive';
  joinedDate: string;
  dailyRate: number;
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  workerId: string;
  workerName: string;
  status: 'Present' | 'Absent' | 'On Leave' | 'Late';
  checkInTime?: string;
  assignedBlockId: string;
  notes?: string;
}

export interface DailyWorkReport {
  id: string;
  date: string;
  workerId: string;
  workerName: string;
  blockId: string;
  taskPerformed:
    | 'Harvesting & Collecting'
    | 'Frond Pruning'
    | 'Circle & Path Spraying'
    | 'Manuring / Fertilizing'
    | 'Loose Fruit Collection'
    | 'Drainage Maintenance'
    | 'Weed Control'
    | 'Road Upkeep';
  description: string;
  quantityCompleted: number;
  unit: string; // e.g. 'Tonnes FFB', 'Bags (50kg)', 'Hectares', 'Trees'
  hoursWorked: number;
  problemsEncountered?: string;
  materialsUsed?: { itemId: string; name: string; quantity: number; unit: string }[];
  photoEvidenceUrl?: string;
  supervisorApproval: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  submittedAt: string;
}

export interface FarmInspection {
  id: string;
  date: string;
  blockId: string;
  inspectorName: string;
  generalConditionScore: number; // 1-5
  palmHealthScore: number; // 1-5
  weedControlScore: number; // 1-5
  pestPresence: 'None' | 'Minor' | 'Moderate' | 'Severe';
  diseasePresence: 'None' | 'Ganoderma' | 'Crown Rot' | 'Orange Spotting' | 'Spear Rot';
  drainageStatus: 'Good' | 'Blocked' | 'Needs Clearing';
  roadStatus: 'Passable' | 'Needs Grading' | 'Flooded';
  workerSafetyPPE: 'Compliant' | 'Minor Violations' | 'Non-Compliant';
  equipmentCondition: 'Good' | 'Fair' | 'Needs Repair';
  recommendations: string;
  photoUrl?: string;
  status: 'Completed' | 'Action Pending' | 'Resolved';
}

export interface PestDiseaseReport {
  id: string;
  date: string;
  blockId: string;
  reportedBy: string;
  pestDiseaseType:
    | 'Bagworms (Metisa plana)'
    | 'Rhinoceros Beetle (Oryctes)'
    | 'Ganoderma Basal Stem Rot'
    | 'Rats (Rattus tiomanicus)'
    | 'Tirathaba Bunch Moth'
    | 'Nettle Caterpillars'
    | 'Crown Rot';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedAreaHa: number;
  affectedTreesCount: number;
  description: string;
  photoUrl?: string;
  recommendedAction: string;
  status: 'Reported' | 'In Treatment' | 'Resolved';
  treatedDate?: string;
  treatedBy?: string;
}

export interface HarvestRecord {
  id: string;
  date: string;
  blockId: string;
  quantityTonnes: number;
  bunchCount: number;
  averageBunchWeightKg: number;
  workerCount: number;
  harvestTeam: string;
  transportTruckNumber: string;
  receivingMillLocation: string;
  ripePercentage: number;
  underripePercentage: number;
  longStalkPercentage: number;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: 'Fertilizer' | 'Herbicide' | 'Pesticide' | 'Tools & Equipment' | 'PPE' | 'Fuel' | 'Spare Parts';
  currentStock: number;
  unit: string;
  minimumStockLevel: number;
  supplier: string;
  unitCost: number;
  lastRestockedDate: string;
  location: string;
}

export interface InventoryTransaction {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: 'Stock Received' | 'Stock Used' | 'Adjustment';
  quantity: number;
  blockId?: string;
  personResponsible: string;
  notes?: string;
}

export interface Equipment {
  id: string;
  equipmentId: string;
  name: string;
  type: 'Tractor' | 'Mini-Grabber' | '4x4 Truck' | 'Motorcycle' | 'Chainsaw' | 'Motorized Cutter' | 'Water Pump';
  operatorName: string;
  condition: 'Excellent' | 'Good' | 'Needs Service' | 'Under Repair';
  fuelUsageLitersMonth: number;
  currentStatus: 'In Service' | 'Scheduled Maintenance' | 'Breakdown' | 'Idle';
  lastMaintenanceDate: string;
  nextServiceDue: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  expenseId: string;
  date: string;
  category:
    | 'Labor / Payroll'
    | 'Labor & Wages'
    | 'Fertilizer & Chemicals'
    | 'Equipment Fuel & Diesel'
    | 'Maintenance & Repairs'
    | 'Equipment Maintenance'
    | 'Fuel & Transport'
    | 'Infrastructure & Roads'
    | 'Tools & Safety'
    | 'Capital Investment'
    | 'Utilities & Admin'
    | 'Admin & Utilities'
    | 'Transport & Shipping';
  description: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Company Credit Card' | 'Cheque';
  vendor: string;
  blockId?: string;
  personResponsible?: string;
  receiptUrl?: string;
  receiptPhotoUrl?: string;
  isApproved: boolean;
  approvedBy?: string;
}
