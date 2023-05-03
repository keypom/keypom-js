/* Talking with a contract often involves transforming data, we recommend you to encapsulate that logic into a class */

import { utils } from 'near-api-js';

export class GuestBook {

  constructor({ contractId, walletToUse }) {
    this.contractId = contractId;
    this.wallet = walletToUse
  }

  async getMessages() {
    let totalMessages = await this.wallet.viewMethod({ contractId: this.contractId, method: "total_messages" });
    const messagesPerPage = 5;
    const messages = await this.wallet.viewMethod({ contractId: this.contractId, method: "get_messages", args: {limit: messagesPerPage, from_index: (totalMessages - messagesPerPage)} })
    console.log(messages)
    return messages
  }

  async addMessage(message, donation) {
    const deposit = utils.format.parseNearAmount(donation);
    return await this.wallet.callMethod({ contractId: this.contractId, method: "add_message", args: { text: message }, deposit });
  }

}