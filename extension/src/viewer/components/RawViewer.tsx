import classNames from "classnames";
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EventType } from "viewer/commons/EventBus";
import * as Json from "viewer/commons/Json";
import {
  CHORD_KEY,
  KeydownEvent,
  RefCurrent,
  useEventBusListener,
  useGlobalKeydownEvent,
} from "viewer/hooks";
import { Search, SettingsContext } from "viewer/state";
import { RenderedText } from "./RenderedText";
import { ViewerPlaceholder } from "./ViewerPlaceholder";

// when the text lenght is over this threshold (heuristic)
// the tab will freeze and it's better to defer rendering
const LARGE_TRESHOLD = 1_000_000;

export type RawViewerProps = Props<{
  json: Json.Root;
  search: Search;
}>;

export function RawViewer({
  json,
  search,
  className,
}: RawViewerProps): JSX.Element {
  const { indentation } = useContext(SettingsContext);
  const [minify, setMinify] = useState(false);

  const expand = useCallback(() => setMinify(false), [setMinify]);
  useEventBusListener(EventType.Expand, expand);

  const collapse = useCallback(() => setMinify(true), [setMinify]);
  useEventBusListener(EventType.Collapse, collapse);

  const space = minify ? undefined : indentation;

  const raw = useMemo(
    () => Json.toString(json, { sortKeys: true, space: space }),
    [json, space]
  );

  const isLargeText = raw.length > LARGE_TRESHOLD;
  const renderedText = useLazyRenderedText(raw, search, isLargeText);

  const ref = useRef<HTMLDivElement>(null);

  // register shortcuts
  const hanldeNavigation = useCallback(
    (e: KeydownEvent) => {
      if (e[CHORD_KEY] && e.key === "0") {
        e.preventDefault();
        ref.current?.focus();
      }
    },
    [ref]
  );
  useGlobalKeydownEvent(hanldeNavigation);

  const handleSelectAll = (e: React.KeyboardEvent) => {
    if (e[CHORD_KEY] && e.key == "a") {
      e.preventDefault();
      selectAllText(ref.current);
    }
  };

  const wrap = minify ? "break-all" : "whitespace-pre";

  return (
    <div
      ref={ref}
      tabIndex={0}
      className={classNames("overflow-auto relative", wrap, className)}
      spellCheck={false}
      onKeyDown={handleSelectAll}
    >
      {isLargeText && <ViewerPlaceholder className="absolute-center" />}

      {/* the text will hide the loading placeholder */}
      <div className="bg-viewer-background relative z-10">{renderedText}</div>
    </div>
  );
}

// html element must be focusable
function selectAllText(elem: RefCurrent<HTMLElement>) {
  if (!elem) return;
  const range = document.createRange();
  range.selectNode(elem);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

// common render frequency is 60 fps
const FRAME_MS = 1 / 60;

function useLazyRenderedText(
  text: string,
  search: Nullable<Search>,
  isLargeText: boolean
): ReactNode {
  // linkifyUrls is disabled for large text to improve performance
  const { linkifyUrls: linkifySettings } = useContext(SettingsContext);
  const linkifyUrls = !isLargeText && linkifySettings;

  useEffect(() => {
    if (linkifySettings && !linkifyUrls) {
      console.info(
        "Large text detected: Linkify URL has been disable to improve performance"
      );
    }
  }, [isLargeText, linkifySettings]);

  const renderText = useCallback(
    () => RenderedText({ text, search, linkifyUrls }),
    [text, search, linkifyUrls]
  );

  // the rendering is done on first render only for small text
  const defaultRenderedText = isLargeText ? null : renderText();
  const [renderedText, setRenderedText] =
    useState<Nullable<ReactNode>>(defaultRenderedText);

  useEffect(() => {
    if (!isLargeText) return;

    // clear the text
    setRenderedText(null);

    // defer the actual rendering to next frame
    const renderTask = setTimeout(
      () => setRenderedText(renderText()),
      FRAME_MS
    );
    return () => clearTimeout(renderTask);
  }, [isLargeText, renderText, setRenderedText]);

  return renderedText;
}
