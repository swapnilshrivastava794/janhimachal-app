import Constants from 'expo-constants';
import { Alert } from 'react-native';

let RazorpayCheckout: any = null;

try {
  // Try to require the native module. 
  // In Expo Go, this might resolve to the JS file but the native module connection will be missing.
  // We catch the error on access or just assume it might fail.
  RazorpayCheckout = require('react-native-razorpay').default;
} catch (e) {
  console.warn("Razorpay module failed to load:", e);
}

// Helper to determine if we are in Expo Go environment
const isExpoGo = Constants.appOwnership === 'expo';

/**
 * A wrapper around RazorpayCheckout that safely handles Expo Go.
 */
const SafeRazorpay = {
  open: (options: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Check if the native module is actually present and functioning
      // Often, the module might be 'defined' in JS but missing native bindings.
      // We can try to access a property or just proceed to 'open'.
      
      if (RazorpayCheckout && !isExpoGo) {
        // In a real native build, use the actual SDK
        RazorpayCheckout.open(options)
          .then((data: any) => resolve(data))
          .catch((error: any) => reject(error));
      } else {
        // Fallback for Expo Go / Web / Missing Native Module
        Alert.alert(
          "Development Mode",
          "You are running in Expo Go (or missing native module). Real payments are not supported here.\n\nWe will simulate a payment for testing UI logic.",
          [
            {
              text: "Simulate SUCCESS",
              onPress: () => {
                resolve({
                  razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
                  razorpay_order_id: options.order_id,
                  razorpay_signature: "mock_signature_" + Date.now()
                });
              }
            },
            {
              text: "Simulate FAILURE",
              onPress: () => {
                reject({
                  code: 0,
                  description: "Payment Cancelled (Mock)"
                });
              },
              style: "cancel"
            }
          ]
        );
      }
    });
  }
};

export default SafeRazorpay;
