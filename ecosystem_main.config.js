module.exports = {
  apps: [
    {
      name: "agdex-price-feeder",
      script: "./dist/src/main.js",
      watch: true,
      env: {
        PORT: 3001,
        DATABASE_URL:
          "mysql://root:RootRoot*123456@localhost:3306/aptos_off_chain",
        // DATABASE_URL: "mysql://root:111111@localhost:3306/aptos_off_chain",

        MODULE_ADDRESS:
          "0x5820ab6b148870afb4ce70569df5dd4442050d7d501778bcc282d2d4c45e948c",
        COIN_ADDRESS:
          "0x6f60af74988c64cd3b7c1e214697e6949db39c061d8d4cf59a7e2bd1b66c8bf0",

        PRICE_FEED_AND_SYNCER_PK:
          "0x8dddb9887ed4d275536a05d47cbaf810dc8873f617080b3fdc6afd81ff73798d",
        PRICE_FEEDER_ADDRESS:
          "0x7e783b349d3e89cf5931af376ebeadbfab855b3fa239b7ada8f5a92fbea6b387",
        APT_FEEDER_ADDRESS:
          "0x44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e",
        USDT_FEEDER_ADDRESS:
          "0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722",
        USDC_FEEDER_ADDRESS:
          "0x1fc18861232290221461220bd4e2acd1dcdfbc89c84092c93c18bdc7756c1588",
        BTC_FEEDER_ADDRESS:
          "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b",
        ETH_FEEDER_ADDRESS:
          "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6",

        UPDATE_PRICE_FEED: "ON",
        SYNC_POSITIONS: "ON",
        SYNC_ORDERS: "ON",
        EXECUTE_ORDERS: "OFF",
        EXECUTE_LIQUIDATION: "OFF",

        LIQUIDATOR_PK:
          "0xd7ff7eb426390042479b13393c0c3727f3790377d13bd28970639a7a787ee173",
        //apt
        EXECUTER_PK:
          "0x1b197f5236783789dd354d6968a1e7b3728350bfe62ebaf803afb3402acb0662",
        //usdc
        // EXECUTER_PK:
        //   "0xbd7f26f79f52b7248b89a8eac0abefc4b34bd615dc0a04ee7829b5dbad588a71",
        //usdt
        // EXECUTER_PK:
        //   "0xca6545daf272ca7e95f741553003877c003511a0c047716eb1fef9e8bbeed037",
        VAULT_APT: "ON",
        VAULT_USDC: "OFF",
        VAULT_USDT: "OFF",
      },
    },
    {
      name: "agdex-2-usdc-executer",
      script: "./dist/src/main.js",
      watch: true,
      env: {
        PORT: 3002,
        DATABASE_URL:
          "mysql://root:RootRoot*123456@localhost:3306/aptos_off_chain",
        // DATABASE_URL: "mysql://root:111111@localhost:3306/aptos_off_chain",

        MODULE_ADDRESS:
          "0x5820ab6b148870afb4ce70569df5dd4442050d7d501778bcc282d2d4c45e948c",
        COIN_ADDRESS:
          "0x6f60af74988c64cd3b7c1e214697e6949db39c061d8d4cf59a7e2bd1b66c8bf0",

        PRICE_FEED_AND_SYNCER_PK:
          "0x8dddb9887ed4d275536a05d47cbaf810dc8873f617080b3fdc6afd81ff73798d",
        PRICE_FEEDER_ADDRESS:
          "0x7e783b349d3e89cf5931af376ebeadbfab855b3fa239b7ada8f5a92fbea6b387",
        APT_FEEDER_ADDRESS:
          "0x44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e",
        USDT_FEEDER_ADDRESS:
          "0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722",
        USDC_FEEDER_ADDRESS:
          "0x1fc18861232290221461220bd4e2acd1dcdfbc89c84092c93c18bdc7756c1588",
        BTC_FEEDER_ADDRESS:
          "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b",
        ETH_FEEDER_ADDRESS:
          "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6",

        UPDATE_PRICE_FEED: "OFF",
        SYNC_POSITIONS: "ON",
        SYNC_ORDERS: "ON",
        EXECUTE_ORDERS: "OFF",
        EXECUTE_LIQUIDATION: "OFF",

        LIQUIDATOR_PK:
          "0xd7ff7eb426390042479b13393c0c3727f3790377d13bd28970639a7a787ee173",
        //apt
        // EXECUTER_PK:
        //   "0x1b197f5236783789dd354d6968a1e7b3728350bfe62ebaf803afb3402acb0662",
        //usdc
        EXECUTER_PK:
          "0xbd7f26f79f52b7248b89a8eac0abefc4b34bd615dc0a04ee7829b5dbad588a71",
        //usdt
        // EXECUTER_PK:
        //   "0xca6545daf272ca7e95f741553003877c003511a0c047716eb1fef9e8bbeed037",
        VAULT_APT: "OFF",
        VAULT_USDC: "ON",
        VAULT_USDT: "ON",
      },
    },
  ],
};
