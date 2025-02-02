import { JSX } from "react";

type MultiContextProviderProps = Props<{
  contexts: [React.Context<any>, any][];
}>;

// https://github.com/facebook/react/issues/14620#issuecomment-491366098
export function MultiContextProvider(
  props: MultiContextProviderProps,
): JSX.Element {
  return props.contexts.reduce(
    (acc, [Context, value]) => (
      <Context.Provider value={value}>{acc}</Context.Provider>
    ),
    props.children,
  ) as JSX.Element;
}
