import { CircleX } from "lucide-react";
import {
  type MouseEvent,
  cloneElement,
  createContext,
  useEffect,
  useContext,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ModalContextValue = {
  openName: string;
  open: (name: string) => void;
  close: () => void;
};

type ModalProps = {
  children: ReactNode;
};

type OpenProps = {
  children: ReactElement<{ onClick?: (event: MouseEvent) => void }>;
  opens: string;
};

type WindowProps = {
  children: ReactElement<{ onCloseModal?: () => void }>;
  name: string;
};

type ModalComponent = ((props: ModalProps) => ReactElement) & {
  Open: (props: OpenProps) => ReactElement;
  Window: (props: WindowProps) => ReactElement | null;
};

const ModalWindowContext = createContext<ModalContextValue | null>(null);

function useModalWindowContext() {
  const context = useContext(ModalWindowContext);

  if (!context) {
    throw new Error("Modal components must be used inside Modal.");
  }

  return context;
}

function useOutsideClick(onOutsideClick: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | globalThis.MouseEvent) {
      if (!(event instanceof globalThis.MouseEvent)) return;
      if (!ref.current) return;
      const target = event.target as HTMLElement | null;

      // Radix Select renders its menu in a portal outside the modal tree.
      // Treat interactions inside that content as internal so the modal stays open.
      if (target?.closest('[data-slot="select-content"]')) return;
      // Menus list also renders in a portal; keep modal open while using it.
      if (target?.closest('[data-slot="menu-list"]')) return;
      if (ref.current.contains(event.target as Node)) return;

      onOutsideClick();
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [onOutsideClick]);

  return ref;
}

function Modal({ children }: ModalProps) {
  const [openName, setOpenName] = useState("");

  const close = () => setOpenName("");
  const open = (name: string) => setOpenName(name);

  return (
    <ModalWindowContext.Provider value={{ openName, open, close }}>
      {children}
    </ModalWindowContext.Provider>
  );
}

function Open({ children, opens: opensWindowName }: OpenProps) {
  const { open } = useModalWindowContext();
  const currentOnClick = children.props.onClick;

  return cloneElement(children, {
    onClick: (event: MouseEvent) => {
      currentOnClick?.(event);
      open(opensWindowName);
    },
  });
}

function Window({ children, name }: WindowProps) {
  const { openName, close } = useModalWindowContext();

  const ref = useOutsideClick(close);

  if (name !== openName) return null;

  return createPortal(
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/30 p-4">
      <div ref={ref} className="relative w-full max-w-2xl">
        <button
          type="button"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1 text-emerald-900 shadow hover:bg-white"
          onClick={close}
        >
          <CircleX className="h-5 w-5" />
        </button>
        <div className="max-h-[85vh] overflow-auto rounded-xl">
          {cloneElement(children, { onCloseModal: close })}
        </div>
      </div>
    </div>,
    document.body,
  );
}

const ModalWindow = Modal as ModalComponent;
ModalWindow.Open = Open;
ModalWindow.Window = Window;

export default ModalWindow;
