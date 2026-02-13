function deepMerge(target, source) {
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
          out[k] = deepMerge(target?.[k] ?? {}, v);
      } else {
          out[k] = v;
      }
  }
  return out;
}

function removePath(obj, path) {
  if (path.length === 0) return obj;

  const [key, ...rest] = path;

  if (!(key in obj)) return obj;

  if (rest.length === 0) {
      const { [key]: _, ...out } = obj;
      return out;
  }

  return {
      ...obj,
      [key]: removePath(obj[key], rest),
  };
}

export function applyPatch(original, patch) {
  let result = { ...original };

  // 1) removals
  if (patch.remove) {
      for (const path of patch.remove) {
          result = removePath(result, path);
      }
  }

  // 2) sets / updates
  if (patch.set) {
      result = deepMerge(result, patch.set);
  }

  return result;
}