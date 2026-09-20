import { ExchangeSearchProvider } from "../v11/exchangeAggregator";
import { UnifiedLoad } from "../v11/unifiedLoad";
import { TransEuClient } from "../integrations/transEu/transEuClient";
import { normalizeTransEuProposal } from "../integrations/transEu/proposalNormalizer";
import { geoKm } from "../v11/ranking";

export class TransEuUnifiedProvider implements ExchangeSearchProvider {
  name = "trans.eu" as const;

  constructor(private readonly client: TransEuClient) {}

  async search(input: {lat:number;lon:number;radiusKm:number}, driverId?: string): Promise<UnifiedLoad[]> {
    if (!driverId) return [];
    const output: UnifiedLoad[] = [];

    // The official list endpoint returns max 30 records per page.
    // Fetch a bounded number of pages to avoid an unbounded provider call.
    for (let page = 1; page <= 5; page++) {
      const rows = await this.client.getFreightProposals(driverId, page, "loading_date", "asc");
      if (!rows.length) break;

      for (const raw of rows) {
        const load = normalizeTransEuProposal(raw);
        if (!load) continue;
        if (geoKm(input, load.pickup) <= input.radiusKm) output.push(load);
      }
      if (rows.length < 30) break;
    }
    return output;
  }
}
