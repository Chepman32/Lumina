import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  SHADOWS,
} from '../../utils/constants';

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  category: 'bundle' | 'filters' | 'stickers' | 'fonts';
  premium: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: 'premium_bundle',
    name: 'Premium Bundle',
    price: '$9.99',
    description: 'Everything included, best value!',
    features: [
      'All filter packs',
      'All sticker collections',
      'Premium fonts',
      'Unlimited history',
      '4K export',
      'Remove watermark',
      'Priority support',
    ],
    category: 'bundle',
    premium: true,
  },
  {
    id: 'cinematic_filters',
    name: 'Cinematic Filters',
    price: '$2.99',
    description: '10 professional film-grade filters',
    features: [
      'Film noir',
      'Golden hour',
      'Teal & orange',
      'Desaturated',
      'High contrast',
    ],
    category: 'filters',
    premium: true,
  },
  {
    id: 'aesthetic_filters',
    name: 'Aesthetic Filters',
    price: '$2.99',
    description: '10 trendy Instagram-style filters',
    features: [
      'VSCO style',
      'Soft pastels',
      'Moody tones',
      'Bright & airy',
      'Film grain',
    ],
    category: 'filters',
    premium: true,
  },
  {
    id: 'fashion_stickers',
    name: 'Fashion Pack',
    price: '$1.99',
    description: '20 stylish fashion stickers',
    features: [
      'Clothing items',
      'Accessories',
      'Beauty products',
      'Fashion icons',
    ],
    category: 'stickers',
    premium: true,
  },
  {
    id: 'premium_fonts',
    name: 'Premium Fonts',
    price: '$2.99',
    description: '20 beautiful fonts',
    features: [
      'Modern sans-serif',
      'Elegant serifs',
      'Handwritten styles',
      'Display fonts',
    ],
    category: 'fonts',
    premium: true,
  },
];

export default function StoreScreen() {
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set());

  const handlePurchase = (product: Product) => {
    Alert.alert('Purchase', `Purchase ${product.name} for ${product.price}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Buy',
        onPress: () => {
          // TODO: Implement actual IAP
          setPurchasedItems(prev => new Set([...prev, product.id]));
          Alert.alert('Success!', `${product.name} purchased successfully!`);
        },
      },
    ]);
  };

  const handleRestore = () => {
    Alert.alert('Restore Purchases', 'Restore your previous purchases?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restore',
        onPress: () => {
          // TODO: Implement actual restore
          Alert.alert('Restored', 'Previous purchases have been restored.');
        },
      },
    ]);
  };

  const renderProduct = (product: Product) => {
    const isPurchased = purchasedItems.has(product.id);
    const isBestValue = product.id === 'premium_bundle';

    return (
      <View
        key={product.id}
        style={[styles.productCard, isBestValue && styles.bestValueCard]}
      >
        {isBestValue && (
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
        )}

        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price}</Text>
        </View>

        <Text style={styles.productDescription}>{product.description}</Text>

        <View style={styles.featuresList}>
          {product.features.map((feature, index) => (
            <Text key={index} style={styles.feature}>
              ✓ {feature}
            </Text>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.purchaseButton,
            isPurchased && styles.purchasedButton,
            isBestValue && styles.premiumButton,
          ]}
          onPress={() => !isPurchased && handlePurchase(product)}
          disabled={isPurchased}
        >
          <Text
            style={[
              styles.purchaseButtonText,
              isPurchased && styles.purchasedButtonText,
              isBestValue && styles.premiumButtonText,
            ]}
          >
            {isPurchased ? 'Purchased ✓' : `Purchase ${product.price}`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>👑 Lumina Store</Text>
        <Text style={styles.subtitle}>Unlock premium features</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {PRODUCTS.map(renderProduct)}

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All purchases are one-time only. No subscriptions.
          </Text>
          <Text style={styles.footerText}>Prices may vary by region.</Text>
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
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: FONT_SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.gray,
  },
  content: {
    flex: 1,
    padding: SPACING.m,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.l,
    marginBottom: SPACING.m,
    position: 'relative',
    ...SHADOWS.level2,
  },
  bestValueCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.level3,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -8,
    right: SPACING.l,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.medium,
  },
  bestValueText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.caption,
    fontWeight: 'bold',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  productName: {
    fontSize: FONT_SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
  },
  productPrice: {
    fontSize: FONT_SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  productDescription: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.gray,
    marginBottom: SPACING.m,
  },
  featuresList: {
    marginBottom: SPACING.l,
  },
  feature: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  premiumButton: {
    backgroundColor: COLORS.accent,
  },
  purchasedButton: {
    backgroundColor: COLORS.success,
  },
  purchaseButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  premiumButtonText: {
    color: COLORS.white,
  },
  purchasedButtonText: {
    color: COLORS.white,
  },
  restoreButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lighterGray,
    marginBottom: SPACING.l,
  },
  restoreButtonText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.l,
  },
  footerText: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
});
