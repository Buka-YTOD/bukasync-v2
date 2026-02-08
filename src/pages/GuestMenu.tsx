import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GuestHeader } from '@/components/guest/GuestHeader';
import { CategoryTabs } from '@/components/guest/CategoryTabs';
import { MenuCard } from '@/components/guest/MenuCard';
import { MenuItemDetailSheet } from '@/components/guest/MenuItemDetailSheet';
import { AllergyFilter } from '@/components/guest/AllergyFilter';
import { SharedCartSheet } from '@/components/guest/SharedCartSheet';
import { ServiceButtons } from '@/components/guest/ServiceButtons';
import { JoinSessionModal } from '@/components/guest/JoinSessionModal';
import { GroupMembersBar } from '@/components/guest/GroupMembersBar';
import { PaymentSheet } from '@/components/guest/PaymentSheet';
import { useRealtimeGroupSession } from '@/hooks/useRealtimeGroupSession';
import { menuItems, categories } from '@/data/menuData';
import { MenuItem, Allergen, SelectedCustomization } from '@/types/menu';
import { toast } from 'sonner';

const RESTAURANT_NAME = "Mama's Kitchen";

export default function GuestMenu() {
  const [searchParams] = useSearchParams();
  const tableNumber = parseInt(searchParams.get('table') || '7', 10);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  
  const session = useRealtimeGroupSession(tableNumber);

  // Filter items by category and allergens
  const filteredItems = menuItems
    .filter((item) => activeCategory === 'All' || item.category === activeCategory)
    .filter((item) => {
      // If no allergens selected, show all items
      if (selectedAllergens.length === 0) return true;
      // Hide items that contain any of the selected allergens
      const itemAllergens = item.allergens || [];
      return !selectedAllergens.some((allergen) =>
        itemAllergens.includes(allergen)
      );
    });

  const handleCreateSession = async (name: string) => {
    try {
      const result = await session.createSession(name);
      toast.success(`Welcome, ${name}!`, {
        description: `Session code: ${result.code} — Share with friends to join!`,
      });
    } catch (error) {
      toast.error('Failed to create session', {
        description: 'Please try again.',
      });
    }
  };

  const handleJoinSession = async (code: string, name: string) => {
    try {
      await session.joinSession(code, name);
      toast.success(`Welcome, ${name}!`, {
        description: 'You joined the group session!',
      });
    } catch (error) {
      toast.error('Failed to join session', {
        description: 'Check the code and try again.',
      });
    }
  };

  const handleJoinExistingSession = async (name: string) => {
    try {
      await session.joinExistingSession(name);
      toast.success(`Welcome, ${name}!`, {
        description: 'You joined the table session!',
      });
    } catch (error) {
      toast.error('Failed to join session', {
        description: 'Please try again.',
      });
    }
  };

  const handleReplaceStaleSession = async (name: string) => {
    try {
      const result = await session.replaceStaleSession(name);
      if (result) {
        toast.success(`Welcome, ${name}!`, {
          description: `New session started! Code: ${result.code}`,
        });
      }
    } catch (error) {
      toast.error('Failed to start new session', {
        description: 'Please try again.',
      });
    }
  };

  const handleSubmitMyOrder = async () => {
    const order = await session.submitMyOrder();
    if (order) {
      toast.success('Your order submitted!', {
        description: 'Your items have been sent to the kitchen.',
      });
    }
  };

  const handleSubmitGroupOrder = async () => {
    const order = await session.submitGroupOrder();
    if (order) {
      toast.success('Group order submitted!', {
        description: 'All items sent to the kitchen.',
      });
    }
  };

  const handleViewDetails = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailSheetOpen(true);
  };

  const handleAddToCartFromDetail = (
    item: MenuItem,
    quantity: number,
    comment?: string,
    customizations?: SelectedCustomization[]
  ) => {
    // Add to cart (customizations stored in toast for now - full DB support coming)
    for (let i = 0; i < quantity; i++) {
      session.addItem(item);
    }
    
    const customizationText = customizations?.length
      ? ` (${customizations.map((c) => c.selectedLabel).join(', ')})`
      : '';
    
    toast.success(`Added ${quantity}x ${item.name}${customizationText}`, {
      description: comment
        ? `Note: "${comment}"`
        : 'Your friends can see this in the shared cart',
    });
  };

  const handleQuickAdd = (item: MenuItem) => {
    // If item has required customizations, open detail sheet
    const hasRequiredCustomizations = item.customizationOptions?.some(
      (opt) => opt.required
    );
    
    if (hasRequiredCustomizations) {
      handleViewDetails(item);
      toast.info(`${item.name} has options`, {
        description: 'Please customize your order',
      });
      return;
    }

    session.addItem(item);
    toast.success(`Added ${item.name}`, {
      description: 'Your friends can see this in the shared cart',
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-36">
      {/* Join Session Modal */}
      <JoinSessionModal
        isOpen={!session.isJoined}
        tableNumber={tableNumber}
        restaurantName={RESTAURANT_NAME}
        isLoading={session.isLoading}
        checkingSession={session.checkingSession}
        existingSession={session.existingSession}
        isStaleSession={session.isStaleSession}
        onCreateSession={handleCreateSession}
        onJoinSession={handleJoinSession}
        onJoinExistingSession={handleJoinExistingSession}
        onReplaceStaleSession={handleReplaceStaleSession}
      />

      <GuestHeader 
        restaurantName={RESTAURANT_NAME} 
        tableNumber={tableNumber} 
        sessionCode={session.sessionCode}
        submittedOrders={session.submittedOrders}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Group Members Bar */}
        {session.isJoined && session.members.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4"
          >
            <GroupMembersBar
              members={session.members}
              currentUserId={session.currentUser?.id || ''}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          
          {/* Allergy Filter */}
          <div className="flex items-center justify-between">
            <AllergyFilter
              selectedAllergens={selectedAllergens}
              onAllergensChange={setSelectedAllergens}
            />
            {selectedAllergens.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {filteredItems.length} items shown
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <MenuCard
                item={item}
                currentUserColor={session.currentUser?.color}
                onViewDetails={handleViewDetails}
                onAddToCart={handleQuickAdd}
              />
            </motion.div>
          ))}
        </motion.div>

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">
              No items match your filters. Try removing some allergen filters.
            </p>
          </motion.div>
        )}
      </main>

      <ServiceButtons tableNumber={tableNumber} />

      {/* Menu Item Detail Sheet */}
      <MenuItemDetailSheet
        item={selectedItem}
        isOpen={isDetailSheetOpen}
        onClose={() => {
          setIsDetailSheetOpen(false);
          setSelectedItem(null);
        }}
        onAddToCart={handleAddToCartFromDetail}
        currentUserColor={session.currentUser?.color}
      />

      {session.isJoined && (session.totalItems > 0 || session.submittedOrders.length > 0) && (
        <SharedCartSheet
          currentUser={session.currentUser}
          members={session.members}
          sharedCart={session.sharedCart}
          submittedOrders={session.submittedOrders}
          totalItems={session.totalItems}
          groupTotal={session.groupTotal}
          myTotal={session.myTotal}
          submittedTotal={session.submittedTotal}
          itemsByPerson={session.itemsByPerson}
          readyMembers={session.readyMembers}
          allReady={session.allReady}
          onUpdateQuantity={session.updateQuantity}
          onRemoveItem={session.removeItem}
          onToggleReady={session.toggleReady}
          onSubmitMyOrder={handleSubmitMyOrder}
          onSubmitGroupOrder={handleSubmitGroupOrder}
          onOpenPayment={session.openPayment}
        />
      )}

      {/* Payment Sheet */}
      <PaymentSheet
        isOpen={session.isPaymentOpen}
        onClose={session.closePayment}
        onEndSession={session.endSession}
        currentUser={session.currentUser}
        members={session.members}
        submittedOrders={session.submittedOrders}
        totalAmount={session.submittedTotal}
        myTotal={session.myTotal}
      />
    </div>
  );
}
