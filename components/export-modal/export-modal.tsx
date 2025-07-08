"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Image, Video, Box, ChevronRight, Maximize, Plus, Crop, Eye, Minus, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// Select Components
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDownIcon className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
        ,
        className,
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

// Slider Component
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// FadeContent Component
interface FadeContentProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FadeContent: React.FC<FadeContentProps> = ({
  children,
  delay = 0,
  className = "",
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-600 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
};

// Toggle Group Component
interface ToggleGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const ToggleGroup: React.FC<ToggleGroupProps> = ({
  value,
  onValueChange,
  children,
  className,
}) => {
  return (
    <div className={cn("flex bg-muted border border-border rounded-xl p-1", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            isSelected: child.props.value === value,
            onClick: () => onValueChange(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
};

interface ToggleGroupItemProps {
  value: string;
  children: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
}

const ToggleGroupItem: React.FC<ToggleGroupItemProps> = ({
  children,
  isSelected,
  onClick,
}) => {
  return (
    <button
      className={cn(
        "flex-1 py-1.5 rounded-md text-xs font-semibold transition-all",
        isSelected
          ? "bg-background shadow text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Export Row Component
interface ExportRowProps {
  scale: string;
  colorSpace: string;
  format: string;
  onScaleChange: (value: string) => void;
  onColorSpaceChange: (value: string) => void;
  onFormatChange: (value: string) => void;
  onRemove: () => void;
  delay?: number;
}

const ExportRow: React.FC<ExportRowProps> = ({
  scale,
  colorSpace,
  format,
  onScaleChange,
  onColorSpaceChange,
  onFormatChange,
  onRemove,
  delay = 0,
}) => {
  return (
    <FadeContent delay={delay} className="flex items-center gap-3">
      {/* Scale Select */}
      <div className="relative">
        <Select value={scale} onValueChange={onScaleChange}>
          <SelectTrigger className="w-20 bg-muted pl-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1x">1x</SelectItem>
            <SelectItem value="2x">2x</SelectItem>
            <SelectItem value="3x">3x</SelectItem>
          </SelectContent>
        </Select>
        <Crop className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Color Space Select */}
      <div className="relative flex-1">
        <Select value={colorSpace} onValueChange={onColorSpaceChange}>
          <SelectTrigger className="bg-background pl-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sRGB">sRGB</SelectItem>
            <SelectItem value="Adobe Color">Adobe Color</SelectItem>
          </SelectContent>
        </Select>
        <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Format Toggle */}
      <ToggleGroup value={format} onValueChange={onFormatChange} className="w-[106px]">
        <ToggleGroupItem value="PNG">PNG</ToggleGroupItem>
        <ToggleGroupItem value="JPG">JPG</ToggleGroupItem>
      </ToggleGroup>

      {/* Remove Button */}
      <Button variant="ghost" size="icon" onClick={onRemove} className="h-6 w-6">
        <Minus className="w-4 h-4" />
      </Button>
    </FadeContent>
  );
};

// Main Export Modal Component
interface ExportRowType {
  id: string;
  scale: string;
  colorSpace: string;
  format: string;
}

const ExportModal: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("Images");
  const [exportRows, setExportRows] = React.useState<ExportRowType[]>([
    { id: "1", scale: "1x", colorSpace: "sRGB", format: "PNG" },
    { id: "2", scale: "2x", colorSpace: "Adobe Color", format: "JPG" },
  ]);
  const [compression, setCompression] = React.useState([80]);

  const addExportRow = () => {
    const newRow: ExportRowType = {
      id: Date.now().toString(),
      scale: "1x",
      colorSpace: "sRGB",
      format: "PNG",
    };
    setExportRows([...exportRows, newRow]);
  };

  const removeExportRow = (id: string) => {
    setExportRows(exportRows.filter(row => row.id !== id));
  };

  const updateExportRow = (id: string, field: keyof ExportRowType, value: string) => {
    setExportRows(exportRows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const navItems = [
    { id: "Images", icon: Image, label: "Images" },
    { id: "Video", icon: Video, label: "Video" },
    { id: "3D Object", icon: Box, label: "3D Object" },
  ];

  return (
    <div className="w-full max-w-5xl rounded-3xl border border-border bg-background/90 backdrop-blur-md overflow-hidden shadow-md">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-40 border-r border-border p-2 flex flex-col justify-between">
          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item, index) => (
              <FadeContent key={item.id} delay={100 * (index + 1)}>
                <button
                  className={cn(
                    "w-full flex items-center justify-between gap-2 p-1 pr-2 rounded-xl border transition-colors",
                    activeTab === item.id
                      ? "border-border bg-muted"
                      : "border-transparent hover:bg-muted"
                  )}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="flex items-center gap-3 flex-1">
                    <span className="p-2 rounded-lg bg-background shadow-sm inline-flex items-center justify-center">
                      <item.icon className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-medium tracking-tight">{item.label}</span>
                  </span>
                  {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
                </button>
              </FadeContent>
            ))}
          </nav>

          {/* Preview */}
          <FadeContent delay={200} className="relative h-24 rounded-xl overflow-hidden border border-border">
            <img
              src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80"
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button className="absolute top-2 right-2 p-2 bg-background rounded-md shadow">
              <Maximize className="w-4 h-4" />
            </button>
          </FadeContent>
        </aside>

        {/* Content */}
        <section className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between px-4 h-14 border-t border-border">
            <h2 className="text-xs font-semibold tracking-tight">Export {activeTab.toLowerCase()}</h2>
            <Button variant="ghost" size="icon" onClick={addExportRow} className="h-6 w-6">
              <Plus className="w-4 h-4" />
            </Button>
          </header>

          {/* Export Options */}
          <div className="space-y-4 px-4 py-4 overflow-y-auto">
            {exportRows.map((row, index) => (
              <ExportRow
                key={row.id}
                scale={row.scale}
                colorSpace={row.colorSpace}
                format={row.format}
                onScaleChange={(value) => updateExportRow(row.id, "scale", value)}
                onColorSpaceChange={(value) => updateExportRow(row.id, "colorSpace", value)}
                onFormatChange={(value) => updateExportRow(row.id, "format", value)}
                onRemove={() => removeExportRow(row.id)}
                delay={100 * (index + 1)}
              />
            ))}
          </div>

          {/* Compression */}
          <div className="border-t border-border px-4 py-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-tight">Compression</span>
              <span className="text-[10px] text-muted-foreground opacity-80">3840px × 2160px</span>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={compression}
                onValueChange={setCompression}
                max={100}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-2 border border-border rounded-xl px-2.5 py-2.5">
                <GripHorizontal className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium tracking-tight">{compression[0]}%</span>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="px-4 py-4">
            <FadeContent delay={300}>
              <Button className="w-full rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-900 text-white text-sm font-semibold tracking-tight py-2 shadow hover:brightness-110 transition">
                Export Robot 2.0
              </Button>
            </FadeContent>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExportModal;
