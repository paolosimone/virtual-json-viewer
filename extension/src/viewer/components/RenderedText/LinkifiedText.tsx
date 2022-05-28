import anchorme from "anchorme";
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
    >
      {children}
    </a>
  );
}

// Matching

export function matchLinks(text: string): LinkMatch[] {
  return anchorme.list(text).map((match) => {
    let href = match.string;

    // set default protocol if missing
    if (!match.protocol) {
      const protocol = match.isEmail ? "mailto:" : "http://";
      href = protocol + match.string;
    }

    return {
      id: uid(),
      start: match.start,
      end: match.end,
      type: LINK_TYPE,
      metadata: {
        linkType: match.isEmail ? "email" : "url",
        href: href,
      },
    };
  });
}
