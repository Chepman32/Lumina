import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';

interface SettingItem {
  id: string;
  title: string;
  type: 'toggle' | 'navigation' | 'action' | 'info';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  subtitle?: string;
  icon?: string;
}

export default function SettingsScreen() {
  const [autoSave, setAutoSave] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [highQualityPreview, setHighQualityPreview] = useState(true);

  const handleRateApp = () => {
    Alert.alert(
      'Rate Lumina',
      'Enjoying Lumina? Please rate us on the App Store!',
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Rate Now',
          onPress: () => {
            // TODO: Open App Store rating
            console.log('Open App Store rating');
          },
        },
      ],
    );
  };

  const handleShareApp = () => {
    Alert.alert('Share Lumina', 'Share Lumina with your friends!', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Share',
        onPress: () => {
          // TODO: Implement share functionality
          console.log('Share app');
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached filter thumbnails and temporary files. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cache clearing
            Alert.alert(
              'Cache Cleared',
              'Cache has been cleared successfully.',
            );
          },
        },
      ],
    );
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Need help? Contact our support team.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Email Support',
        onPress: () => {
          Linking.openURL(
            'mailto:support@luminaapp.com?subject=Lumina Support',
          );
        },
      },
    ]);
  };

  const renderSettingItem = (item: SettingItem) => {
    return (
      <View key={item.id} style={styles.settingItem}>
        <View style={styles.settingContent}>
          <View style={styles.settingInfo}>
            {item.icon && <Text style={styles.settingIcon}>{item.icon}</Text>}
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </View>

          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: COLORS.lighterGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          )}

          {item.type === 'navigation' && (
            <TouchableOpacity onPress={item.onPress}>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}

          {item.type === 'action' && (
            <TouchableOpacity
              onPress={item.onPress}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>👤</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Premium Member</Text>
                  <Text style={styles.settingSubtitle}>Since Jan 2025</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Editor</Text>
          {renderSettingItem({
            id: 'auto_save',
            title: 'Auto-save projects',
            type: 'toggle',
            value: autoSave,
            onToggle: setAutoSave,
          })}
          {renderSettingItem({
            id: 'show_grid',
            title: 'Show grid overlay',
            type: 'toggle',
            value: showGrid,
            onToggle: setShowGrid,
          })}
          {renderSettingItem({
            id: 'haptic_feedback',
            title: 'Haptic feedback',
            type: 'toggle',
            value: hapticFeedback,
            onToggle: setHapticFeedback,
          })}
          {renderSettingItem({
            id: 'high_quality_preview',
            title: 'High quality preview',
            type: 'toggle',
            value: highQualityPreview,
            onToggle: setHighQualityPreview,
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Cache size: 234 MB</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClearCache}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Projects: 12 (156 MB)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>
                    Version 1.0.0 (Build 42)
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {renderSettingItem({
            id: 'rate_app',
            title: 'Rate App',
            type: 'navigation',
            onPress: handleRateApp,
          })}
          {renderSettingItem({
            id: 'share_app',
            title: 'Share App',
            type: 'navigation',
            onPress: handleShareApp,
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderSettingItem({
            id: 'contact_support',
            title: 'Contact Support',
            type: 'navigation',
            onPress: handleContactSupport,
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  header: {
    padding: SPACING.l,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: FONT_SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.s,
    paddingVertical: SPACING.m,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: SPACING.s,
    marginHorizontal: SPACING.m,
    textTransform: 'uppercase',
  },
  settingItem: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightestGray,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: SPACING.m,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.black,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.gray,
    marginTop: SPACING.xxs,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.lightGray,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.small,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
  },
});
