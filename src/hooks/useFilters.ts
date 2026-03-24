import { useSearchParams } from "react-router-dom";

export function useFilters() {
  const [params, setParams] = useSearchParams();

  const parse = (key: string) =>
    params.get(key)?.split(",") ?? [];

  const filters = {
    status: parse("status"),
    priority: parse("priority"),
    assignee: parse("assignee"),
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
  };

  const updateFilter = (
    key: string,
    values: string[] | string
  ) => {
    const next = new URLSearchParams(params);

    if (
      Array.isArray(values)
        ? values.length === 0
        : !values
    ) {
      next.delete(key);
    } else {
      next.set(
        key,
        Array.isArray(values)
          ? values.join(",")
          : values
      );
    }

    setParams(next);
  };

  const clearFilters = () => setParams({});

  const hasActiveFilters =
    Object.values(filters).some((v) =>
      Array.isArray(v)
        ? v.length > 0
        : Boolean(v)
    );

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}