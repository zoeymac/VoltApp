import { useState, useRef } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  Dimensions, Animated, StatusBar, Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const { height, width } = Dimensions.get('window')

const GOLD = '#E8C468'
const CREAM = '#FDFAF3'
const DARK = '#1A1A1A'
const MUTED = '#999999'

const slides = [
  {
    id: 1,
    icon: 'car-sport-outline',
    iconColor: GOLD,
    title: 'Welcome to VoltRide',
    subtitle: 'Toronto\'s first 100% electric ride-sharing platform. Zero emissions, zero compromise.',
  },
  {
    id: 2,
    icon: 'leaf',
    iconColor: '#22c55e',
    title: 'Drive Green',
    subtitle: 'Every ride saves CO₂. Track your environmental impact and help build a cleaner Toronto.',
  },
  {
    id: 3,
    icon: 'car',
    iconColor: GOLD,
    title: 'Ride, Rent or Drive',
    subtitle: 'Book a ride, rent an EV by the day, or earn money driving your electric vehicle.',
  },
  {
    id: 4,
    icon: 'shield-checkmark',
    iconColor: '#3b82f6',
    title: 'Safe & Reliable',
    subtitle: 'All drivers verified, all vehicles inspected. Your safety is our priority.',
  },
]

export default function WelcomeScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current

  const goToSlide = (index) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setCurrentSlide(index)
      slideAnim.setValue(20)
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start()
    })
  }

  const next = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1)
    } else {
      navigation.navigate('Login')
    }
  }

  const slide = slides[currentSlide]
  const isLast = currentSlide === slides.length - 1

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* LOGO */}
      <View style={styles.logoWrap}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>⚡</Text>
        </View>
        <Text style={styles.logoText}>VoltRide</Text>
        <Text style={styles.logoTagline}>Toronto's Electric Future</Text>
      </View>

      {/* SLIDE CONTENT */}
      <Animated.View style={[
        styles.slideContent,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        <View style={[styles.iconCircle, { backgroundColor: `${slide.iconColor}22` }]}>
          <Ionicons name={slide.icon} size={48} color={slide.iconColor} />
        </View>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
      </Animated.View>

      {/* DOTS */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goToSlide(i)}>
            <View style={[styles.dot, i === currentSlide && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* BUTTONS */}
      <View style={styles.buttonsWrap}>
        <TouchableOpacity style={styles.primaryBtn} onPress={next}>
          <Text style={styles.primaryBtnText}>
            {isLast ? 'Get Started as Rider' : 'Next'}
          </Text>
          <Ionicons name={isLast ? 'car-outline' : 'arrow-forward'} size={18} color={DARK} />
        </TouchableOpacity>

        {isLast && (
          <TouchableOpacity
            style={styles.driverBtn}
            onPress={() => navigation.navigate('Login', { mode: 'driver' })}
          >
            <Ionicons name="car-sport-outline" size={18} color={GOLD} />
            <Text style={styles.driverBtnText}>Become a Driver</Text>
          </TouchableOpacity>
        )}

        {!isLast && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        )}

        {isLast && (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* PRIVACY NOTE */}
      <Text style={styles.privacyNote}>
        By continuing you agree to our{' '}
        <Text style={styles.privacyLink}>Terms of Service</Text>
        {' '}and{' '}
        <Text style={styles.privacyLink}>Privacy Policy</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: CREAM,
    alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 24,
  },

  logoWrap: { alignItems: 'center' },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: DARK,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  logoEmoji: { fontSize: 32 },
  logoText: { fontSize: 26, fontWeight: '800', color: DARK, letterSpacing: -0.5 },
  logoTagline: { fontSize: 12, color: MUTED, marginTop: 4 },

  slideContent: { alignItems: 'center', paddingHorizontal: 16 },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  slideTitle: {
    fontSize: 26, fontWeight: '800', color: DARK,
    textAlign: 'center', marginBottom: 12,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 16, color: MUTED,
    textAlign: 'center', lineHeight: 24,
  },

  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#DDD',
  },
  dotActive: { width: 24, backgroundColor: GOLD },

  buttonsWrap: { width: '100%', gap: 10 },
  primaryBtn: {
    backgroundColor: GOLD, borderRadius: 14,
    padding: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8,
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: DARK },

  driverBtn: {
    backgroundColor: DARK, borderRadius: 14,
    padding: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8,
  },
  driverBtnText: { fontSize: 17, fontWeight: '700', color: GOLD },

  skipBtn: { alignItems: 'center', padding: 12 },
  skipBtnText: { fontSize: 15, color: MUTED, fontWeight: '500' },

  loginBtn: { alignItems: 'center', padding: 8 },
  loginBtnText: { fontSize: 14, color: DARK, fontWeight: '600' },

  privacyNote: {
    fontSize: 11, color: MUTED,
    textAlign: 'center', lineHeight: 18,
  },
  privacyLink: { color: DARK, fontWeight: '600' },
})

