import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
  type MenuItem = {
    icon: IoniconName;
    title: string;
    onPress: () => void;
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const showInfo = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: t('common.done') }]);
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'language',
      title: t('profile.language'),
      onPress: () => showInfo(t('profile.language'), t('profile.languageHint')),
    },
    {
      icon: 'notifications',
      title: t('profile.notifications'),
      onPress: () => showInfo(t('profile.notifications'), t('profile.comingSoon')),
    },
    {
      icon: 'lock-closed',
      title: t('profile.privacy'),
      onPress: () => showInfo(t('profile.privacy'), t('settings.dataDesc')),
    },
    {
      icon: 'help-circle',
      title: t('profile.help'),
      onPress: () => showInfo(t('profile.help'), t('profile.helpText')),
    },
    {
      icon: 'information-circle',
      title: t('profile.about'),
      onPress: () => showInfo(t('profile.about'), t('profile.aboutText')),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.colors.primaryLight },
          ]}
        >
          <Text style={styles.avatarText}>🌙</Text>
        </View>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          Lalin User
        </Text>
      </View>

      {/* Language Quick Switch */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          {t('settings.language')}
        </Text>
        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[
              styles.langButton,
              {
                backgroundColor:
                  i18n.language === 'ht'
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
            onPress={() => changeLanguage('ht')}
          >
            <Text
              style={[
                styles.langText,
                { color: i18n.language === 'ht' ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              🇭🇹 Kreyòl
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.langButton,
              {
                backgroundColor:
                  i18n.language === 'fr'
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
            onPress={() => changeLanguage('fr')}
          >
            <Text
              style={[
                styles.langText,
                { color: i18n.language === 'fr' ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              🇫🇷 Français
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.langButton,
              {
                backgroundColor:
                  i18n.language === 'en'
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
            onPress={() => changeLanguage('en')}
          >
            <Text
              style={[
                styles.langText,
                { color: i18n.language === 'en' ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              🇺🇸 English
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Items */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index < menuItems.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              },
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name={item.icon}
                size={24}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                {item.title}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textLight}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.version, { color: theme.colors.textLight }]}>
        Lalin v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  languageButtons: {
    gap: 8,
  },
  langButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  langText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuText: {
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    padding: 32,
    fontSize: 12,
  },
});
