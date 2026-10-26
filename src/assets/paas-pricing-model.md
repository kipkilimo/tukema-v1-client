Here's a comprehensive JSON structure for tukema's progressive PaaS payment plans, designed for Vuetify v-cards:

```json
{
  "plans": [
    {
      "id": "basic_on_the_go",
      "name": "Basic / On The Go",
      "tier": "starter",
      "icon": "mdi-rocket",
      "color": "#2EBD85",
      "gradient": "linear-gradient(135deg, #2EBD85, #27ae60)",
      "badge": "Most Popular",
      "billingPeriod": "pay_per_deployment",
      "pricePerDeployment": 1.5,
      "currency": "USD",
      "features": [
        {
          "name": "Pay per deployment",
          "included": true,
          "description": "Only pay when you deploy a survey"
        },
        {
          "name": "KoboCollect Integration",
          "included": true,
          "description": "Full KoboCollect API access"
        },
        {
          "name": "Offline Data Collection",
          "included": true,
          "description": "GPS, Photo capture, offline sync"
        },
        {
          "name": "Real-time Dashboard",
          "included": true,
          "description": "Live WebSocket updates"
        },
        {
          "name": "XLSForm Upload",
          "included": true,
          "description": "Upload XLSX/CSV/JSON files"
        },
        {
          "name": "Email Support",
          "included": true,
          "description": "48-hour response time"
        },
        {
          "name": "QR Code Generation",
          "included": true,
          "description": "Branded QR codes for field teams"
        },
        {
          "name": "Response Export",
          "included": true,
          "description": "Excel, CSV, JSON formats"
        },
        {
          "name": "Team Members",
          "included": false,
          "limit": 1,
          "description": "Single user account"
        },
        {
          "name": "API Access",
          "included": false,
          "description": "REST & GraphQL API"
        },
        {
          "name": "Webhook Integration",
          "included": false,
          "description": "Custom webhooks"
        }
      ],
      "limits": {
        "maxSurveysPerYear": "unlimited",
        "maxResponsesPerSurvey": 1000,
        "maxFileSizeMB": 10,
        "dataRetentionDays": 30,
        "teamMembers": 1
      },
      "suitableFor": [
        "Individual researchers",
        "Small-scale surveys",
        "Occasional data collection",
        "Field testers"
      ],
      "ctaText": "Deploy First Survey",
      "ctaAction": "/dashboard/deploy"
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "tier": "professional",
      "icon": "mdi-office-building",
      "color": "#5E60CE",
      "gradient": "linear-gradient(135deg, #5E60CE, #4a4db3)",
      "badge": "Best Value",
      "billingPeriod": "yearly",
      "priceYearly": 4999,
      "priceMonthly": 499,
      "currency": "USD",
      "includedDeployments": 500,
      "additionalDeploymentPrice": 0.5,
      "features": [
        {
          "name": "500 Yearly Deployments",
          "included": true,
          "description": "500 survey deployments per year included"
        },
        {
          "name": "KoboCollect Integration",
          "included": true,
          "description": "Full KoboCollect API access"
        },
        {
          "name": "Offline Data Collection",
          "included": true,
          "description": "GPS, Photo capture, offline sync"
        },
        {
          "name": "Real-time Dashboard",
          "included": true,
          "description": "Live WebSocket updates"
        },
        {
          "name": "XLSForm Upload",
          "included": true,
          "description": "Upload XLSX/CSV/JSON files"
        },
        {
          "name": "Priority Support",
          "included": true,
          "description": "24/7 priority email & chat support"
        },
        {
          "name": "QR Code Generation",
          "included": true,
          "description": "Branded QR codes for field teams"
        },
        {
          "name": "Response Export",
          "included": true,
          "description": "Excel, CSV, JSON formats"
        },
        {
          "name": "Unlimited Team Members",
          "included": true,
          "description": "Add unlimited team members"
        },
        {
          "name": "Full API Access",
          "included": true,
          "description": "REST & GraphQL API"
        },
        {
          "name": "Webhook Integration",
          "included": true,
          "description": "Custom webhooks for automation"
        },
        {
          "name": "White-label Dashboard",
          "included": true,
          "description": "Custom branding"
        },
        {
          "name": "SLA Guarantee",
          "included": true,
          "description": "99.9% uptime SLA"
        },
        {
          "name": "Data Export Automation",
          "included": true,
          "description": "Scheduled exports to S3/Google Drive"
        },
        {
          "name": "Audit Logs",
          "included": true,
          "description": "Complete audit trail"
        },
        {
          "name": "SSO Integration",
          "included": true,
          "description": "SAML/OAuth SSO"
        }
      ],
      "limits": {
        "maxSurveysPerYear": "unlimited",
        "maxResponsesPerSurvey": "unlimited",
        "maxFileSizeMB": 50,
        "dataRetentionDays": "unlimited",
        "teamMembers": "unlimited",
        "includedDeployments": 500,
        "additionalDeploymentPrice": 0.5
      },
      "suitableFor": [
        "Large NGOs",
        "Government agencies",
        "Research institutions",
        "Enterprise organizations"
      ],
      "ctaText": "Contact Sales",
      "ctaAction": "/contact-sales"
    },
    {
      "id": "custom",
      "name": "Custom",
      "tier": "enterprise",
      "icon": "mdi-cog",
      "color": "#3B82F6",
      "gradient": "linear-gradient(135deg, #2A73C5, #1e5ea8)",
      "badge": "Tailored",
      "billingPeriod": "flexible",
      "currency": "USD",
      "features": [
        {
          "name": "Flexible Deployment Pricing",
          "included": true,
          "description": "Volume-based discounts"
        },
        {
          "name": "Custom Integration",
          "included": true,
          "description": "Connect to your existing systems"
        },
        {
          "name": "KoboCollect Integration",
          "included": true,
          "description": "Full KoboCollect API access"
        },
        {
          "name": "Offline Data Collection",
          "included": true,
          "description": "GPS, Photo capture, offline sync"
        },
        {
          "name": "Real-time Dashboard",
          "included": true,
          "description": "Live WebSocket updates"
        },
        {
          "name": "Dedicated Support",
          "included": true,
          "description": "24/7 dedicated support team"
        },
        {
          "name": "On-premise Deployment",
          "included": true,
          "description": "Self-hosted option available"
        },
        {
          "name": "Custom Feature Development",
          "included": true,
          "description": "Build features you need"
        },
        {
          "name": "Training & Onboarding",
          "included": true,
          "description": "Team training sessions"
        },
        {
          "name": "SLA Guarantee",
          "included": true,
          "description": "Custom SLA options"
        },
        {
          "name": "Unlimited Everything",
          "included": true,
          "description": "No artificial limits"
        }
      ],
      "limits": {
        "maxSurveysPerYear": "custom",
        "maxResponsesPerSurvey": "custom",
        "maxFileSizeMB": "custom",
        "dataRetentionDays": "custom",
        "teamMembers": "custom",
        "includedDeployments": "custom"
      },
      "suitableFor": [
        "Large-scale operations",
        "Specialized requirements",
        "Long-term partnerships",
        "Government contracts"
      ],
      "ctaText": "Schedule a Call",
      "ctaAction": "/schedule-call"
    }
  ],
  "addOns": [
    {
      "id": "additional_deployment",
      "name": "Additional Deployment",
      "price": 1.5,
      "unit": "per deployment",
      "description": "For Basic plan users needing more deployments",
      "icon": "mdi-plus-circle"
    },
    {
      "id": "priority_support",
      "name": "Priority Support",
      "price": 299,
      "unit": "per year",
      "description": "24/7 priority support with 2-hour response",
      "icon": "mdi-headset"
    },
    {
      "id": "white_label",
      "name": "White Label",
      "price": 999,
      "unit": "per year",
      "description": "Remove tukema branding",
      "icon": "mdi-format-paint"
    },
    {
      "id": "advanced_analytics",
      "name": "Advanced Analytics",
      "price": 499,
      "unit": "per year",
      "description": "AI-powered insights and predictions",
      "icon": "mdi-chart-line"
    }
  ],
  "comparisonTable": {
    "headers": ["Feature", "Basic", "Enterprise", "Custom"],
    "rows": [
      {
        "feature": "Price Model",
        "basic": "$14.00/deployment",
        "enterprise": "$4,999/year",
        "custom": "Custom pricing"
      },
      {
        "feature": "Included Deployments",
        "basic": "Pay as you go",
        "enterprise": "500/year",
        "custom": "Custom"
      },
      {
        "feature": "Team Members",
        "basic": "1",
        "enterprise": "Unlimited",
        "custom": "Custom"
      },
      {
        "feature": "Responses per Survey",
        "basic": "1,000",
        "enterprise": "Unlimited",
        "custom": "Custom"
      },
      {
        "feature": "Data Retention",
        "basic": "30 days",
        "enterprise": "Unlimited",
        "custom": "Custom"
      },
      {
        "feature": "API Access",
        "basic": "❌",
        "enterprise": "✅",
        "custom": "✅"
      },
      {
        "feature": "Priority Support",
        "basic": "❌",
        "enterprise": "✅",
        "custom": "✅"
      },
      {
        "feature": "White Label",
        "basic": "❌",
        "enterprise": "✅",
        "custom": "✅"
      },
      {
        "feature": "On-premise",
        "basic": "❌",
        "enterprise": "❌",
        "custom": "✅"
      }
    ]
  },
  "faq": [
    {
      "question": "What happens if I exceed my included deployments?",
      "answer": "Enterprise plan includes 500 deployments. Additional deployments are billed at $0.50 each. Basic plan is pay-per-deployment, so no overage fees."
    },
    {
      "question": "Can I switch between plans?",
      "answer": "Yes, you can upgrade or downgrade at any time. Changes take effect at the next billing cycle."
    },
    {
      "question": "Is there a free trial?",
      "answer": "Yes, we offer aTrack support ticketson all plans with full feature access."
    },
    {
      "question": "Do you offer discounts for non-profits?",
      "answer": "Yes, we offer 30% discount for registered NGOs and non-profit organizations."
    },
    {
      "question": "What payment methods do you accept?",
      "answer": "We accept all major credit cards, PayPal, and wire transfers for enterprise plans."
    }
  ]
}
```

## 🎨 **Vuetify v-card Component for Rendering**

```vue
<template>
  <v-container fluid>
    <v-row>
      <v-col v-for="plan in plans" :key="plan.id" cols="12" md="6" lg="4">
        <v-card
          :elevation="plan.tier === 'professional' ? 12 : 4"
          class="mx-auto"
          :class="{ 'featured-plan': plan.tier === 'professional' }"
          :style="{
            borderTop: `4px solid ${plan.color}`,
            transform:
              plan.tier === 'professional' ? 'scale(1.02)' : 'scale(1)',
          }"
        >
          <!-- Badge -->
          <v-badge
            v-if="plan.badge"
            color="warning"
            dot
            bordered
            class="position-absolute"
            style="top: 10px; right: 10px;"
          >
            {{ plan.badge }}
          </v-badge>

          <!-- Plan Header -->
          <v-card-title class="text-center pt-6">
            <v-icon :color="plan.color" size="48" class="mb-2">
              {{ plan.icon }}
            </v-icon>
            <h2 class="text-h5 font-weight-bold mt-2">
              {{ plan.name }}
            </h2>
          </v-card-title>

          <!-- Pricing -->
          <v-card-text class="text-center">
            <div v-if="plan.billingPeriod === 'pay_per_deployment'">
              <span class="text-h3 font-weight-bold">{{
                formatCurrency(plan.pricePerDeployment)
              }}</span>
              <span class="text-subtitle-1">/deployment</span>
            </div>
            <div v-else-if="plan.billingPeriod === 'yearly'">
              <span class="text-h3 font-weight-bold">{{
                formatCurrency(plan.priceYearly)
              }}</span>
              <span class="text-subtitle-1">/year</span>
              <div class="text-caption text-grey">
                or {{ formatCurrency(plan.priceMonthly) }}/month
              </div>
            </div>
            <div v-else>
              <span class="text-h4 font-weight-bold">Custom Pricing</span>
            </div>

            <!-- Included Deployments Info -->
            <v-chip
              v-if="plan.includedDeployments"
              class="mt-3"
              color="success"
              outlined
              size="small"
            >
              {{ plan.includedDeployments }} deployments included
            </v-chip>
          </v-card-text>

          <v-divider></v-divider>

          <!-- Features List -->
          <v-card-text>
            <v-list density="compact" bg-color="transparent">
              <v-list-item
                v-for="feature in plan.features"
                :key="feature.name"
                class="px-0"
              >
                <template v-slot:prepend>
                  <v-icon
                    :color="feature.included ? 'success' : 'grey'"
                    size="small"
                    class="mr-2"
                  >
                    {{
                      feature.included ? "mdi-check-circle" : "mdi-close-circle"
                    }}
                  </v-icon>
                </template>
                <v-list-item-title>
                  {{ feature.name }}
                  <v-tooltip
                    v-if="feature.description"
                    activator="parent"
                    location="top"
                  >
                    {{ feature.description }}
                  </v-tooltip>
                </v-list-item-title>
                <v-list-item-subtitle v-if="feature.limit">
                  Limit: {{ feature.limit }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-divider></v-divider>

          <!-- Suitable For -->
          <v-card-text>
            <div class="text-caption text-grey text-center">
              <v-icon size="small" class="mr-1">mdi-account-group</v-icon>
              Ideal for:
            </div>
            <div class="text-center text-body-2">
              {{ plan.suitableFor.join(", ") }}
            </div>
          </v-card-text>

          <!-- CTA Button -->
          <v-card-actions class="pb-6 px-6">
            <v-btn
              :color="plan.tier === 'professional' ? 'primary' : 'secondary'"
              :variant="plan.tier === 'professional' ? 'flat' : 'outlined'"
              block
              size="large"
              :to="plan.ctaAction"
            >
              {{ plan.ctaText }}
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add-ons Section -->
    <v-row class="mt-8">
      <v-col cols="12">
        <h3 class="text-h5 text-center mb-4">Optional Add-ons</h3>
      </v-col>
      <v-col v-for="addon in addOns" :key="addon.id" cols="12" sm="6" md="3">
        <v-card variant="outlined">
          <v-card-text class="text-center">
            <v-icon size="40" color="primary" class="mb-2">
              {{ addon.icon }}
            </v-icon>
            <h4 class="text-h6">{{ addon.name }}</h4>
            <div class="text-h6 font-weight-bold primary--text">
              {{ formatCurrency(addon.price) }}
              <span class="text-caption">{{ addon.unit }}</span>
            </div>
            <div class="text-caption text-grey mt-2">
              {{ addon.description }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" color="primary" block>Add to Plan</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- FAQ Section -->
    <v-row class="mt-8">
      <v-col cols="12">
        <h3 class="text-h5 text-center mb-4">Frequently Asked Questions</h3>
      </v-col>
      <v-col cols="12" md="6" v-for="(item, idx) in faq" :key="idx">
        <v-card variant="flat" class="mb-3">
          <v-card-text>
            <strong>{{ item.question }}</strong>
            <p class="text-body-2 text-grey mt-2 mb-0">{{ item.answer }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import plansData from "./plans.json";

const plans = ref(plansData.plans);
const addOns = ref(plansData.addOns);
const faq = ref(plansData.faq);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
};
</script>

<style scoped>
.featured-plan {
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

@media (max-width: 960px) {
  .featured-plan {
    transform: scale(1) !important;
  }
}
</style>
```

This pricing model is designed to be:

- **Progressive** - Scales from individual to enterprise
- **Transparent** - Clear features and limits
- **Flexible** - Custom plans for unique needs
- **Competitive** - Undercuts SurveyMonkey ($25k) while offering more features

The JSON is importable and ready for Vuetify v-card rendering! 🎯
