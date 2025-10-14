# การตั้งค่า Push Notifications สำหรับ Fonzu Wiki

## สำหรับการพัฒนา (Development)

ระบบปัจจุบันทำงานในโหมดพัฒนาโดยไม่ต้องการ VAPID keys จริงๆ คุณสามารถ:

1. **สมัครรับการแจ้งเตือน** ได้ที่หน้า `/profile`
2. **ทดสอบการแจ้งเตือน** โดยกดปุ่ม "🔔 ทดสอบการแจ้งเตือน"
3. **ส่งการแจ้งเตือน** จากหน้า `/admin` โดยกดปุ่ม "🔔 ส่งแจ้งเตือน"

## สำหรับการใช้งานจริง (Production)

ในการใช้งาน push notifications จริงๆ คุณต้องตั้งค่า VAPID keys:

### ขั้นตอนการตั้งค่า VAPID Keys:

1. **ติดตั้ง web-push library:**
```bash
npm install web-push
```

2. **สร้าง VAPID keys:**
```bash
npx web-push generate-vapid-keys
```

3. **เพิ่ม keys ใน environment variables (.env.local):**
```bash
VAPID_PUBLIC_KEY=BKqxEBvmC9insFnCYwuaOG0zPOjdkHrNxvTkbiUdzwFnId3294I0Z--jWQKFTmZqETKOjlRmJjQwiFqiN1RLbao
VAPID_PRIVATE_KEY=x4jKYX2TXXJd_8Wq0qpZ5R7IaEqPaeN8NvkTjswBm2g
VAPID_EMAIL=athitfkm@gmail.com
```

4. **แก้ไขไฟล์ API (`src/app/api/push/route.ts`):**
```typescript
// Uncomment และปรับแต่งส่วนนี้
const webpush = require('web-push');

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// แล้วใช้สำหรับส่งการแจ้งเตือนจริง
```

### การสร้าง PWA Icons

สำหรับ PWA ที่สมบูรณ์ แนะนำให้สร้าง icons ที่เหมาะสม:

1. **ขนาดที่แนะนำ:**
   - 192x192px (สำหรับ manifest)
   - 512x512px (สำหรับ splash screen)
   - 180x180px (สำหรับ Apple touch icon)

2. **เครื่องมือที่ใช้ได้:**
   - [favicon.io](https://favicon.io)
   - [realfavicongenerator.net](https://realfavicongenerator.net)

### การทดสอบ Push Notifications

1. **เปิดเว็บใน HTTPS** (จำเป็นสำหรับ push notifications)
2. **เข้า `/profile`** และสมัครรับการแจ้งเตือน
3. **เข้า `/admin`** และส่ง test notification
4. **ตรวจสอบการแจ้งเตือน** ในเบราว์เซอร์

### Browser Support

Push notifications รองรับใน:
- ✅ Chrome 22+
- ✅ Firefox 44+
- ✅ Safari 16+
- ✅ Edge 79+

### Troubleshooting

**ปัญหา: ไม่สามารถสมัครรับการแจ้งเตือนได้**
- ตรวจสอบว่าเว็บใช้ HTTPS
- ตรวจสอบว่า service worker ทำงานปกติ
- ลอง refresh หน้าเว็บ

**ปัญหา: ไม่ได้รับการแจ้งเตือน**
- ตรวจสอบการตั้งค่า notification ใน browser
- ตรวจสอบว่าไม่ถูก mute
- ลอง restart browser

**ปัญหา: VAPID keys ไม่ทำงาน**
- ตรวจสอบว่า keys ถูกต้อง
- ตรวจสอบ email format ใน VAPID_EMAIL
- ลอง regenerate keys ใหม่

---

*หมายเหตุ: สำหรับการพัฒนาใน localhost สามารถใช้ HTTP ได้ แต่สำหรับ production ต้องใช้ HTTPS เท่านั้น*