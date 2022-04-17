const puppeteer = require("puppeteer");
const exportAmazonItemsToExcel = require("./exportService");

const BASE_URL = "https://www.amazon.com/";

const amazon = {
  browser: null,
  page: null,
  items: [],

  initialize: async () => {
    amazon.browser = await puppeteer.launch({
      args: [
        "--start-maximized", // you can also use '--start-fullscreen'
      ],
      headless: false,
    });

    amazon.page = await amazon.browser.newPage();
    await amazon.page.setViewport({ width: 1366, height: 768 });
    await amazon.page.goto(BASE_URL, { waitUntil: "networkidle2" });
  },

  changeZipCode: async (url, zipCode) => {
    await amazon.page.goto(url, { waitUntil: "networkidle2" });

    const deliveryButton = await amazon.page.$x(
      '//div[@id="contextualIngressPt"]'
    );

    /* Click on the delivery url button */
    await deliveryButton[0].click();

    // Writing the code
    await amazon.page.waitForSelector("#GLUXZipUpdateInput");
    await amazon.page.waitFor(1000);
    await amazon.page.type(
      'input[data-action="GLUXPostalInputAction"]',
      zipCode,
      {
        delay: 500,
      }
    );

    // Click apply button
    try {
      const applyButton = await amazon.page.$x(
        '//input[@aria-labelledby="GLUXZipUpdate-announce"]'
      );
      await applyButton[0].click();
    } catch (error) {
      console.log(error);
    }

    // Click done button
    try {
      await amazon.page.waitFor(1000);
      await amazon.page.waitForSelector("#GLUXConfirmClose");
      const continueButton = await amazon.page.$x(
        '//input[@id="GLUXConfirmClose"]'
      );

      await continueButton[1].click();
    } catch (error) {
      console.log(error);
    }
  },

  getPrice: async (url) => {
    await amazon.page.waitFor(1000);

    await amazon.page.goto(url, { waitUntil: "networkidle2" });

    // Get price
    const [getXpath] = await amazon.page.$x(
      '//div[@id="corePrice_feature_div"]//span[@class="a-offscreen"]'
    );
    const priceMsg = await amazon.page.evaluate(
      (name) => name?.innerText,
      getXpath
    );
    console.log(priceMsg);
    amazon.items.push({
      Link: url,
      Price: priceMsg?.replace("$", "") ?? 0,
    });
  },

  renderPrice: () => {
    console.log(amazon.items);

    const users = amazon.items;

    const workSheetColumnNames = ["Link", "Price"];

    const workSheetName = "Items_Final";
    const filePath = "./outputFiles/excel-from-js.xlsx";

    exportAmazonItemsToExcel(
      users,
      workSheetColumnNames,
      workSheetName,
      filePath
    );
  },
};

module.exports = amazon;
