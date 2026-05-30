/**
 * SupportChatScreen — VitaCare Pro
 * Écran immersif de chat d'assistance technique avec réponses simulées en direct
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { ProTopBar } from '../../../src/components';
import { useAuthStore } from '../../../src/store';

interface Message {
  id:        string;
  sender:    'user' | 'support';
  text:      string;
  timestamp: string;
}

const QUICK_SUGGESTIONS = [
  "⏱️ Problème d'agenda",
  "📝 Erreur d'ordonnance",
  "💳 Souci de consultation",
  "🔧 Autre bug technique",
];

export default function SupportChatScreen() {
  const user = useAuthStore((s) => s.user);
  const doctorName = user?.fullName ?? 'Médecin';

  const [messages, setMessages] = useState<Message[]>([
    {
      id:        'msg-init',
      sender:    'support',
      text:      `Bonjour ${doctorName} ! Je suis Thomas, votre assistant technique VitaCare Pro. Comment puis-je vous aider aujourd'hui ?`,
      timestamp: 'À l\'instant',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const typingOpacity = useRef(new Animated.Value(0.4)).current;

  // Animate typing dots
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(typingOpacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingOpacity.setValue(0.4);
    }
  }, [isTyping]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getSystemResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('agenda') || q.includes('horaire')) {
      return "Entendu. S'agit-il d'un décalage d'heures sur vos rendez-vous de la journée ou d'un souci pour bloquer un créneau récurrent ?";
    }
    if (q.includes('ordonnance') || q.includes('prescription')) {
      return "Je comprends. Rencontrez-vous un message d'erreur lors de l'envoi de la prescription, ou est-ce un problème lié à la signature électronique ?";
    }
    if (q.includes('consultation') || q.includes('tarif') || q.includes('souci')) {
      return "Bien reçu. Vous pouvez configurer votre tarif de base dans l'écran de tarification de votre profil. S'il s'agit d'une anomalie sur les commissions cliniques, voulez-vous que j'ouvre un ticket avec la comptabilité ?";
    }
    return "Merci pour ces précisions. Je transmets immédiatement ces détails à nos ingénieurs système. Un technicien va prendre le relais pour corriger cette anomalie d'ici quelques minutes.";
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id:        `user-${Date.now()}`,
      sender:    'user',
      text:      textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    scrollToBottom();

    // Trigger typing and agent response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const supportMsg: Message = {
        id:        `support-${Date.now()}`,
        sender:    'support',
        text:      getSystemResponse(textToSend),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, supportMsg]);
      scrollToBottom();
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProTopBar title="Support Technique" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Support Agent Info Header */}
        <View style={styles.agentHeader}>
          <View style={styles.agentAvatar}>
            <Ionicons name="headset-outline" size={20} color={colors.primary} />
            <View style={styles.statusDot} />
          </View>
          <View style={styles.agentInfo}>
            <Text style={styles.agentName}>Thomas — Support Direct</Text>
            <Text style={styles.agentStatus}>En ligne • Répond généralement en 2 min</Text>
          </View>
        </View>

        {/* Scrollable Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowUser : styles.messageRowSupport,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.bubbleUser : styles.bubbleSupport,
                  ]}
                >
                  <Text style={[styles.messageText, isUser ? styles.textUser : styles.textSupport]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.messageTime, isUser ? styles.timeUser : styles.timeSupport]}>
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={[styles.messageRow, styles.messageRowSupport]}>
              <Animated.View style={[styles.bubbleSupport, styles.typingBubble, { opacity: typingOpacity }]}>
                <Text style={styles.typingText}>Thomas est en train d'écrire...</Text>
                <ActivityIndicator size="small" color={colors.primary} style={styles.typingSpinner} />
              </Animated.View>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        {messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
              {QUICK_SUGGESTIONS.map((sug, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionChip}
                  onPress={() => handleSend(sug)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.suggestionText}>{sug}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom Input Section */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Écrivez votre question ou décrivez le bug..."
            value={inputText}
            onChangeText={setInputText}
            style={styles.textInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend(inputText)}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: 12,
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    position: 'absolute',
    bottom: -1,
    right: -1,
    borderWidth: 2,
    borderColor: colors.white,
  },
  agentInfo: {
    gap: 2,
  },
  agentName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  agentStatus: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowSupport: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleSupport: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  textUser: {
    color: colors.white,
  },
  textSupport: {
    color: colors.ink,
  },
  messageTime: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    alignSelf: 'flex-end',
  },
  timeUser: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeSupport: {
    color: colors.inkMuted,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 4,
  },
  typingText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  typingSpinner: {
    marginLeft: 4,
  },
  suggestionsContainer: {
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 40,
    maxHeight: 100,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.inkFaint,
  },
});
