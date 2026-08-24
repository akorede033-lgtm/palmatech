import React, { useState, useMemo } from 'react';
import { FarmBlock, Worker, UserRole, DailyWorkReport, PestDiseaseReport } from '../types';
import {
  Grid,
  List,
  Plus,
  Search,
  Trees,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  X,
  Edit2,
  Save,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  Activity,
  ClipboardList,
  Bug,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';

interface BlockMapViewProps {
  blocks: FarmBlock[];
  workers: Worker[];
  dailyReports?: DailyWorkReport[];
  pestReports?: PestDiseaseReport[];
  currentRole: UserRole;
  onUpdateBlock: (updated: FarmBlock) => void;
  onAddBlock: (newBlock: FarmBlock) => void;
}

interface SectorGroup {
  name: string;
  code: string;
  description: string;
  blocks: FarmBlock[];
}

export const BlockMapView: React.FC<BlockMapViewProps> = ({
  blocks = [],
  workers = [],
  dailyReports = [],
  pestReports = [],
  currentRole,
  onUpdateBlock,
  onAddBlock,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPest, setFilterPest] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<FarmBlock | null>(null);

  // New Block Modal State (Expansion beyond 500ha)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockArea, setNewBlockArea] = useState(25.0);
  const [newBlockPlantingYear, setNewBlockPlantingYear] = useState(2022);
  const [newBlockTerrain, setNewBlockTerrain] = useState<FarmBlock['terrain']>('Flat');
  const [newBlockSupervisor, setNewBlockSupervisor] = useState('Ahmad Zulkifli');

  // Edit Block Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editActivity, setEditActivity] = useState('');
  const [editInspectionStatus, setEditInspectionStatus] = useState<FarmBlock['inspectionStatus']>('Passed');
  const [editPestStatus, setEditPestStatus] = useState<FarmBlock['pestStatus']>('Clear');
  const [editNotes, setEditNotes] = useState('');

  const safeBlocks = blocks || [];
  const safeDailyReports = dailyReports || [];
  const safePestReports = pestReports || [];

  // Helper to resolve which sector a block belongs to
  const getBlockSectorInfo = (block: FarmBlock) => {
    const num = block.blockNumber || parseInt(block.id?.replace(/\D/g, '') || '0', 10);
    if (num >= 1 && num <= 5) return { name: 'North Sector', code: 'NORTH', range: 'BLK 01 – 05' };
    if (num >= 6 && num <= 10) return { name: 'East Sector', code: 'EAST', range: 'BLK 06 – 10' };
    if (num >= 11 && num <= 15) return { name: 'South Sector', code: 'SOUTH', range: 'BLK 11 – 15' };
    if (num >= 16 && num <= 20) return { name: 'West Sector', code: 'WEST', range: 'BLK 16 – 20' };
    return { name: 'Expansion Sector', code: 'EXP', range: `BLK ${num.toString().padStart(2, '0')}+` };
  };

  const filteredBlocks = useMemo(() => {
    return safeBlocks.filter((b) => {
      if (!b) return false;
      const matchesSearch =
        (b.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (b.id || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (b.assignedSupervisor || '').toLowerCase().includes((searchQuery || '').toLowerCase());

      const matchesPest =
        filterPest === 'all' ||
        (filterPest === 'alerts' && b.pestStatus !== 'Clear') ||
        (b.pestStatus || '').toLowerCase() === (filterPest || '').toLowerCase();

      const sectorInfo = getBlockSectorInfo(b);
      const matchesSector =
        filterSector === 'all' || sectorInfo.code.toLowerCase() === filterSector.toLowerCase();

      return matchesSearch && matchesPest && matchesSector;
    });
  }, [safeBlocks, searchQuery, filterPest, filterSector]);

  // Group filtered blocks into defined Sectors for clear boundaries
  const sectorGroups: SectorGroup[] = useMemo(() => {
    const sectors: Record<string, SectorGroup> = {
      NORTH: {
        name: 'North Sector',
        code: 'NORTH',
        description: 'Blocks 01–05 • 125.0 Ha • High-Yield Mature Stands (Planted 2014)',
        blocks: [],
      },
      EAST: {
        name: 'East Sector',
        code: 'EAST',
        description: 'Blocks 06–10 • 125.0 Ha • Mid-Maturity Production (Planted 2016)',
        blocks: [],
      },
      SOUTH: {
        name: 'South Sector',
        code: 'SOUTH',
        description: 'Blocks 11–15 • 125.0 Ha • Prime Commercial Tier (Planted 2017)',
        blocks: [],
      },
      WEST: {
        name: 'West Sector',
        code: 'WEST',
        description: 'Blocks 16–20 • 125.0 Ha • Young Mature Extension (Planted 2019-2021)',
        blocks: [],
      },
      EXP: {
        name: 'Estate Expansion Modules',
        code: 'EXP',
        description: 'New Commercial Extension Blocks',
        blocks: [],
      },
    };

    filteredBlocks.forEach((b) => {
      const info = getBlockSectorInfo(b);
      if (sectors[info.code]) {
        sectors[info.code].blocks.push(b);
      } else {
        sectors.EXP.blocks.push(b);
      }
    });

    return Object.values(sectors).filter((s) => s.blocks.length > 0);
  }, [filteredBlocks]);

  const handleSelectBlock = (block: FarmBlock) => {
    setSelectedBlock(block);
    setEditActivity(block.currentActivity);
    setEditInspectionStatus(block.inspectionStatus);
    setEditPestStatus(block.pestStatus);
    setEditNotes(block.notes);
    setIsEditing(false);
  };

  const handleSaveBlockEdit = () => {
    if (!selectedBlock) return;
    const updated: FarmBlock = {
      ...selectedBlock,
      currentActivity: editActivity,
      inspectionStatus: editInspectionStatus,
      pestStatus: editPestStatus,
      notes: editNotes,
      lastActivityDate: new Date().toISOString().split('T')[0],
    };
    onUpdateBlock(updated);
    setSelectedBlock(updated);
    setIsEditing(false);
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const nextNum = blocks.length + 1;
    const newBlock: FarmBlock = {
      id: `BLK-${nextNum.toString().padStart(2, '0')}`,
      blockNumber: nextNum,
      name: newBlockName || `Block ${nextNum.toString().padStart(2, '0')} Expansion`,
      areaHa: Number(newBlockArea),
      palmAgeYears: 2026 - Number(newBlockPlantingYear),
      plantingYear: Number(newBlockPlantingYear),
      totalPalms: Math.round(Number(newBlockArea) * 138),
      terrain: newBlockTerrain,
      assignedSupervisor: newBlockSupervisor,
      assignedWorkersCount: 2,
      currentActivity: 'Land Prep & Seedling Planting',
      inspectionStatus: 'Passed',
      pestStatus: 'Clear',
      lastActivityDate: new Date().toISOString().split('T')[0],
      targetYieldTonnes: Number(newBlockArea) * 2.1,
      actualYieldTonnesMonth: 0,
      coordinates: { x: (nextNum * 12) % 90, y: (nextNum * 15) % 85 },
      notes: 'New plantation extension block added for estate expansion.',
    };

    onAddBlock(newBlock);
    setIsAddModalOpen(false);
    setNewBlockName('');
  };

  // Extract selected block's historical reports and pest events
  const selectedBlockDailyReports = useMemo(() => {
    if (!selectedBlock) return [];
    const id = selectedBlock.id;
    return safeDailyReports.filter((r) => r && r.blockId === id).slice(0, 5);
  }, [selectedBlock, safeDailyReports]);

  const selectedBlockPestReports = useMemo(() => {
    if (!selectedBlock) return [];
    const id = selectedBlock.id;
    return safePestReports.filter((p) => p && p.blockId === id);
  }, [selectedBlock, safePestReports]);

  return (
    <div className="space-y-6">
      {/* 1. Top Header Controls & Estate Summary Deck */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/95 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-full border border-emerald-500/30 uppercase tracking-widest font-mono">
              20-Block Agronomic Matrix
            </span>
            <span className="text-xs text-slate-400 font-medium">4 Sectors • 125 Ha per Sector</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display mt-1">
            <Trees className="w-5 h-5 text-emerald-400" />
            <span>Commercial Farm Block Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Estate: <strong className="text-emerald-400 font-mono">{safeBlocks.reduce((s, b) => s + (b?.areaHa || 0), 0).toFixed(1)} Ha</strong> across{' '}
            <strong className="text-slate-200">{safeBlocks.length} Blocks</strong> (25 Ha standard module • ~138 Palms/Ha)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search block or supervisor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 placeholder-slate-500"
            />
          </div>

          {/* Sector Filter */}
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="text-xs bg-slate-950 text-slate-300 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All 4 Sectors</option>
            <option value="north">North (BLK 01–05)</option>
            <option value="east">East (BLK 06–10)</option>
            <option value="south">South (BLK 11–15)</option>
            <option value="west">West (BLK 16–20)</option>
          </select>

          {/* Filter Pest Status */}
          <select
            value={filterPest}
            onChange={(e) => setFilterPest(e.target.value)}
            className="text-xs bg-slate-950 text-slate-300 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Pest Statuses</option>
            <option value="alerts">Pest Alerts Only</option>
            <option value="clear">Clear Status</option>
            <option value="low alert">Low Alert</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe Outbreak</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Sector Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Expansion Block Button */}
          {(currentRole === 'Admin' || currentRole === 'Manager') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Block Module</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Grid Map View with Visible Sector Boundaries */}
      {viewMode === 'grid' ? (
        <div className="space-y-6">
          {sectorGroups.map((sector) => {
            const sectorTotalArea = sector.blocks.reduce((sum, b) => sum + (b?.areaHa || 0), 0);
            const sectorActualYield = sector.blocks.reduce((sum, b) => sum + (b?.actualYieldTonnesMonth || 0), 0);
            const sectorTargetYield = sector.blocks.reduce((sum, b) => sum + (b?.targetYieldTonnes || 52.5), 0);
            const sectorPestCount = sector.blocks.filter((b) => b?.pestStatus !== 'Clear').length;

            return (
              <div
                key={sector.code}
                className="bg-slate-900/95 p-5 rounded-2xl border border-slate-800 text-white space-y-4 shadow-xl relative overflow-hidden"
              >
                {/* Sector Header Divider */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs pb-3 border-b border-slate-800 gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 bg-emerald-950/80 rounded-lg border border-emerald-800/40 text-emerald-400">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-sm font-display tracking-tight">{sector.name}</h3>
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded-md border border-slate-700">
                          {sectorTotalArea.toFixed(1)} Ha ({sector.blocks.length} Blocks)
                        </span>
                        {sectorPestCount > 0 ? (
                          <StatusBadge label={`${sectorPestCount} PEST ALERT`} variant="warning" size="sm" />
                        ) : (
                          <StatusBadge label="OPTIMAL" variant="optimal" size="sm" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{sector.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-[11px] font-mono">
                    <span className="text-slate-400">
                      Sector Yield:{' '}
                      <strong className="text-emerald-400 font-semibold">
                        {sectorActualYield.toFixed(1)} / {sectorTargetYield.toFixed(1)} MT
                      </strong>
                    </span>
                  </div>
                </div>

                {/* 5-Block Sector Row Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 pt-1">
                  {sector.blocks.map((block) => {
                    const isPestSevere = block.pestStatus === 'Severe' || block.pestStatus === 'Moderate';
                    const isPestLow = block.pestStatus === 'Low Alert';
                    const harvestPct = Math.min(
                      100,
                      Math.round(((block?.actualYieldTonnesMonth || 0) / (block?.targetYieldTonnes || 52.5)) * 100)
                    );

                    return (
                      <div
                        key={block.id}
                        onClick={() => handleSelectBlock(block)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                          isPestSevere
                            ? 'bg-rose-950/40 border-rose-600/70 hover:border-rose-400 shadow-lg shadow-rose-950/30'
                            : isPestLow
                            ? 'bg-amber-950/30 border-amber-600/60 hover:border-amber-400'
                            : 'bg-slate-800/80 border-slate-700 hover:border-emerald-500 hover:bg-slate-800 shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-black text-white font-mono">{block.id}</span>
                            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[110px]">{block.name}</p>
                          </div>
                          {isPestSevere ? (
                            <StatusBadge label={block.pestStatus} variant="critical" size="sm" />
                          ) : isPestLow ? (
                            <StatusBadge label="Alert" variant="warning" size="sm" />
                          ) : (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded font-mono">
                              {block.areaHa} Ha
                            </span>
                          )}
                        </div>

                        <div className="mt-3 space-y-1 text-[11px] text-slate-300">
                          <div className="flex justify-between text-slate-400">
                            <span>Age / Planted:</span>
                            <strong className="text-slate-200">{block.palmAgeYears}y ({block.plantingYear})</strong>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Palms:</span>
                            <strong className="text-slate-200 font-mono">{block.totalPalms} (~138/ha)</strong>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Yield Progress:</span>
                            <strong className="text-emerald-400 font-mono">
                              {block.actualYieldTonnesMonth} / {block.targetYieldTonnes} MT
                            </strong>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-700/60">
                          <div
                            className={`h-full rounded-full transition-all ${
                              harvestPct >= 90 ? 'bg-emerald-500' : harvestPct >= 70 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${harvestPct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-700/50">
                          <span className="truncate max-w-[90px]">{block.assignedSupervisor}</span>
                          <span className="text-emerald-400 font-medium group-hover:underline flex items-center">
                            Inspect <ArrowUpRight className="w-3 h-3 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900/95 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Block ID & Name</th>
                  <th className="p-3.5">Sector</th>
                  <th className="p-3.5">Area (Ha)</th>
                  <th className="p-3.5">Palm Age / Planted</th>
                  <th className="p-3.5">Total Palms</th>
                  <th className="p-3.5">Terrain</th>
                  <th className="p-3.5">Supervisor</th>
                  <th className="p-3.5">Pest Status</th>
                  <th className="p-3.5">Yield (Actual/Target)</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBlocks.map((block) => {
                  const sector = getBlockSectorInfo(block);
                  return (
                    <tr
                      key={block.id}
                      onClick={() => handleSelectBlock(block)}
                      className="hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 font-bold text-white font-mono">
                        {block.id} - <span className="font-normal text-slate-300">{block.name}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-200">{sector.name}</td>
                      <td className="p-3.5 font-mono">{block.areaHa} Ha</td>
                      <td className="p-3.5">{block.palmAgeYears} yrs ({block.plantingYear})</td>
                      <td className="p-3.5 font-mono">{block.totalPalms}</td>
                      <td className="p-3.5">{block.terrain}</td>
                      <td className="p-3.5">{block.assignedSupervisor}</td>
                      <td className="p-3.5">
                        <StatusBadge
                          label={block.pestStatus}
                          variant={
                            block.pestStatus === 'Clear'
                              ? 'optimal'
                              : block.pestStatus === 'Low Alert'
                              ? 'warning'
                              : 'critical'
                          }
                          size="sm"
                        />
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400">
                        {block.actualYieldTonnesMonth} / {block.targetYieldTonnes} MT
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectBlock(block);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Enhanced Block Details Inspection Modal (Figma V2) */}
      {selectedBlock && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-700 overflow-y-auto text-white animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 border-b border-slate-700 flex justify-between items-start sticky top-0 z-10">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-white font-display">
                    {selectedBlock.id}: {selectedBlock.name}
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/60">
                    {selectedBlock.areaHa} Hectares
                  </span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                    {getBlockSectorInfo(selectedBlock).name}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Planted {selectedBlock.plantingYear} ({selectedBlock.palmAgeYears} Years Old) • {selectedBlock.terrain} Terrain • Supervisor: <strong>{selectedBlock.assignedSupervisor}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-2 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Comprehensive KPI Metric Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/90 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Palms</span>
                  <p className="text-base font-bold text-white font-mono mt-0.5">{selectedBlock.totalPalms}</p>
                  <span className="text-[10px] text-slate-500 font-mono">~138 palms/Ha</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Yield (Actual/Target)</span>
                  <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                    {selectedBlock.actualYieldTonnesMonth} / {selectedBlock.targetYieldTonnes} MT
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {Math.round(((selectedBlock.actualYieldTonnesMonth || 0) / (selectedBlock.targetYieldTonnes || 52.5)) * 100)}% of monthly target
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Pest Status</span>
                  <div className="mt-1">
                    <StatusBadge
                      label={selectedBlock.pestStatus}
                      variant={
                        selectedBlock.pestStatus === 'Clear'
                          ? 'optimal'
                          : selectedBlock.pestStatus === 'Low Alert'
                          ? 'warning'
                          : 'critical'
                      }
                      size="sm"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">IPM Surveillance</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Audit Status</span>
                  <div className="mt-1">
                    <StatusBadge
                      label={selectedBlock.inspectionStatus || 'Passed'}
                      variant={selectedBlock.inspectionStatus === 'Passed' ? 'optimal' : 'warning'}
                      size="sm"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">RSPO Compliance</span>
                </div>
              </div>

              {/* Editing Form vs Display */}
              {isEditing ? (
                <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Current Agronomic Activity</label>
                    <input
                      type="text"
                      value={editActivity}
                      onChange={(e) => setEditActivity(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Inspection Status</label>
                      <select
                        value={editInspectionStatus}
                        onChange={(e) => setEditInspectionStatus(e.target.value as FarmBlock['inspectionStatus'])}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Passed">Passed</option>
                        <option value="Pending Review">Pending Review</option>
                        <option value="Attention Required">Attention Required</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Pest/Disease Status</label>
                      <select
                        value={editPestStatus}
                        onChange={(e) => setEditPestStatus(e.target.value as FarmBlock['pestStatus'])}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Clear">Clear</option>
                        <option value="Low Alert">Low Alert</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Severe">Severe</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Field Agronomy Notes</label>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBlockEdit}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Supervisor & Workforce */}
                  <div className="flex flex-wrap items-center justify-between bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 gap-2">
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold">Assigned Supervisor</span>
                      <p className="font-bold text-white text-xs mt-0.5">{selectedBlock.assignedSupervisor}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold">Assigned Workforce</span>
                      <p className="font-bold text-white text-xs mt-0.5">{selectedBlock.assignedWorkersCount} Field Personnel</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold">Last Operation Date</span>
                      <p className="font-mono text-slate-300 text-xs mt-0.5">{selectedBlock.lastActivityDate || 'Current Cycle'}</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Block Status
                    </button>
                  </div>

                  {/* Active Operation & Agronomy Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 uppercase text-[10px] font-bold">Current Field Operation</span>
                      <p className="font-semibold text-emerald-300 text-xs mt-1">{selectedBlock.currentActivity}</p>
                    </div>

                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 uppercase text-[10px] font-bold">Agronomic Prescription / Notes</span>
                      <p className="text-slate-300 text-xs mt-1 italic leading-relaxed">
                        "{selectedBlock.notes}"
                      </p>
                    </div>
                  </div>

                  {/* Pest Incident Records for this Block (from existing data) */}
                  {selectedBlockPestReports.length > 0 && (
                    <div className="space-y-2 bg-rose-950/30 p-3.5 rounded-xl border border-rose-800/50">
                      <div className="flex items-center justify-between text-rose-300 font-bold text-xs">
                        <span className="flex items-center gap-1.5">
                          <Bug className="w-4 h-4 text-rose-400" />
                          <span>Active Pest & Disease Surveillance in {selectedBlock.id}</span>
                        </span>
                        <StatusBadge label={`${selectedBlockPestReports.length} RECORDED`} variant="critical" size="sm" />
                      </div>
                      <div className="space-y-1.5 mt-2">
                        {selectedBlockPestReports.map((p) => (
                          <div key={p.id} className="p-2.5 bg-slate-900/80 rounded-lg text-[11px] border border-rose-900/60 flex justify-between items-center">
                            <div>
                              <strong className="text-white">{p.pestDiseaseType}</strong> ({p.severity} Severity)
                              <p className="text-slate-400 text-[10px]">
                                Affecting {p.affectedAreaHa} Ha ({p.affectedTreesCount} palms) • Recommended: {p.recommendedTreatment}
                              </p>
                            </div>
                            <StatusBadge label={p.status} variant={p.status === 'Resolved' ? 'optimal' : 'warning'} size="sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Field Daily Reports for this Block (from existing data) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-slate-300 font-bold text-xs">
                      <span className="flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4 text-emerald-400" />
                        <span>Recent Field Work Logs ({selectedBlock.id})</span>
                      </span>
                    </div>

                    {selectedBlockDailyReports.length > 0 ? (
                      <div className="space-y-1.5">
                        {selectedBlockDailyReports.map((report) => (
                          <div
                            key={report.id}
                            className="p-2.5 bg-slate-950/70 rounded-xl text-[11px] border border-slate-800 flex justify-between items-center"
                          >
                            <div>
                              <strong className="text-white">{report.taskPerformed}</strong>
                              <span className="text-slate-400 ml-2">by {report.workerName}</span>
                              <p className="text-slate-400 text-[10px] font-mono">{report.date}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-emerald-300 font-bold">
                                {report.quantityCompleted} {report.unit}
                              </span>
                              <StatusBadge
                                label={report.supervisorApproval}
                                variant={report.supervisorApproval === 'Approved' ? 'optimal' : 'warning'}
                                size="sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-950/50 rounded-xl text-[11px] text-slate-400 border border-slate-800 text-center">
                        No recent specific work reports logged for {selectedBlock.id} in this view cycle.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Expand Estate Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBlock}
            className="bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden space-y-4 p-6 text-white animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Expand Plantation Estate (Add 25-Ha Module)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Block Title</label>
                <input
                  type="text"
                  required
                  placeholder={`Block ${blocks.length + 1} - Expansion Extension`}
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Area (Ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newBlockArea}
                    onChange={(e) => setNewBlockArea(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Planting Year</label>
                  <input
                    type="number"
                    required
                    value={newBlockPlantingYear}
                    onChange={(e) => setNewBlockPlantingYear(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Terrain / Soil</label>
                  <select
                    value={newBlockTerrain}
                    onChange={(e) => setNewBlockTerrain(e.target.value as FarmBlock['terrain'])}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Flat">Flat</option>
                    <option value="Undulating">Undulating</option>
                    <option value="Coastal Alluvial">Coastal Alluvial</option>
                    <option value="Peat">Peat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Supervisor</label>
                  <input
                    type="text"
                    required
                    value={newBlockSupervisor}
                    onChange={(e) => setNewBlockSupervisor(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-md cursor-pointer"
              >
                Confirm Block Addition
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
