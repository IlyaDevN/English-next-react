import clsx from "clsx";

export function InputSentenceField({ className, value, onChange }) {

  return (
    <textarea
      className={clsx(
        "text-base text-yellow-900 px-3.5 py-3 resize-none outline-none border-2 rounded-lg border-yellow-900 bg-white bg-opacity-50 shadow-lg placeholder-yellow-900 placeholder-opacity-50 placeholder:focus:text-transparent",
        className,
      )}
      placeholder="Напишите перевод"
	  value={value}
	  onChange={onChange}
    ></textarea>
  );
}