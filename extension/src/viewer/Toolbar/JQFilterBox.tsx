import classNames from "classnames";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { JQFilter } from "viewer/commons/JQFilter";
import { Icon, IconButton } from "viewer/components";

export type JQFilterBoxProps = Props<{
  filter: JQFilter;
  setFilter: Dispatch<SetStateAction<JQFilter>>;
}>;

export function JQFilterBox({
  filter,
  setFilter,
  className,
}: JQFilterBoxProps): JSX.Element {
  const [expression, setExpression] = useState(filter.expression);

  function applyExpression() {
    setFilter((filter: JQFilter) => ({ ...filter, expression: expression }));
  }

  return (
    <span className="flex">
      <label className="mx-4 ">jq</label>
      <span
        className={classNames("border rounded flex flex-1 bg-white", className)}
      >
        <ExpressionInput
          className="flex-1"
          expression={expression}
          setExpression={setExpression}
          onSubmit={applyExpression}
        />
        <IconButton
          className="w-5 h-5"
          title="Apply filter"
          icon={Icon.Run}
          onClick={applyExpression}
        />
      </span>
    </span>
  );
}

type ExpressionInputProps = Props<{
  expression: string;
  setExpression: (text: string) => void;
  onSubmit: () => void;
}>;

function ExpressionInput({
  expression,
  setExpression,
  onSubmit,
  className,
}: ExpressionInputProps): JSX.Element {
  // restore the input element internal state on rerender
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.value = expression;
    }
  }, [ref, expression]);

  const onChange = (e: FormEvent<HTMLInputElement>) => {
    const text = (e.target as HTMLInputElement).value.trim();
    setExpression(text);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <input
      ref={ref}
      type="input"
      className={classNames("focus:outline-none", className)}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder="."
    />
  );
}
