import { getSupabaseClient } from './supabase';
import {
  FarmBlock,
  Worker,
  AttendanceRecord,
  DailyWorkReport,
  FarmInspection,
  PestDiseaseReport,
  HarvestRecord,
  InventoryItem,
  Equipment,
  ExpenseRecord,
} from '../types';

/**
 * Reusable Supabase Data-Access Layer (DAL) for PALMATECH
 * Provides clean CRUD access to Supabase PostgreSQL database tables.
 */

// --- 1. Farm Blocks ---
export async function fetchFarmBlocksFromSupabase(): Promise<FarmBlock[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('farm_blocks').select('*');
    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      blockNumber: Number(row.block_number),
      name: row.name,
      areaHa: Number(row.area_ha),
      palmAgeYears: Number(row.palm_age_years),
      plantingYear: Number(row.planting_year),
      totalPalms: Number(row.total_palms),
      terrain: row.terrain,
      assignedSupervisor: row.assigned_supervisor || 'Unassigned',
      assignedWorkersCount: Number(row.assigned_workers_count || 0),
      currentActivity: row.current_activity || 'Routine Patrol',
      inspectionStatus: row.inspection_status || 'Passed',
      pestStatus: row.pest_status || 'Clear',
      lastActivityDate: row.last_activity_date || new Date().toISOString().split('T')[0],
      targetYieldTonnes: Number(row.target_yield_tonnes || 52.5),
      actualYieldTonnesMonth: Number(row.actual_yield_tonnes_month || 0),
      coordinates: { x: Number(row.coordinates_x || 0), y: Number(row.coordinates_y || 0) },
      notes: row.notes || '',
    }));
  } catch (err) {
    console.warn('Error fetching farm blocks from Supabase:', err);
    return null;
  }
}

export async function upsertFarmBlockToSupabase(block: FarmBlock): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: block.id,
      block_number: block.blockNumber,
      name: block.name,
      area_ha: block.areaHa,
      palm_age_years: block.palmAgeYears,
      planting_year: block.plantingYear,
      total_palms: block.totalPalms,
      terrain: block.terrain,
      assigned_supervisor: block.assignedSupervisor,
      assigned_workers_count: block.assignedWorkersCount,
      current_activity: block.currentActivity,
      inspection_status: block.inspectionStatus,
      pest_status: block.pestStatus,
      last_activity_date: block.lastActivityDate,
      target_yield_tonnes: block.targetYieldTonnes,
      actual_yield_tonnes_month: block.actualYieldTonnesMonth,
      coordinates_x: block.coordinates.x,
      coordinates_y: block.coordinates.y,
      notes: block.notes,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('farm_blocks').upsert(payload);
    return !error;
  } catch (err) {
    console.warn('Error saving farm block to Supabase:', err);
    return false;
  }
}

// --- 2. Workers ---
export async function fetchWorkersFromSupabase(): Promise<Worker[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('workers').select('*');
    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      workerId: row.worker_id,
      name: row.name,
      phone: row.phone || '',
      role: row.role,
      assignedBlockId: row.assigned_block_id || 'B01',
      employmentStatus: row.employment_status || 'Active',
      joinedDate: row.joined_date || new Date().toISOString().split('T')[0],
      dailyRate: Number(row.daily_rate || 0),
      avatarUrl: row.avatar_url,
    }));
  } catch (err) {
    console.warn('Error fetching workers from Supabase:', err);
    return null;
  }
}

export async function upsertWorkerToSupabase(worker: Worker): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: worker.id,
      worker_id: worker.workerId,
      name: worker.name,
      phone: worker.phone,
      role: worker.role,
      assigned_block_id: worker.assignedBlockId,
      employment_status: worker.employmentStatus,
      joined_date: worker.joinedDate,
      daily_rate: worker.dailyRate,
      avatar_url: worker.avatarUrl,
    };

    const { error } = await supabase.from('workers').upsert(payload);
    return !error;
  } catch (err) {
    console.warn('Error saving worker to Supabase:', err);
    return false;
  }
}

// --- 3. Attendance Records ---
export async function fetchAttendanceFromSupabase(): Promise<AttendanceRecord[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('attendance_records').select('*');
    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      date: row.date,
      workerId: row.worker_id,
      workerName: row.worker_name,
      status: row.status,
      checkInTime: row.check_in_time,
      assignedBlockId: row.assigned_block_id || 'B01',
      notes: row.notes,
    }));
  } catch (err) {
    console.warn('Error fetching attendance records from Supabase:', err);
    return null;
  }
}

export async function upsertAttendanceToSupabase(record: AttendanceRecord): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: record.id,
      date: record.date,
      worker_id: record.workerId,
      worker_name: record.workerName,
      status: record.status,
      check_in_time: record.checkInTime,
      assigned_block_id: record.assignedBlockId,
      notes: record.notes,
    };

    const { error } = await supabase.from('attendance_records').upsert(payload);
    return !error;
  } catch (err) {
    console.warn('Error saving attendance to Supabase:', err);
    return false;
  }
}

// --- 4. Daily Work Reports ---
export async function fetchDailyReportsFromSupabase(): Promise<DailyWorkReport[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('daily_work_reports').select('*');
    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      date: row.date,
      workerId: row.worker_id,
      workerName: row.worker_name,
      blockId: row.block_id,
      taskPerformed: row.task_performed,
      description: row.description,
      quantityCompleted: Number(row.quantity_completed),
      unit: row.unit,
      hoursWorked: Number(row.hours_worked),
      problemsEncountered: row.problems_encountered,
      materialsUsed: row.materials_used || [],
      photoEvidenceUrl: row.photo_evidence_url,
      supervisorApproval: row.supervisor_approval || 'Pending',
      approvedBy: row.approved_by,
      submittedAt: row.submitted_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Error fetching daily reports from Supabase:', err);
    return null;
  }
}

export async function insertDailyReportToSupabase(report: DailyWorkReport): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: report.id,
      date: report.date,
      worker_id: report.workerId,
      worker_name: report.workerName,
      block_id: report.blockId,
      task_performed: report.taskPerformed,
      description: report.description,
      quantity_completed: report.quantityCompleted,
      unit: report.unit,
      hours_worked: report.hoursWorked,
      problems_encountered: report.problemsEncountered,
      materials_used: report.materialsUsed || [],
      photo_evidence_url: report.photoEvidenceUrl,
      supervisor_approval: report.supervisorApproval,
      approved_by: report.approvedBy,
      submitted_at: report.submittedAt,
    };

    const { error } = await supabase.from('daily_work_reports').upsert(payload);
    return !error;
  } catch (err) {
    console.warn('Error saving daily report to Supabase:', err);
    return false;
  }
}

// --- 5. Harvest Records ---
export async function fetchHarvestsFromSupabase(): Promise<HarvestRecord[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('harvest_records').select('*');
    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      date: row.date,
      blockId: row.block_id,
      quantityTonnes: Number(row.quantity_tonnes),
      bunchCount: Number(row.bunch_count),
      averageBunchWeightKg: Number(row.average_bunch_weight_kg),
      workerCount: Number(row.worker_count),
      harvestTeam: row.harvest_team,
      transportTruckNumber: row.transport_truck_number,
      receivingMillLocation: row.receiving_mill_location,
      ripePercentage: Number(row.ripe_percentage || 90),
      underripePercentage: Number(row.underripe_percentage || 5),
      longStalkPercentage: Number(row.long_stalk_percentage || 5),
      notes: row.notes,
    }));
  } catch (err) {
    console.warn('Error fetching harvest records from Supabase:', err);
    return null;
  }
}

export async function insertHarvestToSupabase(harvest: HarvestRecord): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: harvest.id,
      date: harvest.date,
      block_id: harvest.blockId,
      quantity_tonnes: harvest.quantityTonnes,
      bunch_count: harvest.bunchCount,
      average_bunch_weight_kg: harvest.averageBunchWeightKg,
      worker_count: harvest.workerCount,
      harvest_team: harvest.harvestTeam,
      transport_truck_number: harvest.transportTruckNumber,
      receiving_mill_location: harvest.receivingMillLocation,
      ripe_percentage: harvest.ripePercentage,
      underripe_percentage: harvest.underripePercentage,
      long_stalk_percentage: harvest.longStalkPercentage,
      notes: harvest.notes,
    };

    const { error } = await supabase.from('harvest_records').upsert(payload);
    return !error;
  } catch (err) {
    console.warn('Error saving harvest record to Supabase:', err);
    return false;
  }
}

// --- 6. Expense Records ---
export async function fetchExpensesFromSupabase(): Promise<ExpenseRecord[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('expense_records').select('*');
    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      expenseId: row.id,
      date: row.date,
      category: row.category,
      description: row.description,
      amount: Number(row.amount),
      paymentMethod: 'Bank Transfer',
      vendor: 'Agro Supplier',
      blockId: row.block_id,
      personResponsible: row.person_responsible || 'Admin',
      receiptUrl: row.receipt_photo_url,
      receiptPhotoUrl: row.receipt_photo_url,
      isApproved: row.approval_status === 'Approved',
      approvedBy: row.approved_by,
    }));
  } catch (err) {
    console.warn('Error fetching expense records from Supabase:', err);
    return null;
  }
}

export async function insertExpenseToSupabase(expense: ExpenseRecord): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: expense.id,
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      block_id: expense.blockId,
      person_responsible: expense.personResponsible || 'Admin',
      receipt_photo_url: expense.receiptUrl || expense.receiptPhotoUrl,
      approval_status: expense.isApproved ? 'Approved' : 'Pending',
      approved_by: expense.approvedBy,
    };

    const { error } = await supabase.from('expense_records').upsert(payload);
    return !error;
  } catch (err) {
    console.warn('Error saving expense to Supabase:', err);
    return false;
  }
}
