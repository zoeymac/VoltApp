import { useState } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, ScrollView, StatusBar, Platform,
  ActivityIndicator, KeyboardAvoidingView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'

const GOLD = '#E8C468'
const CREAM = '#FDFAF3'
const CARD = '#FFFFFF'
const MUTED = '#999999'
const DARK = '#1A1A1A'
const BORDER = '#E8E8E8'
const RED = '#ef4444'
const GREEN = '#22c55e'

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validatePassword = (pass) => {
    if (pass.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(pass)) return 'Password must contain an uppercase letter'
    if (!/[0-9]/.test(pass)) return 'Password must contain a number'
    return null
  }

  const signup = async () => {
    setError('')

    if (!fullName.trim()) { setError('Please enter your full name'); return }
    if (!email.trim()) { setError('Please enter your email'); return }
    if (!password) { setError('Please enter a password'); return }

    const passError = validatePassword(password)
    if (passError) { setError(passError); return }

    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (!agreedToTerms) { setError('Please agree to the Terms of Service and Privacy Policy'); return }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim() }
        }
      })
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={48} color={CARD} />
        </View>
        <Text style={styles.successTitle}>Check your email!</Text>
        <Text style={styles.successDesc}>
          We sent a confirmation link to {email}. Click it to activate your account.
        </Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* BACK */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>

        {/* LOGO */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>⚡</Text>
          </View>
          <Text style={styles.logoText}>VoltRide</Text>
        </View>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join Toronto's electric revolution</Text>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={RED} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* FULL NAME */}
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={18} color={MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Zoey MacDonald"
                placeholderTextColor={MUTED}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* EMAIL */}
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={18} color={MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor={MUTED}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* PASSWORD */}
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={18} color={MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                placeholderTextColor={MUTED}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18} color={MUTED}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* CONFIRM PASSWORD */}
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={[
              styles.inputBox,
              confirmPassword && password !== confirmPassword && { borderColor: RED },
              confirmPassword && password === confirmPassword && { borderColor: GREEN },
            ]}>
              <Ionicons name="lock-closed-outline" size={18} color={MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Repeat your password"
                placeholderTextColor={MUTED}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              {confirmPassword ? (
                <Ionicons
                  name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={password === confirmPassword ? GREEN : RED}
                />
              ) : null}
            </View>
          </View>

          {/* TERMS */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
              {agreedToTerms && <Ionicons name="checkmark" size={14} color={DARK} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* SIGNUP BUTTON */}
          <TouchableOpacity
            style={[styles.signupBtn, loading && { opacity: 0.7 }]}
            onPress={signup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={DARK} />
            ) : (
              <Text style={styles.signupBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* DIVIDER */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* APPLE */}
          <TouchableOpacity style={styles.appleBtn}>
            <Ionicons name="logo-apple" size={20} color={CARD} />
            <Text style={styles.appleBtnText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* LOGIN LINK */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  scroll: {
    flexGrow: 1, padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },

  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: CARD, justifyContent: 'center',
    alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },

  logoWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 10 },
  logoCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: DARK, justifyContent: 'center', alignItems: 'center',
  },
  logoEmoji: { fontSize: 20 },
  logoText: { fontSize: 22, fontWeight: '800', color: DARK },

  title: { fontSize: 28, fontWeight: '800', color: DARK, marginBottom: 8 },
  subtitle: { fontSize: 15, color: MUTED, marginBottom: 32 },

  form: { gap: 0 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', borderRadius: 10,
    padding: 12, marginBottom: 16, gap: 8,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { fontSize: 13, color: RED, flex: 1 },

  inputWrap: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: DARK, marginBottom: 6 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: DARK },

  termsRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 12, marginBottom: 24,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: BORDER,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 1,
  },
  checkboxActive: { backgroundColor: GOLD, borderColor: GOLD },
  termsText: { flex: 1, fontSize: 13, color: MUTED, lineHeight: 20 },
  termsLink: { color: DARK, fontWeight: '600' },

  signupBtn: {
    backgroundColor: GOLD, borderRadius: 14,
    padding: 18, alignItems: 'center',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  signupBtnText: { fontSize: 17, fontWeight: '700', color: DARK },

  divider: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 24, gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { fontSize: 13, color: MUTED },

  appleBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    backgroundColor: DARK, borderRadius: 14,
    padding: 16,
  },
  appleBtnText: { fontSize: 16, fontWeight: '600', color: CARD },

  loginRow: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: 24,
  },
  loginText: { fontSize: 14, color: MUTED },
  loginLink: { fontSize: 14, fontWeight: '700', color: DARK },

  successContainer: {
    flex: 1, backgroundColor: CREAM,
    alignItems: 'center', justifyContent: 'center',
    padding: 32,
  },
  successIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: GREEN, justifyContent: 'center',
    alignItems: 'center', marginBottom: 24,
  },
  successTitle: { fontSize: 26, fontWeight: '800', color: DARK, marginBottom: 12 },
  successDesc: {
    fontSize: 15, color: MUTED, textAlign: 'center',
    lineHeight: 24, marginBottom: 32,
  },
  loginBtn: {
    backgroundColor: GOLD, borderRadius: 14,
    padding: 18, alignItems: 'center', width: '100%',
  },
  loginBtnText: { fontSize: 17, fontWeight: '700', color: DARK },
})

