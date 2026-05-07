module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    infoPlist: {
      ...config.ios?.infoPlist,
      NSCalendarsUsageDescription: "This app requires calendar access.",
      NSRemindersUsageDescription: "This app requires reminders access.",
    },
  },
});
