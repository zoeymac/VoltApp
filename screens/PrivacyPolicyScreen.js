import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, StatusBar, Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const GOLD = '#E8C468'
const CREAM = '#FDFAF3'
const CARD = '#FFFFFF'
const MUTED = '#999999'
const DARK = '#1A1A1A'
const BORDER = '#E8E8E8'

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionText}>{children}</Text>
  </View>
)

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSub}>Last updated: May 2026</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.introBanner}>
          <Ionicons name="shield-checkmark-outline" size={28} color={GOLD} />
          <Text style={styles.introText}>
            VoltRide is committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information in accordance with PIPEDA and Ontario law.
          </Text>
        </View>

        <Section title="1. Information We Collect">
          We collect information you provide directly, including your name, email address, phone number, payment information, and pickup/destination addresses when you book a ride or register a vehicle.{'\n\n'}
          We also automatically collect location data (with your permission), device identifiers, IP address, app usage data, and ride history to provide and improve our service.
        </Section>

        <Section title="2. How We Use Your Information">
          We use your information to:{'\n\n'}
          • Match you with nearby EV drivers or rentals{'\n'}
          • Process payments and manage your account{'\n'}
          • Provide real-time ride tracking and driver communication{'\n'}
          • Send trip confirmations, receipts, and safety alerts{'\n'}
          • Improve our platform, pricing models, and route efficiency{'\n'}
          • Comply with legal obligations in Ontario and Canada
        </Section>

        <Section title="3. Location Data">
          VoltRide requests access to your device's location only while the app is in use to enable ride matching and navigation. We do not sell your location data to third parties. You may disable location access in your device settings at any time, though this will limit core functionality.
        </Section>

        <Section title="4. Payment Information">
          All payment processing is handled by Stripe, a PCI-DSS Level 1 certified payment processor. VoltRide does not store your full card number or CVV. We retain only the last four digits and card brand for display purposes.
        </Section>

        <Section title="5. Sharing Your Information">
          We share limited information with:{'\n\n'}
          • Drivers — your first name and pickup location to complete a ride{'\n'}
          • Stripe — for payment processing{'\n'}
          • Service providers — hosting, analytics, and customer support tools bound by confidentiality{'\n'}
          • Law enforcement — only when required by applicable Canadian law{'\n\n'}
          We do not sell your personal information to advertisers or data brokers.
        </Section>

        <Section title="6. Data Retention">
          We retain your account data for as long as your account is active or as needed to provide services. Ride history is retained for 3 years for safety and compliance purposes. You may request deletion of your account and associated data by contacting us.
        </Section>

        <Section title="7. Your Rights (PIPEDA / Ontario)">
          Under Canada's Personal Information Protection and Electronic Documents Act (PIPEDA), you have the right to:{'\n\n'}
          • Access the personal information we hold about you{'\n'}
          • Correct inaccurate information{'\n'}
          • Withdraw consent for non-essential data use{'\n'}
          • Request deletion of your account data{'\n\n'}
          To exercise these rights, contact us at privacy@voltride.ca
        </Section>

        <Section title="8. Security">
          We implement industry-standard security measures including encryption in transit (TLS), encrypted storage for sensitive data, rate limiting, and regular security audits. No system is 100% secure; we encourage you to use a strong, unique password.
        </Section>

        <Section title="9. Children's Privacy">
          VoltRide is not intended for users under the age of 18. We do not knowingly collect personal information from minors. If you believe we have collected information from a minor, please contact us immediately.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this policy from time to time. We will notify you of material changes via email or in-app notification at least 14 days before they take effect.
        </Section>

        <Section title="11. Contact Us">
          Questions or concerns about this policy? Reach us at:{'\n\n'}
          VoltRide Inc.{'\n'}
          Toronto, Ontario, Canada{'\n'}
          privacy@voltride.ca
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: '#FAEDCB',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: CARD, justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  headerSub: { fontSize: 12, color: MUTED, marginTop: 2 },

  scroll: { padding: 16 },

  introBanner: {
    backgroundColor: '#FFF8E7', borderRadius: 14,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#F0E4B8',
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  introText: { flex: 1, fontSize: 14, color: DARK, lineHeight: 22 },

  section: {
    backgroundColor: CARD, borderRadius: 14,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 10 },
  sectionText: { fontSize: 14, color: MUTED, lineHeight: 22 },
})

