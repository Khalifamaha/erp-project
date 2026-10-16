import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Select from "react-select";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import client from "../../api/client";
import PageHeader from "../../components/common/PageHeader";

const TYPES_OPERATION = [
  { value: "usinage", label: "Usinage" },
  { value: "decoupe", label: "Découpe" },
  { value: "soudure", label: "Soudure" },
  { value: "assemblage", label: "Assemblage" },
  { value: "pliage", label: "Pliage" },
  { value: "controle", label: "Contrôle qualité" },
  { value: "finition", label: "Finition" },
  { value: "emballage", label: "Emballage" },
  { value: "autre", label: "Autre" },
];

async function getProduits() {
  const { data } = await client.get("/inventory/produits/", {
    params: { page_size: 500 },
  });
  return data;
}
async function getMachines() {
  const { data } = await client.get("/production/machines/", {
    params: { page_size: 200 },
  });
  return data;
}
async function createGamme(payload) {
  const { data } = await client.post("/production/gammes/", payload);
  return data;
}

export default function GammeForm() {
  const navigate = useNavigate();

  const { data: produitsData } = useQuery({
    queryKey: ["produits", { page_size: 500 }],
    queryFn: getProduits,
  });
  const { data: machinesData } = useQuery({
    queryKey: ["machines", { page_size: 200 }],
    queryFn: getMachines,
  });
  const produitOptions = (produitsData?.results ?? produitsData ?? []).map(
    (p) => ({ value: p.id, label: `${p.reference} — ${p.designation}` })
  );
  const machineOptions = (machinesData?.results ?? machinesData ?? []).map(
    (m) => ({ value: m.id, label: `${m.code} — ${m.nom}` })
  );

  const creerGamme = useMutation({ mutationFn: createGamme });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      produit: null,
      nom: "",
      version: 1,
      description: "",
      operations: [
        {
          machine: null,
          ordre: 1,
          nom: "",
          type_operation: "usinage",
          temps_unitaire_min: 1,
          temps_reglage_min: 0,
          operateurs_requis: 1,
          instruction: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "operations",
  });

  const onSubmit = async (values) => {
    if (!values.produit) {
      toast.error("Sélectionne un produit");
      return;
    }
    if (values.operations.some((o) => !o.machine)) {
      toast.error("Chaque opération doit avoir une machine");
      return;
    }
    const payload = {
      produit: values.produit.value,
      nom: values.nom,
      version: values.version,
      description: values.description,
      operations: values.operations.map((o) => ({
        machine: o.machine.value,
        ordre: o.ordre,
        nom: o.nom,
        type_operation: o.type_operation,
        temps_unitaire_min: o.temps_unitaire_min,
        temps_reglage_min: o.temps_reglage_min || 0,
        operateurs_requis: o.operateurs_requis || 1,
        instruction: o.instruction || "",
      })),
    };
    try {
      await creerGamme.mutateAsync(payload);
      toast.success("Gamme opératoire créée");
      navigate("/gammes");
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        typeof data === "object"
          ? Object.values(data).flat().join(" — ")
          : "Une erreur est survenue";
      toast.error(msg);
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <PageHeader title="Nouvelle gamme opératoire" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-ink-100 bg-white p-6"
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Produit *
            </label>
            <Controller
              name="produit"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={produitOptions}
                  placeholder="Rechercher un produit..."
                  classNamePrefix="rs"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Version
            </label>
            <input
              type="number"
              {...register("version", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="col-span-3">
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Nom de la gamme *
            </label>
            <input
              {...register("nom", { required: "Le nom est requis" })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.nom && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.nom.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-ink-900">
              Opérations
            </h3>
            <button
              type="button"
              onClick={() =>
                append({
                  machine: null,
                  ordre: fields.length + 1,
                  nom: "",
                  type_operation: "usinage",
                  temps_unitaire_min: 1,
                  temps_reglage_min: 0,
                  operateurs_requis: 1,
                  instruction: "",
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100"
            >
              <Plus size={14} />
              Ajouter une opération
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-2 rounded-lg border border-ink-100 p-3"
              >
                <div className="col-span-1">
                  <label className="mb-1 block text-xs text-ink-500">
                    Ordre
                  </label>
                  <input
                    type="number"
                    {...register(`operations.${index}.ordre`, {
                      required: true,
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-lg border border-ink-300 px-2 py-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div className="col-span-3">
                  <label className="mb-1 block text-xs text-ink-500">
                    Nom opération
                  </label>
                  <input
                    {...register(`operations.${index}.nom`, {
                      required: true,
                    })}
                    className="w-full rounded-lg border border-ink-300 px-2 py-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div className="col-span-3">
                  <label className="mb-1 block text-xs text-ink-500">
                    Machine
                  </label>
                  <Controller
                    name={`operations.${index}.machine`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={machineOptions}
                        placeholder="Machine..."
                        classNamePrefix="rs"
                      />
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs text-ink-500">
                    Type
                  </label>
                  <select
                    {...register(`operations.${index}.type_operation`)}
                    className="w-full rounded-lg border border-ink-300 px-2 py-2 text-sm outline-none focus:border-brand-500"
                  >
                    {TYPES_OPERATION.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="mb-1 block text-xs text-ink-500">
                    Tps unit. (min)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`operations.${index}.temps_unitaire_min`, {
                      required: true,
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-lg border border-ink-300 px-2 py-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="mb-1 block text-xs text-ink-500">
                    Tps réglage
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`operations.${index}.temps_reglage_min`, {
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-lg border border-ink-300 px-2 py-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div className="col-span-1 flex items-end justify-center">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="rounded p-1.5 text-ink-500 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={2}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate("/gammes")}
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Créer la gamme
          </button>
        </div>
      </form>
    </div>
  );
}