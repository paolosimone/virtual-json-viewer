export interface Match<Metadata> {
  id: string;
  start: number;
  end: number;
  type: string;
  metadata: Metadata;
}
