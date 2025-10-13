import { addToast } from '@/app/components/Toast';

// Toast utility functions for different scenarios
export const showSuccessToast = (message: string, duration?: number) => {
  addToast({
    message,
    type: 'success',
    duration: duration || 4000
  });
};

export const showErrorToast = (message: string, duration?: number) => {
  addToast({
    message,
    type: 'error',
    duration: duration || 5000
  });
};

export const showWarningToast = (message: string, duration?: number) => {
  addToast({
    message,
    type: 'warning',
    duration: duration || 4000
  });
};

export const showInfoToast = (message: string, duration?: number) => {
  addToast({
    message,
    type: 'info',
    duration: duration || 4000
  });
};

// Specific toast messages for common actions
export const showLoginSuccessToast = () => {
  showSuccessToast('🎉 เข้าสู่ระบบสำเร็จแล้ว!');
};

export const showCreatePostSuccessToast = (postTitle?: string) => {
  const message = postTitle
    ? `📝 สร้างโพสต์ "${postTitle}" สำเร็จแล้ว!`
    : '📝 สร้างโพสต์สำเร็จแล้ว!';
  showSuccessToast(message);
};

export const showEditPostSuccessToast = (postTitle?: string) => {
  const message = postTitle
    ? `✏️ แก้ไขโพสต์ "${postTitle}" สำเร็จแล้ว!`
    : '✏️ แก้ไขโพสต์สำเร็จแล้ว!';
  showSuccessToast(message);
};

export const showDeletePostSuccessToast = (postTitle?: string) => {
  const message = postTitle
    ? `🗑️ ลบโพสต์ "${postTitle}" สำเร็จแล้ว!`
    : '🗑️ ลบโพสต์สำเร็จแล้ว!';
  showSuccessToast(message);
};

export const showUploadSuccessToast = (fileName?: string) => {
  const message = fileName
    ? `📁 อัปโหลดไฟล์ "${fileName}" สำเร็จแล้ว!`
    : '📁 อัปโหลดไฟล์สำเร็จแล้ว!';
  showSuccessToast(message);
};

export const showErrorToastWithMessage = (message: string) => {
  showErrorToast(`❌ เกิดข้อผิดพลาด: ${message}`);
};

export const showNetworkErrorToast = () => {
  showErrorToast('🌐 ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาลองใหม่อีกครั้ง');
};

export const showValidationErrorToast = (field?: string) => {
  const message = field
    ? `⚠️ กรุณากรอกข้อมูลในฟิลด์ "${field}" ให้ครบถ้วน`
    : '⚠️ กรุณากรอกข้อมูลให้ครบถ้วน';
  showWarningToast(message);
};