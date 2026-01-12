import { useState } from 'react';
import { motion } from 'framer-motion';
import { GuestHeader } from '@/components/guest/GuestHeader';
import { CategoryTabs } from '@/components/guest/CategoryTabs';
import { MenuCard } from '@/components/guest/MenuCard';
import { SharedCartSheet } from '@/components/guest/SharedCartSheet';
import { ServiceButtons } from '@/components/guest/ServiceButtons';
import { JoinSessionModal } from '@/components/guest/JoinSessionModal';
import { GroupMembersBar } from '@/components/guest/GroupMembersBar';
import { PaymentSheet } from '@/components/guest/PaymentSheet';
import { useRealtimeGroupSession } from '@/hooks/useRealtimeGroupSession';
import { menuItems, categories } from '@/data/menuData';
import { toast } from 'sonner';

const TABLE_NUMBER = 7;
const RESTAURANT_NAME = "Mama's Kitchen";

export default function GuestMenu() {
  const [activeCategory, setActiveCategory] = useState('All');
  const session = useRealtimeGroupSession(TABLE_NUMBER);

  const filteredItems =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

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

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Join Session Modal */}
      <JoinSessionModal
        isOpen={!session.isJoined}
        tableNumber={TABLE_NUMBER}
        restaurantName={RESTAURANT_NAME}
        isLoading={session.isLoading}
        onCreateSession={handleCreateSession}
        onJoinSession={handleJoinSession}
      />

      <GuestHeader 
        restaurantName={RESTAURANT_NAME} 
        tableNumber={TABLE_NUMBER} 
        sessionCode={session.sessionCode}
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
        >
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
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
                onAddToCart={(menuItem) => {
                  session.addItem(menuItem);
                  toast.success(`Added ${menuItem.name}`, {
                    description: 'Your friends can see this in the shared cart',
                  });
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </main>

      <ServiceButtons tableNumber={TABLE_NUMBER} />

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
