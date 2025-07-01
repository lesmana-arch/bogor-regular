import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBVEtBh-3JMf917wXVnJogGQxOcKD3Gc_I",
  authDomain: "tester-ojol.firebaseapp.com",
  databaseURL: "https://tester-ojol-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tester-ojol",
  storageBucket: "tester-ojol.firebasestorage.app",
  messagingSenderId: "17083838667",
  appId: "1:17083838667:web:f1371f47a3841e14606b4e",
  measurementId: "G-5P0VLQ72CK"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const firebaseService = {
  createOrder: async (orderData) => {
    try {
      const ordersRef = ref(database, 'orders');
      const newOrderRef = push(ordersRef);
      
      await set(newOrderRef, {
        ...orderData,
        status: 'pending',
        timestamp: Date.now()
      });
      
      return newOrderRef.key;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  },

  listenToOrderStatus: (orderId, callback) => {
    const orderRef = ref(database, `orders/${orderId}`);
    return onValue(orderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });
  },

  listenToNewOrders: (callback) => {
    const ordersRef = ref(database, 'orders');
    return onValue(ordersRef, (snapshot) => {
      const orders = snapshot.val();
      const currentTime = Date.now();
      for (const orderId in orders) {
        const order = orders[orderId];
        if (currentTime - order.timestamp <= 5000) {
          callback(orderId, order);
          setTimeout(() => {
            remove(ref(database, `orders/${orderId}`));
          }, 7000);
        }
      }
    });
  }
};