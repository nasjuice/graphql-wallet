import { createRpcGraphQL } from '@solana/rpc-graphql';
import { createSolanaRpc } from '@solana/web3.js';
import bodyParser from 'body-parser';
import express from 'express';

const PORT = process.env.SERVER_PORT || 3001;
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || 'http://127.0.0.1:8899';

const app = express();
app.use(bodyParser.json());

const rpc = createSolanaRpc(RPC_ENDPOINT);
const rpcGraphQL = createRpcGraphQL(rpc);

app.post('/api/graphql', async (req, res) => {
    const { source, variableValues } = req.body;
    const response = await rpcGraphQL.query(source, variableValues);

    if (response.errors) {
        response.errors.forEach(e => console.error(e));
        res.status(500).send('Server Error');
    }

    if (response.data) {
        res.send(JSON.stringify(response.data, (_, value) => {
            if (typeof value === 'bigint') {
                return { __bigint: value.toString() };
            }
            return value;
        }));
    }

    return;
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});