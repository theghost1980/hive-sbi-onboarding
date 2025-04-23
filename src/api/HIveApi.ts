// HiveApi.ts
import { Client, PrivateKey } from "@hiveio/dhive";

const client = new Client(["https://api.hive.blog"]);

export const HiveApi = {
  getAccount: async (username: string) => {
    return await client.database.getAccounts([username]);
  },

  getDynamicGlobalProperties: async () => {
    return await client.database.getDynamicGlobalProperties();
  },

  broadcastVote: async (
    voter: string,
    author: string,
    permlink: string,
    weight: number,
    postingKey: string
  ) => {
    const key = PrivateKey.fromString(postingKey);
    return await client.broadcast.vote(
      {
        voter,
        author,
        permlink,
        weight,
      },
      key
    );
  },

  streamBlocks: (onBlock: (block: any) => void) => {
    const stream = client.blockchain.getBlockStream();
    stream.on("data", onBlock);
    return stream;
  },
};
