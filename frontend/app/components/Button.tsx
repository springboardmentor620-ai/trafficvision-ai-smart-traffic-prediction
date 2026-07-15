"use client";

type ButtonProps = {
  text: string;
  onClick?: () => void;
  color?: string;
};

export default function Button({
  text,
  onClick,
  color = "bg-blue-600 hover:bg-blue-700",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white px-5 py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 font-semibold`}
    >
      {text}
    </button>
  );
}