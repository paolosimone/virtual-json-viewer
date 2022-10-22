export function ViewerPlaceholder(): JSX.Element {
  return (
    <div className="flex justify-center mt-4">
      <svg
        className="animate-spin w-14 h-14"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="stroke-viewer-focus "
          cx="12"
          cy="12"
          r="10"
          strokeWidth="4"
        />
        <path
          className="fill-json-key"
          fill="red"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
