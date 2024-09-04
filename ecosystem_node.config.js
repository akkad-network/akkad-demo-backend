const {
  SCRIPT_SRC,
  DATABASE_URL,
  MODULE_ADDRESS,
  COIN_ADDRESS,
  PRICE_FEEDER_ADDRESS,
  PRICE_FEED_AND_SYNCER_PK,
  APT_FEEDER_ADDRESS,
  USDT_FEEDER_ADDRESS,
  USDC_FEEDER_ADDRESS,
  BTC_FEEDER_ADDRESS,
  ETH_FEEDER_ADDRESS,
  BNB_FEEDER_ADDRESS,
  SOL_FEEDER_ADDRESS,
  AVAX_FEEDER_ADDRESS,
  PEPE_FEEDER_ADDRESS,
  DOGE_FEEDER_ADDRESS,
  EXECUTER_PK_1,
  EXECUTER_PK_2,
  EXECUTER_PK_3,
  LIQUIDATOR_PK,
} = require("./ecosystem_base");

module.exports = {
  apps: [
    {
      name: "agdex-1-executer",
      script: SCRIPT_SRC,
      watch: true,
      env: {
        PORT: 3001,

        DATABASE_URL: DATABASE_URL,
        MODULE_ADDRESS: MODULE_ADDRESS,
        COIN_ADDRESS: COIN_ADDRESS,

        PRICE_FEEDER_ADDRESS: PRICE_FEEDER_ADDRESS,
        APT_FEEDER_ADDRESS: APT_FEEDER_ADDRESS,
        USDT_FEEDER_ADDRESS: USDT_FEEDER_ADDRESS,
        USDC_FEEDER_ADDRESS: USDC_FEEDER_ADDRESS,
        BTC_FEEDER_ADDRESS: BTC_FEEDER_ADDRESS,
        ETH_FEEDER_ADDRESS: ETH_FEEDER_ADDRESS,
        BNB_FEEDER_ADDRESS: BNB_FEEDER_ADDRESS,
        SOL_FEEDER_ADDRESS: SOL_FEEDER_ADDRESS,
        AVAX_FEEDER_ADDRESS: AVAX_FEEDER_ADDRESS,
        PEPE_FEEDER_ADDRESS: PEPE_FEEDER_ADDRESS,
        DOGE_FEEDER_ADDRESS: DOGE_FEEDER_ADDRESS,

        //private keys
        PRICE_FEED_AND_SYNCER_PK: PRICE_FEED_AND_SYNCER_PK,
        EXECUTER_PK: EXECUTER_PK_1,
        LIQUIDATOR_PK: LIQUIDATOR_PK,

        //sync func
        SYNC_POSITIONS: "OFF",
        SYNC_ORDERS: "OFF",
        SYNC_VAULT_CONFIG: "OFF",
        SYNC_LP_TOKEN_PRICE: "OFF",

        //onchain func
        UPDATE_PRICE_FEED: "OFF",
        EXECUTE_ORDERS: "ON",
        EXECUTE_LIQUIDATION: "OFF",

        //vault switcher
        VAULT_APT: "ON",
        VAULT_USDC: "OFF",
        VAULT_USDT: "OFF",
        VAULT_BTC: "ON",
        VAULT_ETH: "ON",

        //clear price data
        CLEAR_PRICE_DATA: "OFF",

        //test
        BATCH_TEST: "OFF",
      },
    },
    {
      name: "agdex-2-executer",
      script: SCRIPT_SRC,
      watch: true,
      env: {
        PORT: 3002,

        DATABASE_URL: DATABASE_URL,
        MODULE_ADDRESS: MODULE_ADDRESS,
        COIN_ADDRESS: COIN_ADDRESS,

        PRICE_FEEDER_ADDRESS: PRICE_FEEDER_ADDRESS,
        APT_FEEDER_ADDRESS: APT_FEEDER_ADDRESS,
        USDT_FEEDER_ADDRESS: USDT_FEEDER_ADDRESS,
        USDC_FEEDER_ADDRESS: USDC_FEEDER_ADDRESS,
        BTC_FEEDER_ADDRESS: BTC_FEEDER_ADDRESS,
        ETH_FEEDER_ADDRESS: ETH_FEEDER_ADDRESS,
        BNB_FEEDER_ADDRESS: BNB_FEEDER_ADDRESS,
        SOL_FEEDER_ADDRESS: SOL_FEEDER_ADDRESS,
        AVAX_FEEDER_ADDRESS: AVAX_FEEDER_ADDRESS,
        PEPE_FEEDER_ADDRESS: PEPE_FEEDER_ADDRESS,
        DOGE_FEEDER_ADDRESS: DOGE_FEEDER_ADDRESS,

        //private keys
        PRICE_FEED_AND_SYNCER_PK: PRICE_FEED_AND_SYNCER_PK,
        EXECUTER_PK: EXECUTER_PK_2,
        LIQUIDATOR_PK: LIQUIDATOR_PK,

        //sync func
        SYNC_POSITIONS: "OFF",
        SYNC_ORDERS: "OFF",
        SYNC_VAULT_CONFIG: "OFF",
        SYNC_LP_TOKEN_PRICE: "OFF",

        //onchain func
        UPDATE_PRICE_FEED: "OFF",
        EXECUTE_ORDERS: "ON",
        EXECUTE_LIQUIDATION: "OFF",

        //vault switcher
        VAULT_APT: "OFF",
        VAULT_USDC: "ON",
        VAULT_USDT: "OFF",
        VAULT_BTC: "OFF",
        VAULT_ETH: "OFF",

        //clear price data
        CLEAR_PRICE_DATA: "OFF",

        //test
        BATCH_TEST: "OFF",
      },
    },
    {
      name: "agdex-3-executer",
      script: SCRIPT_SRC,
      watch: true,
      env: {
        PORT: 3003,

        DATABASE_URL: DATABASE_URL,
        MODULE_ADDRESS: MODULE_ADDRESS,
        COIN_ADDRESS: COIN_ADDRESS,

        PRICE_FEEDER_ADDRESS: PRICE_FEEDER_ADDRESS,
        APT_FEEDER_ADDRESS: APT_FEEDER_ADDRESS,
        USDT_FEEDER_ADDRESS: USDT_FEEDER_ADDRESS,
        USDC_FEEDER_ADDRESS: USDC_FEEDER_ADDRESS,
        BTC_FEEDER_ADDRESS: BTC_FEEDER_ADDRESS,
        ETH_FEEDER_ADDRESS: ETH_FEEDER_ADDRESS,
        BNB_FEEDER_ADDRESS: BNB_FEEDER_ADDRESS,
        SOL_FEEDER_ADDRESS: SOL_FEEDER_ADDRESS,
        AVAX_FEEDER_ADDRESS: AVAX_FEEDER_ADDRESS,
        PEPE_FEEDER_ADDRESS: PEPE_FEEDER_ADDRESS,
        DOGE_FEEDER_ADDRESS: DOGE_FEEDER_ADDRESS,

        //private keys
        PRICE_FEED_AND_SYNCER_PK: PRICE_FEED_AND_SYNCER_PK,
        EXECUTER_PK: EXECUTER_PK_3,
        LIQUIDATOR_PK: LIQUIDATOR_PK,

        //sync func
        SYNC_POSITIONS: "OFF",
        SYNC_ORDERS: "OFF",
        SYNC_VAULT_CONFIG: "OFF",
        SYNC_LP_TOKEN_PRICE: "OFF",

        //onchain func
        UPDATE_PRICE_FEED: "OFF",
        EXECUTE_ORDERS: "ON",
        EXECUTE_LIQUIDATION: "OFF",

        //vault switcher
        VAULT_APT: "OFF",
        VAULT_USDC: "OFF",
        VAULT_USDT: "ON",
        VAULT_BTC: "OFF",
        VAULT_ETH: "OFF",

        //clear price data
        CLEAR_PRICE_DATA: "OFF",

        //test
        BATCH_TEST: "OFF",
      },
    },
    {
      name: "agdex-4-liquidator",
      script: SCRIPT_SRC,
      watch: true,
      env: {
        PORT: 3004,

        DATABASE_URL: DATABASE_URL,
        MODULE_ADDRESS: MODULE_ADDRESS,
        COIN_ADDRESS: COIN_ADDRESS,

        PRICE_FEEDER_ADDRESS: PRICE_FEEDER_ADDRESS,
        APT_FEEDER_ADDRESS: APT_FEEDER_ADDRESS,
        USDT_FEEDER_ADDRESS: USDT_FEEDER_ADDRESS,
        USDC_FEEDER_ADDRESS: USDC_FEEDER_ADDRESS,
        BTC_FEEDER_ADDRESS: BTC_FEEDER_ADDRESS,
        ETH_FEEDER_ADDRESS: ETH_FEEDER_ADDRESS,
        BNB_FEEDER_ADDRESS: BNB_FEEDER_ADDRESS,
        SOL_FEEDER_ADDRESS: SOL_FEEDER_ADDRESS,
        AVAX_FEEDER_ADDRESS: AVAX_FEEDER_ADDRESS,
        PEPE_FEEDER_ADDRESS: PEPE_FEEDER_ADDRESS,
        DOGE_FEEDER_ADDRESS: DOGE_FEEDER_ADDRESS,

        //private keys
        PRICE_FEED_AND_SYNCER_PK: PRICE_FEED_AND_SYNCER_PK,
        EXECUTER_PK: EXECUTER_PK_3,
        LIQUIDATOR_PK: LIQUIDATOR_PK,

        //sync func
        SYNC_POSITIONS: "OFF",
        SYNC_ORDERS: "OFF",
        SYNC_VAULT_CONFIG: "OFF",
        SYNC_LP_TOKEN_PRICE: "OFF",

        //onchain func
        UPDATE_PRICE_FEED: "OFF",
        EXECUTE_ORDERS: "OFF",
        EXECUTE_LIQUIDATION: "ON",

        //vault switcher
        VAULT_APT: "ON",
        VAULT_USDC: "ON",
        VAULT_USDT: "ON",
        VAULT_BTC: "ON",
        VAULT_ETH: "ON",

        //clear price data
        CLEAR_PRICE_DATA: "OFF",

        //test
        BATCH_TEST: "OFF",
      },
    },
  ],
};
