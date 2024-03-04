export const executorAssisABI = [
    {
        inputs: [
            {
                internalType: 'contract IPositionRouterState',
                name: '_positionRouter',
                type: 'address',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [
            {
                internalType: 'uint128',
                name: '_max',
                type: 'uint128',
            },
        ],
        name: 'calculateNextMulticall',
        outputs: [
            {
                internalType: 'contract IMarketDescriptor[]',
                name: 'markets',
                type: 'address[]',
            },
            {
                components: [
                    {
                        internalType: 'uint128',
                        name: 'index',
                        type: 'uint128',
                    },
                    {
                        internalType: 'uint128',
                        name: 'indexNext',
                        type: 'uint128',
                    },
                    {
                        internalType: 'uint128',
                        name: 'indexEnd',
                        type: 'uint128',
                    },
                ],
                internalType: 'struct ExecutorAssistant.IndexPerOperation[4]',
                name: 'indexPerOperations',
                type: 'tuple[4]',
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
                internalType: 'contract IPositionRouterState',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
]