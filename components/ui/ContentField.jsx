import clsx from "clsx";

export function ContentField({ children, className }) {
  return (
    <p
      className={clsx(
        "text-base px-1 py-1 border-2 rounded-lg border-yellow-900 bg-white bg-opacity-50 shadow-lg min-h-[84px]",
        className,
      )}
    >
      {children}
    </p>
  );
}
