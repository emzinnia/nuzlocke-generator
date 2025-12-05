import React, { ReactElement, ReactNode } from "react";

type ButtonGroupProps = {
  children: ReactNode;
  className?: string;
};

export function ButtonGroup({ children, className = "" }: ButtonGroupProps) {
  const buttons = React.Children.toArray(children);

  return (
    <div className={`inline-flex ${className}`}>
      {buttons.map((child, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === buttons.length - 1;
        const roundedClass = isFirst
          ? "rounded-l-md"
          : isLast
          ? "rounded-r-md"
          : "rounded-none";

        if (React.isValidElement(child)) {
          const el = child as ReactElement<any>;
          const childClassName = el.props?.className || "";
          return React.cloneElement(el, {
            className: `${childClassName} ${roundedClass}`.trim(),
            key: el.key ?? idx,
          });
        }
        return child;
      })}
    </div>
  );
}
