import type { OriginChainOption } from '../types';

export const ORIGIN_CHAINS: OriginChainOption[] = [
  {
    id: 84532,
    name: 'Base Sepolia',
    rpc: 'https://sepolia.base.org',
    feeds: [
      {
        "label": "BTC / USD",
        "address": "0x961AD289351459A45fC90884eF3AB0278ea95DDE"
      },
      {
        "label": "CBETH / ETH",
        "address": "0xF4f6843A8003417b04EAbDd7a1bAe2cAFCBF0aCC"
      },
      {
        "label": "CBETH / USD",
        "address": "0xCd701e3450AD9706F09b9d82166bE852132Ca059"
      },
      {
        "label": "DAI / USD",
        "address": "0x6eaE3676F1124D7201c541950f633E3766D056dA"
      },
      {
        "label": "ETH / USD",
        "address": "0xa24A68DD788e1D7eb4CA517765CFb2b7e217e7a3"
      },
      {
        "label": "LINK / ETH",
        "address": "0xd94522a6feF7779f672f4C88eb672da9222f2eAc"
      },
      {
        "label": "LINK / USD",
        "address": "0xAc6DB6d5538Cd07f58afee9dA736ce192119017B"
      },
      {
        "label": "USDC / USD",
        "address": "0xf3138B59cAcbA1a4d7d24fA7b184c20B3941433e"
      }
    ]
    
  },
  {
    id: 97,
    name: 'Binance smart chain',
    rpc: 'wss://bsc-testnet.drpc.org',
    feeds:[
      
        {
          "label": "ADA/USD",
          "address": "0x96Ece749Add6b2ED35BcF210112869361Db03cff"
        },
        {
          "label": "BCH/USD",
          "address": "0xB87c2E86180947dcfA775491aeAd8Ad9d6ED885B"
        },
        {
          "label": "BNB/USD",
          "address": "0xdbd22686749275932BF35D9A893Da23505CC2804"
        },
        {
          "label": "BTC/ETH",
          "address": "0x8bA499f8012B4cdF38D5c585e5afa94D7a146C97"
        },
        {
          "label": "BTC/USD",
          "address": "0xAAf337687be186caE90Db12304C31567BeB32Ef"
        },
        {
          "label": "BUSD/ETH",
          "address": "0x83e396AC16175D2056DE95BDA956f7E89A5e6Cf5"
        },
        {
          "label": "BUSD/USD",
          "address": "0xe4a831D928251A8ceF29A59303ED2410dEB33B03"
        },
        {
          "label": "CAKE/USD",
          "address": "0x509f0F2de9B5f10C464c43D64D6b211993f7E253"
        },
        {
          "label": "DAI/BNB",
          "address": "0xDD580Ca8Cc80c5C8735F76d618d954c89c1533A8"
        },
      
      
    ]
  },
  {
    id: 43113,
    name: 'Avalanche Fuji',
    rpc: 'wss://avalanche-fuji-c-chain-rpc.publicnode.com',
    feeds: [
      {
        "label": "APE / USD",
        "address": "0x8c4E5F5dcA2C2813EB97AAA06cFa0780692D8a9e"
      },
      {
        "label": "ARB / USD",
        "address": "0x8280e1F83CD11dB2cC1784C6AA013D16D01Ae612"
      },
      {
        "label": "AVAX / USD",
        "address": "0x11FeeA5D7Ec56EE717D8a229e8aac5d8AdB238Aa"
      },
      {
        "label": "AXS / USD",
        "address": "0x9DE4086641E636A76C279ce6357EfC2570665727"
      },
      {
        "label": "BAT / USD",
        "address": "0x555F12d7014DBf252BE3842E768d6d0BBE2D007A"
      },
      {
        "label": "BNB / USD",
        "address": "0x0b6A02355d61FB67d9bE4b9D00c3e2f1141180e6"
      },
      {
        "label": "BTC / ETH",
        "address": "0x4Cc8dB0c1D6DDF0a2b4f35C905CD6885CeD3d80f"
      },
      {
        "label": "BTC / USD",
        "address": "0xEC95B4b38245689EDcF3E2e48B098257D06eAbBc"
      }
    ]    
  }, 
  { id: 80002,
    name: 'Polygon Amoy',
    rpc: 'https://polygon-amoy.drpc.org',
    feeds: [
      {"label": "BTC / USD",     "address": "0xd4cfC9C436c61bEF92E8002603c825401A2cCaa8"},
      {"label": "DAI / USD",     "address": "0x96Eed9a504dC55E9307f011EcE55b6D43024ccAc"},
      {"label": "ETH / USD",     "address": "0xF1764080A314dc6AcB3cf84245721b08400Fdd1B"},
      {"label": "EUR / USD",     "address": "0xd8d927e5d52Bb7cdb2C0ae6f55ACcB18e9a2B9D7"},
      {"label": "FAST NAV",      "address": "0x61db09C67094B2f9c052d77655E6efB96dF607ec"},
      {"label": "LINK / MATIC",  "address": "0x8B1837bC2FC51D2496fee858e28B75708bfF5c16"},
      {"label": "LINK / USD",    "address": "0xeBe9A7A5F6D83195d3d15a95f60C297e9d9211a0"},
      {"label": "MATIC / USD",   "address": "0x1F781De3B1340BCf46ea5CAe8df8d88Bb99f098C"},
      {"label": "SAND / USD",    "address": "0x8cbC4C620B28255ACB6e5cd0CcB878A77FB17E32"},
      {"label": "SOL / USD",     "address": "0x47d74B40f7C3F9cef2633963FF2A66ab86E8cbB3"},
      {"label": "USDC / USD",    "address": "0x9072a70bdaEA9307aCc1694BB1F028f55875B1D1"},
      {"label": "USDT / USD",    "address": "0x4D1763c3750a9dA215788f9bEE514D7085B7d46c"}
    ]
    
  },
];