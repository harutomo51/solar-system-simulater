export const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="text-white">{children}</label>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="bg-gray-700 text-white rounded px-2 py-1" />
);

export const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} className="bg-blue-500 text-white rounded px-4 py-2" />
); 