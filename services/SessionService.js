import AsyncStorage from '@react-native-async-storage/async-storage';

class SessionService {
  timeoutId = null;

  /**
   * Start a session after login/OTP verification
   * @param {number} duration - Session duration in ms (default 10 min)
   * @param {object} navigation - Navigation object to redirect on logout
   */
  async startSession(duration = 10 * 60 * 1000, navigation) {
    const expiry = Date.now() + duration;
    try {
      await AsyncStorage.setItem('sessionExpiry', expiry.toString());
      await AsyncStorage.setItem('userToken', 'LoggedIn');

      // Clear any previous timeout
      if (this.timeoutId) clearTimeout(this.timeoutId);

      // Start new timeout
      this.timeoutId = setTimeout(() => this.logoutUser(navigation), duration);
      console.log('Session started, expires in', duration / 1000, 'seconds');
    } catch (e) {
      console.error('Start session error:', e);
    }
  }

  /**
   * Check if session is still valid
   * @param {object} navigation - Navigation object to redirect if expired
   */
  async checkSession(navigation) {
    try {
      const expiry = await AsyncStorage.getItem('sessionExpiry');
      const now = Date.now();

      if (!expiry || now > parseInt(expiry, 10)) {
        console.log('Session expired');
        this.logoutUser(navigation);
      } else {
        const timeLeft = parseInt(expiry, 10) - now;
        console.log('Session valid, time left:', timeLeft / 1000, 'seconds');
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => this.logoutUser(navigation), timeLeft);
      }
    } catch (e) {
      console.error('Session check error:', e);
    }
  }

  /**
   * Logout user globally
   * @param {object} navigation - Navigation object to redirect to Login
   */
  async logoutUser(navigation) {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('sessionExpiry');

      console.log('User logged out');

      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
  }
}

// ✅ Export a singleton instance
const sessionService = new SessionService();
export default sessionService;
