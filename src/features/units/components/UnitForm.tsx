import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import { createUnitSchema, type UnitFormData } from "../validation/unit.schema";

interface UnitFormProps {
  defaultValues?: Partial<UnitFormData>;
  loading?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (data: UnitFormData) => Promise<void> | void;
}

const UnitForm = ({
  defaultValues,
  loading = false,
  submitLabel = "Save Unit",
  onCancel,
  onSubmit,
}: UnitFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(createUnitSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      symbol: defaultValues?.symbol ?? "",
      description: defaultValues?.description ?? "",
      is_active: defaultValues?.is_active ?? true,
    },
  });
    
  return (
    <form
      onSubmit={handleSubmit((data: UnitFormData) => onSubmit(data))}
      className="flex flex-col h-full space-y-6"
    >
      <div className="flex-1 space-y-5">
        {/* Name Field */}
        <div>
          <Label className="text-slate-700 dark:text-slate-200 font-bold text-sm mb-1.5 flex items-center gap-1">
            Name <span className="text-rose-500">*</span>
          </Label>
          <Input
            placeholder="e.g. Bottle"
            className="h-11 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-indigo-500/20 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Symbol Field */}
        <div>
          <Label className="text-slate-700 dark:text-slate-200 font-bold text-sm mb-1.5 flex items-center gap-1">
            Symbol <span className="text-rose-500">*</span>
          </Label>
          <Input
            placeholder="e.g. btl"
            maxLength={10}
            className="h-11 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-indigo-500/20 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
            {...register("symbol")}
          />
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
            Short symbol to represent the unit.
          </p>
          {errors.symbol && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.symbol.message}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <Label className="text-slate-700 dark:text-slate-200 font-bold text-sm mb-1.5">
            Description
          </Label>
          <Input
            placeholder="e.g. Used for bottled products"
            className="h-11 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-indigo-500/20 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
            {...register("description")}
          />
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
            Optional description for this unit.
          </p>
          {errors.description && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Is Active Checkbox - only shown or preserved elegantly */}
        <div className="flex items-center gap-2.5 pt-2">
          <input
            type="checkbox"
            id="is_active"
            className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition"
            {...register("is_active")}
          />
          <label
            htmlFor="is_active"
            className="cursor-pointer text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 select-none transition"
          >
            Is Active / Enabled
          </label>
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
        <Button
          type="button"
          variant="secondary"
          className="h-11 px-6 rounded-xl text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          loading={loading}
          className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold shadow-sm transition"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default UnitForm;
