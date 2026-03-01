// Orders Service - Dedicated service for order management
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    serverTimestamp,
    onSnapshot,
    Unsubscribe
} from "firebase/firestore";
import { getDatabase } from "./firebase";

export interface Order {
    id: string;
    name: string;
    phone: string;
    occasion: string;
    details: string;
    package: string;
    status: string;
    orderCode: string;
    notes?: string;
    createdAt: Timestamp | Date;
    updatedAt?: Timestamp | Date;
}

// Generate unique order code: LM-XXXXXX
const generateOrderCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'LM-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Get orders collection reference
const getOrdersCollection = () => {
    const db = getDatabase();
    return collection(db, "orders");
};

// Add a new order to Firestore
export const addOrder = async (orderData: Omit<Order, "id" | "createdAt" | "orderCode">): Promise<{ id: string; orderCode: string }> => {
    const ordersCollection = getOrdersCollection();
    const orderCode = generateOrderCode();

    try {
        const docRef = await addDoc(ordersCollection, {
            ...orderData,
            orderCode,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return { id: docRef.id, orderCode };
    } catch (error: any) {
        throw new Error(`Failed to save order: ${error.message}`);
    }
};

// Get all orders from Firestore
export const getOrders = async (): Promise<Order[]> => {
    const ordersCollection = getOrdersCollection();

    try {
        const q = query(ordersCollection, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Order));

        return orders;
    } catch (error: any) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
    }
};

// Subscribe to real-time order updates
export const subscribeToOrders = (
    callback: (orders: Order[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const ordersCollection = getOrdersCollection();

    const q = query(ordersCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q,
        (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Order));
            callback(orders);
        },
        (error) => {
            if (onError) {
                onError(error as Error);
            }
        }
    );

    return unsubscribe;
};

// Get a single order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
    const db = getDatabase();

    try {
        const orderDoc = doc(db, "orders", orderId);
        const docSnap = await getDoc(orderDoc);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Order;
        }

        return null;
    } catch (error: any) {
        throw new Error(`Failed to fetch order: ${error.message}`);
    }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
    const db = getDatabase();

    try {
        const orderDoc = doc(db, "orders", orderId);
        await updateDoc(orderDoc, {
            status,
            updatedAt: serverTimestamp()
        });
    } catch (error: any) {
        throw new Error(`Failed to update order status: ${error.message}`);
    }
};

// Update an order
export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<void> => {
    const db = getDatabase();

    try {
        const orderDoc = doc(db, "orders", orderId);
        await updateDoc(orderDoc, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    } catch (error: any) {
        throw new Error(`Failed to update order: ${error.message}`);
    }
};

// Delete an order
export const deleteOrder = async (orderId: string): Promise<void> => {
    const db = getDatabase();

    try {
        const orderDoc = doc(db, "orders", orderId);
        await deleteDoc(orderDoc);
    } catch (error: any) {
        throw new Error(`Failed to delete order: ${error.message}`);
    }
};

export default {
    addOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    subscribeToOrders
};
