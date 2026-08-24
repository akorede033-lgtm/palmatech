import React, { useState } from 'react';
import { FarmBlock, HarvestRecord, ExpenseRecord, PestDiseaseReport } from '../types';
import {
  FileSpreadsheet,
  Download,
  Printer,
  TrendingUp,
  BarChart2,
  DollarSign,
  Bug,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ReportsAnalyticsViewProps {
  blocks: FarmBlock[];
  harvests: HarvestRecord[];
  expenses: ExpenseRecord[];
  pestReports: PestDiseaseReport[];
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  blocks = [],
  harvests = [],
  expenses = [],
  pestReports = [],
}) => {
  const [reportPeriod, setReportPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  const safeBlocks = blocks || [];
  const safeHarvests = harvests || [];
  const safeExpenses = expenses || [];
  const safePestReports = pestReports || [];

  const totalAreaHa = safeBlocks.reduce((sum, b) => sum + (b.areaHa || 0), 0);
  const totalHarvestTonnage = safeHarvests.reduce((sum, h) => sum + (h.quantityTonnes || 0), 0);
  const totalExpenses = safeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Estimations
  const estimatedFFBPricePerMT = 185; // $185 per MT FFB
  const totalEstimatedRevenue = totalHarvestTonnage * estimatedFFBPricePerMT;
  const netProfit = totalEstimatedRevenue - totalExpenses;
  const costPerHectare = totalAreaHa > 0 ? totalExpenses / totalAreaHa : 0;
  const yieldPerHectareMT = totalAreaHa > 0 ? totalHarvestTonnage / totalAreaHa : 0;

  // Block Yield Performance Ranking
  const blockPerformance = safeBlocks
    .map((block) => {
      const blockHarvests = safeHarvests.filter((h) => h && h.blockId === block.id);
      const harvestSum = blockHarvests.reduce((sum, h) => sum + (h.quantityTonnes || 0), 0);
      const yieldPerHa = block.areaHa > 0 ? harvestSum / block.areaHa : 0;
      return {
        ...block,
        harvestSum,
        yieldPerHa,
      };
    })
    .sort((a, b) => b.yieldPerHa - a.yieldPerHa);

  const topBlock = blockPerformance[0];
  const lowestBlock = blockPerformance[blockPerformance.length - 1];

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Block ID,Block Name,Area (Ha),Total Yield (MT),Yield/Ha (MT/Ha),Pest Status\n' +
      blockPerformance
        .map(
          (b) => `${b.id},"${b.name}",${b.areaHa},${b.harvestSum},${b.yieldPerHa.toFixed(2)},${b.pestStatus}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Palm_Estate_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Executive Plantation Reporting & Analytics</span>
          </h2>
          <p className="text-xs text-slate-500">
            Yield productivity, operational cost per hectare, net revenue margins, and block rankings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Management Report</span>
          </button>
        </div>
      </div>

      {/* Financial Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-950 text-white p-4 rounded-xl border border-emerald-900">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Est. FFB Gross Revenue</span>
          <div className="text-2xl font-bold mt-1 text-emerald-300">
            ${totalEstimatedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-200/80 mt-1">Based on ${estimatedFFBPricePerMT}/MT market price</p>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Operating Expenses</span>
          <div className="text-2xl font-bold mt-1 text-slate-100">
            ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">${costPerHectare.toFixed(2)} / Ha cost density</p>
        </div>

        <div className="bg-teal-900 text-white p-4 rounded-xl border border-teal-800">
          <span className="text-[10px] uppercase font-bold text-teal-300">Net Estate Profit</span>
          <div className="text-2xl font-bold mt-1 text-teal-200">
            ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-teal-200/80 mt-1">
            Margin: {totalEstimatedRevenue > 0 ? ((netProfit / totalEstimatedRevenue) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-amber-950 text-amber-100 p-4 rounded-xl border border-amber-900">
          <span className="text-[10px] uppercase font-bold text-amber-400">Average Yield Productivity</span>
          <div className="text-2xl font-bold mt-1 text-amber-300">{yieldPerHectareMT.toFixed(2)} MT / Ha</div>
          <p className="text-[11px] text-amber-200/80 mt-1">Target Commercial Rate: 2.20 MT/Ha/Mo</p>
        </div>
      </div>

      {/* Block Productivity Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Block Yield Ranking & Productivity Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">
              Comparing 20 commercial palm blocks across 500 hectares
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Top Performer: {topBlock?.id}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3">Rank & Block ID</th>
                <th className="p-3">Block Area</th>
                <th className="p-3">Palm Age</th>
                <th className="p-3">Total FFB Yield (MT)</th>
                <th className="p-3">Productivity (MT/Ha)</th>
                <th className="p-3">Pest Health</th>
                <th className="p-3">Supervisor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blockPerformance.map((block, idx) => (
                <tr key={block.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">
                    <span className="w-5 h-5 inline-flex items-center justify-center bg-slate-100 rounded-full text-[10px] mr-2">
                      #{idx + 1}
                    </span>
                    {block.id} ({block.name})
                  </td>
                  <td className="p-3 text-slate-700">{block.areaHa} Ha</td>
                  <td className="p-3 text-slate-600">{block.palmAgeYears} Years</td>
                  <td className="p-3 font-bold text-emerald-700">{block.harvestSum.toFixed(1)} MT</td>
                  <td className="p-3 font-bold text-slate-900">{block.yieldPerHa.toFixed(2)} MT/Ha</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        block.pestStatus === 'Severe'
                          ? 'bg-rose-100 text-rose-800'
                          : block.pestStatus === 'Clear'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {block.pestStatus}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">{block.assignedSupervisor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
