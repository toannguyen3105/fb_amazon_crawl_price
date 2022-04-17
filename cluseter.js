const { Cluster } = require("puppeteer-cluster");
const reader = require("xlsx");
const amz = require("./amazon");

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

const urls = getLink();

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 5,
    puppeteerOptions: {
      headless: false,
      defaultViewport: false,
      userDataDir: "./tmp",
    },
  });

  await cluster.task(async ({ amz, data: url }) => {
    await amz.initialize();

    await amz.changeZipCode(FIXED_URL, ZIP_CODE);

    await amz.getPrice(url, ZIP_CODE);

    amz.renderPrice();

    debugger;
  });

  for (const url of urls) {
    await cluster.queue(url);
  }

  //   await cluster.idle();
  //   await cluster.close();
})();
