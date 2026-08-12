/**
 * Ẽm copy deck.
 *
 * Vietnamese here is written for a Vietnamese reader rather than translated
 * word for word — particularly the medical language, where a literal rendering
 * of English hedging reads as evasive rather than careful. Vietnamese strings
 * also run roughly a quarter longer than their English counterparts, so any
 * layout consuming these must survive two lines where English takes one.
 */
export const en = {
  appName: "Ẽm",
  privacy: "Private by design",
  reminders: "Reminders",

  // Tabs
  "tab.today": "Today",
  "tab.calendar": "Calendar",
  "tab.log": "Log",
  "tab.insights": "Insights",
  "tab.care": "Care",

  // Today
  "today.eyebrow": "Ẽm atlas",
  "today.title": "Your body, today",
  "today.subtitle":
    "A calm read on your cycle signals, without pretending estimates are certainty.",
  "today.logToday": "Log today",
  "today.nextDays": "The next few days",
  "today.rhythmMap": "Rhythm map",
  "today.usefulNote": "Today’s useful note",

  // Predictions
  "prediction.nextPeriod": "Next period",
  "prediction.ovulation": "Ovulation",
  "prediction.fertileWindow": "Fertile window",
  "prediction.estimate": "estimate",
  "prediction.rangeExplainer":
    "Your recent cycles vary enough that a single date would overstate what Ẽm knows, so this shows a span.",
  "prediction.sharpening": "Predictions sharpen as your history grows.",

  // Confidence
  "confidence.high": "Strong signal",
  "confidence.medium": "Moderate signal",
  "confidence.low": "Needs more history",

  // Safety
  "safety.notContraception": "Fertility estimates are not contraception",
  "safety.notContraceptionBody":
    "Ẽm can explain timing signals, but it should not be your only method for avoiding pregnancy.",
  "safety.notDiagnostic": "Not a diagnostic tool",

  // Log
  "log.eyebrow": "Daily log",
  "log.title": "Log gently",
  "log.subtitle": "One honest signal beats a rushed full form.",
  "log.period": "Period",
  "log.bleedingToday": "Bleeding today",
  "log.periodExplainer":
    "Only turn this on for days you actually bled — it is what every prediction is built from.",
  "log.symptoms": "Symptoms",
  "log.pickMany": "Pick as many as apply.",
  "log.intensity": "Intensity",
  "log.privateNote": "Private note",
  "log.save": "Save daily log",
  "log.saved": "Saved",

  // Flow
  "flow.spotting": "Spotting",
  "flow.light": "Light",
  "flow.medium": "Medium",
  "flow.heavy": "Heavy",

  // Severity
  "severity.mild": "Mild",
  "severity.moderate": "Moderate",
  "severity.severe": "Severe",

  // Categories
  "category.physical": "Body",
  "category.mental": "Mood",
  "category.behavior": "Habits",

  // Care
  "care.eyebrow": "Care center",
  "care.title": "Privacy & support",
  "care.appearance": "Appearance",
  "care.mode": "Mode",
  "care.dataControls": "Health data controls",
  "care.notBuiltYet": "Not built yet",
  "care.exportData": "Export data as JSON",
  "care.deleteData": "Delete local data",

  // Appearance
  "appearance.system": "System",
  "appearance.light": "Light",
  "appearance.dark": "Dark",

  // Goals
  "goal.tracking": "Tracking",
  "goal.ttc": "Trying",
  "goal.pregnancy": "Pregnancy",
  "goal.contraception": "Avoiding",
  "goal.menopause": "Menopause"
} as const;

export type CopyKey = keyof typeof en;

export const vi: Record<CopyKey, string> = {
  appName: "Ẽm",
  privacy: "Riêng tư từ thiết kế",
  reminders: "Nhắc nhở",

  "tab.today": "Hôm nay",
  "tab.calendar": "Lịch",
  "tab.log": "Ghi",
  "tab.insights": "Phân tích",
  "tab.care": "Chăm sóc",

  "today.eyebrow": "Bản đồ Ẽm",
  "today.title": "Cơ thể bạn, hôm nay",
  "today.subtitle":
    "Một cái nhìn nhẹ nhàng về chu kỳ của bạn, không biến ước tính thành điều chắc chắn.",
  "today.logToday": "Ghi hôm nay",
  "today.nextDays": "Vài ngày tới",
  "today.rhythmMap": "Nhịp chu kỳ",
  "today.usefulNote": "Ghi chú hữu ích hôm nay",

  "prediction.nextPeriod": "Kỳ kinh tới",
  "prediction.ovulation": "Rụng trứng",
  "prediction.fertileWindow": "Cửa sổ thụ thai",
  "prediction.estimate": "ước tính",
  "prediction.rangeExplainer":
    "Các chu kỳ gần đây của bạn chênh lệch khá nhiều, nên Ẽm hiển thị một khoảng thay vì một ngày cụ thể mà nó chưa đủ cơ sở để khẳng định.",
  "prediction.sharpening": "Dự đoán sẽ chính xác hơn khi bạn ghi thêm dữ liệu.",

  "confidence.high": "Tín hiệu rõ",
  "confidence.medium": "Tín hiệu vừa",
  "confidence.low": "Cần thêm dữ liệu",

  "safety.notContraception": "Ước tính thụ thai không phải biện pháp tránh thai",
  "safety.notContraceptionBody":
    "Ẽm giúp bạn hiểu các tín hiệu về thời điểm, nhưng đừng dùng nó làm cách duy nhất để tránh thai.",
  "safety.notDiagnostic": "Không phải công cụ chẩn đoán",

  "log.eyebrow": "Nhật ký hằng ngày",
  "log.title": "Ghi nhẹ nhàng thôi",
  "log.subtitle": "Một tín hiệu thành thật có ích hơn một biểu mẫu điền vội.",
  "log.period": "Kỳ kinh",
  "log.bleedingToday": "Hôm nay có kinh",
  "log.periodExplainer":
    "Chỉ bật cho những ngày bạn thực sự ra máu — đây là dữ liệu gốc của mọi dự đoán.",
  "log.symptoms": "Triệu chứng",
  "log.pickMany": "Chọn tất cả những gì đúng với bạn.",
  "log.intensity": "Mức độ",
  "log.privateNote": "Ghi chú riêng",
  "log.save": "Lưu nhật ký",
  "log.saved": "Đã lưu",

  "flow.spotting": "Lấm tấm",
  "flow.light": "Ít",
  "flow.medium": "Vừa",
  "flow.heavy": "Nhiều",

  "severity.mild": "Nhẹ",
  "severity.moderate": "Vừa",
  "severity.severe": "Nặng",

  "category.physical": "Cơ thể",
  "category.mental": "Tâm trạng",
  "category.behavior": "Thói quen",

  "care.eyebrow": "Trung tâm chăm sóc",
  "care.title": "Riêng tư & hỗ trợ",
  "care.appearance": "Giao diện",
  "care.mode": "Mục tiêu",
  "care.dataControls": "Kiểm soát dữ liệu sức khỏe",
  "care.notBuiltYet": "Chưa xây dựng",
  "care.exportData": "Xuất dữ liệu dạng JSON",
  "care.deleteData": "Xóa dữ liệu trên máy",

  "appearance.system": "Hệ thống",
  "appearance.light": "Sáng",
  "appearance.dark": "Tối",

  "goal.tracking": "Theo dõi",
  "goal.ttc": "Đang mong con",
  "goal.pregnancy": "Mang thai",
  "goal.contraception": "Tránh thai",
  "goal.menopause": "Tiền mãn kinh"
};

export const dictionaries = { en, vi };
