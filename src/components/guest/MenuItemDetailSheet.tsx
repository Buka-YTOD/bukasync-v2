import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Minus,
  Flame,
  Leaf,
  AlertTriangle,
  Sparkles,
  ChefHat,
  Wine,
  Heart,
  Info,
} from 'lucide-react';
import { MenuItem, SelectedCustomization, COMMON_ALLERGENS } from '@/types/menu';
import { useMenuAI } from '@/hooks/useMenuAI';

interface MenuItemDetailSheetProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    comment?: string,
    customizations?: SelectedCustomization[]
  ) => void;
  currentUserColor?: string;
}

export function MenuItemDetailSheet({
  item,
  isOpen,
  onClose,
  onAddToCart,
  currentUserColor,
}: MenuItemDetailSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState('');
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([]);
  const [aiDetails, setAiDetails] = useState<{
    fullDescription?: string;
    pairingSuggestions?: string[];
    nutritionHighlights?: string;
    preparationInfo?: string;
    commonAllergens?: string[];
    typicalIngredients?: string[];
  } | null>(null);

  const { getItemDetails, isLoading: aiLoading } = useMenuAI();

  // Reset state when item changes
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setComment('');
      setSelectedCustomizations([]);
      setAiDetails(null);

      // Fetch AI details
      getItemDetails(item).then((details) => {
        if (details) {
          setAiDetails(details);
        }
      });
    }
  }, [item, getItemDetails]);

  if (!item) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCustomizationChange = (
    optionId: string,
    optionName: string,
    value: string,
    label: string,
    priceModifier?: number
  ) => {
    setSelectedCustomizations((prev) => {
      const filtered = prev.filter((c) => c.optionId !== optionId);
      return [
        ...filtered,
        {
          optionId,
          optionName,
          selectedValue: value,
          selectedLabel: label,
          priceModifier,
        },
      ];
    });
  };

  const customizationPriceModifier = selectedCustomizations.reduce(
    (sum, c) => sum + (c.priceModifier || 0),
    0
  );

  const totalPrice = (item.price + customizationPriceModifier) * quantity;

  const handleAddToCart = () => {
    onAddToCart(
      item,
      quantity,
      comment.trim() || undefined,
      selectedCustomizations.length > 0 ? selectedCustomizations : undefined
    );
    onClose();
  };

  // Combine known allergens with AI-detected ones
  const allAllergens = [
    ...(item.allergens || []),
    ...(aiDetails?.commonAllergens || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  // Combine known ingredients with AI-detected ones
  const allIngredients = [
    ...(item.ingredients || []),
    ...(aiDetails?.typicalIngredients || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-3xl p-0 border-0"
      >
        <ScrollArea className="h-full">
          {/* Hero Image */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            {!item.available && (
              <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg py-2 px-4">
                  Sold Out
                </Badge>
              </div>
            )}
          </div>

          <div className="px-6 pb-32 -mt-12 relative">
            <SheetHeader className="text-left mb-4">
              <div className="flex items-start justify-between gap-4">
                <SheetTitle className="font-display text-2xl font-bold">
                  {item.name}
                </SheetTitle>
                <span className="font-display text-2xl font-bold text-primary shrink-0">
                  {formatPrice(item.price)}
                </span>
              </div>
            </SheetHeader>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="capitalize flex items-center gap-1"
                >
                  {tag === 'spicy' && <Flame className="w-3 h-3" />}
                  {tag === 'vegetarian' && <Leaf className="w-3 h-3" />}
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              {aiLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {aiDetails?.fullDescription || item.description}
                </p>
              )}
            </div>

            {/* AI-Powered Sections */}
            <AnimatePresence>
              {aiLoading ? (
                <div className="space-y-4 mb-6">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : (
                aiDetails && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 mb-6"
                  >
                    {/* Pairing Suggestions */}
                    {aiDetails.pairingSuggestions && aiDetails.pairingSuggestions.length > 0 && (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Wine className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-sm">
                            Perfect Pairings
                          </span>
                          <Sparkles className="w-3 h-3 text-primary/60" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {aiDetails.pairingSuggestions.map((pairing, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-background"
                            >
                              {pairing}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preparation Info */}
                    {aiDetails.preparationInfo && (
                      <div className="p-4 rounded-xl bg-secondary/50">
                        <div className="flex items-center gap-2 mb-2">
                          <ChefHat className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">
                            Preparation
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {aiDetails.preparationInfo}
                        </p>
                      </div>
                    )}

                    {/* Nutrition */}
                    {aiDetails.nutritionHighlights && (
                      <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-4 h-4 text-success" />
                          <span className="font-semibold text-sm">
                            Nutrition
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {aiDetails.nutritionHighlights}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )
              )}
            </AnimatePresence>

            {/* Allergens Warning */}
            {allAllergens.length > 0 && (
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="font-semibold text-sm">Allergen Info</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allAllergens.map((allergen) => (
                    <Badge
                      key={allergen}
                      variant="outline"
                      className="bg-warning/5 border-warning/30 text-warning-foreground capitalize"
                    >
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {allIngredients.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">Ingredients</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {allIngredients.join(', ')}
                </p>
              </div>
            )}

            {/* Customization Options */}
            {item.customizationOptions && item.customizationOptions.length > 0 && (
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold">Customize Your Order</h4>
                {item.customizationOptions.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {option.label}
                      {option.required && (
                        <span className="text-destructive text-xs">
                          Required
                        </span>
                      )}
                    </Label>
                    <RadioGroup
                      value={
                        selectedCustomizations.find(
                          (c) => c.optionId === option.id
                        )?.selectedValue || ''
                      }
                      onValueChange={(value) => {
                        const choice = option.choices.find(
                          (c) => c.value === value
                        );
                        if (choice) {
                          handleCustomizationChange(
                            option.id,
                            option.label,
                            value,
                            choice.label,
                            choice.priceModifier
                          );
                        }
                      }}
                      className="flex flex-wrap gap-2"
                    >
                      {option.choices.map((choice) => (
                        <div key={choice.value} className="flex items-center">
                          <RadioGroupItem
                            value={choice.value}
                            id={`${option.id}-${choice.value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`${option.id}-${choice.value}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          >
                            {choice.label}
                            {choice.priceModifier !== undefined &&
                              choice.priceModifier !== 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {choice.priceModifier > 0 ? '+' : ''}
                                  {formatPrice(choice.priceModifier)}
                                </span>
                              )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            )}

            {/* Special Instructions */}
            <div className="mb-6">
              <Label htmlFor="comment" className="mb-2 block">
                Special Instructions (Optional)
              </Label>
              <Textarea
                id="comment"
                placeholder="Any allergies, preferences, or special requests..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg">
          <div className="flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-secondary rounded-full p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="font-semibold w-6 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Add to Cart Button */}
            <Button
              className="flex-1 h-12 rounded-full font-semibold text-base"
              onClick={handleAddToCart}
              disabled={!item.available}
              style={
                currentUserColor
                  ? {
                      backgroundColor: currentUserColor,
                      borderColor: currentUserColor,
                    }
                  : undefined
              }
            >
              <Plus className="w-5 h-5 mr-2" />
              Add to Cart • {formatPrice(totalPrice)}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
