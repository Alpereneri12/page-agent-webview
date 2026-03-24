import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
// UYARIYI SİLEN KRİTİK DEĞİŞİKLİK: SafeAreaView artık buradan geliyor
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  const [url, setUrl] = useState('https://www.google.com');

  const startAgent = () => {
    let finalUrl = url.startsWith('http') ? url : `https://${url}`;
    navigation.navigate('Agent', { siteUrl: finalUrl });
  };

  return (
    // SafeAreaView artık ekranın en üstündeki pil/saat alanını otomatik korur
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Nexus AI</Text>
          <Text style={styles.subtitle}>Sistem başlatılıyor. Lütfen bir hedef belirleyin.</Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Hedef URL (örn: trendyol.com)"
            placeholderTextColor="#888"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            keyboardType="url"
          />

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={startAgent}
          >
            <Text style={styles.buttonText}>Ağı Başlat</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212' // Arka plan rengini SafeAreaView'a da yaydık
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    // Neon etkisi korunuyor
    textShadowColor: 'rgba(138, 43, 226, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#8A2BE2',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});