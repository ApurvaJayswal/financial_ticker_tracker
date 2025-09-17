import React from "react";
import { ChevronDown } from "lucide-react";

const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value);

  React.useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    onValueChange && onValueChange(newValue);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child, {
              onClick: () => setIsOpen(!isOpen),
              selectedValue,
              isOpen
            });
          }
          if (child.type === SelectContent && isOpen) {
            return React.cloneElement(child, {
              onSelect: handleSelect,
              onClose: handleClose,
              selectedValue
            });
          }
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ children, className = "", onClick, selectedValue, isOpen, ...props }) => {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={onClick}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectValue) {
          return React.cloneElement(child, { selectedValue });
        }
        return child;
      })}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

const SelectValue = ({ placeholder = "Select an option", className = "", selectedValue, children, ...props }) => {
  // If there are children (custom display), render them
  if (children) {
    return <span className={className} {...props}>{children}</span>;
  }
  
  // Otherwise show selected value or placeholder
  return <span className={className} {...props}>{selectedValue || placeholder}</span>;
};

const SelectContent = ({ children, className = "", onSelect, onClose, selectedValue, ...props }) => {
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.select-content')) {
        onClose && onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      className={`select-content absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 ${className}`}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child, { onSelect, selectedValue });
        }
        return child;
      })}
    </div>
  );
};

const SelectItem = ({ children, value, className = "", onSelect, selectedValue, ...props }) => {
  const handleClick = () => {
    onSelect && onSelect(value);
  };

  const isSelected = selectedValue === value;

  return (
    <div
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
        isSelected ? 'bg-accent text-accent-foreground' : ''
      } ${className}`}
      onClick={handleClick}
      {...props}
    >
      {isSelected && <span className="absolute left-2">✓</span>}
      {children}
    </div>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };