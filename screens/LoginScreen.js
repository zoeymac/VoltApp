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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async () => {
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) {
        setError(error.message)
      }
      // No navigation needed — App.js handles it automatically
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
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

        {/* HEADING */}
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue riding</Text>

        {/* FORM */}
        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={RED} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

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

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={18} color={MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your password"
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

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={login}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={DARK} />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* DIVIDER */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* APPLE SIGN IN */}
          <TouchableOpacity style={styles.appleBtn}>
            <Ionicons name="logo-apple" size={20} color={CARD} />
            <Text style={styles.appleBtnText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* SIGN UP */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PRIVACY */}
        <Text style={styles.privacyNote}>
          By signing in you agree to our{' '}
          <Text style={styles.privacyLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.privacyLink}>Privacy Policy</Text>
        </Text>
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

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 13, color: DARK, fontWeight: '600' },

  loginBtn: {
    backgroundColor: GOLD, borderRadius: 14,
    padding: 18, alignItems: 'center',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  loginBtnText: { fontSize: 17, fontWeight: '700', color: DARK },

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

  signupRow: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: 24,
  },
  signupText: { fontSize: 14, color: MUTED },
  signupLink: { fontSize: 14, fontWeight: '700', color: DARK },

  privacyNote: {
    fontSize: 11, color: MUTED,
    textAlign: 'center', lineHeight: 18,
    marginTop: 32,
  },
  privacyLink: { color: DARK, fontWeight: '600' },
})

