// Credits: https://github.com/microsoft/vscode-icons

// It's easier to render svg icons as JSX elements than
// list all of them as a "web_accessible_resources" in manifest

export type IconProps = {
  fill: string;
};

export interface Icon {
  (props: IconProps): JSX.Element;
}

export function ChevronDown({ fill }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.97637 10.0719L12.3337 5.7146L12.9524 6.33332L8.28573 11L7.66701 11L3.00034 6.33332L3.61906 5.7146L7.97637 10.0719Z"
        fill={fill}
      />
    </svg>
  );
}

export function ChevronRight({ fill }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.0722 8.02397L5.71484 3.66666L6.33356 3.04794L11.0002 7.71461V8.33333L6.33356 13L5.71484 12.3813L10.0722 8.02397Z"
        fill={fill}
      />
    </svg>
  );
}

export function CollapseAll({ fill }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.00024 9H4.00024V10H9.00024V9Z" fill={fill} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.00024 3L6.00024 2H13.0002L14.0002 3V10L13.0002 11H11.0002V13L10.0002 14H3.00024L2.00024 13V6L3.00024 5H5.00024V3ZM6.00024 5H10.0002L11.0002 6V10H13.0002V3H6.00024V5ZM10.0002 6H3.00024V13H10.0002V6Z"
        fill={fill}
      />
    </svg>
  );
}

export function ExpandAll({ fill }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.00024 9H4.00024V10H9.00024V9Z" fill={fill} />
      <path
        d="M7.00024 12L7.00024 7L6.00024 7L6.00024 12L7.00024 12Z"
        fill={fill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.00024 3L6.00024 2H13.0002L14.0002 3V10L13.0002 11H11.0002V13L10.0002 14H3.00024L2.00024 13V6L3.00024 5H5.00024V3ZM6.00024 5H10.0002L11.0002 6V10H13.0002V3H6.00024V5ZM10.0002 6H3.00024V13H10.0002V6Z"
        fill={fill}
      />
    </svg>
  );
}

export function EyeClosed({ fill }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.00024 2C6.50024 2 5.20024 2.4 4.10024 3.2L4.90024 3.9C5.80024 3.3 6.80024 3 8.00024 3C11.3002 3 14.0002 5.7 14.0002 9H15.0002C15.0002 5.1 11.9002 2 8.00024 2ZM1.00024 3.00005L2.60024 4.50005C1.60024 5.70005 1.00024 7.30005 1.00024 9.00005H2.00024C2.00024 7.50005 2.50024 6.20005 3.40024 5.20005L5.60024 7.20005C5.20024 7.70005 5.00024 8.30005 5.00024 9.00005C5.00024 10.7 6.30024 12 8.00024 12C8.80024 12 9.50024 11.7 10.0002 11.2L13.0002 14L13.7002 13.3L1.70024 2.30005L1.00024 3.00005ZM6.30024 7.90005L9.20024 10.6C8.90024 10.8 8.50024 11 8.00024 11C6.90024 11 6.00024 10.1 6.00024 9.00005C6.00024 8.60005 6.10024 8.20005 6.30024 7.90005ZM11.0002 9.5L10.0002 8.6C9.80024 7.8 9.10024 7.1 8.20024 7L7.20024 6.1C7.50024 6 7.70024 6 8.00024 6C9.70024 6 11.0002 7.3 11.0002 9V9.5Z"
        fill={fill}
      />
    </svg>
  );
}

export function Run({ fill }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.00024 2V14.4805L12.9149 8.24024L4.00024 2ZM11.1812 8.24024L4.99524 12.5684V3.91209L11.1812 8.24024Z"
        fill={fill}
      />
    </svg>
  );
}
