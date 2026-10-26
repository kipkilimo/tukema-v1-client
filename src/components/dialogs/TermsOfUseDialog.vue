<!-- components/dialogs/TermsOfServiceDialog.vue -->
<template>
  <v-dialog v-model="dialogVisible" max-width="900px" scrollable persistent>
    <v-card>
      <!-- Header - tukema Cultural Museum Style -->
      <v-card-title
        class="text-h6 font-weight-bold pa-4"
        style="background: linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)"
      >
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <span class="tukema-icon-header mr-2">🏛️</span>
            <div>
              <span class="text-white" style="font-size: 18px">tukema</span>
              <span
                class="text-white"
                style="font-size: 14px; opacity: 0.8; margin-left: 8px"
                >|</span
              >
              <span
                class="text-white text-subtitle-2"
                style="opacity: 0.9; margin-left: 8px"
              >
                Terms of Service & Privacy
              </span>
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            @click="closeDialog"
            size="small"
            color="white"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div
          class="text-caption text-white"
          style="opacity: 0.8; font-size: 10px; margin-top: 4px"
        >
          Culture • Heritage • Posterity • tukema Cultural Museum
        </div>
      </v-card-title>

      <v-divider style="border-color: #2e86c1" />

      <v-card-text class="pa-4" style="max-height: 65vh">
        <!-- Platform Notice - tukema Cultural Museum Style -->
        <v-alert
          type="info"
          density="compact"
          class="mb-4"
          color="#1a5276"
          style="
            background: #eaf2f8 !important;
            border-left: 4px solid #1a5276 !important;
          "
        >
          <div class="d-flex align-center">
            <v-icon start color="#1a5276">mdi-information</v-icon>
            <span class="text-caption" style="color: #1a5276">
              <strong>Effective Date:</strong> January 1, 2026 &nbsp;|&nbsp;
              <strong>Version:</strong> 2.0 &nbsp;|&nbsp;
              <strong>tukema Cultural Museum</strong>
            </span>
          </div>
        </v-alert>

        <!-- Tab Navigation - tukema Cultural Museum Style -->
        <v-tabs v-model="activeTab" color="#1a5276" grow>
          <v-tab value="terms">
            <v-icon start size="18" color="#1a5276">mdi-file-sign</v-icon>
            <span style="color: #1a5276">Terms of Service</span>
          </v-tab>
          <v-tab value="privacy">
            <v-icon start size="18" color="#1a5276">mdi-shield-lock</v-icon>
            <span style="color: #1a5276">Privacy Policy</span>
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="mt-4">
          <!-- Terms of Service Tab -->
          <v-window-item value="terms">
            <div class="terms-content">
              <!-- Introduction with tukema Cultural Museum Branding -->
              <div class="text-body-2 mb-4">
                <div class="d-flex align-center mb-3">
                  <span class="tukema-badge">🏛️ tukema</span>
                  <span class="mx-2 text-grey">|</span>
                  <span
                    class="text-caption"
                    style="color: #1a5276; font-weight: 500"
                    >Preserving Culture • Celebrating Heritage</span
                  >
                </div>
                <p class="font-weight-bold" style="color: #1a5276">
                  INTRODUCTION
                </p>
                <p>
                  Welcome to the
                  <strong>tukema Cultural Museum</strong> platform. These terms
                  and conditions (the "<strong>Terms of Service</strong>" or
                  "<strong>Terms</strong>") are a legal agreement between You
                  ("<strong>You</strong>" or "<strong>User</strong>") and tukema
                  ("<strong>tukema</strong>," "<strong>we</strong>," or
                  "<strong>us</strong>") that governs Your access to and use of
                  the tukema cultural heritage platform.
                </p>
                <p>
                  tukema is a digital museum dedicated to
                  <strong>preserving, showcasing, and celebrating cultural
                  heritage</strong>, connecting communities, researchers, and
                  the public with the stories, traditions, and artifacts that
                  define our shared history. The platform serves as a living
                  archive for cultural preservation and education.
                </p>
                <p>
                  By explicitly accepting or accessing our Services, You accept
                  and agree to be bound by these Terms on behalf of Yourself and
                  any entity that You represent. If You are using the Services
                  on behalf of a business or entity, You acknowledge and agree
                  that You have such authority to bind such business or entity.
                  If You do not agree to these Terms of Service, You may not
                  access or use any of our Services.
                </p>
                <v-alert
                  type="warning"
                  density="compact"
                  class="mt-2"
                  color="#1a5276"
                  style="
                    background: #fdf2e9 !important;
                    border-left: 4px solid #e67e22 !important;
                  "
                >
                  <strong style="color: #1a5276">IMPORTANT:</strong>
                  <span style="color: #1a5276"
                    >SECTION 14 "MUTUAL ARBITRATION PROVISION"</span
                  >
                  <span style="color: #1a5276"
                    >CONTAINS A BINDING ARBITRATION AGREEMENT AND CLASS ACTION
                    WAIVER THAT AFFECT YOUR LEGAL RIGHTS.</span
                  >
                </v-alert>
              </div>

              <v-expansion-panels multiple>
                <v-expansion-panel
                  v-for="section in termsSections"
                  :key="section.title"
                >
                  <v-expansion-panel-title
                    class="font-weight-medium"
                    style="color: #1a5276"
                  >
                    <v-icon start size="18" color="#1a5276" class="mr-2"
                      >mdi-chevron-right</v-icon
                    >
                    {{ section.title }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div v-html="section.content" class="text-body-2"></div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <!-- Fine Print Footer -->
              <div
                class="text-caption mt-4 pt-2"
                style="border-top: 1px solid #d4e6f1"
              >
                <div class="d-flex justify-space-between flex-wrap">
                  <div>
                    <span style="color: #1a5276; font-weight: 600">tukema</span>
                    <span style="color: #5d6d7e; margin-left: 8px"
                      >Culture • Heritage • Posterity</span
                    >
                  </div>
                  <div style="color: #5d6d7e">
                    <span>© 2026 tukema</span>
                    <span class="mx-2">|</span>
                    <span>Cultural Museum</span>
                  </div>
                </div>
                <div class="mt-1" style="color: #5d6d7e; font-size: 9px">
                  <span>Email: legal@tukema.culture</span>
                  <span class="mx-2">|</span>
                  <span>Website: https://tukema.culture</span>
                  <span class="mx-2">|</span>
                  <span>Concept, design & crafted by Nelson Kilimo</span>
                </div>
              </div>
            </div>
          </v-window-item>

          <!-- Privacy Policy Tab -->
          <v-window-item value="privacy">
            <div class="privacy-content">
              <div class="d-flex align-center mb-3">
                <span class="tukema-badge">🏛️ tukema</span>
                <span class="mx-2 text-grey">|</span>
                <span
                  class="text-caption"
                  style="color: #1a5276; font-weight: 500"
                  >Your Data Privacy & Security</span
                >
              </div>

              <v-expansion-panels multiple>
                <v-expansion-panel
                  v-for="section in privacySections"
                  :key="section.title"
                >
                  <v-expansion-panel-title
                    class="font-weight-medium"
                    style="color: #1a5276"
                  >
                    <v-icon start size="18" color="#1a5276" class="mr-2"
                      >mdi-chevron-right</v-icon
                    >
                    {{ section.title }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div v-html="section.content" class="text-body-2"></div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <!-- Fine Print Footer -->
              <div
                class="text-caption mt-4 pt-2"
                style="border-top: 1px solid #d4e6f1"
              >
                <div class="d-flex justify-space-between flex-wrap">
                  <div>
                    <span style="color: #1a5276; font-weight: 600">tukema</span>
                    <span style="color: #5d6d7e; margin-left: 8px"
                      >Culture • Heritage • Posterity</span
                    >
                  </div>
                  <div style="color: #5d6d7e">
                    <span>© 2026 tukema</span>
                    <span class="mx-2">|</span>
                    <span>Cultural Museum</span>
                  </div>
                </div>
                <div class="mt-1" style="color: #5d6d7e; font-size: 9px">
                  <span>Email: privacy@tukema.culture</span>
                  <span class="mx-2">|</span>
                  <span>Website: https://tukema.culture/privacy</span>
                  <span class="mx-2">|</span>
                  <span>Data Protection Officer available</span>
                </div>
              </div>
            </div>
          </v-window-item>
        </v-window>

        <!-- Acceptance Footer -->
        <v-divider class="mt-4" style="border-color: #d4e6f1" />
        <div
          class="d-flex align-center justify-space-between mt-4 pa-2"
          style="background: #eaf2f8; border-radius: 8px"
        >
          <div class="text-caption" style="color: #1a5276">
            <v-icon color="#1a5276" size="small">mdi-check-circle</v-icon>
            <span class="ml-1"
              >Version 2.0 | Effective: January 1, 2026 | tukema Cultural
              Museum</span
            >
          </div>
          <div class="d-flex ga-2">
            <v-btn
              color="#1a5276"
              variant="flat"
              size="small"
              @click="acceptAll"
              :disabled="accepting"
              :loading="accepting"
              style="background: #1a5276 !important"
            >
              <v-icon start size="18">mdi-check</v-icon>
              I Accept All
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              @click="closeDialog"
              :disabled="accepting"
              style="color: #1a5276; border-color: #1a5276"
            >
              Close
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "accept"): void;
  (e: "close"): void;
}>();

const activeTab = ref("terms");
const accepting = ref(false);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const termsSections = [
  {
    title: "1. ELIGIBILITY",
    content: `
      <p>The tukema Cultural Museum Services are intended for visitors, researchers, cultural enthusiasts, educators, and the general public interested in cultural heritage. By accessing or using the Services, You represent and warrant that You are at least eighteen (18) years old or the age of majority in Your jurisdiction. If You are under 18 years of age, You must obtain Your parent or guardian's written permission to use the Services.</p>
      <p>By using our Services, You represent and warrant that You possess the legal right and ability to enter into these Terms of Service and to use the Services in accordance with these Terms.</p>
    `,
  },
  {
    title: "2. CHANGES TO TERMS OF SERVICE",
    content: `
      <p>We reserve the right to modify and update these Terms of Service at our discretion. Revised versions will be posted on the Website with an updated "Last Modified" date. We will provide reasonable notice of any material changes by emailing our Users prior to the changes becoming effective.</p>
      <p>Your continued use of the Services after any change means that You accept and agree to be bound by these Terms of Service, as revised.</p>
    `,
  },
  {
    title: "3. USER ACCOUNTS AND SERVICES",
    content: `
      <p><strong>User Accounts</strong></p>
      <p>Users are required to create a User account to access certain features of the tukema Cultural Museum platform, including saving collections, contributing to archives, and participating in community discussions. Using another User's Account without their explicit permission is strictly prohibited. You are solely responsible for how You use Your Account and must ensure the strength and security of Your Account password.</p>
      <p><strong>Accurate Information</strong></p>
      <p>You agree to provide true, accurate, current, and complete information about Yourself on any registration form. If You provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate Your Account.</p>
      <p><strong>System Requirements</strong></p>
      <p>Use of the Services requires a compatible device(s) and internet access. Your ability to access and use the Services may be affected by the performance of these factors.</p>
    `,
  },
  {
    title: "4. CHARGES AND PAYMENTS",
    content: `
      <p><strong>Free Access Model</strong></p>
      <p>tukema is committed to providing free access to cultural heritage collections and educational materials for the public, researchers, and cultural institutions. The platform is made possible through institutional support, partnerships, and community contributions.</p>
      <p><strong>Premium Services</strong></p>
      <p>Some services, such as high-resolution archival access, custom exhibitions, research partnerships, or certification programs, may be offered for a fee. Any paid services will be clearly indicated with pricing terms.</p>
      <p><strong>Cultural Institution & Academic Discounts</strong></p>
      <p>tukema offers 30-50% discounts for registered cultural institutions, museums, academic organizations, and community heritage groups. Contact <strong>support@tukema.culture</strong> for verification and discount application.</p>
    `,
  },
  {
    title: "5. TERM AND TERMINATION",
    content: `
      <p><strong>Effective Date</strong></p>
      <p>These Terms of Service become effective on the date on which You agree to these Terms by accessing or using the Website or registering for an Account, and will remain in effect until You stop using the Website or delete Your Account.</p>
      <p><strong>Cancellation and Termination</strong></p>
      <p>tukema may terminate your Account at any time without cause and for any reason without notice or liability to You. Upon termination, all licenses and rights granted to You under these Terms shall immediately cease.</p>
    `,
  },
  {
    title: "6. INTELLECTUAL PROPERTY RIGHTS",
    content: `
      <p><strong>tukema Intellectual Property</strong></p>
      <p>Subject to Your compliance with these Terms, tukema grants to You a non-exclusive, non-assignable, and non-sublicensable right and license to access and use the tukema Cultural Museum platform for educational, research, and cultural appreciation purposes.</p>
      <p>The tukema name, logo, trademarks, and all related names, logos, product and service names, designs, and slogans are trademarks of tukema or its affiliates or licensors. You shall not be entitled to use tukema's name or any trade name, trademark, or service mark belonging to tukema without the prior written consent.</p>
      <p><strong>Cultural Content & Artifacts</strong></p>
      <p>All cultural artifacts, images, stories, oral histories, and heritage materials displayed on tukema are protected by copyright, cultural heritage laws, and community rights. These materials are provided for personal, educational, and non-commercial use only. Commercial use, reproduction, or redistribution of cultural content requires explicit written permission.</p>
      <p><strong>Community Contributions</strong></p>
      <p>By contributing cultural content to tukema, You grant tukema a non-exclusive, worldwide, royalty-free license to preserve, display, and share Your contributions for cultural heritage purposes.</p>
    `,
  },
  {
    title: "7. PROHIBITED USES",
    content: `
      <p>You may use our Services only for lawful purposes and in accordance with these Terms of Service. You agree not to use the Services:</p>
      <ul>
        <li>In any way that violates any applicable law or regulation, including cultural heritage protection laws</li>
        <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors</li>
        <li>To misappropriate, deface, or disrespect cultural artifacts, traditions, or community heritage</li>
        <li>To send, knowingly receive, upload, download, use, or re-use any material that does not comply with these Terms of Service</li>
        <li>To impersonate or attempt to impersonate tukema, a team member, another User, or any other person or entity</li>
        <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Services</li>
      </ul>
    `,
  },
  {
    title: "8. CONFIDENTIALITY",
    content: `
      <p><strong>Definitions</strong></p>
      <p>"<strong>Confidential Information</strong>" includes without limitation: (a) all information clearly identified as confidential or proprietary; (b) Your research data and cultural documentation; and (c) the Party's business, operational, financial, technical, and proprietary information. Confidential Information of tukema includes any code or non-public documentation relating to the Services.</p>
      <p><strong>Obligations</strong></p>
      <p>Neither Party shall use Confidential Information of the other Party for any purpose other than the purposes described in these Terms. Each Party agrees to safeguard, protect, and keep secret the Confidential Information of the other Party.</p>
      <p><strong>Usage Data</strong></p>
      <p>tukema may use de-identified data related to Your use of the Services to improve its product and service offerings. tukema may also use or disclose such usage data in aggregate form for any purpose permitted by applicable law.</p>
    `,
  },
  {
    title: "9. PRIVACY NOTICE",
    content: `
      <p>In accordance with applicable data protection laws, tukema will notify individual Users of its publicly posted Privacy Notice available at <strong>https://tukema.culture/privacy</strong> and will process Personal Information as described in such Privacy Notice.</p>
      <p>tukema is committed to protecting the privacy and security of your personal information. All data collected is used solely for the purpose of providing cultural heritage services and improving the visitor experience.</p>
    `,
  },
  {
    title: "10. WARRANTY DISCLAIMER",
    content: `
      <p>When using the Services, information will be transmitted in such a way that may be beyond our control. As such, we make no warranty concerning the delay, failure, interruption, or corruption of any data, content, or other information transmitted in connection with the use of the Services.</p>
      <p><strong>WE PROVIDE THE SERVICES "AS IS" AND "AS AVAILABLE" WITHOUT ANY REPRESENTATION OR WARRANTY, EXPRESS, IMPLIED, OR STATUTORY. WE SPECIFICALLY DISCLAIM ANY IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</strong></p>
    `,
  },
  {
    title: "11. LIMITATION OF LIABILITY",
    content: `
      <p><strong>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL tukema BE LIABLE FOR ANY DAMAGES FOR LOSS OR CORRUPTION OF DATA OR PROGRAMS, DAMAGES (INCLUDING, WITHOUT LIMITATION, ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES) ARISING OUT OF OR IN CONNECTION WITH ANY USE OF, THE INABILITY TO USE, OR THE RESULTS OF USE OF THE SERVICES.</strong></p>
      <p>IN NO EVENT WILL tukema'S TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, OR CAUSES OF ACTION EXCEED THE AMOUNT THAT YOU HAVE PAID tukema IN THE LAST SIX (6) MONTHS.</p>
    `,
  },
  {
    title: "12. INDEMNIFICATION",
    content: `
      <p>You agree to indemnify, defend, and hold tukema and its officers, directors, employees, agents, affiliates, representatives, and assigns (collectively, the "<strong>Indemnified Parties</strong>") harmless from and against any and all losses, damages, liabilities, and costs incurred by the Indemnified Parties in connection with any claim arising out of any breach by You of these Terms or any claims arising from Your use of the Services.</p>
    `,
  },
  {
    title: "13. GOVERNING LAW; VENUE",
    content: `
      <p>These Terms of Service and any claim arising out of these Terms will be governed by and construed in accordance with the laws of the Republic of Kenya, without regard to any conflict of laws principles. You agree and hereby submit to the exclusive personal jurisdiction and venue of the courts of Nairobi, Kenya, with respect to such matters.</p>
    `,
  },
  {
    title: "14. MUTUAL ARBITRATION PROVISION",
    content: `
      <p><strong>YOU AND tukema MUTUALLY AGREE TO RESOLVE ANY JUSTICIABLE DISPUTES EXCLUSIVELY THROUGH FINAL AND BINDING ARBITRATION INSTEAD OF A COURT OR JURY TRIAL.</strong></p>
      <p><strong>Notice of Disputes</strong></p>
      <p>If either Party initiates arbitration, the initiating Party must notify the other Party in writing via certified mail, return receipt requested, or hand delivery within the applicable statute of limitations period. Any demand for arbitration by You must be delivered to:</p>
      <p><strong>tukema Cultural Museum</strong><br>
      Attn: Legal Department<br>
      Email: legal@tukema.culture<br>
      Nairobi, Kenya</p>
      <p><strong>Class Action Waiver</strong></p>
      <p><strong>YOU AND tukema MUTUALLY AGREE THAT BY ENTERING INTO THIS MUTUAL ARBITRATION PROVISION, BOTH PARTIES WAIVE THEIR RIGHT TO HAVE ANY DISPUTE OR CLAIM BROUGHT, HEARD, OR ARBITRATED AS A CLASS ACTION OR COLLECTIVE ACTION.</strong></p>
    `,
  },
  {
    title: "15. FORCE MAJEURE",
    content: `
      <p>tukema will not be responsible for delays or failure of performance resulting from acts beyond its reasonable control, including but not limited to acts of God, riots, acts of war, failures of internet or other communication systems, power outages, terrorism, epidemics, pandemics, new governmental regulations, flood, fire, earthquake, or other disasters.</p>
    `,
  },
  {
    title: "16. ENTIRE AGREEMENT",
    content: `
      <p>These Terms of Service constitute the sole and entire agreement between You and tukema and supersede all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, to the extent they relate in any way to the Services.</p>
    `,
  },
  {
    title: "17. CONTACT INFORMATION",
    content: `
      <p>For questions or concerns related to these Terms, please contact us at:</p>
      <p><strong>tukema Cultural Museum</strong><br>
      Email: legal@tukema.culture<br>
      Website: https://tukema.culture<br>
      Nairobi, Kenya<br>
      Concept, design & crafted by Nelson Kilimo</p>
    `,
  },
];

const privacySections = [
  {
    title: "Our Commitment to Your Privacy",
    content: `
      <p>tukema is committed to protecting the privacy and security of your personal information. As a cultural heritage platform, we understand the importance of data confidentiality and the sensitive nature of cultural knowledge and community stories.</p>
      <p>This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the tukema Cultural Museum platform. We are committed to compliance with all applicable data protection laws, including the Kenya Data Protection Act, 2019.</p>
      <div class="d-flex align-center mt-2" style="background: #eaf2f8; padding: 8px 12px; border-radius: 4px;">
        <span style="color: #1a5276; font-weight: 500;">🏛️ Data Protection Officer:</span>
        <span style="color: #1a5276; margin-left: 8px;">privacy@tukema.culture</span>
      </div>
    `,
  },
  {
    title: "Information We Collect",
    content: `
      <p>tukema collects the following categories of personal data to provide and improve our cultural heritage services:</p>
      <ul>
        <li><strong>Account Information:</strong> Name, email address, institution/organization, role, cultural interests</li>
        <li><strong>Usage Data:</strong> Visit history, collection views, saved artifacts, learning preferences</li>
        <li><strong>Technical Data:</strong> IP address, device type, browser information, and access logs</li>
        <li><strong>Contribution Data:</strong> Cultural stories, photographs, oral histories, and heritage documentation you share</li>
        <li><strong>Communication Data:</strong> Contact history, support requests, and feedback</li>
      </ul>
      <p class="text-grey mt-2"><em>All data is collected with your consent and in compliance with applicable data protection laws.</em></p>
    `,
  },
  {
    title: "How We Use Your Information",
    content: `
      <p>We use your data for the following purposes:</p>
      <ul>
        <li>Provide, maintain, and improve tukema cultural heritage services</li>
        <li>Authenticate users and manage access to collections and archives</li>
        <li>Preserve and showcase cultural contributions</li>
        <li>Generate reports and analytics for platform improvement</li>
        <li>Ensure platform security and prevent unauthorized access</li>
        <li>Comply with legal and regulatory requirements</li>
        <li>Communicate important updates, new exhibitions, and cultural events</li>
        <li>Support cultural preservation and educational missions</li>
      </ul>
    `,
  },
  {
    title: "Data Sharing & Disclosure",
    content: `
      <p>We share data only as necessary for service operations and in accordance with applicable law:</p>
      <ul>
        <li><strong>With Service Providers:</strong> Technical partners and hosting providers essential for platform operation</li>
        <li><strong>With Cultural Institutions:</strong> If you are accessing tukema through an institutional partnership</li>
        <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your data</li>
        <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
      </ul>
      <p><strong>We do not sell, rent, or trade personal data to third parties for marketing purposes.</strong></p>
      <p class="mt-2" style="color: #1a5276; font-size: 11px;">
        <strong>Note:</strong> tukema is committed to supporting cultural preservation while protecting individual and community privacy.
      </p>
    `,
  },
  {
    title: "Data Security",
    content: `
      <p>We implement robust security measures to protect your data:</p>
      <ul>
        <li>End-to-end encryption (TLS 1.3) for all data transmission</li>
        <li>Role-based access control (RBAC) with fine-grained permissions</li>
        <li>Multi-factor authentication (MFA) for all users</li>
        <li>Regular security audits and penetration testing</li>
        <li>Data backups with encrypted storage</li>
        <li>Secure development practices (OWASP guidelines)</li>
        <li>Incident response procedures for data breaches</li>
        <li>Cultural heritage data protection standards compliance</li>
      </ul>
    `,
  },
  {
    title: "Data Retention",
    content: `
      <p>We retain data according to the following schedules:</p>
      <ul>
        <li><strong>Active Data:</strong> Retained for duration of your account and active participation</li>
        <li><strong>User Accounts:</strong> Retained until access is revoked or 2 years of inactivity</li>
        <li><strong>Cultural Contributions:</strong> Retained for preservation purposes in accordance with cultural heritage guidelines</li>
        <li><strong>Audit Logs:</strong> Retained for 7 years for legal and compliance purposes</li>
        <li><strong>Research Data:</strong> Retained in de-identified form for cultural research purposes</li>
      </ul>
      <p>Users may request data deletion via the Data Protection Officer at <strong>privacy@tukema.culture</strong></p>
    `,
  },
  {
    title: "Your Rights",
    content: `
      <p>Under the Kenya Data Protection Act, 2019 and applicable data protection laws, you have the following rights:</p>
      <ul>
        <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
        <li><strong>Right to Rectify:</strong> Correct inaccurate or incomplete data</li>
        <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal and cultural preservation obligations)</li>
        <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
        <li><strong>Right to Object:</strong> Object to certain data processing activities</li>
        <li><strong>Right to Portability:</strong> Receive your data in a structured format</li>
        <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
      </ul>
      <p>Submit requests to: <strong>privacy@tukema.culture</strong></p>
      <p class="mt-2" style="color: #1a5276; font-size: 11px;">
        <strong>Response Time:</strong> We will respond to all requests within 30 days.
      </p>
    `,
  },
  {
    title: "Cookies & Tracking",
    content: `
      <p>tukema uses essential cookies for:</p>
      <ul>
        <li>Authentication and session management</li>
        <li>User preferences and cultural interests</li>
        <li>Security and fraud prevention</li>
        <li>Analytics to improve platform performance</li>
        <li>Tracking collection views and saved artifacts</li>
      </ul>
      <p>We do not use tracking cookies for advertising or third-party marketing. We respect your privacy and do not engage in intrusive tracking practices.</p>
      <p class="mt-2" style="color: #1a5276; font-size: 11px;">
        <strong>Cookie Preferences:</strong> You can manage cookie settings in your browser preferences at any time.
      </p>
    `,
  },
  {
    title: "International Data Transfers",
    content: `
      <p>Data may be transferred to:</p>
      <ul>
        <li>Service providers in other countries (with appropriate safeguards)</li>
        <li>International cultural institutions and heritage partners</li>
        <li>Users accessing the platform from different jurisdictions</li>
      </ul>
      <p>All international transfers comply with applicable data protection laws and are protected by appropriate safeguards, including standard contractual clauses where required.</p>
    `,
  },
  {
    title: "Children's Privacy",
    content: `
      <p>tukema is designed for cultural enthusiasts, researchers, educators, and the general public. Our services are not intended for children under the age of 18 without parental supervision. We do not knowingly collect personal information from individuals under 18 years of age.</p>
      <p>If you are under 18, please do not use the tukema platform without parental consent. If we become aware that we have collected personal information from a child under 18 without verification of parental consent, we will take steps to remove that information from our servers.</p>
    `,
  },
  {
    title: "Changes to This Policy",
    content: `
      <p>We may update this policy periodically to reflect changes in our practices or legal requirements. Significant changes will be notified via:</p>
      <ul>
        <li>Email notification to registered users</li>
        <li>Platform announcement on login</li>
        <li>Updated version number and date on this page</li>
      </ul>
      <p>Continued use of tukema constitutes acceptance of updated policies.</p>
      <p class="mt-2" style="color: #1a5276; font-size: 11px;">
        <strong>Last Updated:</strong> January 1, 2026
      </p>
    `,
  },
  {
    title: "Contact Information",
    content: `
      <div style="background: #eaf2f8; padding: 16px; border-radius: 8px; border-left: 4px solid #1a5276;">
        <p><strong>📧 Data Protection Officer</strong></p>
        <p>Email: <a href="mailto:privacy@tukema.culture" style="color: #1a5276;">privacy@tukema.culture</a></p>
        <p>Website: <a href="https://tukema.culture/privacy" style="color: #1a5276;">https://tukema.culture/privacy</a></p>
        <p><strong>Institutional Oversight:</strong><br>
        tukema Cultural Museum<br>
        Nairobi, Kenya</p>
        <p><strong>Complaints:</strong><br>
        If you believe your data privacy rights have been violated, contact the Data Protection Officer or the Office of the Data Protection Commissioner, Kenya.</p>
        <p><strong>tukema Team:</strong><br>
        Concept, design & crafted by Nelson Kilimo</p>
      </div>
    `,
  },
];

const acceptAll = () => {
  accepting.value = true;

  setTimeout(() => {
    accepting.value = false;
    const acceptanceData = {
      acceptedAt: new Date().toISOString(),
      version: "2.0",
      type: "terms_of_service",
      platform: "tukema-cultural-museum",
    };

    try {
      localStorage.setItem("termsAcceptance", JSON.stringify(acceptanceData));
      localStorage.setItem("termsAccepted", "true");
      localStorage.setItem("termsAcceptedAt", acceptanceData.acceptedAt);
      localStorage.setItem("privacyAccepted", "true");
      localStorage.setItem("termsVersion", "2.0");
    } catch (err) {
      console.error("Failed to save acceptance:", err);
    }

    emit("accept");
    dialogVisible.value = false;
  }, 500);
};

const closeDialog = () => {
  emit("close");
  dialogVisible.value = false;
};
</script>

<style scoped>
.terms-content,
.privacy-content {
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 4px;
}

.terms-content::-webkit-scrollbar,
.privacy-content::-webkit-scrollbar {
  width: 4px;
}

.terms-content::-webkit-scrollbar-track,
.privacy-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.terms-content::-webkit-scrollbar-thumb,
.privacy-content::-webkit-scrollbar-thumb {
  background: #2e86c1;
  border-radius: 4px;
}

.terms-content::-webkit-scrollbar-thumb:hover,
.privacy-content::-webkit-scrollbar-thumb:hover {
  background: #1a5276;
}

:deep(.v-expansion-panel-title) {
  background-color: #f8fafc;
  font-size: 0.9rem;
  padding: 12px 16px;
  font-family: var(
    --font-family,
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif
  );
}

:deep(.v-expansion-panel-title:hover) {
  background-color: #eaf2f8;
}

:deep(.v-expansion-panel-text) {
  padding: 12px 16px;
  font-size: 0.85rem;
  line-height: 1.6;
  font-family: var(
    --font-family,
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif
  );
}

:deep(ul) {
  margin-top: 8px;
  margin-bottom: 8px;
  padding-left: 1.5rem;
}

:deep(p) {
  margin-top: 8px;
  margin-bottom: 8px;
}

:deep(strong) {
  color: #1a5276;
}

:deep(.text-grey) {
  color: #5d6d7e !important;
}

:deep(.v-tab) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  font-family: var(
    --font-family,
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif
  );
}

:deep(.v-tab--selected) {
  font-weight: 600;
}

.tukema-badge {
  display: inline-block;
  background: #1a5276;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.tukema-icon-header {
  font-size: 24px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  :deep(.v-expansion-panel-title) {
    font-size: 0.8rem;
    padding: 10px 12px;
  }

  :deep(.v-expansion-panel-text) {
    font-size: 0.8rem;
    padding: 10px 12px;
  }

  .tukema-badge {
    font-size: 10px;
    padding: 2px 8px;
  }
}
</style>