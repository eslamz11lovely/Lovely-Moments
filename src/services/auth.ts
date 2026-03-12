// Admin credentials
const ADMIN_PASSWORD = "Okaeslam2020###";

// Check if user is admin (using custom localStorage approach)
export const isAdmin = (): boolean => {
    return localStorage.getItem("isAdmin") === "true";
};

// Set admin status
export const setAdminStatus = (status: boolean): void => {
    if (status) {
        localStorage.setItem("isAdmin", "true");
    } else {
        localStorage.removeItem("isAdmin");
    }
};

// Custom admin login
export const adminLogin = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (password === ADMIN_PASSWORD) {
        setAdminStatus(true);
        return { success: true };
    }
    return { success: false, error: "كلمة المرور غير صحيحة" };
};

// Custom admin logout
export const adminLogout = async (): Promise<void> => {
    setAdminStatus(false);
};

// Check if admin is logged in
export const checkAdminAuth = (): boolean => {
    return isAdmin();
};
