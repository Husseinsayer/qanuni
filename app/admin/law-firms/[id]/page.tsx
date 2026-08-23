import Content from "./content";

export const dynamicParams = true;

export function generateStaticParams() {
  return [{ id: '__admin__' }];
}

export default function Page() {
  return <Content />;
}
