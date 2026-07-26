# MOPH CBT v3.1 — Safari/Cache Fix

อัปโหลดไฟล์ทั้งหมดทับไฟล์เดิมใน GitHub repository แล้วเปิดลิงก์ด้วย `?v=31`

ตัวอย่าง:
`https://USERNAME.github.io/moph-public-health-exam/?v=31`

รุ่นนี้แก้ปัญหาไฟล์ HTML/JavaScript คนละเวอร์ชันจาก Service Worker cache ซึ่งทำให้ขึ้น `Cannot set properties of null (setting 'hidden')` โดย:
- ใส่เลขเวอร์ชันให้ CSS/JS/คลังข้อสอบ
- ล้าง cache รุ่นเก่าอัตโนมัติ
- โหลดสคริปต์หลัง DOM พร้อม
- เพิ่ม error guard เพื่อไม่ให้หน้าจอค้าง
