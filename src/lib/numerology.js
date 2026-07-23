function digitSum(n) {
  return String(Math.abs(n))
    .split("")
    .reduce((s, d) => s + Number(d), 0);
}

export function reduceNumber(n) {
  let value = n;
  while (value > 9 && ![11, 22, 33].includes(value)) {
    value = digitSum(value);
  }
  return value;
}

export function calcNumerology(birthDate) {
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;

  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  const allDigits = `${day}${month}${year}`.split("").reduce((s, c) => s + Number(c), 0);
  const lifePath = reduceNumber(allDigits);

  const maturity = reduceNumber(reduceNumber(day + month) + reduceNumber(year));

  const now = new Date();
  const personalYear = reduceNumber(reduceNumber(day + month) + now.getFullYear());
  const personalMonth = reduceNumber(personalYear + (now.getMonth() + 1));

  return {
    day,
    month,
    year,
    lifePath,
    maturity,
    personalYear,
    personalMonth,
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth() + 1,
  };
}

export const LIFE_PATH_TEXT = {
  1: "Bạn là người tiên phong, độc lập và giàu ý chí. Bạn thích tự mình dẫn dắt hơn là đi theo, và học được nhiều nhất qua việc tự trải nghiệm.",
  2: "Bạn nhạy cảm, khéo hòa giải và làm việc tốt trong tập thể. Sự kiên nhẫn và khả năng lắng nghe là thế mạnh giúp bạn xây dựng các mối quan hệ bền vững.",
  3: "Bạn sáng tạo, hoạt ngôn và lạc quan. Nghệ thuật, giao tiếp và các hoạt động thể hiện bản thân là nơi bạn tỏa sáng nhất.",
  4: "Bạn thực tế, kỷ luật và đáng tin cậy. Bạn xây dựng nền tảng vững chắc cho cuộc sống bằng sự chăm chỉ và kế hoạch rõ ràng.",
  5: "Bạn yêu tự do, thích khám phá và dễ thích nghi với thay đổi. Sự linh hoạt giúp bạn nắm bắt cơ hội mà người khác bỏ lỡ.",
  6: "Bạn có trách nhiệm, quan tâm đến gia đình và cộng đồng. Bạn tìm thấy ý nghĩa cuộc sống qua việc chăm sóc và giúp đỡ người khác.",
  7: "Bạn có chiều sâu nội tâm, thích phân tích và tìm hiểu bản chất vấn đề. Bạn cần thời gian riêng để suy ngẫm và phát triển trí tuệ.",
  8: "Bạn có tư duy quản lý, hướng đến thành công vật chất và địa vị. Khả năng tổ chức và tầm nhìn dài hạn là lợi thế lớn của bạn.",
  9: "Bạn nhân hậu, giàu lòng vị tha và có tầm nhìn nhân văn rộng lớn. Bạn thường hướng năng lượng của mình để đóng góp cho những điều lớn hơn bản thân.",
  11: "Bạn nhạy cảm đặc biệt và có trực giác mạnh mẽ. Bạn có khả năng truyền cảm hứng cho người khác nhưng cũng cần học cách làm chủ sự lo lắng của chính mình.",
  22: "Bạn có khả năng biến ý tưởng lớn thành hiện thực. Sự kết hợp giữa tầm nhìn và tính thực tế giúp bạn tạo ra ảnh hưởng lâu dài.",
  33: "Bạn có tấm lòng nhân ái sâu sắc và khả năng dẫn dắt bằng sự đồng cảm. Bạn thường được tin tưởng để hướng dẫn và chữa lành cho người khác.",
};

export const PERSONAL_YEAR_TEXT = {
  1: "Năm khởi đầu mới — thời điểm tốt để đặt ra mục tiêu, bắt đầu dự án hoặc thay đổi lớn.",
  2: "Năm của sự hợp tác và kiên nhẫn — mọi việc cần thời gian, hãy chú trọng xây dựng quan hệ.",
  3: "Năm đầy cảm hứng và giao tiếp — tận dụng các cơ hội kết nối, thể hiện bản thân.",
  4: "Năm của nền tảng và kỷ luật — tập trung củng cố công việc, tài chính và các cam kết dài hạn.",
  5: "Năm nhiều biến động và cơ hội — hãy sẵn sàng thích nghi và đón nhận thay đổi.",
  6: "Năm của gia đình và trách nhiệm — các vấn đề về nhà cửa, người thân cần được quan tâm.",
  7: "Năm nhìn lại nội tâm — phù hợp để học hỏi, nghiên cứu và tái cân bằng cuộc sống.",
  8: "Năm của thành quả và tài chính — công sức trước đó có thể được đền đáp, chú ý quản lý tiền bạc.",
  9: "Năm kết thúc một chu kỳ — thời điểm buông bỏ những gì không còn phù hợp để chuẩn bị cho khởi đầu mới.",
};

export const PERSONAL_MONTH_TEXT = {
  1: "Hãy bắt đầu! Bắt đầu một cái gì đó mới.",
  2: "Tháng của sự hợp tác — lắng nghe và kiên nhẫn với người khác.",
  3: "Tháng thuận lợi để giao tiếp, kết nối và thể hiện ý tưởng.",
  4: "Tháng cần tập trung vào công việc và tổ chức lại kế hoạch.",
  5: "Tháng nhiều thay đổi bất ngờ — hãy linh hoạt đón nhận.",
  6: "Tháng của gia đình và các mối quan hệ gần gũi.",
  7: "Tháng phù hợp để nghỉ ngơi, suy ngẫm và học hỏi.",
  8: "Tháng của kết quả công việc và tài chính.",
  9: "Tháng để hoàn tất, tổng kết trước khi bước sang chu kỳ mới.",
};
