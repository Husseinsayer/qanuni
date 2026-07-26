import Content from "./content";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: '__admin__' }];
}

export default function Page() {
  return <Content />;
}
