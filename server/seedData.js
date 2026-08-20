export const initialSeedData = {
  vehicles: [],
  insurance_docs: [],
  prb_docs: [],
  tax_docs: [],
  oil_changes: [],
  maintenances: [],
  staff_members: [
    {
      id: "staff-1",
      name: "พัควลัญชญ์ อุไรล้ำ",
      role: "พนักงานไอที",
      isDefault: true,
      createdAt: "2026-08-20T08:00:00.000Z"
    },
    {
      id: "staff-2",
      name: "สมศักดิ์ ข้าวดี",
      role: "หัวหน้าคลัง",
      isDefault: false,
      createdAt: "2026-08-20T08:00:00.000Z"
    },
    {
      id: "staff-3",
      name: "มานะ ขยันงาน",
      role: "ธุรการ",
      isDefault: false,
      createdAt: "2026-08-20T08:00:00.000Z"
    },
    {
      id: "staff-4",
      name: "สมคิด",
      role: "ช่างประจำร้าน",
      isDefault: false,
      createdAt: "2026-08-20T08:00:00.000Z"
    }
  ],
  line_settings: {
    isEnabled: true,
    channelAccessToken: "",
    userIdOrGroupId: "",
    notifyInsurance: true,
    notifyPrb: true,
    notifyTax: true,
    notifyOil: true,
    notifyMaintenance: true,
    notifyTime: "08:00",
    daysInsuranceBefore: 60, // 2 months
    daysTaxBefore: 90,       // 3 months
    daysPrbBefore: 60        // 2 months
  },
  line_logs: [],
  adminPin: "172839"
};
