import React from "react";

type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

export function H1({ children, className = "", ...props }: TypographyProps) {
  return (
    <h1
      className={`text-4xl font-bold leading-tight mb-4 text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className = "", ...props }: TypographyProps) {
  return (
    <h2
      className={`text-3xl font-semibold leading-tight mb-3 text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className = "", ...props }: TypographyProps) {
  return (
    <h3
      className={`text-2xl font-semibold leading-snug mb-2 text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function H4({ children, className = "", ...props }: TypographyProps) {
  return (
    <h4
      className={`text-xl font-semibold mb-2 text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h4>
  );
}

export function H5({ children, className = "", ...props }: TypographyProps) {
  return (
    <h5
      className={`text-lg font-medium mb-1.5 text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
}

export function H6({ children, className = "", ...props }: TypographyProps) {
  return (
    <h6
      className={`text-base font-medium mb-1 text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h6>
  );
}

export function P({ children, className = "", ...props }: TypographyProps) {
  return (
    <p className={`mb-4 leading-relaxed text-gray-700 dark:text-gray-300 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function Blockquote({ children, className = "", ...props }: TypographyProps) {
  return (
    <blockquote
      className={`border-l-4 pl-4 italic text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/70 py-2 my-4 ${className}`}
      {...props}
    >
      {children}
    </blockquote>
  );
}

export function Ul({ children, className = "", ...props }: TypographyProps) {
  return (
    <ul className={`list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 ${className}`} {...props}>
      {children}
    </ul>
  );
}

export function Ol({ children, className = "", ...props }: TypographyProps) {
  return (
    <ol className={`list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300 ${className}`} {...props}>
      {children}
    </ol>
  );
}

export function Li({ children, className = "", ...props }: TypographyProps) {
  return (
    <li className={`mb-1 ${className}`} {...props}>
      {children}
    </li>
  );
}
