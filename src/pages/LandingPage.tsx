import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  QrCode, 
  Users, 
  Bell, 
  ChefHat, 
  LayoutDashboard,
  ArrowRight,
  Smartphone,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-restaurant.jpg';

const features = [
  {
    icon: QrCode,
    title: 'Instant QR Ordering',
    description: 'Guests scan a QR code and instantly access your digital menu. No app downloads required.',
  },
  {
    icon: Users,
    title: 'Group Orders',
    description: 'Everyone at the table can add to a shared basket and submit orders together.',
  },
  {
    icon: Bell,
    title: 'Service Requests',
    description: 'One tap to call a waiter, request the bill, or ask for assistance.',
  },
  {
    icon: LayoutDashboard,
    title: 'Live Dashboard',
    description: 'Real-time order tracking, menu management, and guest alerts in one place.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              BukaSync
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/menu">
              <Button variant="ghost">Demo Menu</Button>
            </Link>
            <Link to="/login">
              <Button variant="hero">
                Restaurant Login
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Smart Dining,{' '}
                <span className="text-gradient">Seamless Service</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-lg">
                Elevate your restaurant with QR-powered ordering, real-time kitchen sync, 
                and intelligent guest management. Built for modern Nigerian dining.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/menu">
                  <Button variant="hero" size="xl">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Try Guest Experience
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="xl">
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    View Dashboard
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 mt-12 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span>2-week Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  <span>NDPR Compliant</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-medium">
                <img
                  src={heroImage}
                  alt="Restaurant ordering with BukaSync"
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
              </div>
              
              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -left-4 top-1/4 bg-card p-4 rounded-xl shadow-medium border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">New Order</p>
                    <p className="text-xs text-muted-foreground">Table 7 • Just now</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute -right-4 bottom-1/4 bg-card p-4 rounded-xl shadow-medium border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">QR Scanned</p>
                    <p className="text-xs text-muted-foreground">Menu loaded</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Everything Your Restaurant Needs
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              From QR ordering to kitchen management, BukaSync handles it all
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl border border-border hover-lift"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-primary rounded-3xl p-8 md:p-16 text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-primary-foreground/90 max-w-xl mx-auto mb-8">
              Join the pilot program and experience the future of restaurant service.
              No setup fees during beta.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/login">
                <Button variant="secondary" size="xl">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">BukaSync</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 BukaSync. Built for Nigerian restaurants.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
