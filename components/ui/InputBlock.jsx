import InputField from "./InputField";
import ShowPassButton from "./showPassButton/showPassButton";

export default function InputBlock({ tip, fieldType, placeholder }) {

  return (
    <div>
      <p className="uppercase mb-1 ml-1 text-yellow-900 font-bold leading-tight">
        {tip}
      </p>
      <div className="relative">
        <InputField fieldType={fieldType} placeholder={placeholder} />
        {fieldType === "password" && <ShowPassButton />}
      </div>
    </div>
  );
}
