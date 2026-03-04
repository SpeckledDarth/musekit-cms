import { FeatureSubPage } from "@/src/landing";

export default function FeaturePage({ params }: { params: { slug: string } }) {
  return <FeatureSubPage slug={params.slug} />;
}
