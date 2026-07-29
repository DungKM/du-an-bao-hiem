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

  const now = new Date();
  const personalYear = reduceNumber(reduceNumber(day + month) + now.getFullYear());
  const personalMonth = reduceNumber(personalYear + (now.getMonth() + 1));

  const birthDayNumber = reduceNumber(day);
  const attitude = reduceNumber(reduceNumber(day) + reduceNumber(month));

  return {
    day,
    month,
    year,
    lifePath,
    personalYear,
    personalMonth,
    birthDayNumber,
    attitude,
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth() + 1,
  };
}

const LETTER_VALUES = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

function sumLetters(name, predicate) {
  const letters = String(name)
    .toUpperCase()
    .split("")
    .filter((ch) => LETTER_VALUES[ch] && predicate(ch));
  if (!letters.length) return 0;
  return reduceNumber(letters.reduce((s, ch) => s + LETTER_VALUES[ch], 0));
}

export function calcNameNumbers(fullName) {
  return {
    destiny: sumLetters(fullName, () => true),
    soulUrge: sumLetters(fullName, (ch) => VOWELS.has(ch)),
    personality: sumLetters(fullName, (ch) => !VOWELS.has(ch)),
  };
}

function reduceFully(n) {
  let value = n;
  while (value > 9) value = digitSum(value);
  return value;
}

export function calcPinnacles(lifePath, birthYear) {
  const firstEndAge = 36 - reduceFully(lifePath);
  return [1, 2, 3, 4].map((n) => {
    const age = firstEndAge + (n - 1) * 9;
    return { label: `Đỉnh ${n}`, age, year: birthYear + age };
  });
}

export const LIFE_PATH_SHORT = {
  1: "Người tiên phong độc lập",
  2: "Người hòa giải nhạy cảm",
  3: "Thích nổi bật",
  4: "Người thực tế kỷ luật",
  5: "Người yêu tự do",
  6: "Người trách nhiệm gia đình",
  7: "Người sâu sắc bí ẩn",
  8: "Người quản lý thành đạt",
  9: "Người nhân hậu vị tha",
  11: "Người trực giác nhạy bén",
  22: "Người kiến tạo tầm nhìn",
  33: "Người dẫn dắt nhân ái",
};

export const DESTINY_SHORT = {
  1: "Người lãnh đạo & ra quyết định",
  2: "Người kết nối & hòa giải",
  3: "Người truyền cảm hứng",
  4: "Người xây dựng nền tảng",
  5: "Người tiên phong đổi mới",
  6: "Người chăm sóc & bảo vệ",
  7: "Người nghiên cứu chuyên sâu",
  8: "Người kiến tạo thành công",
  9: "Người cống hiến nhân loại",
  11: "Người truyền cảm hứng tâm linh",
  22: "Kiến trúc sư vĩ đại",
  33: "Người thầy của nhân loại",
};

export const SOUL_URGE_SHORT = {
  1: "Khát khao độc lập",
  2: "Khát khao yêu thương",
  3: "Người có sức quyến rũ",
  4: "Khát khao ổn định",
  5: "Khát khao tự do",
  6: "Khát khao yêu thương gia đình",
  7: "Khát khao tri thức",
  8: "Khát khao thành công",
  9: "Khát khao cống hiến",
  11: "Khát khao giác ngộ",
  22: "Khát khao kiến tạo lớn lao",
  33: "Khát khao chữa lành",
};

export const PERSONALITY_SHORT = {
  1: "Mạnh mẽ & quyết đoán",
  2: "Nhẹ nhàng & tinh tế",
  3: "Vui vẻ & cuốn hút",
  4: "Nghiêm túc & đáng tin",
  5: "Năng động & phóng khoáng",
  6: "Ấm áp & chu đáo",
  7: "Nghiêm túc & bí ẩn",
  8: "Uy nghiêm & quyền lực",
  9: "Rộng lượng & cuốn hút",
  11: "Kỳ bí & cuốn hút",
  22: "Điềm tĩnh & đáng tin cậy",
  33: "Nhân hậu & ấm áp",
};

export const LIFE_PATH_TEXT = {
  1: "Bạn là người tiên phong, độc lập và giàu ý chí. Bạn thích tự mình dẫn dắt hơn là đi theo, và học được nhiều nhất qua việc tự trải nghiệm.",
  2: "Bạn nhạy cảm, khéo hòa giải và làm việc tốt trong tập thể. Sự kiên nhẫn và khả năng lắng nghe là thế mạnh giúp bạn xây dựng các mối quan hệ bền vững.",
  3: `Con số đường đời 3 thích nổi bật! Bạn sống "cuộc sống của những bữa tiệc", được yêu thích và quảng giao. Năng lượng của bạn thúc đẩy sự mở rộng. (nếu bạn kể 1 câu chuyện cho những người có con số đường đời 3, họ sẽ cải biến câu chuyện khi kể lại cho người khác, sử dụng các từ hoa mỹ, nhấn nhá và chắc chắn là thêm 1 số chi tiết cường điệu). Sự lạc quan và nhiệt tình của bạn có khả năng lan truyền. Bạn cần giải tỏa năng lượng sáng tạo của mình, nếu không nó sẽ bùng nổ dưới dạng cảm xúc.

Cảm xúc của bạn có thể dễ dàng bị tổn thương, đặc biệt là bằng lời nói, điều này thật trớ trêu, vì bản thân bạn cũng có cái lưỡi sắc bén và hiếm khi gặp khó khăn trong việc thể hiện bản thân. Trên thực tế, bạn phải cẩn trọng để xem mình có đang hỗn xược, hoài nghi hoặc ủ rũ không. Hãy nhớ rằng lời nói của bạn có thể làm tổn thương người khác, vì vậy hãy cẩn thận khi sử dụng chúng. Bạn có thể rất khắt khe với bản thân và có tâm lý tự ti. Bạn sử dụng năng khiếu hài hước của mình để che giấu cảm xúc bị tổn thương và sự bất an, nhưng cách đối phó này có thể bị nhận ra dễ dàng hơn bạn nghĩ.

Nhìn chung, bạn cần thêm hành động chủ động vào những mối quan hệ thân thiết nhất của mình để mọi người xung quanh cảm thấy họ được trân trọng.

Tài năng nghề nghiệp của con số đường đời này là sự sáng tạo. Nhạc sĩ, diễn viên, nghệ sĩ, vũ công, nhà văn, đầu bếp là 1 vài lựa chọn nghề nghiệp nổi trội để bạn cân nhắc. Ở mức độ rung động thấp, bạn có thể thoái thác trách nhiệm, sống vô tổ chức và chìm đắm trong tâm lý nạn nhân, phẫn nộ với bất kỳ ai tranh giành sự chú ý với bạn. Khi nỗ lực hết mình và thể hiện sự tích cực, bạn có thể trở thành nguồn động lực truyền cảm hứng, nâng cao tinh thần và mang lại niềm vui cho những người xung quanh.

Về sức khỏe, bạn có khả năng tăng và giảm cân nhanh chóng, đôi khi ở mức báo động. Hầu hết những người có con số đường đời 3 đều được ban cho vẻ ngoài ưa nhìn và nụ cười đẹp. Cân nặng luôn dao động, trạng thái tinh thần và các vấn đề về họng là những vấn đề sức khỏe mà bạn cần chú ý.

Số 3 có hình dáng giống như một cặp móng ngựa nằm ngang và được coi là con số may mắn nhất. Đừng bao giờ coi vận may của bạn là điều hiển nhiên!`,
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

export const DESTINY_TEXT = {
  1: `Bạn thích làm như vậy theo cách riêng của mình và thường làm như vậy. Trong sự nghiệp, bạn tìm kiếm không gian phát triển để duy trì động lực, và nhiều khả năng sẽ vươn lên vị trí người chịu trách nhiệm. Sự sáng tạo giúp bạn có kỹ năng giải quyết vấn đề nhanh chóng.

Bạn có tầm nhìn xa tuyệt vời và những ý tưởng sáng tạo, đồng thời xuất sắc trong việc thu hút mọi người cùng tham gia để biến ý tưởng của bạn thành hiện thực. Số 1 cũng hào hứng với các ý tưởng, thực sự hào hứng, nhưng có thể mất hứng khi đi vào chi tiết và thường phải gặp khó khăn để duy trì và kết thúc toàn bộ quá trình. Hãy nhớ đặt các ranh giới và đứng lên bảo vệ chính mình.

Bạn sợ thất bại. Nếu không nghĩ rằng mình giỏi nhất ở lĩnh vực nào đó, bạn thậm chí sẽ không thử. Ở mặt tối tính cách, bạn có thể hách dịch, thiếu kiên nhẫn, kiêu ngạo, ích kỷ và lạm dụng sức ảnh hưởng của mình cho những mục đích xấu.

Hãy đón nhận và phát huy tài năng thiên bẩm và lãnh đạo, khả năng truyền cảm hứng, suy nghĩ độc lập và những ý tưởng độc đáo. Hãy sẵn lòng chia sẻ tính sáng tạo của bạn. Cuối cùng, con số vận mệnh 1 đòi hỏi bạn phải tận dụng những tài năng này và tạo cơ hội để hoàn thành tầm nhìn của mình.`,
  2: "Sứ mệnh của bạn là kết nối và dung hòa các bên. Bạn tỏa sáng trong vai trò hỗ trợ, ngoại giao, hoặc bất cứ công việc nào cần sự tinh tế trong quan hệ con người.",
  3: "Bạn sinh ra để truyền cảm hứng bằng lời nói, hình ảnh hoặc nghệ thuật. Thế giới cần bạn thể hiện bản thân và lan tỏa niềm vui, sự sáng tạo đến những người xung quanh.",
  4: "Sứ mệnh của bạn là xây dựng những nền tảng vững chắc và bền lâu. Bạn phù hợp với các công việc đòi hỏi quy trình, kỷ luật và sự tận tâm dài hạn.",
  5: "Bạn được sinh ra để trải nghiệm, khám phá và mang lại sự đổi mới. Sứ mệnh của bạn gắn liền với tự do, giao thương hoặc bất kỳ điều gì phá vỡ khuôn mẫu cũ.",
  6: "Sứ mệnh của bạn là chăm sóc, nuôi dưỡng và bảo vệ những người xung quanh. Bạn phù hợp với các vai trò liên quan đến gia đình, giáo dục, y tế hoặc cộng đồng.",
  7: "Bạn sinh ra để tìm kiếm sự thật và tri thức chuyên sâu. Sứ mệnh của bạn gắn với nghiên cứu, phân tích hoặc bất kỳ lĩnh vực nào đòi hỏi chiều sâu tư duy.",
  8: "Sứ mệnh của bạn là tạo dựng thành công vật chất và ảnh hưởng trên quy mô lớn. Bạn có năng lực thiên bẩm về quản lý, tài chính và tổ chức.",
  9: "Bạn sinh ra để cống hiến cho những điều lớn hơn bản thân mình. Sứ mệnh của bạn gắn liền với việc phụng sự cộng đồng, nghệ thuật nhân văn hoặc các hoạt động vì lợi ích chung.",
  11: "Sứ mệnh của bạn là truyền cảm hứng và nâng đỡ tinh thần người khác bằng trực giác đặc biệt của mình. Đây là con số của người dẫn đường tâm linh.",
  22: "Bạn được sinh ra để biến những giấc mơ lớn thành công trình thực tế, có tác động lâu dài đến nhiều người. Đây là con số của những nhà kiến tạo vĩ đại.",
  33: "Sứ mệnh của bạn là dẫn dắt bằng tình yêu thương vô điều kiện, chữa lành và nâng đỡ nhân loại. Đây là con số hiếm gặp của người thầy tinh thần.",
};

export const SOUL_URGE_TEXT = {
  1: "Sâu thẳm bên trong, bạn khao khát được độc lập và khẳng định bản thân. Bạn chỉ thực sự hạnh phúc khi được tự mình quyết định con đường của mình.",
  2: "Bạn khao khát sự hòa hợp, yêu thương và những mối quan hệ gắn bó. Cảm giác được cần đến và được yêu thương là điều nuôi dưỡng tâm hồn bạn.",
  3: `Mê hoặc và quyến rũ, con số linh hồn 3 khiến người khác bật cười và cảm thấy họ thật đặc biệt với tính cách nổi bật của họ. Bạn có xu hướng chạy theo những cuộc vui và đấu tranh với tâm lý "cỏ bên kia đồi luôn xanh hơn", điều này có thể khiến bạn trở nên thiếu độ tin cậy trong các mối quan hệ.

Bạn có thể che giấu cảm xúc thật của mình bằng sự hài hước và nói liên tục. Nếu bạn không vui, người khác sẽ biết được từ lời nói của bạn, điều này có thể giống như những nhát dao, được sử dụng với mục đích làm tổn thương.

Bài học của bạn luôn cho người khác sự công nhận mà họ xứng đáng được nhận, không coi mọi thứ là hiển nhiên và mọi người sẽ luôn bên bạn.`,
  4: "Bạn khao khát sự ổn định, trật tự và an toàn. Cảm giác kiểm soát được cuộc sống của mình là điều khiến bạn thấy bình yên.",
  5: "Bạn khao khát tự do tuyệt đối và những trải nghiệm mới mẻ. Sự lặp lại, gò bó khiến tâm hồn bạn cảm thấy ngột ngạt.",
  6: "Bạn khao khát yêu thương và được chăm sóc gia đình, người thân. Hạnh phúc của bạn gắn liền với hạnh phúc của những người bạn quan tâm.",
  7: "Bạn khao khát sự thật và hiểu biết sâu sắc về thế giới. Thời gian một mình để suy ngẫm là điều nuôi dưỡng tâm hồn bạn.",
  8: "Bạn khao khát thành công, địa vị và sự công nhận về năng lực. Cảm giác làm chủ được tài chính và cuộc sống là động lực nội tâm lớn nhất.",
  9: "Bạn khao khát được cống hiến và tạo ra khác biệt cho thế giới. Bạn cảm thấy trọn vẹn nhất khi giúp đỡ được nhiều người.",
  11: "Bạn khao khát sự giác ngộ và kết nối với những điều lớn lao hơn bản thân. Trực giác mạnh mẽ khiến bạn luôn tìm kiếm ý nghĩa sâu xa.",
  22: "Bạn khao khát để lại một di sản lớn lao, có giá trị thực tiễn cho nhiều thế hệ. Bạn không hài lòng với những điều nhỏ bé, tầm thường.",
  33: "Bạn khao khát chữa lành và nâng đỡ những người xung quanh bằng tình yêu vô điều kiện. Đây là khát khao của một trái tim vị tha hiếm có.",
};

export const PERSONALITY_TEXT = {
  1: "Người khác nhìn bạn như một người mạnh mẽ, quyết đoán và có phần độc lập. Bạn tạo ấn tượng của một người dẫn đầu ngay từ lần gặp đầu tiên.",
  2: "Bạn để lại ấn tượng nhẹ nhàng, dễ gần và biết lắng nghe. Người khác cảm thấy an toàn và thoải mái khi ở cạnh bạn.",
  3: "Bạn gây ấn tượng bởi sự vui vẻ, hoạt bát và duyên dáng trong giao tiếp. Người khác thường bị cuốn hút bởi năng lượng tích cực của bạn.",
  4: "Bạn tạo ấn tượng là người đáng tin cậy, nghiêm túc và có tổ chức. Người khác thường tìm đến bạn khi cần một chỗ dựa vững chắc.",
  5: "Bạn gây ấn tượng năng động, phóng khoáng và thích phiêu lưu. Người khác cảm nhận được ở bạn nguồn năng lượng tự do khó đoán.",
  6: "Bạn tạo ấn tượng ấm áp, chu đáo và có trách nhiệm. Người khác thường tìm đến bạn để được lắng nghe và chở che.",
  7: "Có nhận thức, quan sát tốt, thông minh, đàng hoàng, dè dặt, nội tâm, hướng nội, hay triết lý, lập dị, xa cách.",
  8: "Bạn tạo ấn tượng uy nghiêm, thành đạt và có quyền lực. Người khác dễ dàng nhận ra ở bạn phong thái của một nhà lãnh đạo.",
  9: "Bạn gây ấn tượng rộng lượng, cuốn hút và có tầm nhìn. Người khác cảm nhận được sự ấm áp và bao dung toát ra từ bạn.",
  11: "Bạn tạo ấn tượng kỳ bí, nhạy cảm và cuốn hút một cách khó lý giải. Người khác thường cảm thấy bạn có điều gì đó đặc biệt.",
  22: "Bạn gây ấn tượng điềm tĩnh, đáng tin cậy và có tầm nhìn xa. Người khác cảm nhận được sự chắc chắn toát ra từ bạn.",
  33: "Bạn tạo ấn tượng nhân hậu, ấm áp như một người dẫn dắt đầy yêu thương. Người khác thường tìm đến bạn để được an ủi và chỉ dẫn.",
};

export const BIRTHDAY_TEXT = {
  1: `Bạn là người độc lập, thích cạnh tranh và là 1 nhà lãnh đạo bẩm sinh.

Bạn là người sáng tạo với nhiều ý tưởng độc đáo và bạn thích nổi bật. Bạn chủ động và có thể khuấy động, tạo cảm hứng cho mọi người.

Bạn cũng có thể cứng đầu, ích kỷ và thất thường. Bài học tuyệt vời của bạn là học về ranh giới, chia sẻ và làm việc theo nhóm.`,
  2: "Bạn có năng khiếu bẩm sinh về ngoại giao và sự nhạy cảm với cảm xúc người khác. Đây là món quà giúp bạn dễ dàng xây dựng các mối quan hệ.",
  3: "Bạn có tài năng bẩm sinh về nghệ thuật, ngôn từ và sự sáng tạo. Đây là món quà giúp bạn dễ dàng thu hút sự chú ý của người khác.",
  4: "Bạn có năng khiếu bẩm sinh về tổ chức và làm việc có phương pháp. Đây là món quà giúp bạn xây dựng nền tảng vững chắc cho mọi việc.",
  5: "Bạn có tài năng bẩm sinh về sự linh hoạt và khả năng thích nghi nhanh. Đây là món quà giúp bạn dễ dàng nắm bắt cơ hội mới.",
  6: "Bạn có năng khiếu bẩm sinh về chăm sóc và tạo sự hài hòa cho những người xung quanh. Đây là món quà giúp bạn trở thành chỗ dựa cho gia đình.",
  7: "Bạn có tài năng bẩm sinh về phân tích và tư duy sâu sắc. Đây là món quà giúp bạn nhìn thấu bản chất của vấn đề.",
  8: "Bạn có năng khiếu bẩm sinh về quản lý tài chính và tổ chức quy mô lớn. Đây là món quà giúp bạn dễ dàng đạt được thành công vật chất.",
  9: "Bạn có tài năng bẩm sinh về lòng trắc ẩn và tầm nhìn nhân văn. Đây là món quà giúp bạn dễ dàng đồng cảm với người khác.",
  11: "Bạn có năng khiếu bẩm sinh đặc biệt về trực giác và sự nhạy cảm tâm linh. Đây là món quà hiếm có giúp bạn cảm nhận được những điều người khác bỏ lỡ.",
  22: "Bạn có tài năng bẩm sinh về việc biến ý tưởng lớn thành hiện thực. Đây là món quà giúp bạn tạo ra những công trình có giá trị lâu dài.",
  33: "Bạn có năng khiếu bẩm sinh về việc chữa lành và nâng đỡ tinh thần người khác. Đây là món quà hiếm có của một người thầy bẩm sinh.",
};

export const ATTITUDE_TEXT = {
  1: "Trước những tình huống mới, bản năng của bạn là hành động ngay và tự mình giải quyết. Bạn không thích chờ đợi người khác quyết định thay mình.",
  2: `Ấn tượng đầu tiên của người khác về bạn là một người tử tế, ngoại giao tốt và kiên nhẫn.

Sự nhạy cảm đáng kinh ngạc của bạn thường được thể hiện dưới dạng những lo lắng.

Hãy cẩn trọng về những gì bạn "nhận" từ người khác. Bạn không cần phải sở hữu những trải nghiệm, tâm trạng, ý kiến hoặc cảm xúc của người khác.`,
  3: "Trước những tình huống mới, bản năng của bạn là phản ứng bằng sự lạc quan và hài hước. Bạn thường biến khó khăn thành câu chuyện nhẹ nhàng hơn.",
  4: "Trước những tình huống mới, bản năng của bạn là tìm kiếm sự chắc chắn và một kế hoạch rõ ràng. Bạn không thích những thay đổi đột ngột.",
  5: "Trước những tình huống mới, bản năng của bạn là thích nghi nhanh và tìm lối thoát linh hoạt. Bạn dễ dàng xoay chuyển khi mọi thứ bất ngờ thay đổi.",
  6: "Trước những tình huống mới, bản năng của bạn là nghĩ đến người thân trước tiên. Bạn thường đặt trách nhiệm với gia đình lên hàng đầu.",
  7: "Trước những tình huống mới, bản năng của bạn là lùi lại quan sát và phân tích trước khi hành động. Bạn cần thời gian riêng để xử lý thông tin.",
  8: "Trước những tình huống mới, bản năng của bạn là đánh giá được và mất một cách thực tế. Bạn thường phản ứng theo hướng có lợi nhất về lâu dài.",
  9: "Trước những tình huống mới, bản năng của bạn là nghĩ đến ảnh hưởng chung trước khi nghĩ đến bản thân. Bạn dễ đồng cảm với hoàn cảnh của người khác.",
  11: "Trước những tình huống mới, bản năng của bạn là cảm nhận trước khi hiểu bằng lý trí. Trực giác thường mách bảo bạn trước khi có đủ thông tin.",
  22: "Trước những tình huống mới, bản năng của bạn là nhìn ngay ra bức tranh lớn và giải pháp thực tế. Bạn ít khi hoảng loạn trước vấn đề phức tạp.",
  33: "Trước những tình huống mới, bản năng của bạn là nghĩ đến việc xoa dịu và chữa lành cho những người bị ảnh hưởng. Sự đồng cảm luôn đến trước phán xét.",
};

export const MATURITY_TEXT = {
  1: "Khi bước vào nửa sau cuộc đời, bạn sẽ ngày càng khẳng định vai trò độc lập và dẫn dắt của mình. Đây là giai đoạn bạn thu hoạch thành quả từ sự tự chủ đã xây dựng.",
  2: "Khi bước vào nửa sau cuộc đời, các mối quan hệ và sự hợp tác sẽ trở thành trọng tâm. Đây là giai đoạn bạn tìm thấy bình yên trong sự gắn kết với người khác.",
  3: "Khi bước vào nửa sau cuộc đời, khả năng sáng tạo và thể hiện bản thân của bạn sẽ được công nhận rộng rãi hơn. Đây là giai đoạn bạn tỏa sáng theo cách riêng của mình.",
  4: "Bạn sẽ thấy mình trở thành người có kế hoạch, thực tế và có tổ chức hơn. Tránh việc quá cứng nhắc, không linh hoạt và cố chấp. Hãy nhớ dành thời gian để tận hưởng niềm vui.",
  5: "Khi bước vào nửa sau cuộc đời, bạn sẽ có nhiều tự do hơn để trải nghiệm và khám phá theo cách của riêng mình. Đây là giai đoạn bạn sống trọn với tinh thần phóng khoáng.",
  6: "Khi bước vào nửa sau cuộc đời, vai trò chăm sóc và dẫn dắt gia đình, cộng đồng sẽ trở nên rõ nét hơn. Đây là giai đoạn bạn được ghi nhận vì sự tận tâm của mình.",
  7: "Khi bước vào nửa sau cuộc đời, bạn sẽ đạt đến chiều sâu tri thức và sự thấu hiểu nội tâm. Đây là giai đoạn bạn trở thành người truyền đạt trí tuệ cho người khác.",
  8: "Khi bước vào nửa sau cuộc đời, thành quả về tài chính và địa vị sẽ trở nên rõ ràng hơn bao giờ hết. Đây là giai đoạn bạn gặt hái những gì đã nỗ lực xây dựng.",
  9: "Khi bước vào nửa sau cuộc đời, bạn sẽ tìm thấy ý nghĩa trọn vẹn qua việc cống hiến cho cộng đồng. Đây là giai đoạn bạn để lại di sản nhân văn của mình.",
  11: "Khi bước vào nửa sau cuộc đời, khả năng truyền cảm hứng của bạn sẽ chạm đến nhiều người hơn. Đây là giai đoạn sứ mệnh tâm linh của bạn được thể hiện rõ ràng.",
  22: "Khi bước vào nửa sau cuộc đời, những công trình và ý tưởng lớn của bạn sẽ thành hình rõ rệt. Đây là giai đoạn bạn để lại dấu ấn lâu dài cho nhiều người.",
  33: "Khi bước vào nửa sau cuộc đời, bạn sẽ trở thành người dẫn dắt và chữa lành cho những người xung quanh. Đây là giai đoạn sứ mệnh yêu thương của bạn được trọn vẹn nhất.",
};

export const PERSONAL_YEAR_SHORT = {
  1: "Khởi đầu mới",
  2: "Hợp tác và kiên nhẫn",
  3: "Các sự kiện xã hội và cảm xúc",
  4: "Nền tảng và kỷ luật",
  5: "Thay đổi và tự do",
  6: "Gia đình và trách nhiệm",
  7: "Nội tâm và tái tạo",
  8: "Thành quả và tài chính",
  9: "Hoàn tất chu kỳ",
};

export const PERSONAL_YEAR_TEXT = {
  1: "Năm khởi đầu mới — thời điểm tốt để đặt ra mục tiêu, bắt đầu dự án hoặc thay đổi lớn.",
  2: "Năm của sự hợp tác và kiên nhẫn — mọi việc cần thời gian, hãy chú trọng xây dựng quan hệ.",
  3: `Năm cá nhân 3 của bạn sẽ là 1 năm của các hoạt động và sự kiện xã hội, và bạn có thể thấy mình nổi tiếng hơn bình thường. Đây là năm của những kết nối tuyệt vời: Hãy sẵn sàng đón nhận những lời mời. Vũ trụ muốn tạo 1 số kết nối cho bạn trong năm nay! Hãy để chúng xảy ra. Chấp nhận mọi lời mời bạn nhận được và gặp gỡ nhiều người nhất có thể.

Đây cũng sẽ là 1 năm đầy cảm xúc, và điều này có nghĩa là bạn sẽ trải nghiệm mọi cung bậc cảm xúc: tức giận, sợ hãi, buồn bã, vui vẻ, thất vọng... Tìm một lối thoát sáng tạo mà bạn có thể chuyển hướng nguồn cảm xúc đang dâng cao của mình. Khả năng sáng tạo và kỹ năng giao tiếp của bạn sẽ đạt đến đỉnh cao trong năm nay.

Đây cũng là thời điểm định mệnh! Trong năm 3, bạn có thể sẽ gặp một người có ảnh hưởng lớn đến cuộc sống của bạn hoặc mang lại cho bạn cơ hội thay đổi cuộc đời.

Những người có năm cá nhân này yêu thích sự tăng trưởng và mở rộng. Hãy thận trọng, đừng phóng đại và tô điểm quá nhiều. Bạn cũng cần chú ý đến việc tăng cân.`,
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
