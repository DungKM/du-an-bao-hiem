export const FINANCIAL_SURVEY_QUESTIONS = [
  {
    id: "life_goals",
    number: 1,
    title: "Em có đồng ý cuộc sống của chúng ta được an vui khi...",
    options: [
      ["quality_life", "Chất lượng cuộc sống luôn được tốt", "Đủ chi phí sinh hoạt, được đi du lịch mỗi năm 3 lần, thường xuyên chăm sóc sức khỏe và tận hưởng giải trí cùng gia đình."],
      ["loved_ones_happy", "Người thân yêu luôn hạnh phúc", "Gia đình luôn hòa thuận, ông bà cha mẹ khỏe mạnh, vợ chồng thấu hiểu, con cái ngoan ngoãn."],
      ["children_dreams", "Con cái thực hiện được ước mơ", "Con được học hành đến nơi đến chốn, có nghề nghiệp ổn định, theo đuổi đam mê và thành công trong sự nghiệp."],
    ],
  },
  {
    id: "financial_pieces",
    number: 2,
    title: "Em đã chuẩn bị những mảnh ghép tài chính hoàn hảo để giúp gia đình mình có một tương lai xác định chưa?",
    options: [
      ["retirement_fund", "Quỹ lương hưu", "Quỹ tiết kiệm dài hạn nhằm đảm bảo nguồn tài chính sau khi nghỉ việc và duy trì mức sống ổn định."],
      ["emergency_fund", "Quỹ dự phòng", "Khoản tiền thiết yếu để đối phó với tình huống khẩn cấp như mất việc, bệnh tật hoặc sửa chữa đột xuất."],
      ["education_fund", "Quỹ học vấn", "Quỹ độc lập tài trợ chi phí giáo dục tương lai cho con cái hoặc bản thân, giảm bớt gánh nặng học phí."],
      ["startup_fund", "Quỹ khởi nghiệp", "Nguồn vốn ban đầu để biến ý tưởng kinh doanh thành hiện thực, phục vụ nghiên cứu, thiết bị, mặt bằng và vận hành."],
      ["healthcare_fund", "Quỹ chăm sóc y tế", "Tiền dành riêng cho chi phí y tế không dự kiến hoặc định kỳ, giúp tiếp cận dịch vụ chăm sóc sức khỏe tốt khi cần."],
    ],
  },
  {
    id: "financial_risks",
    number: 5,
    title: "Những rủi ro nào có thể ảnh hưởng đến an toàn tài chính?",
    options: [
      ["job", "Công việc", "Nguồn thu nhập chính có thể bị gián đoạn do mất việc, doanh nghiệp phá sản, thị trường biến động hoặc năng lực nghề nghiệp không còn phù hợp."],
      ["health", "Sức khỏe", "Bệnh tật hoặc tai nạn có thể làm mất khả năng lao động, giảm thu nhập và làm chi phí điều trị, chăm sóc tăng lên."],
    ],
  },
  {
    id: "income_loss",
    number: 6,
    title: "Giả sử chẳng may mất đi nguồn thu nhập chính, chi phí sinh hoạt hàng tháng của gia đình sẽ lấy từ đâu?",
    options: [
      ["savings", "Các khoản tiết kiệm", "Sử dụng quỹ tiết kiệm hiện có để trang trải sinh hoạt trong thời gian chưa có nguồn thu nhập thay thế."],
      ["sell_assets", "Bán tài sản hiện có", "Thanh lý nhà đất, xe hoặc các khoản đầu tư có tính thanh khoản để có tiền trang trải sinh hoạt tạm thời."],
      ["family_work_early", "Đẩy người thân ra đời làm việc sớm", "Người thân phải đi làm sớm, có thể bỏ lỡ cơ hội học tập và tiếp tục chu kỳ khó khăn tài chính qua các thế hệ."],
      ["reserve_income", "Dùng 10 - 20% thu nhập", "Chủ động dành một phần thu nhập mỗi tháng để xây dựng quỹ dự phòng trước rủi ro mất thu nhập."],
    ],
  },
].map((question) => ({
  ...question,
  options: question.options.map(([id, label, description]) => ({ id, label, description })),
}));

export function getDefaultSurveyAnswers() {
  return Object.fromEntries(FINANCIAL_SURVEY_QUESTIONS.map((question) => [question.id, []]));
}

export function normalizeSurveyAnswers(answers) {
  const normalized = getDefaultSurveyAnswers();
  for (const question of FINANCIAL_SURVEY_QUESTIONS) {
    if (Array.isArray(answers?.[question.id])) {
      normalized[question.id] = answers[question.id].filter((id) => question.options.some((option) => option.id === id));
    }
  }
  return normalized;
}
