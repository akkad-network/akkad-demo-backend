export const mixedExecutorABI = [
    {
        inputs: [
            {
                internalType: 'contract Router',
                name: '_router',
                type: 'address',
            },
            {
                internalType: 'contract MarketIndexer',
                name: '_marketIndexer',
                type: 'address',
            },
            {
                internalType: 'contract ILiquidator',
                name: '_liquidator',
                type: 'address',
            },
            {
                internalType: 'contract IPositionRouter',
                name: '_positionRouter',
                type: 'address',
            },
            {
                internalType: 'contract IPriceFeed',
                name: '_priceFeed',
                type: 'address',
            },
            {
                internalType: 'contract IOrderBook',
                name: '_orderBook',
                type: 'address',
            },
            {
                internalType: 'contract IMarketManager',
                name: '_marketManager',
                type: 'address',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'target',
                type: 'address',
            },
        ],
        name: 'AddressEmptyCode',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'bytes',
                name: 'reason',
                type: 'bytes',
            },
        ],
        name: 'ExecutionFailed',
        type: 'error',
    },
    {
        inputs: [],
        name: 'FailedInnerCall',
        type: 'error',
    },
    {
        inputs: [],
        name: 'Forbidden',
        type: 'error',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousGov',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newGov',
                type: 'address',
            },
        ],
        name: 'ChangeGovStarted',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'orderIndex',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'bytes4',
                name: 'shortenedReason1',
                type: 'bytes4',
            },
            {
                indexed: false,
                internalType: 'bytes4',
                name: 'shortenedReason2',
                type: 'bytes4',
            },
        ],
        name: 'DecreaseOrderCancelFailed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'orderIndex',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'bytes4',
                name: 'shortenedReason',
                type: 'bytes4',
            },
        ],
        name: 'DecreaseOrderCancelSucceeded',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'orderIndex',
                type: 'uint256',
            },
        ],
        name: 'DecreaseOrderExecuteFailed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'executor',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'bool',
                name: 'active',
                type: 'bool',
            },
        ],
        name: 'ExecutorUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousGov',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newGov',
                type: 'address',
            },
        ],
        name: 'GovChanged',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'orderIndex',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'bytes4',
                name: 'shortenedReason1',
                type: 'bytes4',
            },
            {
                indexed: false,
                internalType: 'bytes4',
                name: 'shortenedReason2',
                type: 'bytes4',
            },
        ],
        name: 'IncreaseOrderCancelFailed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'orderIndex',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'bytes4',
                name: 'shortenedReason',
                type: 'bytes4',
            },
        ],
        name: 'IncreaseOrderCancelSucceeded',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'orderIndex',
                type: 'uint256',
            },
        ],
        name: 'IncreaseOrderExecuteFailed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'contract IMarketDescriptor',
                name: 'market',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'bytes4',
                name: 'shortenedReason',
                type: 'bytes4',
            },
        ],
        name: 'LiquidateLiquidityPositionFailed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'contract IMarketDescriptor',
                name: 'market',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'Side',
                name: 'side',
                type: 'uint8',
            },
            {
                indexed: false,
                internalType: 'bytes4',
                name: 'shortenedReason',
                type: 'bytes4',
            },
        ],
        name: 'LiquidatePositionFailed',
        type: 'event',
    },
    {
        inputs: [],
        name: 'acceptGov',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'cancelOrderIfFailedStatus',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_newGov',
                type: 'address',
            },
        ],
        name: 'changeGov',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'PackedValue',
                name: '_packedValue',
                type: 'uint256',
            },
        ],
        name: 'collectProtocolFeeBatch',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint128',
                name: '_endIndex',
                type: 'uint128',
            },
        ],
        name: 'executeDecreaseLiquidityPositions',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'PackedValue',
                name: '_packedValue',
                type: 'uint256',
            },
        ],
        name: 'executeDecreaseOrder',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint128',
                name: '_endIndex',
                type: 'uint128',
            },
        ],
        name: 'executeDecreasePositions',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint128',
                name: '_endIndex',
                type: 'uint128',
            },
        ],
        name: 'executeIncreaseLiquidityPositions',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'PackedValue',
                name: '_packedValue',
                type: 'uint256',
            },
        ],
        name: 'executeIncreaseOrder',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint128',
                name: '_endIndex',
                type: 'uint128',
            },
        ],
        name: 'executeIncreasePositions',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'executors',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'feeReceiver',
        outputs: [
            {
                internalType: 'address payable',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'gov',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'PackedValue',
                name: '_packedValue',
                type: 'uint256',
            },
        ],
        name: 'liquidateLiquidityPosition',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'PackedValue',
                name: '_packedValue',
                type: 'uint256',
            },
        ],
        name: 'liquidatePosition',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'liquidator',
        outputs: [
            {
                internalType: 'contract ILiquidator',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'marketIndexer',
        outputs: [
            {
                internalType: 'contract MarketIndexer',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'marketManager',
        outputs: [
            {
                internalType: 'contract IMarketManager',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes[]',
                name: 'data',
                type: 'bytes[]',
            },
        ],
        name: 'multicall',
        outputs: [
            {
                internalType: 'bytes[]',
                name: 'results',
                type: 'bytes[]',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'orderBook',
        outputs: [
            {
                internalType: 'contract IOrderBook',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'pendingGov',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'positionRouter',
        outputs: [
            {
                internalType: 'contract IPositionRouter',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'priceFeed',
        outputs: [
            {
                internalType: 'contract IPriceFeed',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'router',
        outputs: [
            {
                internalType: 'contract Router',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'PackedValue',
                name: '_packedValue',
                type: 'uint256',
            },
        ],
        name: 'sampleAndAdjustFundingRateBatch',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bool',
                name: '_cancelOrderIfFailedStatus',
                type: 'bool',
            },
        ],
        name: 'setCancelOrderIfFailedStatus',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_executor',
                type: 'address',
            },
            {
                internalType: 'bool',
                name: '_active',
                type: 'bool',
            },
        ],
        name: 'setExecutor',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address payable',
                name: '_receiver',
                type: 'address',
            },
        ],
        name: 'setFeeReceiver',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'PackedValue[]',
                name: '_packedValues',
                type: 'uint256[]',
            },
            {
                internalType: 'uint64',
                name: '_timestamp',
                type: 'uint64',
            },
        ],
        name: 'setPriceX96s',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
]