const amz = require("./amazon");
const reader = require("xlsx");

const ZIP_CODE = "10001";
const FIXED_URL = "https://www.amazon.com/dp/B07RJ3XLM8";

const getLink = () => {
  // Reading our test file
  const file = reader.readFile("./Items.xlsx");

  let data = [];

  const sheets = file.SheetNames;

  for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
    temp.forEach((res) => {
      data.push(res["Link"]);
    });
  }

  return data;
};

(async () => {
  await amz.initialize();

  await amz.changeZipCode(FIXED_URL, ZIP_CODE);

  const links = getLink();

  for (let i = 0; i < links.length; i++) {
    let url = links[i];
    await amz.getPrice(url, ZIP_CODE);
  }

  amz.renderPrice();

  debugger;
})();
