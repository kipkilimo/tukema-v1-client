<template>
  <div class="invoice-pdf" ref="pdfInvoice">
    <!-- Header -->
    <header>
      <img :src="logoImg" alt="tukema" class="logo" />
      <div class="title">Receipt</div>
    </header>

    <!-- Receipt Details - Matching Anthropic style -->
    <section class="receipt-details">
      <div class="detail-row">
        <span class="label">Invoice number</span>
        <span class="value">{{ invoice.number }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Receipt number</span>
        <span class="value">{{
          invoice.receiptNumber || generateReceiptNumber()
        }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Date paid</span>
        <span class="value">{{ invoice.date }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Payment method</span>
        <span class="value">{{ invoice.paymentMethod || "Link" }}</span>
      </div>
    </section>

    <!-- Addresses -->
    <section class="addresses">
      <div class="bill-to">
        <strong>Bill to</strong>
        <span>{{ invoice.customerName || "Customer" }}</span>
        <span v-if="invoice.customerEmail">{{ invoice.customerEmail }}</span>
      </div>

      <div class="company">
        <strong>tukema, Inc.</strong>
        <span>548 Market Street</span>
        <span>PMB 90375</span>
        <span>San Francisco, California 94104</span>
        <span>United States</span>
        <span>support@tukema.culture</span>
      </div>
    </section>

    <!-- Paid Amount -->
    <div class="paid-amount">
      <strong>${{ formatAmount(parseFloat(totalAmount)) }}</strong>
      <span>paid on {{ invoice.date }}</span>
    </div>

    <!-- Invoice Items Table -->
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Unit price</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>{{ invoice.plan || "Custom Plan" }}</strong>
            <div class="description-detail">
              {{ billingCycle || "Annual Subscription" }}
            </div>
          </td>
          <td>1</td>
          <td>${{ formatAmount(parseFloat(totalAmount)) }}</td>
          <td>${{ formatAmount(parseFloat(totalAmount)) }}</td>
        </tr>
        <!-- Additional features -->
        <tr v-for="feature in features" :key="feature.id">
          <td>
            <span>{{ feature.name }}</span>
            <div class="description-detail">{{ feature.description }}</div>
          </td>
          <td>1</td>
          <td>${{ formatAmount(feature.price) }}</td>
          <td>${{ formatAmount(feature.price) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="label-cell">Subtotal</td>
          <td>${{ formatAmount(parseFloat(totalAmount)) }}</td>
        </tr>
        <tr>
          <td colspan="3" class="label-cell">Total</td>
          <td class="total-amount">
            ${{ formatAmount(parseFloat(totalAmount)) }}
          </td>
        </tr>
        <tr>
          <td colspan="3" class="label-cell">Amount paid</td>
          <td class="total-amount">
            ${{ formatAmount(parseFloat(totalAmount)) }}
          </td>
        </tr>
      </tfoot>
    </table>

    <!-- Footer -->
    <footer>
      <div class="footer-reference">
        {{ invoice.receiptNumber || generateReceiptNumber() }} · ${{
          formatAmount(parseFloat(totalAmount))
        }}
        paid on {{ invoice.date }}
      </div>
      <div class="footer-page">Page 1 of 1</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import logoImg from "@/assets/tukema-logo.png";

interface Feature {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface Invoice {
  number: string;
  date: string;
  plan: string;
  billingCycle: string;
  customerName?: string;
  customerEmail?: string;
  paymentMethod?: string;
  receiptNumber?: string;
}

const props = defineProps<{
  invoice: Invoice;
  amount: string | number;
  features: Feature[];
  billingCycle: string;
}>();

const pdfInvoice = ref<HTMLElement | null>(null);

const totalAmount = computed(() => {
  if (typeof props.amount === "string") {
    return props.amount.replace("$", "").replace(/,/g, "");
  }
  return String(props.amount);
});

const formatAmount = (value: number): string => {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const generateReceiptNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${year}${month}${day}-${random}`;
};

// Expose the ref for PDF generation
defineExpose({
  pdfInvoice,
});
</script>

<style scoped>
.invoice-pdf {
  width: 794px;
  min-height: 1123px;
  background: #ffffff;
  padding: 48px 56px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  color: #1a1a1a;
  font-size: 13px;
  line-height: 1.6;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Header */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 16px;
}

.logo {
  height: 48px;
  width: auto;
  object-fit: contain;
}

.title {
  font-size: 32px;
  font-weight: 300;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

/* Receipt Details - Anthropic style */
.receipt-details {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 4px 20px;
  margin-bottom: 32px;
  padding: 16px 0;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
}

.detail-row {
  display: contents;
}

.detail-row .label {
  color: #666666;
  font-weight: 400;
  padding: 2px 0;
}

.detail-row .value {
  color: #1a1a1a;
  font-weight: 500;
  padding: 2px 0;
}

/* Addresses */
.addresses {
  display: flex;
  justify-content: space-between;
  margin-bottom: 36px;
  padding: 16px 0;
  border-bottom: 1px solid #e8e8e8;
  font-size: 12px;
}

.bill-to,
.company {
  display: flex;
  flex-direction: column;
  gap: 1px;
  color: #444444;
}

.bill-to strong,
.company strong {
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: 2px;
}

/* Paid Amount */
.paid-amount {
  margin: 8px 0 28px;
  font-size: 22px;
  font-weight: 300;
  color: #1a1a1a;
}

.paid-amount strong {
  font-weight: 600;
}

.paid-amount span {
  font-weight: 400;
  color: #666666;
  margin-left: 8px;
  font-size: 16px;
}

/* Table */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-size: 12px;
}

thead {
  border-bottom: 2px solid #e0e0e0;
}

thead th {
  text-align: left;
  padding: 8px 8px 6px 0;
  font-weight: 600;
  color: #555555;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

thead th:not(:first-child) {
  text-align: right;
}

tbody td {
  padding: 12px 8px 12px 0;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
  color: #1a1a1a;
}

tbody td:not(:first-child) {
  text-align: right;
}

tbody td strong {
  font-weight: 600;
}

.description-detail {
  font-size: 11px;
  color: #888888;
  font-weight: 400;
  margin-top: 1px;
}

/* Table Footer */
tfoot td {
  padding: 8px 8px 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

tfoot td:not(:first-child) {
  text-align: right;
}

tfoot tr:last-child td {
  border-bottom: none;
}

tfoot .label-cell {
  font-weight: 400;
  color: #555555;
  text-align: right;
  padding-right: 20px;
}

tfoot .total-amount {
  font-weight: 700;
  color: #1a1a1a;
  font-size: 13px;
}

/* Footer */
footer {
  margin-top: 48px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #888888;
}

.footer-reference {
  color: #666666;
}

.footer-page {
  color: #999999;
}

/* Print Styles */
@media print {
  .invoice-pdf {
    width: 100%;
    min-height: auto;
    padding: 40px;
    margin: 0;
  }

  table {
    page-break-inside: avoid;
  }

  thead {
    display: table-header-group;
  }

  tfoot {
    display: table-footer-group;
  }
}
</style>
