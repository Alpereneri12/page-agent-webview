import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  BackHandler
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import { PAGE_AGENT_CODE } from './pageAgentContent';

export default function AgentScreen({ route }) {
  const { siteUrl } = route.params;
  const webViewRef = useRef(null);

  const [showInput, setShowInput] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [agentReady, setAgentReady] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // --- 1. Geri Tuşu Kontrolü ---
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        sub.remove();
      };
    }, [canGoBack])
  );

  // --- 2. Page-Agent Enjeksiyonu ---
  const injectAgent = () => {
    if (agentReady) return;

    const scriptStr = `
      (function() {
        if (window.__AGENT_DONE__) return;

        // Görsel Temizlik (CSS Inject)
        const style = document.createElement('style');
        style.innerHTML = '.page-agent-spinner, .page-agent-input-container, #page-agent-neon-bar { display: none !important; visibility: hidden !important; opacity: 0 !important; }';
        document.head.appendChild(style);

        // Otomatik Odaklanma (Auto-focus)
        setTimeout(() => {
          const inputs = document.querySelectorAll('input, select, textarea');
          if (inputs.length > 0) {
            inputs[0].focus();
          }
        }, 1000);

        try {
          ${PAGE_AGENT_CODE}; 
          
          if (typeof PageAgent !== 'undefined') {
            window.pageAgentInstance = new PageAgent({
              enableMask: false,
              debug: false,
              llm: {
                model: "none", 
                baseURL: "none",
                apiKey: "none"
              }
            });

            if (window.pageAgentInstance.config) {
              window.pageAgentInstance.config.enableMask = false;
            }

            window.__AGENT_DONE__ = true;
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
          }
        } catch (err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', msg: err.message }));
        }
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(scriptStr);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loadProgress < 1 && (
        <View style={[styles.progressBar, { width: `${loadProgress * 100}%` }]} />
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: siteUrl }}
        onMessage={(e) => {
          try {
            const d = JSON.parse(e.nativeEvent.data);
            if (d.type === 'ready') setAgentReady(true);
            if (d.type === 'error' && __DEV__) console.warn("Agent Bilgi: ", d.msg);
          } catch (err) { }
        }}
        onLoadProgress={({ nativeEvent }) => {
          setLoadProgress(nativeEvent.progress);
        }}
        onLoad={() => {
          setTimeout(() => {
            injectAgent();
          }, 500);
        }}
        onLoadEnd={() => {
          setLoadProgress(1);
        }}
        onError={(e) => Alert.alert("WebView Hatası", e.nativeEvent.description)}
        onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
        style={styles.webview}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        mixedContentMode="always"
        cacheEnabled={false}
        incognito={true}
      />

      <View style={styles.overlay}>
        {showInput ? (
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Komutunuzu yazın..."
              placeholderTextColor="#888"
              value={prompt}
              onChangeText={setPrompt}
              autoFocus
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={() => {
                if (prompt && agentReady) {
                  // Türkçe Karakter Fix (UTF-8 encoding via encodeURIComponent)
                  const safePrompt = encodeURIComponent(prompt);
                  webViewRef.current.injectJavaScript(`
                    if (window.pageAgentInstance) {
                      window.pageAgentInstance.execute(decodeURIComponent("${safePrompt}"));
                    }
                    true;
                  `);
                } else {
                  Alert.alert("Durum", "Ajan henüz hazır değil.");
                }
                setPrompt('');
                setShowInput(false);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sor</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: agentReady ? '#8A2BE2' : '#333' }]}
            onPress={() => setShowInput(true)}
          >
            {agentReady ? (
              <Text style={{ fontSize: 24, color: '#fff' }}>⚡</Text>
            ) : (
              <ActivityIndicator color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  webview: { flex: 1, backgroundColor: '#121212' },
  progressBar: {
    height: 3,
    backgroundColor: '#8A2BE2',
    position: 'absolute',
    top: 0,
    zIndex: 99,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  inputCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '90%',
    padding: 10,
    borderRadius: 30,
    elevation: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: { flex: 1, paddingHorizontal: 15, height: 40, color: '#fff' },
  sendBtn: { backgroundColor: '#8A2BE2', padding: 10, borderRadius: 20, paddingHorizontal: 20 }
});