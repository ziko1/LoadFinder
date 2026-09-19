import { TransEuClient } from "./integrations/transEu/transEuClient";

export class TransEuWorkflow {
  constructor(private readonly client: TransEuClient) {}

  async negotiate(driverId: string, freightId: string, amountEur: number) {
    const proposal = await this.client.getProposalDetails(driverId, freightId);

    if (proposal.status && proposal.status !== "active") {
      throw new Error("PROPOSAL_NOT_ACTIVE");
    }
    if (proposal.decision_date && Date.parse(proposal.decision_date) < Date.now()) {
      throw new Error("PROPOSAL_EXPIRED");
    }
    if (!proposal.offerId) throw new Error("OFFER_ID_MISSING");

    return this.client.negotiate(
      driverId,
      proposal.offerId,
      amountEur,
      "eur",
      proposal.version
    );
  }

  async accept(driverId: string, freightId: string) {
    const proposal = await this.client.getProposalDetails(driverId, freightId);

    if (proposal.status && proposal.status !== "active") {
      throw new Error("PROPOSAL_NOT_ACTIVE");
    }
    if (!proposal.offerId) throw new Error("OFFER_ID_MISSING");

    return this.client.accept(driverId, proposal.offerId, proposal.version);
  }
}
