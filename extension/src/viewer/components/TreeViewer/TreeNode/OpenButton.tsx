import { Icon, IconButton } from "@/viewer/components";
import classNames from "classnames";
import { JSX } from "react";

export type OpenProps = Props<{
  enabled: boolean;
  isOpen: boolean;
  toggleOpen: () => void;
}>;

export function OpenButton({
  enabled,
  isOpen,
  toggleOpen,
  className,
}: OpenProps): JSX.Element {
  return (
    <span className={classNames("mr-0.5 w-5 min-w-5", className)}>
      {enabled && (
        <IconButton
          icon={isOpen ? Icon.ChevronDown : Icon.ChevronRight}
          onClick={toggleOpen}
          className="fill-viewer-foreground h-4 w-4 align-middle"
          tabIndex={-1}
        />
      )}
    </span>
  );
}
