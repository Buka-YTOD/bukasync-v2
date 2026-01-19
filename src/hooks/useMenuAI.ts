import { useState, useCallback } from 'react';
import { MenuItem } from '@/types/menu';
import { supabase } from '@/integrations/supabase/client';

interface AIDetails {
  fullDescription?: string;
  pairingSuggestions?: string[];
  nutritionHighlights?: string;
  preparationInfo?: string;
  commonAllergens?: string[];
  typicalIngredients?: string[];
}

interface SuggestedOption {
  name: string;
  label: string;
  choices: { value: string; label: string }[];
  required: boolean;
  reason: string;
}

interface UseMenuAIReturn {
  getItemDetails: (item: MenuItem) => Promise<AIDetails | null>;
  getSuggestedOptions: (item: MenuItem) => Promise<SuggestedOption[] | null>;
  isLoading: boolean;
  error: string | null;
}

// Simple in-memory cache to avoid repeated API calls
const detailsCache = new Map<string, AIDetails>();

export function useMenuAI(): UseMenuAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getItemDetails = useCallback(async (item: MenuItem): Promise<AIDetails | null> => {
    // Check cache first
    const cacheKey = `details-${item.id}`;
    if (detailsCache.has(cacheKey)) {
      return detailsCache.get(cacheKey)!;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('menu-ai', {
        body: {
          action: 'get_details',
          item: {
            name: item.name,
            description: item.description,
            category: item.category,
            tags: item.tags,
            allergens: item.allergens,
            ingredients: item.ingredients,
          },
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Cache the result
      detailsCache.set(cacheKey, data);
      return data as AIDetails;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get AI details';
      setError(message);
      console.error('useMenuAI error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSuggestedOptions = useCallback(async (item: MenuItem): Promise<SuggestedOption[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('menu-ai', {
        body: {
          action: 'suggest_options',
          item: {
            name: item.name,
            description: item.description,
            category: item.category,
            tags: item.tags,
          },
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data.suggestedOptions as SuggestedOption[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get suggested options';
      setError(message);
      console.error('useMenuAI error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getItemDetails,
    getSuggestedOptions,
    isLoading,
    error,
  };
}
