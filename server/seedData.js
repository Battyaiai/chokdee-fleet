export const initialSeedData = {
  vehicles: [
    {
      id: "veh-001",
      code: "CK-01",
      name: "รถบรรทุก 6 ล้อ (ส่งข้าวเปลือก)",
      type: "รถบรรทุก 6 ล้อ",
      brand: "Isuzu",
      model: "Forward FRR 210",
      color: "ขาว",
      plateNumber: "70-1234",
      province: "นครปฐม",
      year: "2021",
      vin: "MP1FRR90L01234567",
      engineNo: "4HK1-123456",
      status: "active",
      notes: "ติดตั้งคอกสูงสำหรับบรรทุกข้าวเปลือก รับน้ำหนักได้ 9.5 ตัน",
      createdBy: "สมศักดิ์ ข้าวดี (หัวหน้าคลัง)",
      createdAt: "2024-01-10T08:00:00.000Z"
    },
    {
      id: "veh-002",
      code: "CK-02",
      name: "รถบรรทุก 10 ล้อ (ส่งข้าวสารท่าเรือ)",
      type: "รถบรรทุก 10 ล้อ",
      brand: "Hino",
      model: "Victors 500 FL8J",
      color: "น้ำเงิน-ขาว",
      plateNumber: "71-5678",
      province: "นครปฐม",
      year: "2020",
      vin: "JHD500FL8J9876543",
      engineNo: "J08E-765432",
      status: "active",
      notes: "ใช้ส่งข้าวสารบรรจุถุงส่งท่าเรือคลองเตยและแหลมฉบัง",
      createdBy: "สมศักดิ์ ข้าวดี (หัวหน้าคลัง)",
      createdAt: "2024-01-10T08:30:00.000Z"
    },
    {
      id: "veh-003",
      code: "CK-03",
      name: "รถกระบะตู้ทึบส่งข้าวสาร",
      type: "รถกระบะตอนเดียว",
      brand: "Toyota",
      model: "Hilux Revo 2.4 Entry",
      color: "ขาว",
      plateNumber: "2ฒข 4411",
      province: "กรุงเทพมหานคร",
      year: "2023",
      vin: "MROHA8CD12349911",
      engineNo: "2GD-881234",
      status: "active",
      notes: "ตู้ทึบสูง 2.1 เมตร ส่งร้านค้าปลีก/ซูเปอร์มาร์เก็ต",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2024-02-15T09:00:00.000Z"
    },
    {
      id: "veh-004",
      code: "CK-04",
      name: "รถกระบะจัดซื้อข้าว/ตรวจงาน",
      type: "รถกระบะ 4 ประตู",
      brand: "Isuzu",
      model: "D-Max Hi-Lander 1.9 Ddi",
      color: "บรอนซ์เงิน",
      plateNumber: "1ฒณ 8899",
      province: "กรุงเทพมหานคร",
      year: "2022",
      vin: "MP1TFR87J55443322",
      engineNo: "RZ4E-994433",
      status: "active",
      notes: "รถสำหรับทีมจัดซื้อออกตรวจคุณภาพข้าวตามแปลงและสหกรณ์",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2024-03-01T10:00:00.000Z"
    },
    {
      id: "veh-005",
      code: "CK-05",
      name: "รถตู้ส่งด่วน/สำนักงาน",
      type: "รถตู้",
      brand: "Toyota",
      model: "Commuter 2.8 Diesel",
      color: "บรอนซ์เงิน",
      plateNumber: "นข 3322",
      province: "นนทบุรี",
      year: "2019",
      vin: "MROFX22P99887766",
      engineNo: "1GD-554433",
      status: "inactive",
      notes: "รอซ่อมช่วงล่างชั่วคราว ปัจจุบันพักการใช้งาน",
      createdBy: "สมศักดิ์ ข้าวดี (หัวหน้าคลัง)",
      createdAt: "2024-01-20T11:00:00.000Z"
    }
  ],
  insurance_docs: [
    {
      id: "ins-001",
      vehicleId: "veh-001",
      company: "วิริยะประกันภัย",
      policyNumber: "VIR-2025-99881",
      startDate: "2025-09-20",
      endDate: "2026-09-20",
      premiumAmount: 28500,
      notes: "ประกันภัยชั้น 1 คุ้มครองสินค้าและอุบัติเหตุ",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2025-09-15T09:00:00.000Z"
    },
    {
      id: "ins-002",
      vehicleId: "veh-002",
      company: "ทิพยประกันภัย",
      policyNumber: "TIP-2025-44321",
      startDate: "2025-10-15",
      endDate: "2026-10-15",
      premiumAmount: 34000,
      notes: "ประกันภัยชั้น 1 สำหรับรถบรรทุกหนัก",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2025-10-10T10:00:00.000Z"
    },
    {
      id: "ins-003",
      vehicleId: "veh-003",
      company: "กรุงเทพประกันภัย",
      policyNumber: "BKI-2025-11223",
      startDate: "2025-11-05",
      endDate: "2026-11-05",
      premiumAmount: 18500,
      notes: "ประกันชั้น 1 คุ้มครองตู้ทึบและตัวรถ",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2025-11-01T11:00:00.000Z"
    },
    {
      id: "ins-004",
      vehicleId: "veh-004",
      company: "เมืองไทยประกันภัย",
      policyNumber: "MTI-2025-77665",
      startDate: "2025-12-01",
      endDate: "2026-12-01",
      premiumAmount: 16200,
      notes: "ประกันชั้น 1 ซ่อมห้าง",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2025-11-25T14:00:00.000Z"
    }
  ],
  prb_docs: [
    {
      id: "prb-001",
      vehicleId: "veh-001",
      prbNumber: "PRB-2025-001234",
      startDate: "2025-09-20",
      endDate: "2026-09-20",
      cost: 1250,
      notes: "พ.ร.บ. รถบรรทุกขนาดกลาง",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2025-09-15T09:15:00.000Z"
    },
    {
      id: "prb-002",
      vehicleId: "veh-002",
      prbNumber: "PRB-2025-005678",
      startDate: "2025-10-15",
      endDate: "2026-10-15",
      cost: 1450,
      notes: "พ.ร.บ. รถบรรทุกขนาดใหญ่",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2025-10-10T10:15:00.000Z"
    },
    {
      id: "prb-003",
      vehicleId: "veh-003",
      prbNumber: "PRB-2025-004411",
      startDate: "2025-10-10",
      endDate: "2026-10-10",
      cost: 967,
      notes: "พ.ร.บ. รถกระบะบรรทุก",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2025-10-05T11:00:00.000Z"
    },
    {
      id: "prb-004",
      vehicleId: "veh-004",
      prbNumber: "PRB-2025-008899",
      startDate: "2025-12-01",
      endDate: "2026-12-01",
      cost: 645,
      notes: "พ.ร.บ. รถยนต์นั่งส่วนบุคคล",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2025-11-25T14:15:00.000Z"
    }
  ],
  tax_docs: [
    {
      id: "tax-001",
      vehicleId: "veh-001",
      plateNumber: "70-1234",
      province: "นครปฐม",
      lastRenewalDate: "2025-09-20",
      expireDate: "2026-09-20",
      cost: 2100,
      notes: "ตรวจสภาพ ตรอ. ผ่านเรียบร้อย",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2025-09-15T09:30:00.000Z"
    },
    {
      id: "tax-002",
      vehicleId: "veh-002",
      plateNumber: "71-5678",
      province: "นครปฐม",
      lastRenewalDate: "2025-10-15",
      expireDate: "2026-10-15",
      cost: 3200,
      notes: "ตรวจสภาพรถใหญ่ ขนส่งนครปฐม",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2025-10-10T10:30:00.000Z"
    },
    {
      id: "tax-003",
      vehicleId: "veh-003",
      plateNumber: "2ฒข 4411",
      province: "กรุงเทพมหานคร",
      lastRenewalDate: "2025-10-10",
      expireDate: "2026-10-10",
      cost: 1050,
      notes: "ต่อทะเบียนกรมการขนส่งทางบก",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2025-10-05T11:30:00.000Z"
    },
    {
      id: "tax-004",
      vehicleId: "veh-004",
      plateNumber: "1ฒณ 8899",
      province: "กรุงเทพมหานคร",
      lastRenewalDate: "2025-11-15",
      expireDate: "2026-11-15",
      cost: 2450,
      notes: "ภาษีประจำปี ขนส่งพื้นที่ 5",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2025-11-10T14:30:00.000Z"
    }
  ],
  oil_changes: [
    {
      id: "oil-001",
      vehicleId: "veh-001",
      changeDate: "2026-06-15",
      currentMileage: 145000,
      oilDetails: "น้ำมันเครื่องดีเซลเกรดสังเคราะห์ 15W-40 (20 ลิตร) + กรองน้ำมันเครื่องแท้ Isuzu",
      cost: 3850,
      nextChangeDate: "2026-12-15",
      nextMileage: 155000,
      notes: "ตรวจเช็กระดับน้ำมันเกียร์และเฟืองท้ายปกติ",
      createdBy: "สมคิด ช่างประจำร้าน",
      createdAt: "2026-06-15T15:00:00.000Z"
    },
    {
      id: "oil-002",
      vehicleId: "veh-002",
      changeDate: "2026-05-20",
      currentMileage: 198000,
      oilDetails: "น้ำมันเครื่อง Hino Genuine 15W-40 + ไส้กรองเครื่อง + กรองดักน้ำ",
      cost: 5400,
      nextChangeDate: "2026-11-20",
      nextMileage: 210000,
      notes: "เปลี่ยนถ่ายตามรอบระยะทาง",
      createdBy: "สมคิด ช่างประจำร้าน",
      createdAt: "2026-05-20T16:00:00.000Z"
    },
    {
      id: "oil-003",
      vehicleId: "veh-003",
      changeDate: "2026-07-05",
      currentMileage: 62000,
      oilDetails: "Toyota Semi-Synthetic 10W-30 (7.5 ลิตร) + ไส้กรองน้ำมันเครื่อง",
      cost: 1650,
      nextChangeDate: "2026-10-05",
      nextMileage: 72000,
      notes: "ตรวจสภาพสายพานหน้าเครื่องยังดี",
      createdBy: "สมคิด ช่างประจำร้าน",
      createdAt: "2026-07-05T14:30:00.000Z"
    },
    {
      id: "oil-004",
      vehicleId: "veh-004",
      changeDate: "2026-08-01",
      currentMileage: 48500,
      oilDetails: "Isuzu Ddi Max 5W-30 สังเคราะห์แท้ 100% (7 ลิตร)",
      cost: 2200,
      nextChangeDate: "2026-11-01",
      nextMileage: 58500,
      notes: "เปลี่ยนไส้กรองอากาศร่วมด้วย",
      createdBy: "สมคิด ช่างประจำร้าน",
      createdAt: "2026-08-01T11:00:00.000Z"
    }
  ],
  maintenances: [
    {
      id: "mnt-001",
      vehicleId: "veh-001",
      repairDate: "2026-07-10",
      mileage: 147200,
      description: "เปลี่ยนผ้าเบรกหน้า-หลัง และเจียรจานเบรกคู่หน้า",
      garage: "อู่เจริญยนต์ นครปฐม",
      cost: 6500,
      notes: "เบรกหนึบปกติ ทดสอบระบบลมเบรกสมบูรณ์",
      createdBy: "สมศักดิ์ ข้าวดี (หัวหน้าคลัง)",
      createdAt: "2026-07-10T17:00:00.000Z"
    },
    {
      id: "mnt-002",
      vehicleId: "veh-002",
      repairDate: "2026-06-28",
      mileage: 201000,
      description: "เปลี่ยนยางหลัง 4 เส้น (Bridgestone R156) พร้อมตั้งศูนย์ถ่วงล้อ",
      garage: "บีควิก นครปฐม",
      cost: 44000,
      notes: "ยางเดิมดอกยางหมดเพื่อความปลอดภัยในการบรรทุกหนัก",
      createdBy: "สมศักดิ์ ข้าวดี (หัวหน้าคลัง)",
      createdAt: "2026-06-28T16:00:00.000Z"
    },
    {
      id: "mnt-003",
      vehicleId: "veh-003",
      repairDate: "2026-08-02",
      mileage: 63500,
      description: "เปลี่ยนแบตเตอรี่ GS Battery 85 แอมป์ (ลูกเดิมไฟไม่พอสตาร์ท)",
      garage: "ร้านนำชัยไดนาโม",
      cost: 3200,
      notes: "รับประกันแบตเตอรี่ 1 ปี",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2026-08-02T13:00:00.000Z"
    },
    {
      id: "mnt-004",
      vehicleId: "veh-004",
      repairDate: "2026-07-22",
      mileage: 47800,
      description: "ตรวจเช็กระบบแอร์ ล้างตู้แอร์แบบไม่ถอดคอนโซล และเติมน้ำยาแอร์ R134a",
      garage: "ศูนย์บริการอีซูซุนครปฐม",
      cost: 1850,
      notes: "แอร์เย็นฉ่ำปกติ กลิ่นสะอาด",
      createdBy: "มานะ ขยันงาน (ธุรการ)",
      createdAt: "2026-07-22T15:30:00.000Z"
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
  line_logs: [
    {
      id: "log-seed-01",
      timestamp: "2026-08-19T08:00:15.000Z",
      type: "insurance",
      vehiclePlate: "70-1234 (นครปฐม)",
      details: "แจ้งเตือนประกันรถล่วงหน้า 1 เดือน (หมดอายุ 20/09/2026 เหลือ 32 วัน)",
      status: "sent",
      errorMessage: null
    },
    {
      id: "log-seed-02",
      timestamp: "2026-08-19T08:00:16.000Z",
      type: "tax",
      vehiclePlate: "70-1234 (นครปฐม)",
      details: "แจ้งเตือนต่อทะเบียนล่วงหน้า 1 เดือน (ครบกำหนด 20/09/2026 เหลือ 32 วัน)",
      status: "sent",
      errorMessage: null
    },
    {
      id: "log-seed-03",
      timestamp: "2026-08-19T08:00:17.000Z",
      type: "prb",
      vehiclePlate: "70-1234 (นครปฐม)",
      details: "แจ้งเตือน พ.ร.บ. ใกล้หมดอายุ (หมดอายุ 20/09/2026 เหลือ 32 วัน)",
      status: "sent",
      errorMessage: null
    }
  ]
};
