import anchorme from "anchorme";
import type { ListingProps } from "anchorme/dist/node/types";
import { ReactElement } from "react";
import { uid } from "uid";
import { Match } from "./Match";

export const LINK_TYPE = "link";

// Rendering

export type LinkMetadata = {
  linkType: "url" | "email";
  href: string;
};

export interface LinkMatch extends Match<LinkMetadata> {
  type: typeof LINK_TYPE;
}

export function LinkifiedText({
  children,
  href,
  linkType,
}: Props<LinkMetadata>): ReactElement<HTMLElement> {
  return (
    <a
      href={href}
      target={linkType === "email" ? undefined : "_blank"}
      rel="noreferrer"
      className="underline"
      tabIndex={-1}
    >
      {children}
    </a>
  );
}

// Matching

export function matchLinks(text: string): LinkMatch[] {
  return anchorme
    .list(text)
    .filter((match) => getHref(match) !== null)
    .map((match) => ({
      id: uid(),
      start: match.start,
      end: match.end,
      type: LINK_TYPE,
      metadata: {
        linkType: match.isEmail ? "email" : "url",
        href: getHref(match)!,
      },
    }));
}

function getHref(match: ListingProps): Nullable<string> {
  // already has the protocol
  if (match.protocol) {
    return match.string;
  }

  // set default protocol for emails
  if (match.isEmail) {
    return "mailto:" + match.string;
  }

  // ignore url matches without protocol to avoid false positives
  return null;
}
