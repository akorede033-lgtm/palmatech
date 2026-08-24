import React, { useState } from 'react';
import { UserRole, NavTab, FarmBlock, Worker, AttendanceRecord, DailyWorkReport, FarmInspection, PestDiseaseReport, HarvestRecord, InventoryItem, Equipment, ExpenseRecord } from './types';
import {
  INITIAL_BLOCKS,
  INITIAL_WORKERS,
  INITIAL_ATTENDANCE,
  INITIAL_DAILY_REPORTS,
  INITIAL_INSPECTIONS,
  INITIAL_PEST_REPORTS,
  INITIAL_HARVESTS,
  INITIAL_INVENTORY,
  INITIAL_EQUIPMENT,
  INITIAL_EXPENSES,
} from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { BlockMapView } from './components/BlockMapView';
import { WorkerManagementView } from './components/WorkerManagementView';
import { DailyReportView } from './components/DailyReportView';
import { InspectionSystemView } from './components/InspectionSystemView';
import { PestDiseaseView } from './components/PestDiseaseView';
import { HarvestManagementView } from './components/HarvestManagementView';
import { InventoryView } from './components/InventoryView';
import { EquipmentView } from './components/EquipmentView';
import { ExpensesView } from './components/ExpensesView';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { DatabaseSetupView } from './components/DatabaseSetupView';
import { AIAgronomistModal } from './components/AIAgronomistModal';
import { SupabaseModal } from './components/SupabaseModal';
import { getSupabaseConfig } from './lib/supabase';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Master State Arrays
  const [blocks, setBlocks] = useState<FarmBlock[]>(INITIAL_BLOCKS);
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [dailyReports, setDailyReports] = useState<DailyWorkReport[]>(INITIAL_DAILY_REPORTS);
  const [inspections, setInspections] = useState<FarmInspection[]>(INITIAL_INSPECTIONS);
  const [pestReports, setPestReports] = useState<PestDiseaseReport[]>(INITIAL_PEST_REPORTS);
  const [harvests, setHarvests] = useState<HarvestRecord[]>(INITIAL_HARVESTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [equipment, setEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);

  // Modals
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiPrompt, setAIPrompt] = useState<string | undefined>(undefined);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(getSupabaseConfig().isConnected);

  // Handlers for Blocks
  const handleUpdateBlock = (updated: FarmBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleAddBlock = (newBlock: FarmBlock) => {
    setBlocks((prev) => [...prev, newBlock]);
  };

  // Handlers for Workers
  const handleAddWorker = (newWorker: Worker) => {
    setWorkers((prev) => [newWorker, ...prev]);
  };

  const handleUpdateAttendance = (updated: AttendanceRecord[]) => {
    setAttendance(updated);
  };

  // Handlers for Daily Reports
  const handleSubmitDailyReport = (report: DailyWorkReport) => {
    setDailyReports((prev) => [report, ...prev]);
  };

  const handleApproveDailyReport = (
    reportId: string,
    status: 'Approved' | 'Rejected',
    approverName: string
  ) => {
    setDailyReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, supervisorApproval: status, approvedBy: approverName }
          : r
      )
    );
  };

  // Handlers for Inspections
  const handleAddInspection = (inspection: FarmInspection) => {
    setInspections((prev) => [inspection, ...prev]);
  };

  // Handlers for Pests
  const handleAddPestReport = (report: PestDiseaseReport) => {
    setPestReports((prev) => [report, ...prev]);
  };

  const handleUpdatePestStatus = (id: string, status: PestDiseaseReport['status']) => {
    setPestReports((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  // Handlers for Harvests
  const handleAddHarvest = (harvest: HarvestRecord) => {
    setHarvests((prev) => [harvest, ...prev]);
  };

  // Handlers for Inventory
  const handleAddInventoryItem = (item: InventoryItem) => {
    setInventory((prev) => [item, ...prev]);
  };

  const handleUpdateInventoryStock = (id: string, delta: number, type: 'add' | 'subtract') => {
    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const newQty = type === 'add' ? i.currentStock + delta : Math.max(0, i.currentStock - delta);
          return { ...i, currentStock: newQty };
        }
        return i;
      })
    );
  };

  // Handlers for Equipment
  const handleAddEquipment = (item: Equipment) => {
    setEquipment((prev) => [item, ...prev]);
  };

  const handleUpdateEquipmentStatus = (id: string, status: Equipment['currentStatus']) => {
    setEquipment((prev) =>
      prev.map((e) => (e.id === id ? { ...e, currentStatus: status } : e))
    );
  };

  // Handlers for Expenses
  const handleAddExpense = (expense: ExpenseRecord) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const handleApproveExpense = (id: string, approvedBy: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isApproved: true, approvedBy } : e))
    );
  };

  // Trigger AI Agronomist
  const handleOpenAI = (prompt?: string) => {
    setAIPrompt(prompt);
    setIsAIOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Fixed Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenAIAgronomist={() => handleOpenAI()}
        onOpenSupabase={() => {
          setActiveTab('database_setup');
          setIsSupabaseOpen(true);
        }}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 gap-4">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab === 'ai_agronomist' ? 'dashboard' : activeTab}
          onTabChange={(tab) => {
            if (tab === 'ai_agronomist') {
              handleOpenAI();
            } else {
              setActiveTab(tab);
            }
          }}
          pendingApprovalsCount={(dailyReports || []).filter((r) => r.supervisorApproval === 'Pending').length}
          pestAlertsCount={(pestReports || []).filter((p) => p.status !== 'Resolved').length}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 min-w-0">
          {(activeTab === 'dashboard' || activeTab === 'ai_agronomist') && (
            <DashboardView
              blocks={blocks}
              workers={workers}
              attendance={attendance}
              pestReports={pestReports}
              dailyReports={dailyReports}
              harvests={harvests}
              expenses={expenses}
              equipment={equipment}
              inspections={inspections}
              currentRole={currentRole}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAIAgronomist={handleOpenAI}
            />
          )}

          {activeTab === 'blocks' && (
            <BlockMapView
              blocks={blocks}
              workers={workers}
              dailyReports={dailyReports}
              pestReports={pestReports}
              currentRole={currentRole}
              onUpdateBlock={handleUpdateBlock}
              onAddBlock={handleAddBlock}
            />
          )}

          {activeTab === 'workers' && (
            <WorkerManagementView
              workers={workers}
              attendance={attendance}
              blocks={blocks}
              dailyReports={dailyReports}
              currentRole={currentRole}
              onAddWorker={handleAddWorker}
              onUpdateAttendance={handleUpdateAttendance}
            />
          )}

          {activeTab === 'daily_reports' && (
            <DailyReportView
              reports={dailyReports}
              workers={workers}
              blocks={blocks}
              inventory={inventory}
              currentRole={currentRole}
              onSubmitReport={handleSubmitDailyReport}
              onApproveReport={handleApproveDailyReport}
            />
          )}

          {activeTab === 'inspections' && (
            <InspectionSystemView
              inspections={inspections}
              blocks={blocks}
              currentRole={currentRole}
              onAddInspection={handleAddInspection}
            />
          )}

          {activeTab === 'pest_disease' && (
            <PestDiseaseView
              reports={pestReports}
              blocks={blocks}
              currentRole={currentRole}
              onAddReport={handleAddPestReport}
              onUpdateStatus={handleUpdatePestStatus}
              onOpenAIAgronomist={handleOpenAI}
            />
          )}

          {activeTab === 'harvest' && (
            <HarvestManagementView
              harvests={harvests}
              blocks={blocks}
              currentRole={currentRole}
              onAddHarvest={handleAddHarvest}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              currentRole={currentRole}
              onAddItem={handleAddInventoryItem}
              onUpdateStock={handleUpdateInventoryStock}
            />
          )}

          {activeTab === 'equipment' && (
            <EquipmentView
              equipment={equipment}
              currentRole={currentRole}
              onAddEquipment={handleAddEquipment}
              onUpdateStatus={handleUpdateEquipmentStatus}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              currentRole={currentRole}
              onAddExpense={handleAddExpense}
              onApproveExpense={handleApproveExpense}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsAnalyticsView
              blocks={blocks}
              harvests={harvests}
              expenses={expenses}
              pestReports={pestReports}
            />
          )}

          {activeTab === 'database_setup' && (
            <DatabaseSetupView />
          )}
        </main>
      </div>

      {/* AI Agronomist Modal */}
      <AIAgronomistModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        initialPrompt={aiPrompt}
      />

      {/* Supabase Connection Modal */}
      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
        onConfigSaved={() => setIsSupabaseConnected(!!getSupabaseConfig())}
      />
    </div>
  );
}

export default App;
