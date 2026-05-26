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

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionText}>{children}</Text>
  </View>
)

export default function TermsOfServiceScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <Text style={styles.headerSub}>Last updated: May 2026</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.introBanner}>
          <Ionicons name="document-text-outline" size={28} color={GOLD} />
          <Text style={styles.introText}>
            By using VoltRide, you agree to these Terms of Service. Please read them carefully. These terms govern your use of the VoltRide platform in Canada.
          </Text>
        </View>

        <Section title="1. Acceptance of Terms">
          By creating a VoltRide account or using our services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use VoltRide. You must be at least 18 years old to use this service.
        </Section>

        <Section title="2. The VoltRide Platform">
          VoltRide is a technology platform that connects riders with independent electric vehicle drivers and EV rental owners in Toronto and the Greater Toronto Area. VoltRide is not a transportation company and does not provide transportation services directly. All drivers are independent contractors.
        </Section>

        <Section title="3. Rider Responsibilities">
          As a rider, you agree to:{'\n\n'}
          • Provide accurate pickup and destination information{'\n'}
          • Treat drivers with respect and professionalism{'\n'}
          • Pay all applicable fares, fees, and cancellation charges{'\n'}
          • Not engage in illegal activity during rides{'\n'}
          • Wear a seatbelt at all times{'\n'}
          • Not request rides for others without their consent{'\n'}
          • Report any safety concerns immediately
        </Section>

        <Section title="4. Driver Responsibilities">
          As a driver, you agree to:{'\n\n'}
          • Maintain a valid Ontario driver's licence and vehicle insurance{'\n'}
          • Keep your vehicle clean, safe, and in good working condition{'\n'}
          • Complete all background check requirements{'\n'}
          • Follow all Ontario traffic laws{'\n'}
          • Treat riders with respect and professionalism{'\n'}
          • Only accept rides when physically able to drive safely{'\n'}
          • Maintain a minimum rating of 4.5 stars
        </Section>

        <Section title="5. Fares and Payments">
          Fares are calculated based on distance, time, vehicle type, and demand. VoltRide retains a 3% platform fee from each completed ride. Drivers receive 97% of the fare. All payments are processed securely through Stripe. Prices shown are estimates; final fare may vary based on actual route taken.
        </Section>

        <Section title="6. Cancellations">
          Riders may cancel a ride at no charge before a driver is assigned. After driver assignment:{'\n\n'}
          • Cancellation within 2 minutes: No fee{'\n'}
          • Driver more than 5 minutes away: $3.00 fee{'\n'}
          • Driver less than 5 minutes away: $5.00 fee{'\n'}
          • Driver arriving: $8.00 fee{'\n\n'}
          Drivers may cancel rides in exceptional circumstances without penalty.
        </Section>

        <Section title="7. Ratings and Reviews">
          Both riders and drivers are rated after each completed ride. Maintaining a high rating is important for continued access to the platform. VoltRide reserves the right to suspend or terminate accounts with consistently low ratings.
        </Section>

        <Section title="8. Prohibited Conduct">
          You may not use VoltRide to:{'\n\n'}
          • Engage in any illegal activity{'\n'}
          • Harass, threaten, or discriminate against other users{'\n'}
          • Damage vehicles or property{'\n'}
          • Provide false information{'\n'}
          • Attempt to circumvent the platform's payment system{'\n'}
          • Use the platform for commercial purposes without authorization
        </Section>

        <Section title="9. Safety">
          Your safety is our top priority. VoltRide conducts background checks on all drivers and vehicle inspections. However, VoltRide cannot guarantee the conduct of any user. If you feel unsafe during a ride, contact emergency services immediately by calling 911.
        </Section>

        <Section title="10. Limitation of Liability">
          VoltRide provides its platform on an "as is" basis. To the maximum extent permitted by Ontario law, VoltRide is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid for the ride in question.
        </Section>

        <Section title="11. Governing Law">
          These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any disputes shall be resolved in the courts of Ontario.
        </Section>

        <Section title="12. Changes to Terms">
          We may update these Terms from time to time. We will notify you of significant changes via email or in-app notification at least 14 days before they take effect. Continued use of VoltRide after changes constitutes acceptance.
        </Section>

        <Section title="13. Contact Us">
          Questions about these Terms? Contact us at:{'\n\n'}
          VoltRide Inc.{'\n'}
          Toronto, Ontario, Canada{'\n'}
          legal@voltride.ca
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

