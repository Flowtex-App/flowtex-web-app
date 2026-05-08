import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const COMMON_OPTS = {
  animate: true,
  showProgress: true,
  showButtons: ['next' as const, 'previous' as const, 'close' as const],
  nextBtnText: 'Siguiente',
  prevBtnText: 'Anterior',
  doneBtnText: 'Terminar',
  progressText: '{{current}} de {{total}}',
};

/** Pasos del tour del editor de formulario y workflow. */
const FORM_BUILDER_STEPS: DriveStep[] = [
  {
    element: '[data-tour="tabs"]',
    popover: {
      title: '¡Bienvenido al editor!',
      description:
        'Aquí construyes un formulario y su flujo de aprobación en una sola página. La pestaña <b>Formulario</b> es para los campos. La pestaña <b>Workflow</b> es para el flujo de aprobaciones.',
      side: 'bottom',
    },
  },
  {
    element: '[data-tour="palette"]',
    popover: {
      title: 'Paleta de elementos',
      description:
        'Arrastra cualquier elemento desde acá (texto, número, lista, imagen, etc.) hasta el canvas. La sección <b>Auto del usuario</b> rellena automáticamente con datos del empleado logueado.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="canvas"]',
    popover: {
      title: 'Canvas: grid de 12 columnas',
      description:
        'Cada elemento ocupa N columnas y N filas. Mientras arrastras, se resalta exactamente la zona donde caerá. Puedes dejar filas vacías como espaciadores intencionales.',
      side: 'left',
    },
  },
  {
    element: '[data-tour="inspector"]',
    popover: {
      title: 'Inspector lateral',
      description:
        'Selecciona cualquier elemento del canvas para editar su etiqueta, ancho, posición exacta, opciones, validación y colores (en bloques de texto e imágenes).',
      side: 'left',
    },
  },
  {
    element: '[data-tour="chatbot"]',
    popover: {
      title: 'Asistente IA',
      description:
        'Pídele que sugiera campos para tu formulario en lenguaje natural ("necesito un formulario de solicitud de vacaciones"). Genera campos listos para arrastrar al canvas.',
      side: 'left',
    },
  },
  {
    element: '[data-tour="workflow-tab"]',
    popover: {
      title: 'Pestaña Workflow',
      description:
        'Diseña el flujo de aprobación: pasos, aprobadores y condiciones. Las flechas se conectan con drag, doble-click para configurar la condición. Puedes usar valores del formulario para ramificar el flujo.',
      side: 'bottom',
    },
  },
  {
    element: '[data-tour="save"]',
    popover: {
      title: 'Guardar todo',
      description:
        'Un solo click guarda tu formulario y su flujo juntos. <b>Publicar todo</b> los pone en producción para que los empleados puedan llenarlo.',
      side: 'left',
    },
  },
];

const STORAGE_KEY = 'flowtex.tour.formBuilder.completed';

export function startFormBuilderTour() {
  const guide = driver({
    ...COMMON_OPTS,
    steps: FORM_BUILDER_STEPS,
    onDestroyed: () => {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    },
  });
  guide.drive();
}

export function maybeAutoStartFormBuilderTour() {
  try {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Esperamos un tick para que el DOM termine de pintar
      setTimeout(() => startFormBuilderTour(), 600);
    }
  } catch { /* ignore */ }
}

export function resetFormBuilderTour() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
