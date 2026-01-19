import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Filter, X, AlertTriangle } from 'lucide-react';
import { COMMON_ALLERGENS, Allergen } from '@/types/menu';

interface AllergyFilterProps {
  selectedAllergens: Allergen[];
  onAllergensChange: (allergens: Allergen[]) => void;
}

export function AllergyFilter({
  selectedAllergens,
  onAllergensChange,
}: AllergyFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAllergen = (allergen: Allergen) => {
    if (selectedAllergens.includes(allergen)) {
      onAllergensChange(selectedAllergens.filter((a) => a !== allergen));
    } else {
      onAllergensChange([...selectedAllergens, allergen]);
    }
  };

  const clearAll = () => {
    onAllergensChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={selectedAllergens.length > 0 ? 'default' : 'outline'}
            size="sm"
            className="rounded-full gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Allergies
            {selectedAllergens.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
              >
                {selectedAllergens.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Filter by Allergens</h4>
              {selectedAllergens.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  onClick={clearAll}
                >
                  Clear all
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Select allergens to hide items that may contain them
            </p>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_ALLERGENS.map((allergen) => (
                <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergen-${allergen}`}
                    checked={selectedAllergens.includes(allergen)}
                    onCheckedChange={() => toggleAllergen(allergen)}
                  />
                  <Label
                    htmlFor={`allergen-${allergen}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {allergen}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter badges */}
      <AnimatePresence>
        {selectedAllergens.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-1 flex-wrap"
          >
            {selectedAllergens.slice(0, 3).map((allergen) => (
              <Badge
                key={allergen}
                variant="secondary"
                className="capitalize gap-1 pr-1"
              >
                {allergen}
                <button
                  onClick={() => toggleAllergen(allergen)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {selectedAllergens.length > 3 && (
              <Badge variant="outline" className="text-muted-foreground">
                +{selectedAllergens.length - 3} more
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
