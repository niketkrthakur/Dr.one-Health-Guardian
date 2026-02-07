import { Info } from "lucide-react";

const NoDataSourceBanner = () => (
  <div className="rounded-xl p-4 border border-border bg-muted/40">
    <div className="flex items-start gap-3">
      <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
      <div>
        <h4 className="font-semibold text-xs text-foreground">
          Real-Time Provider Data
        </h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Doctor listings are sourced exclusively from verified healthcare directories
          and provider databases. No mock, placeholder, or AI-generated profiles are
          shown. Listings will appear once a verified data source (e.g., healthcare
          directory API or hospital database) is connected.
        </p>
      </div>
    </div>
  </div>
);

export default NoDataSourceBanner;
