/**
 * Utility function to get time-based greeting
 * Returns appropriate greeting based on current hour
 */
export const getTimeBasedGreeting = (): string => {
  const currentHour = new Date().getHours();
  
  if (currentHour >= 5 && currentHour < 12) {
    return 'Good Morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
};

/**
 * Get greeting with emoji for enhanced UX
 */
export const getTimeBasedGreetingWithEmoji = (): { greeting: string; emoji: string } => {
  const currentHour = new Date().getHours();
  
  if (currentHour >= 5 && currentHour < 12) {
    return { greeting: 'Good Morning', emoji: '🌅' };
  } else if (currentHour >= 12 && currentHour < 17) {
    return { greeting: 'Good Afternoon', emoji: '☀️' };
  } else {
    return { greeting: 'Good Evening', emoji: '🌙' };
  }
};

/**
 * Get time period for styling purposes
 */
export const getTimePeriod = (): 'morning' | 'afternoon' | 'evening' => {
  const currentHour = new Date().getHours();
  
  if (currentHour >= 5 && currentHour < 12) {
    return 'morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    return 'afternoon';
  } else {
    return 'evening';
  }
};