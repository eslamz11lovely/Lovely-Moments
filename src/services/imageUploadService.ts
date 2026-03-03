// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Lovely Moments — Image Upload Service
//
//  Upload Strategy (in order):
//  1. Firebase Cloud Function (keeps API keys server-side)
//  2. Direct imgbb API (fallback if CF not deployed)
//  3. Direct Freeimage.host API (last resort fallback)
//  4. Continue without image (graceful degradation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface UploadResult {
    url: string;
    source: "cloudfunction" | "imgbb" | "freeimage" | "none";
}

// ── Config ────────────────────────────────────────────

// Cloud Function endpoint (set VITE_UPLOAD_FUNCTION_URL in .env after deploying)
const UPLOAD_FUNCTION_URL = import.meta.env.VITE_UPLOAD_FUNCTION_URL || "";

// Direct API fallbacks — only used when CF is not deployed
// These are public-tier API keys with rate limits but acceptable for low-volume use
const IMGBB_KEY = import.meta.env.VITE_IMGBB_KEY || "4928381d580067cef94fe8759d7cf536";
const FREEIMAGE_KEY = import.meta.env.VITE_FREEIMAGE_KEY || "6d207e02198a847aa98d0a2a901485a5";

// Max file size: 5MB
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

// Allowed types
const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
];

// ── Validate image ────────────────────────────────────

export const validateImage = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return "نوع الملف غير مدعوم. الأنواع المقبولة: JPG, PNG, WebP, GIF";
    }
    if (file.size > MAX_SIZE_BYTES) {
        return "حجم الصورة يجب أن يكون أقل من 5 ميجابايت";
    }
    return null;
};

// ── Convert file to base64 ────────────────────────────

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]); // strip data:...;base64, prefix
        };
        reader.onerror = () => reject(new Error("فشل قراءة الملف"));
        reader.readAsDataURL(file);
    });

// ── Strategy 1: Firebase Cloud Function ──────────────

const uploadViaCloudFunction = async (
    base64: string,
    filename: string
): Promise<string | null> => {
    if (!UPLOAD_FUNCTION_URL) return null; // Not configured

    try {
        const res = await fetch(UPLOAD_FUNCTION_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64, filename }),
            signal: AbortSignal.timeout(25000),
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data?.url || null;
    } catch {
        return null;
    }
};

// ── Strategy 2: Direct imgbb ──────────────────────────

const uploadViaImgbb = async (
    base64: string,
    filename: string
): Promise<string | null> => {
    try {
        const form = new FormData();
        form.append("key", IMGBB_KEY);
        form.append("image", base64);
        form.append("name", filename);

        const res = await fetch("https://api.imgbb.com/1/upload", {
            method: "POST",
            body: form,
            signal: AbortSignal.timeout(20000),
        });

        if (!res.ok) return null;

        const data = await res.json();
        return (
            data?.data?.display_url ||
            data?.data?.url ||
            null
        );
    } catch (err) {
        console.warn("imgbb direct upload failed:", err);
        return null;
    }
};

// ── Strategy 3: Direct Freeimage.host ────────────────

const uploadViaFreeimage = async (
    base64: string
): Promise<string | null> => {
    try {
        const form = new FormData();
        form.append("key", FREEIMAGE_KEY);
        form.append("source", base64);
        form.append("format", "json");

        const res = await fetch("https://freeimage.host/api/1/upload", {
            method: "POST",
            body: form,
            signal: AbortSignal.timeout(20000),
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data?.image?.url || null;
    } catch (err) {
        console.warn("freeimage.host direct upload failed:", err);
        return null;
    }
};

// ── Main upload function ──────────────────────────────

export const uploadReviewImage = async (file: File): Promise<UploadResult> => {
    const validationError = validateImage(file);
    if (validationError) {
        throw new Error(validationError);
    }

    let base64: string;
    try {
        base64 = await fileToBase64(file);
    } catch (err) {
        console.warn("Failed to read file:", err);
        return { url: "", source: "none" };
    }

    const filename = file.name || "review-image";

    // 1️⃣ Try Cloud Function (most secure)
    if (UPLOAD_FUNCTION_URL) {
        const cfUrl = await uploadViaCloudFunction(base64, filename);
        if (cfUrl) {
            console.log("✅ Uploaded via Cloud Function");
            return { url: cfUrl, source: "cloudfunction" };
        }
        console.warn("Cloud Function upload failed, trying direct APIs...");
    }

    // 2️⃣ Try imgbb directly
    const imgbbUrl = await uploadViaImgbb(base64, filename);
    if (imgbbUrl) {
        console.log("✅ Uploaded via imgbb");
        return { url: imgbbUrl, source: "imgbb" };
    }

    // 3️⃣ Try freeimage.host directly
    const freeimageUrl = await uploadViaFreeimage(base64);
    if (freeimageUrl) {
        console.log("✅ Uploaded via freeimage.host");
        return { url: freeimageUrl, source: "freeimage" };
    }

    // 4️⃣ All failed — continue without image
    console.warn("All image upload strategies failed — continuing without image");
    return { url: "", source: "none" };
};

export default {
    uploadReviewImage,
    validateImage,
};
