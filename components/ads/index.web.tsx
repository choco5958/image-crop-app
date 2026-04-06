import React from 'react';
import { View, Text } from 'react-native';

export const BannerAdSize = {
  ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
};

export const TestIds = {
  BANNER: 'banner',
  INTERSTITIAL: 'interstitial',
  REWARDED: 'rewarded',
};

export const AdEventType = {
  LOADED: 'loaded',
  CLOSED: 'closed',
  ERROR: 'error',
};

export const RewardedAdEventType = {
  LOADED: 'loaded',
  EARNED_REWARD: 'rewarded',
};

export const BannerAd = () => {
  return (
    <View style={{ width: 320, height: 50, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff' }}>[Web] Banner Ad Placeholder</Text>
    </View>
  );
};

export const InterstitialAd = {
  createForAdRequest: () => ({
    load: () => {},
    show: () => {},
    addAdEventListener: (event: string, callback: () => void) => {
      // immediately fire loaded on web so we can proceed
      if (event === AdEventType.LOADED) {
        setTimeout(callback, 100);
      }
      if (event === AdEventType.CLOSED) {
        setTimeout(callback, 100);
      }
      return () => {};
    },
  }),
};

export const RewardedAd = {
  createForAdRequest: () => ({
    load: () => {},
    show: () => {},
    addAdEventListener: (event: string, callback: () => void) => {
      // immediately fire loaded & reward on web so we can proceed
      if (event === RewardedAdEventType.LOADED) {
        setTimeout(callback, 100);
      }
      if (event === RewardedAdEventType.EARNED_REWARD) {
        setTimeout(callback, 500);
      }
      if (event === AdEventType.CLOSED) {
        setTimeout(callback, 1000);
      }
      return () => {};
    },
  }),
};
