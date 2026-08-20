export const initialSeedData = {
  vehicles: [],
  insurance_docs: [],
  prb_docs: [],
  tax_docs: [],
  oil_changes: [],
  maintenances: [],
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
