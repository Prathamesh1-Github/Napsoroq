import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  LineChart,
  Settings,
  CheckCircle2,
  XCircle,
  ArrowRight,
  DollarSign,
  Gauge,
  ShieldCheck,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get real-time recommendations and predictive analytics for your manufacturing operations"
  },
  {
    icon: LineChart,
    title: "Performance Tracking",
    description: "Monitor OEE, production rates, and quality metrics with advanced visualization"
  },
  {
    icon: Settings,
    title: "Process Optimization",
    description: "Identify bottlenecks and optimize your manufacturing processes automatically"
  },
  {
    icon: DollarSign,
    title: "Cost Management",
    description: "Track and reduce operational costs with AI-driven recommendations"
  },
  {
    icon: Gauge,
    title: "Real-time Monitoring",
    description: "Get instant alerts and updates about your manufacturing operations"
  },
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    description: "Maintain high quality standards with predictive quality control"
  }
];

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for small manufacturers getting started with AI",
    price: "499",
    features: [
      "Basic AI Analytics",
      "Real-time Dashboard",
      "Production Tracking",
      "Email Support",
      "Up to 5 Users",
      "Basic Reporting"
    ],
    limitations: [
      "Limited AI Insights",
      "No Custom Analytics",
      "Basic Integrations"
    ]
  },
  {
    name: "Professional",
    description: "Ideal for growing manufacturers seeking advanced optimization",
    price: "999",
    popular: true,
    features: [
      "Advanced AI Analytics",
      "Custom Dashboards",
      "Predictive Maintenance",
      "Priority Support",
      "Up to 20 Users",
      "Advanced Reporting",
      "API Access",
      "Custom Integrations"
    ],
    limitations: []
  },
  {
    name: "Enterprise",
    description: "Full-scale solution for large manufacturing operations",
    price: "Custom",
    features: [
      "Full AI Capabilities",
      "Unlimited Dashboards",
      "Custom Development",
      "24/7 Support",
      "Unlimited Users",
      "Custom Analytics",
      "Full API Access",
      "White Labeling",
      "Dedicated Account Manager"
    ],
    limitations: []
  }
];

const comparisonFeatures = [
  {
    category: "Analytics",
    traditional: "Basic reporting and historical data",
    neuraops: "AI-powered predictive analytics and real-time insights"
  },
  {
    category: "Setup",
    traditional: "Complex implementation, requires IT team",
    neuraops: "Quick setup, no technical expertise needed"
  },
  {
    category: "Cost",
    traditional: "High upfront costs, complex pricing",
    neuraops: "Transparent pricing, immediate ROI"
  },
  {
    category: "Integration",
    traditional: "Requires IoT sensors and hardware",
    neuraops: "Works with manual data input, no sensors needed"
  },
  {
    category: "Support",
    traditional: "Limited support, additional costs",
    neuraops: "24/7 AI-powered support included"
  }
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary">
                Next-Gen Manufacturing Intelligence
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Transform Your Factory with
                <span className="text-primary"> AI-Powered</span> Insights
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Optimize operations, cut costs, and maximize profitability with intelligent manufacturing analytics designed for SMEs.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 rounded-lg border bg-card p-2 shadow-2xl"
          >
            <img
              src="https://source.unsplash.com/random/1200x600/?dashboard"
              alt="NeuraOps Dashboard"
              className="rounded-md w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Optimize Your Factory
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you monitor, analyze, and improve your manufacturing operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary">
              Why NeuraOps?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Smart Choice for Modern Manufacturing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how NeuraOps compares to traditional ERP solutions.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="font-medium">Feature</div>
                  <div className="font-medium text-center">Traditional ERP</div>
                  <div className="font-medium text-center">NeuraOps</div>
                </div>
                {comparisonFeatures.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-4 py-4 border-t"
                  >
                    <div className="text-sm">{item.category}</div>
                    <div className="text-sm text-center flex items-center justify-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      {item.traditional}
                    </div>
                    <div className="text-sm text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {item.neuraops}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary">
              Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your manufacturing needs. No hidden costs, no complex integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card
                  className={`relative h-full ${
                    plan.popular ? 'border-primary shadow-lg' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-0 right-0 flex justify-center">
                      <Badge className="bg-primary">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        ${plan.price}
                      </span>
                      {plan.price !== "Custom" && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      {plan.limitations.length > 0 && (
                        <div className="space-y-2 pt-4">
                          {plan.limitations.map((limitation, limitIndex) => (
                            <div
                              key={limitIndex}
                              className="flex items-center gap-2"
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span className="text-sm text-muted-foreground">
                                {limitation}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full mt-6"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Manufacturing?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of manufacturers who are already optimizing their operations with NeuraOps.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}