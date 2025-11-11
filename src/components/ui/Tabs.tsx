import { useThemedColors } from '@/components/theme';
import { SPACING, BORDER_RADIUS } from '@/constants/ui';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Flex } from '@/components/ui/Layout';
export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTabId, onChange }) => {
  const colors = useThemedColors();
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);

  const handleTabPress = (tabId: string) => {
    setActiveTabId(tabId);
    onChange?.(tabId);
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const getTabStyle = (isActive: boolean) => {
    const backgroundColor = isActive ? colors.backgroundSecondary : 'transparent';
    const borderColor = isActive ? colors.border : 'transparent';

    return {
      backgroundColor,
      borderColor,
    };
  };

  return (
    <Flex flex={1}>
      <Flex flexDirection="row">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabHeader, getTabStyle(isActive)]}
              onPress={() => handleTabPress(tab.id)}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <Text
                variant="caption"
                weight={isActive ? 'semibold' : 'normal'}
                color={isActive ? 'primary' : 'secondary'}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Flex>
      <ScrollView showsHorizontalScrollIndicator={false}>
        {/* Tab Content */}
        <View style={styles.tabContent}>{activeTab?.content}</View>
      </ScrollView>
    </Flex>
  );
};

const styles = StyleSheet.create({
  tabHeaders: {
    borderBottomWidth: 1,
    marginBottom: SPACING.md,
  },
  tabHeadersContent: {
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
  },
  tabHeader: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  tabContent: {
    flex: 1,
  },
});
