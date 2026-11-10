import { Wrench } from "phosphor-react";

/** Swap this component to change the mark next to the product name. */
export default function BrandMark({ size = 22, className }) {
  return <Wrench size={size} weight="thin" className={className} />;
}
