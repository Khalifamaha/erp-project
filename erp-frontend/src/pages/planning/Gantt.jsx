import { useEffect, useRef, useState } from "react";
import Gantt from "frappe-gantt";
import "frappe-gantt/dist/frappe-gantt.css";
import toast from "react-hot-toast";
import { Sparkles, RefreshCw } from "lucide-react";
import {
  useGanttData,
  useGenererAutoPlanning,
  useConfirmerPlanning,
} from "../../hooks/usePlanning";
import PageHeader from "../../components/common/PageHeader";

const VIEW_MODES = [
  { value: "Day", label: "Jour" },
  { value: "Week", label: "Semaine" },
  { value: "Month", label: "Mois" },
];

export default function GanttPage() {
  const containerRef = useRef(null);
  const ganttInstance = useRef(null);
  const [viewMode, setViewMode] = useState("Week");
  const { data, isLoading, refetch } = useGanttData();
  const genererAuto = useGenererAutoPlanning();
  const confirmerPlanning = useConfirmerPlanning();

  const taches = data?.taches || [];

  useEffect(() => {
    if (!containerRef.current || taches.length === 0) return;

    const ganttTasks = taches.map((t) => ({
      id: t.id_gantt,
      name: t.text,
      start: t.start_date,
      end: t.end_date,
      progress: Math.round((t.progress || 0) * 100),
      custom_class: `gantt-statut-${t.statut}`,
    }));

    containerRef.current.innerHTML = "";
    ganttInstance.current = new Gantt(containerRef.current, ganttTasks, {
      view_mode: viewMode,
      language: "fr",
      bar_height: 28,
      bar_corner_radius: 6,
      padding: 20,
      on_click: (task) => {
        const original = taches.find((t) => t.id_gantt === task.id);
        if (original) {
          toast(
            `${task.name}\n${original.resource} — ${original.quantite_planifiee} pcs`,
            { icon: "🗓️" }
          );
        }
      },
    });
  }, [taches, viewMode]);

  const handleGenererAuto = async () => {
    try {
      const result = await genererAuto.mutateAsync({
        date_debut: new Date().toISOString().slice(0, 10),
      });
      toast.success(result.message || "Planning généré");
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Planning — Vue Gantt"
        subtitle="Visualisation temps réel des ordres de fabrication planifiés"
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-ink-300 bg-white p-1">
              {VIEW_MODES.map((v) => (
                <button
                  key={v.value}
                  onClick={() => setViewMode(v.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    viewMode === v.value
                      ? "bg-brand-500 text-white"
                      : "text-ink-700 hover:bg-ink-100"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
              title="Rafraîchir"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleGenererAuto}
              disabled={genererAuto.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-400 to-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition disabled:opacity-50"
            >
              <Sparkles size={16} />
              Générer automatiquement
            </button>
          </div>
        }
      />

      {/* Légende */}
      <div className="flex flex-wrap gap-3">
        {[
          { statut: "brouillon", label: "Brouillon", color: "#9CA3AF" },
          { statut: "confirme", label: "Confirmé", color: "#3B82F6" },
          { statut: "en_cours", label: "En cours", color: "#F59E0B" },
          { statut: "termine", label: "Terminé", color: "#10B981" },
          { statut: "reporte", label: "Reporté", color: "#F97316" },
          { statut: "annule", label: "Annulé", color: "#EF4444" },
        ].map((s) => (
          <div key={s.statut} className="flex items-center gap-1.5 text-xs text-ink-700">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </div>
        ))}
      </div>

      {/* Gantt */}
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center text-sm text-ink-500">
            Chargement du planning...
          </div>
        ) : taches.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
            <Sparkles size={32} className="text-ink-300" />
            <p className="text-sm text-ink-500">
              Aucun planning pour le moment.
            </p>
            <button
              onClick={handleGenererAuto}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Générer automatiquement depuis les OF
            </button>
          </div>
        ) : (
          <div className="gantt-wrapper p-4" ref={containerRef} />
        )}
      </div>

      <style>{`
        .gantt-wrapper .gantt .grid-header {
          fill: var(--color-canvas, #f5f6fb);
        }
        .gantt-wrapper .gantt .bar {
          fill: #7d80f5;
          rx: 6;
        }
        .gantt-wrapper .gantt .bar-progress {
          fill: #5b5fef;
        }
        .gantt-wrapper .gantt .bar-label {
          fill: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
        }
        .gantt-wrapper .gantt .gantt-statut-confirme .bar { fill: #93c5fd; }
        .gantt-wrapper .gantt .gantt-statut-confirme .bar-progress { fill: #3B82F6; }
        .gantt-wrapper .gantt .gantt-statut-en_cours .bar { fill: #fcd34d; }
        .gantt-wrapper .gantt .gantt-statut-en_cours .bar-progress { fill: #F59E0B; }
        .gantt-wrapper .gantt .gantt-statut-termine .bar { fill: #6ee7b7; }
        .gantt-wrapper .gantt .gantt-statut-termine .bar-progress { fill: #10B981; }
        .gantt-wrapper .gantt .gantt-statut-reporte .bar { fill: #fdba74; }
        .gantt-wrapper .gantt .gantt-statut-annule .bar { fill: #fca5a5; }
        .gantt-wrapper .gantt .today-highlight {
          fill: rgba(91, 95, 239, 0.08);
        }
      `}</style>
    </div>
  );
}