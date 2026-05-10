import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Position = { x: number; y: number };

type MenusContextValue = {
  openId: string;
  open: (id: string) => void;
  close: () => void;
  position: Position | null;
  setPosition: (pos: Position) => void;
};

type MenusProps = { children: ReactNode };
type MenuProps = { children: ReactNode };
type ToggleProps = { id: string };
type ListProps = { id: string; children: ReactNode };
type ButtonProps = {
  children: ReactNode;
  icon?: ReactElement;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

type MenusComponent = ((props: MenusProps) => ReactElement) & {
  Menu: (props: MenuProps) => ReactElement;
  Toggle: (props: ToggleProps) => ReactElement;
  List: (props: ListProps) => ReactElement | null;
  Button: (props: ButtonProps) => ReactElement;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const MenusContext = createContext<MenusContextValue | null>(null);

function useMenusContext() {
  const context = useContext(MenusContext);

  if (!context) {
    throw new Error("Menus subcomponents must be used inside <Menus>.");
  }

  return context;
}

// ─── useOutsideClick ─────────────────────────────────────────────────────────

function useOutsideClick(onOutsideClick: () => void) {
  const ref = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: globalThis.MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(event.target as Node)) return;

      onOutsideClick();
    }

    document.addEventListener("mousedown", handlePointerDown, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown, true);
    };
  }, [onOutsideClick]);

  return ref;
}

// ─── Compound components ──────────────────────────────────────────────────────

function Menus({ children }: MenusProps) {
  const [openId, setOpenId] = useState("");
  const [position, setPosition] = useState<Position | null>(null);

  const close = () => setOpenId("");
  const open = (id: string) => setOpenId(id);

  return (
    <MenusContext.Provider
      value={{ openId, close, open, position, setPosition }}
    >
      {children}
    </MenusContext.Provider>
  );
}

function Menu({ children }: MenuProps) {
  return <div className="flex items-center justify-end">{children}</div>;
}

function Toggle({ id }: ToggleProps) {
  const { open, close, openId, setPosition } = useMenusContext();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    // currentTarget is always the button with the handler,
    // even if the user clicks on the SVG icon inside it.
    const rect = event.currentTarget.getBoundingClientRect();

    setPosition({
      x: rect.left,
      y: rect.bottom + 8,
    });

    if (openId === "" || openId !== id) {
      open(id);
    } else {
      close();
    }
  }

  return (
    <button
      onClick={handleClick}
      className="rounded p-1.5 transition-all hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
    >
      <MoreVertical className="h-5 w-5 text-emerald-700" />
    </button>
  );
}

function List({ id, children }: ListProps) {
  const { openId, position, close } = useMenusContext();
  const ref = useOutsideClick(close);

  if (openId !== id) return null;

  return createPortal(
    <ul
      ref={ref}
      data-slot="menu-list"
      style={{ left: `calc(${position?.x}px - 70px)`, top: `${position?.y}px` }}
      className="fixed z-9999 min-w-40 rounded-lg border border-gray-200 bg-white p-1 shadow-xl"
    >
      {children}
    </ul>,
    document.body,
  );
}

function Button({ children, icon, onClick }: ButtonProps) {
  const { close } = useMenusContext();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onClick?.(event);
    close();
  }

  return (
    <li className="list-none">
      <button
        onClick={handleClick}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
      >
        {icon}
        <span>{children}</span>
      </button>
    </li>
  );
}

// ─── Assemble compound component ──────────────────────────────────────────────

const TypedMenus = Menus as MenusComponent;
TypedMenus.Menu = Menu;
TypedMenus.Toggle = Toggle;
TypedMenus.List = List;
TypedMenus.Button = Button;

export default TypedMenus;
